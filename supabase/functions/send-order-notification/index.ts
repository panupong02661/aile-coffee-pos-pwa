import { createClient } from 'npm:@supabase/supabase-js@2'
import { resolveLineCredentials } from '../_shared/lineCredentials.ts'
import { resolveShopName } from '../_shared/shopName.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPlatforms {
  line: { enabled: boolean; token: string; type?: string };
  discord: { enabled: boolean; token: string };
  telegram: { enabled: boolean; token: string };
  instagram: { enabled: boolean; token: string };
}

interface OrderSettings {
  enabled: boolean;
  message: string;
  platforms: NotificationPlatforms;
}

// Database-backed idempotency - no in-memory cache needed

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔔 send-order-notification function called at:', new Date().toISOString());
  console.log('📦 Request method:', req.method);
  console.log('📦 Request URL:', req.url);

  try {
    const body = await req.json();
    console.log('📦 Received request body:', JSON.stringify(body, null, 2));
    
    const { orderData } = body;
    console.log('🔔 Processing order notification:', orderData);

    // CRITICAL: Filter out test/trigger orders and add edge function duplicate prevention
    if (orderData.order_number && orderData.order_number.includes('-TRIGGER')) {
      console.log('🚫 Skipping trigger/test order notification:', orderData.order_number);
      return new Response(
        JSON.stringify({ success: false, message: 'Test/trigger order ignored' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client FIRST
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('🔗 Supabase client initialized');

    // CRITICAL: Database-backed idempotency using outbox table
    const eventKey = `order_${orderData.order_number}_${orderData.created_at}`;
    console.log('🔍 Checking database outbox for:', eventKey);
    
    // Try to insert into outbox - if unique constraint fails, we've already processed
    const { error: outboxError } = await supabase
      .from('notification_outbox')
      .insert({ event_key: eventKey });
    
    if (outboxError) {
      // Unique constraint violation = already processed
      if (outboxError.code === '23505') {
        console.log('🚫 Order already processed (database check), skipping:', eventKey);
        return new Response(
          JSON.stringify({ success: false, message: 'Order already processed' }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Other errors should not block notification
      console.error('⚠️ Outbox insert error (proceeding anyway):', outboxError);
    } else {
      console.log('✅ Marked order as processing in database outbox:', eventKey);
    }

    // Get notification settings
    console.log('📋 Fetching notification settings...');
    let settingsQuery = supabase
      .from('notification_settings')
      .select('online_orders, pos_orders');
    if (orderData.shop_id) {
      settingsQuery = settingsQuery.eq('shop_id', orderData.shop_id);
    }
    const { data: settings, error: settingsError } = await settingsQuery.maybeSingle();

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError);
      throw new Error('Failed to fetch notification settings');
    }

    console.log('📋 Settings fetched:', settings);

    // Determine if this is a POS order or online order based on order_source
    // 'pos', 'in_store', or empty/null = POS order
    const isPosOrder = orderData.order_source === 'pos' || orderData.order_source === 'in_store' || !orderData.order_source;
    const isOnlineOrder = orderData.order_source === 'online';

    console.log('🔍 Order type detection:', {
      order_source: orderData.order_source,
      isPosOrder,
      isOnlineOrder
    });

    let orderSettings: OrderSettings | null = null;
    let orderType = '';

    if (isPosOrder && settings?.pos_orders) {
      orderSettings = settings.pos_orders;
      orderType = 'POS';
    } else if (isOnlineOrder && settings?.online_orders) {
      orderSettings = settings.online_orders;
      orderType = 'Online';
    }

    if (!orderSettings) {
      console.log(`⚠️ No ${orderType} order notification settings found`);
      return new Response(
        JSON.stringify({ success: false, message: `No ${orderType} notification settings configured` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`⚙️ ${orderType} order settings:`, orderSettings);
    
    if (!orderSettings.enabled) {
      console.log(`⚠️ ${orderType} order notifications are disabled`);
      return new Response(
        JSON.stringify({ success: false, message: `${orderType} order notifications disabled` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve shop name so every platform shows which branch sent the notification
    const shopName = await resolveShopName(orderData.shop_id);
    console.log('🏪 Shop name resolved:', shopName || '-');

    // Prepare notification message with variables
    let message = orderSettings.message;
    message = message.replace(/\{\{orderNumber\}\}/g, orderData.order_number);
    message = message.replace(/\{\{amount\}\}/g, orderData.total_amount.toLocaleString());
    message = message.replace(/\{\{customerName\}\}/g, orderData.customer_name || 'ลูกค้า');

    console.log('💬 Prepared message:', message);

    // Format order items for notification with COMPLETE addon details
    let orderItemsText = '';
    if (orderData.order_items && orderData.order_items.length > 0) {
      console.log(`📋 Processing ${orderData.order_items.length} order items for notification`);
      
      orderItemsText = orderData.order_items.map((item: any, index: number) => {
        let itemText = `${index + 1}. ${item.menu_item_name} x${item.quantity}`;
        
        // Add COMPLETE addon details with prices
        if (item.selected_addons && item.selected_addons.length > 0) {
          const addons = item.selected_addons.map((addon: any) => {
            const addonPrice = addon.price || 0;
            if (addonPrice > 0) {
              return `+${addon.name} (+฿${addonPrice})`;
            } else {
              return `+${addon.name} (ฟรี)`;
            }
          }).join(', ');
          itemText += `\n   📎 Add-ons: ${addons}`;
        }
        
        // Add item discount information
        if (item.item_discount && item.item_discount > 0) {
          const discountText = item.item_discount_type === 'percent' 
            ? `ส่วนลดรายการ ${item.item_discount}%`
            : `ส่วนลดรายการ ฿${item.item_discount}`;
          itemText += `\n   🏷️ ${discountText}`;
        }
        
        itemText += `\n   💰 ราคา: ฿${item.total_price}`;
        return itemText;
      }).join('\n\n');
      
      console.log('📋 Formatted order items text:', orderItemsText);
    }

    // Format discount information for notification
    let discountText = '';
    if (orderData.bill_discount && orderData.bill_discount > 0) {
      const billDiscountText = orderData.bill_discount_type === 'percent' 
        ? `ส่วนลดท้ายบิล ${orderData.bill_discount}%`
        : `ส่วนลดท้ายบิล ฿${orderData.bill_discount}`;
      discountText += `\n🏷️ ${billDiscountText}`;
    }
    if (orderData.discount_code) {
      discountText += `\n🏷️ โค้ดส่วนลด: ${orderData.discount_code}`;
    }

    // Send notifications to enabled platforms
    let sentCount = 0;
    let errorCount = 0;
    const results: any = {};

    // Send to Discord if enabled
    if (orderSettings.platforms.discord.enabled && orderSettings.platforms.discord.token) {
      console.log('🔵 Sending Discord notification to:', orderSettings.platforms.discord.token);
      try {
        await sendDiscordNotification(orderSettings.platforms.discord.token, `${message}${discountText}`, orderData, orderItemsText, orderType, shopName);
        console.log('✅ Discord notification sent successfully');
        results.discord = 'success';
        sentCount++;
      } catch (error) {
        console.error('❌ Discord notification failed:', error);
        results.discord = error;
        errorCount++;
      }
    } else {
      console.log('⚠️ Discord not enabled or no token');
    }

    // Send to LINE if enabled
    if (orderSettings.platforms.line.enabled && orderSettings.platforms.line.token) {
      console.log('🟢 Sending LINE notification...');
      try {
        const lineType = orderSettings.platforms.line.type || 'user';
        await sendLineNotification(
          orderSettings.platforms.line.token, 
          `${message}${discountText}`, 
          orderData, 
          orderItemsText, 
          orderType,
          lineType,
          orderData.shop_id,
          isPosOrder ? 'pos_orders' : 'online_orders',
          shopName
        );
        console.log('✅ LINE notification sent successfully');
        results.line = 'success';
        sentCount++;
      } catch (error) {
        console.error('❌ LINE notification failed:', error);
        results.line = error;
        errorCount++;
      }
    } else {
      console.log('⚠️ LINE not enabled or no token');
    }

    // Send to Telegram if enabled
    if (orderSettings.platforms.telegram.enabled && orderSettings.platforms.telegram.token) {
      console.log('🔵 Sending Telegram notification...');
      try {
        await sendTelegramNotification(orderSettings.platforms.telegram.token, `${message}${discountText}`, orderData, orderItemsText, shopName);
        console.log('✅ Telegram notification sent successfully');
        results.telegram = 'success';
        sentCount++;
      } catch (error) {
        console.error('❌ Telegram notification failed:', error);
        results.telegram = error;
        errorCount++;
      }
    } else {
      console.log('⚠️ Telegram not enabled or no token');
    }

    // Instagram is not supported for automated notifications
    if (orderSettings.platforms.instagram.enabled) {
      console.log('⚠️ Instagram not enabled or no token');
    }

    console.log(`📊 Notifications sent: ${sentCount}/${sentCount + errorCount} platforms`);
    
    return new Response(
      JSON.stringify({
        success: sentCount > 0,
        message: sentCount > 0 
          ? `${orderType} order notification sent to ${sentCount}/${sentCount + errorCount} platforms`
          : `Failed to send ${orderType} order notification to any platform`,
        results,
        sentCount,
        errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error in send-order-notification function:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Discord notification function with comprehensive order details
async function sendDiscordNotification(webhookUrl: string, message: string, orderData: any, orderItemsText: string, orderType: string, shopName?: string | null) {
  console.log('🔵 Sending Discord notification to:', webhookUrl);
  
  // Create comprehensive fields for Discord embed
  const fields = [
    {
      name: '📋 หมายเลขออเดอร์',
      value: orderData.order_number,
      inline: true
    },
    {
      name: '💰 ยอดรวม',
      value: `${orderData.total_amount.toLocaleString()} บาท`,
      inline: true
    },
    {
      name: '📦 จำนวนเมนู',
      value: `${orderData.items_count} เมนู`,
      inline: true
    },
    {
      name: '👤 ลูกค้า',
      value: orderData.customer_name || 'ไม่ระบุ',
      inline: true
    },
    {
      name: '📞 เบอร์โทร',
      value: orderData.customer_phone || 'ไม่ระบุ',
      inline: true
    },
    {
      name: '💳 วิธีชำระเงิน',
      value: orderData.payment_method || 'ไม่ระบุ',
      inline: true
    }
  ];

  // Add comprehensive order items if available
  if (orderItemsText) {
    // Split long text if needed for Discord field limits
    const maxFieldLength = 1024;
    if (orderItemsText.length > maxFieldLength) {
      const chunks = [];
      let currentChunk = '';
      const lines = orderItemsText.split('\n');
      
      for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxFieldLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
      
      chunks.forEach((chunk, index) => {
        fields.push({
          name: index === 0 ? '🍽️ รายการสั่งซื้อ (รายละเอียดครบถ้วน)' : `🍽️ รายการสั่งซื้อ (ต่อ ${index + 1})`,
          value: chunk,
          inline: false
        });
      });
    } else {
      fields.push({
        name: '🍽️ รายการสั่งซื้อ (รายละเอียดครบถ้วน)',
        value: orderItemsText,
        inline: false
      });
    }
  }

  // Add discount information to Discord fields
  if ((orderData.bill_discount && orderData.bill_discount > 0) || orderData.discount_code) {
    let discountInfo = '';
    if (orderData.bill_discount && orderData.bill_discount > 0) {
      const discountText = orderData.bill_discount_type === 'percent' 
        ? `ส่วนลดท้ายบิล ${orderData.bill_discount}%`
        : `ส่วนลดท้ายบิล ฿${orderData.bill_discount}`;
      discountInfo += discountText;
    }
    if (orderData.discount_code) {
      discountInfo += (discountInfo ? '\n' : '') + `โค้ดส่วนลด: ${orderData.discount_code}`;
    }
    
    fields.push({
      name: '🏷️ ส่วนลด',
      value: discountInfo,
      inline: false
    });
  }

  const shopLabel = shopName ? `🏪 ${shopName}` : '';
  const baseTitle = orderType === 'POS' ? 'มีการสั่งซื้อใหม่ที่ร้าน!' : '🛒 ออเดอร์ออนไลน์ใหม่เข้ามาแล้ว!';

  const embed = {
    title: shopName ? `🏪 ${shopName} | ${baseTitle}` : (orderType === 'POS' ? '🏪 มีการสั่งซื้อใหม่ที่ร้าน!' : baseTitle),
    description: message,
    color: orderType === 'POS' ? 0xff9500 : 0x00ff00, // สีส้มสำหรับ POS, เขียวสำหรับ Online
    fields: fields,
    footer: {
      text: `${shopName ? `${shopName} | ` : ''}ระบบร้านอาหาร | เวลา: ${new Date(orderData.created_at).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}`
    },
    timestamp: orderData.created_at
  };

  const payload = {
    content: `${shopLabel ? `${shopLabel}\n` : ''}${orderType === 'POS' ? '🏪 **ออเดอร์ POS ใหม่!**' : '🔔 **ออเดอร์ออนไลน์ใหม่!**'}`,
    embeds: [embed]
  };

  console.log('🔵 Discord payload fields count:', fields.length);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  console.log('🔵 Discord response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔵 Discord error response:', errorText);
    throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
  }

  const responseData = await response.text();
  console.log('🔵 Discord success response:', responseData);
  return { status: 'Discord notification sent with complete details', response: responseData };
}

// LINE notification function with comprehensive order details
async function sendLineNotification(
  lineId: string, 
  message: string, 
  orderData: any, 
  orderItemsText: string, 
  orderType: string,
  lineType: string = 'user',
  shopId?: string | null,
  scope: 'pos_orders' | 'online_orders' = 'pos_orders',
  shopName?: string | null
) {
  // บัญชี LINE ของสาขา/ของประเภทการแจ้งเตือน ถ้าไม่ได้ตั้งไว้จะใช้บัญชีกลาง
  const { accessToken: botToken, source } = await resolveLineCredentials(shopId, scope);
  console.log('🔑 LINE credentials source:', source, 'shop:', shopId || '-', 'scope:', scope);
  
  if (!botToken) {
    throw new Error('ยังไม่ได้ตั้งค่า LINE Channel Access Token');
  }
  
  if (!lineId) {
    throw new Error('LINE ID (User ID or Group ID) is required');
  }

  // สร้างข้อความที่มีรายละเอียดครบถ้วนเหมือน Discord
  const orderTypeEmoji = orderType === 'POS' ? '🏪' : '🛒';
  const orderTypeText = orderType === 'POS' ? 'ออเดอร์ POS ใหม่!' : 'ออเดอร์ออนไลน์ใหม่!';
  
  let fullMessage = '';
  if (shopName) {
    fullMessage += `🏪 ${shopName}\n`;
  }
  fullMessage += `${orderTypeEmoji} ${orderTypeText}\n`;
  fullMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
  fullMessage += `${message}\n\n`;
  
  // เพิ่มข้อมูลรายละเอียดออเดอร์
  fullMessage += `📋 หมายเลขออเดอร์: ${orderData.order_number}\n`;
  fullMessage += `💰 ยอดรวม: ${orderData.total_amount.toLocaleString()} บาท\n`;
  fullMessage += `📦 จำนวนเมนู: ${orderData.items_count} เมนู\n`;
  fullMessage += `👤 ลูกค้า: ${orderData.customer_name || 'ไม่ระบุ'}\n`;
  fullMessage += `📞 เบอร์โทร: ${orderData.customer_phone || 'ไม่ระบุ'}\n`;
  fullMessage += `💳 วิธีชำระเงิน: ${orderData.payment_method || 'ไม่ระบุ'}\n`;
  
  // เพิ่มรายการสั่งซื้อแบบละเอียด
  if (orderItemsText) {
    fullMessage += `\n🍽️ รายการสั่งซื้อ (รายละเอียดครบถ้วน):\n`;
    fullMessage += `${orderItemsText}\n`;
  }
  
  // เพิ่มข้อมูลส่วนลดถ้ามี
  if ((orderData.bill_discount && orderData.bill_discount > 0) || orderData.discount_code) {
    fullMessage += `\n🏷️ ส่วนลด:\n`;
    if (orderData.bill_discount && orderData.bill_discount > 0) {
      const discountText = orderData.bill_discount_type === 'percent' 
        ? `ส่วนลดท้ายบิล ${orderData.bill_discount}%`
        : `ส่วนลดท้ายบิล ฿${orderData.bill_discount}`;
      fullMessage += `${discountText}\n`;
    }
    if (orderData.discount_code) {
      fullMessage += `โค้ดส่วนลด: ${orderData.discount_code}\n`;
    }
  }
  
  // เพิ่มเวลา
  fullMessage += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  fullMessage += `⏰ เวลา: ${new Date(orderData.created_at).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}\n`;
  fullMessage += `ระบบร้านอาหาร`;

  const lineMessage = {
    to: lineId,
    messages: [
      {
        type: 'text',
        text: fullMessage
      }
    ]
  };

  console.log(`🟢 Sending LINE message to ${lineType}:`, lineId);

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${botToken}`,
    },
    body: JSON.stringify(lineMessage)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🟢 LINE error response:', errorText);
    throw new Error(`LINE API failed: ${response.status} - ${errorText}`);
  }

  const responseData = await response.text();
  console.log('🟢 LINE success response:', responseData);
  return { status: 'LINE notification sent with complete details', response: responseData };
}

// Telegram notification function  
async function sendTelegramNotification(botToken: string, message: string, orderData: any, orderItemsText: string, shopName?: string | null) {
  // Extract bot token and chat ID from the format: botToken:chatId
  const [token, chatId] = botToken.split(':');
  
  if (!token || !chatId) {
    throw new Error('Telegram token format should be "botToken:chatId"');
  }

  const shopHeader = shopName
    ? `🏪 <b>${shopName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</b>\n`
    : '';
  const telegramMessage = `${shopHeader}${message}\n\n${orderItemsText || 'ไม่มีรายละเอียดรายการ'}`;

  console.log('🔷 Sending Telegram message to chat:', chatId);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: telegramMessage,
      parse_mode: 'HTML'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔷 Telegram error response:', errorText);
    throw new Error(`Telegram API failed: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('🔷 Telegram success response:', responseData);
  return { status: 'Telegram notification sent', response: responseData };
}

// Instagram notification function (not supported for automated notifications)
async function sendInstagramNotification(apiToken: string, message: string, orderData: any, orderItemsText: string) {
  console.log('🟣 Instagram notification (not supported):', { apiToken, message, orderData, orderItemsText });
  throw new Error('Instagram does not support automated notifications for businesses');
}