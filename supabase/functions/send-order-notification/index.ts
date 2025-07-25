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

  try {
    const { orderData } = await req.json();
    console.log('🔔 Processing order notification:', orderData);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('online_orders')
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching notification settings:', settingsError);
      throw new Error('Failed to fetch notification settings');
    }

    if (!settings?.online_orders) {
      console.log('No online order notification settings found');
      return new Response(
        JSON.stringify({ success: false, message: 'No notification settings configured' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const onlineOrderSettings: OnlineOrderSettings = settings.online_orders;
    
    if (!onlineOrderSettings.enabled) {
      console.log('Online order notifications are disabled');
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

    const results = [];
    
    // Send notifications to enabled platforms
    if (onlineOrderSettings.platforms.discord.enabled && onlineOrderSettings.platforms.discord.token) {
      try {
        const result = await sendDiscordNotification(
          onlineOrderSettings.platforms.discord.token,
          message,
          orderData
        );
        results.push({ platform: 'Discord', success: true, result });
      } catch (error) {
        console.error('Discord notification failed:', error);
        results.push({ platform: 'Discord', success: false, error: error.message });
      }
    }

    if (onlineOrderSettings.platforms.line.enabled && onlineOrderSettings.platforms.line.token) {
      try {
        const result = await sendLineNotification(
          onlineOrderSettings.platforms.line.token,
          message,
          orderData
        );
        results.push({ platform: 'LINE', success: true, result });
      } catch (error) {
        console.error('LINE notification failed:', error);
        results.push({ platform: 'LINE', success: false, error: error.message });
      }
    }

    if (onlineOrderSettings.platforms.telegram.enabled && onlineOrderSettings.platforms.telegram.token) {
      try {
        const result = await sendTelegramNotification(
          onlineOrderSettings.platforms.telegram.token,
          message,
          orderData
        );
        results.push({ platform: 'Telegram', success: true, result });
      } catch (error) {
        console.error('Telegram notification failed:', error);
        results.push({ platform: 'Telegram', success: false, error: error.message });
      }
    }

    if (onlineOrderSettings.platforms.instagram.enabled && onlineOrderSettings.platforms.instagram.token) {
      try {
        const result = await sendInstagramNotification(
          onlineOrderSettings.platforms.instagram.token,
          message,
          orderData
        );
        results.push({ platform: 'Instagram', success: true, result });
      } catch (error) {
        console.error('Instagram notification failed:', error);
        results.push({ platform: 'Instagram', success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${successCount}/${results.length} platforms`,
        results 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-order-notification function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: '🔔 **ออเดอร์ใหม่เข้ามาแล้ว!**',
      embeds: [embed]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// LINE notification function (placeholder for now)
async function sendLineNotification(accessToken: string, message: string, orderData: any) {
  // TODO: Implement LINE notification
  console.log('LINE notification (placeholder):', { accessToken, message, orderData });
  return { status: 'LINE notification not implemented yet' };
}

// Telegram notification function (placeholder for now)
async function sendTelegramNotification(botToken: string, message: string, orderData: any) {
  // TODO: Implement Telegram notification
  console.log('Telegram notification (placeholder):', { botToken, message, orderData });
  return { status: 'Telegram notification not implemented yet' };
}

// Instagram notification function (placeholder for now)
async function sendInstagramNotification(apiToken: string, message: string, orderData: any) {
  // TODO: Implement Instagram notification
  console.log('Instagram notification (placeholder):', { apiToken, message, orderData });
  return { status: 'Instagram notification not implemented yet' };
}