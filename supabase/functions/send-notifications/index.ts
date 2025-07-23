
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'order' | 'daily_report' | 'monthly_report';
  data: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

async function sendDiscordNotification(webhookUrl: string, message: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Discord notification error:', error);
    return false;
  }
}

async function sendLINENotification(token: string, message: string) {
  try {
    // This is a placeholder for LINE API integration
    // You would need to implement actual LINE API calls here
    console.log('LINE notification:', message);
    return true;
  } catch (error) {
    console.error('LINE notification error:', error);
    return false;
  }
}

async function sendTelegramNotification(token: string, message: string) {
  try {
    // This is a placeholder for Telegram API integration
    // You would need to implement actual Telegram API calls here
    console.log('Telegram notification:', message);
    return true;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}

async function sendInstagramNotification(token: string, message: string) {
  try {
    // This is a placeholder for Instagram API integration
    // You would need to implement actual Instagram API calls here
    console.log('Instagram notification:', message);
    return true;
  } catch (error) {
    console.error('Instagram notification error:', error);
    return false;
  }
}

function formatOrderNotification(orderData: any) {
  const orderItems = orderData.items?.map((item: any) => 
    `• ${item.name} ${item.quantity > 1 ? `x${item.quantity}` : ''} - ฿${item.price * item.quantity}`
  ).join('\n') || '';

  const total = orderData.total || 0;
  const customerName = orderData.customer_name || 'ลูกค้า';
  const orderNumber = orderData.order_number || 'N/A';
  const timestamp = new Date().toLocaleString('th-TH');

  return {
    text: `🔔 **มีออเดอร์ออนไลน์ใหม่เข้ามา!**\n\n📋 ออเดอร์ #${orderNumber}\n👤 ลูกค้า: ${customerName}\n📅 เวลา: ${timestamp}\n\n📦 รายการสินค้า:\n${orderItems}\n\n💰 **ยอดรวม: ฿${total}**`,
    embed: {
      title: '🛍️ ออเดอร์ออนไลน์ใหม่',
      description: `ออเดอร์ #${orderNumber}`,
      color: 0x00ff00,
      fields: [
        {
          name: '👤 ลูกค้า',
          value: customerName,
          inline: true
        },
        {
          name: '💰 ยอดรวม',
          value: `฿${total}`,
          inline: true
        },
        {
          name: '📦 รายการสินค้า',
          value: orderItems || 'ไม่มีรายการ',
          inline: false
        }
      ],
      footer: {
        text: 'ระบบแจ้งเตือนร้านอาหาร'
      },
      timestamp: new Date().toISOString()
    }
  };
}

function formatDailyReport(reportData: any) {
  const date = new Date().toLocaleDateString('th-TH');
  const totalSales = reportData.totalSales || 0;
  const orderCount = reportData.orderCount || 0;
  
  return {
    text: `📊 **สรุปยอดขายประจำวัน**\n\n📅 วันที่: ${date}\n💰 ยอดขายรวม: ฿${totalSales}\n📦 จำนวนออเดอร์: ${orderCount} รายการ`,
    embed: {
      title: '📊 รายงานยอดขายประจำวัน',
      description: `สรุปยอดขาย ${date}`,
      color: 0x0099ff,
      fields: [
        {
          name: '💰 ยอดขายรวม',
          value: `฿${totalSales}`,
          inline: true
        },
        {
          name: '📦 จำนวนออเดอร์',
          value: `${orderCount} รายการ`,
          inline: true
        }
      ],
      footer: {
        text: 'ระบบรายงานร้านอาหาร'
      },
      timestamp: new Date().toISOString()
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotificationRequest = await req.json();
    
    // Get notification settings from database
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (!settings) {
      return new Response(JSON.stringify({ error: 'No notification settings found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let formattedMessage;
    let platformSettings;

    switch (type) {
      case 'order':
        formattedMessage = formatOrderNotification(data);
        platformSettings = settings.online_orders?.platforms || {};
        break;
      case 'daily_report':
        formattedMessage = formatDailyReport(data);
        platformSettings = settings.daily_reports?.platforms || {};
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const results = [];

    // Send Discord notification
    if (platformSettings.discord?.enabled && platformSettings.discord?.token) {
      const discordMessage = {
        content: formattedMessage.text,
        embeds: [formattedMessage.embed]
      };
      const discordResult = await sendDiscordNotification(platformSettings.discord.token, discordMessage);
      results.push({ platform: 'discord', success: discordResult });
    }

    // Send LINE notification
    if (platformSettings.line?.enabled && platformSettings.line?.token) {
      const lineResult = await sendLINENotification(platformSettings.line.token, formattedMessage.text);
      results.push({ platform: 'line', success: lineResult });
    }

    // Send Telegram notification
    if (platformSettings.telegram?.enabled && platformSettings.telegram?.token) {
      const telegramResult = await sendTelegramNotification(platformSettings.telegram.token, formattedMessage.text);
      results.push({ platform: 'telegram', success: telegramResult });
    }

    // Send Instagram notification
    if (platformSettings.instagram?.enabled && platformSettings.instagram?.token) {
      const instagramResult = await sendInstagramNotification(platformSettings.instagram.token, formattedMessage.text);
      results.push({ platform: 'instagram', success: instagramResult });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
