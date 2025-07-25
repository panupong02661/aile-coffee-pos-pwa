import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPlatforms {
  line: { enabled: boolean; token: string };
  discord: { enabled: boolean; token: string };
  telegram: { enabled: boolean; token: string };
  instagram: { enabled: boolean; token: string };
}

interface OnlineOrderSettings {
  enabled: boolean;
  message: string;
  platforms: NotificationPlatforms;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔔 send-order-notification function called at:', new Date().toISOString());
  console.log('📦 Request method:', req.method);
  console.log('📦 Request URL:', req.url);
  console.log('📦 Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

  try {
    const body = await req.json();
    console.log('📦 Received request body:', JSON.stringify(body, null, 2));
    
    const { orderData } = body;
    console.log('🔔 Processing order notification:', orderData);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔗 Supabase client initialized');

    // Get notification settings
    console.log('📋 Fetching notification settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('online_orders')
      .maybeSingle();

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError);
      throw new Error('Failed to fetch notification settings');
    }

    console.log('📋 Settings fetched:', settings);

    if (!settings?.online_orders) {
      console.log('⚠️ No online order notification settings found');
      return new Response(
        JSON.stringify({ success: false, message: 'No notification settings configured' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const onlineOrderSettings: OnlineOrderSettings = settings.online_orders;
    console.log('⚙️ Online order settings:', onlineOrderSettings);
    
    if (!onlineOrderSettings.enabled) {
      console.log('⚠️ Online order notifications are disabled');
      return new Response(
        JSON.stringify({ success: false, message: 'Online order notifications disabled' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification message with variables
    let message = onlineOrderSettings.message;
    message = message.replace(/\{\{orderNumber\}\}/g, orderData.order_number);
    message = message.replace(/\{\{amount\}\}/g, orderData.total_amount.toLocaleString());
    message = message.replace(/\{\{customerName\}\}/g, orderData.customer_name || 'ลูกค้า');

    console.log('💬 Prepared message:', message);

    const results = [];
    
    // Send notifications to enabled platforms
    if (onlineOrderSettings.platforms.discord.enabled && onlineOrderSettings.platforms.discord.token) {
      console.log('🔵 Sending Discord notification...');
      try {
        const result = await sendDiscordNotification(
          onlineOrderSettings.platforms.discord.token,
          message,
          orderData
        );
        results.push({ platform: 'Discord', success: true, result });
        console.log('✅ Discord notification sent successfully');
      } catch (error) {
        console.error('❌ Discord notification failed:', error);
        results.push({ platform: 'Discord', success: false, error: error.message });
      }
    } else {
      console.log('⚠️ Discord not enabled or no token');
    }

    if (onlineOrderSettings.platforms.line.enabled && onlineOrderSettings.platforms.line.token) {
      console.log('🟢 Sending LINE notification...');
      try {
        const result = await sendLineNotification(
          onlineOrderSettings.platforms.line.token,
          message,
          orderData
        );
        results.push({ platform: 'LINE', success: true, result });
        console.log('✅ LINE notification sent successfully');
      } catch (error) {
        console.error('❌ LINE notification failed:', error);
        results.push({ platform: 'LINE', success: false, error: error.message });
      }
    } else {
      console.log('⚠️ LINE not enabled or no token');
    }

    if (onlineOrderSettings.platforms.telegram.enabled && onlineOrderSettings.platforms.telegram.token) {
      console.log('🔷 Sending Telegram notification...');
      try {
        const result = await sendTelegramNotification(
          onlineOrderSettings.platforms.telegram.token,
          message,
          orderData
        );
        results.push({ platform: 'Telegram', success: true, result });
        console.log('✅ Telegram notification sent successfully');
      } catch (error) {
        console.error('❌ Telegram notification failed:', error);
        results.push({ platform: 'Telegram', success: false, error: error.message });
      }
    } else {
      console.log('⚠️ Telegram not enabled or no token');
    }

    if (onlineOrderSettings.platforms.instagram.enabled && onlineOrderSettings.platforms.instagram.token) {
      console.log('🟣 Sending Instagram notification...');
      try {
        const result = await sendInstagramNotification(
          onlineOrderSettings.platforms.instagram.token,
          message,
          orderData
        );
        results.push({ platform: 'Instagram', success: true, result });
        console.log('✅ Instagram notification sent successfully');
      } catch (error) {
        console.error('❌ Instagram notification failed:', error);
        results.push({ platform: 'Instagram', success: false, error: error.message });
      }
    } else {
      console.log('⚠️ Instagram not enabled or no token');
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Notifications sent: ${successCount}/${results.length} platforms`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${successCount}/${results.length} platforms`,
        results 
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

// Discord notification function
async function sendDiscordNotification(webhookUrl: string, message: string, orderData: any) {
  console.log('🔵 Sending Discord notification to:', webhookUrl);
  
  const embed = {
    title: '🛒 ออเดอร์ออนไลน์ใหม่!',
    description: message,
    color: 0x00ff00, // สีเขียว
    fields: [
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
      },
      {
        name: '📦 สถานะ',
        value: orderData.order_status || 'รอดำเนินการ',
        inline: true
      }
    ],
    footer: {
      text: 'ระบบร้านอาหาร'
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    content: '🔔 **ออเดอร์ใหม่เข้ามาแล้ว!**',
    embeds: [embed]
  };

  console.log('🔵 Discord payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  console.log('🔵 Discord response status:', response.status);
  console.log('🔵 Discord response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🔵 Discord error response:', errorText);
    throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
  }

  const responseData = await response.text();
  console.log('🔵 Discord success response:', responseData);
  return { status: 'Discord notification sent', response: responseData };
}

// LINE notification function (placeholder for now)
async function sendLineNotification(accessToken: string, message: string, orderData: any) {
  console.log('🟢 LINE notification (placeholder):', { accessToken, message, orderData });
  return { status: 'LINE notification not implemented yet' };
}

// Telegram notification function (placeholder for now)
async function sendTelegramNotification(botToken: string, message: string, orderData: any) {
  console.log('🔷 Telegram notification (placeholder):', { botToken, message, orderData });
  return { status: 'Telegram notification not implemented yet' };
}

// Instagram notification function (placeholder for now)
async function sendInstagramNotification(apiToken: string, message: string, orderData: any) {
  console.log('🟣 Instagram notification (placeholder):', { apiToken, message, orderData });
  return { status: 'Instagram notification not implemented yet' };
}