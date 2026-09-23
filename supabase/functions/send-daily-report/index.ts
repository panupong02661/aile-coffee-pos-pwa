import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { resolveLineCredentials } from '../_shared/lineCredentials.ts'
import { resolveShopName } from '../_shared/shopName.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationSettings {
  daily_reports: {
    enabled: boolean;
    time: string;
    platforms: {
      discord: { enabled: boolean; token: string };
      line: { enabled: boolean; token: string; type?: string };
      telegram: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
    };
    message: string;
  };
}

// Helper function to get Bangkok time (UTC+7)
function getBangkokTime(): { date: Date; timeString: string } {
  const utcNow = new Date();
  
  // คำนวณเวลา Bangkok (UTC+7) อย่างถูกต้อง
  const bangkokTime = new Date(utcNow.getTime() + (7 * 60 * 60 * 1000));
  
  // แปลงเป็น HH:MM format
  const hours = bangkokTime.getUTCHours().toString().padStart(2, '0');
  const minutes = bangkokTime.getUTCMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  console.log('🕐 Bangkok time:', {
    utcNow: utcNow.toISOString(),
    bangkokTime: bangkokTime.toISOString(),
    timeString,
    hours: parseInt(hours),
    minutes: parseInt(minutes)
  });
  
  return { date: bangkokTime, timeString };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const timestamp = new Date().toISOString();
  console.log('🚀 Daily report function triggered at:', timestamp)

  try {
    const requestBody = await req.json().catch(() => ({}));
    const isManualTrigger = requestBody.manual_trigger === true;
    const isCronTrigger = requestBody.cron_trigger === true;
    
    console.log('🔄 Trigger type:', { 
      isManualTrigger, 
      isCronTrigger, 
      requestBody,
      timestamp
    });

    // Initialize Supabase client (service role - bypass RLS so cron can read settings)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "https://mzvzbxflwvksohrmxbsy.supabase.co"
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseKey)

    const requestedShopId: string | null = requestBody?.shopId || requestBody?.shop_id || null;

    // Get notification settings (all shops, or the requested one)
    let settingsQuery = supabase
      .from('notification_settings')
      .select('shop_id, daily_reports, daily_report_last_sent_date')
    if (requestedShopId) settingsQuery = settingsQuery.eq('shop_id', requestedShopId)

    const { data: settingsRows, error: settingsError } = await settingsQuery

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError)
      throw settingsError
    }

    console.log('⚙️ Settings rows found:', settingsRows?.length || 0)

    // Get current Bangkok time (same for all shops)
    const { date: bangkokTime, timeString: currentTime } = getBangkokTime();
    const todayKey = bangkokTime.toISOString().slice(0, 10);

    const enabledRows = (settingsRows || []).filter((r: any) => r?.daily_reports?.enabled)

    if (enabledRows.length === 0) {
      console.log('ℹ️ Daily reports are disabled for every shop')
      return new Response(JSON.stringify({
        success: true,
        message: 'Daily reports disabled',
        enabled: false,
        timestamp
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const shopResults: any[] = []

    // Process every shop independently
    for (const row of enabledRows) {
      const shopId: string | null = (row as any).shop_id || null
      const dailySettings = (row as any).daily_reports as NotificationSettings['daily_reports']
      const scheduledTime = dailySettings.time
      const lastSentDate = (row as any).daily_report_last_sent_date || null

      const isTimeMatch = currentTime === scheduledTime
      const alreadySentToday = lastSentDate === todayKey
      const shouldSend = isManualTrigger || (isCronTrigger && isTimeMatch && !alreadySentToday)

      console.log('🏬 Shop check:', { shopId, scheduledTime, currentTime, isTimeMatch, alreadySentToday, shouldSend })

      if (!shouldSend) {
        shopResults.push({
          shopId,
          sent: false,
          reason: alreadySentToday ? 'already sent today' : `not scheduled time (${scheduledTime})`,
          scheduledTime,
          currentTime
        })
        continue
      }

      try {
        const result = await processShop(supabase, shopId, dailySettings, bangkokTime, currentTime, scheduledTime, isManualTrigger, timestamp)

        if (!isManualTrigger && result.sentCount > 0 && shopId) {
          const { error: markError } = await supabase
            .from('notification_settings')
            .update({ daily_report_last_sent_date: todayKey })
            .eq('shop_id', shopId)
          if (markError) console.error('⚠️ Could not mark daily report as sent:', markError)
        }

        shopResults.push({ shopId, sent: true, ...result })
      } catch (shopError) {
        console.error('❌ Shop report failed:', shopId, shopError)
        shopResults.push({ shopId, sent: false, reason: 'error', error: String(shopError) })
      }
    }

    const totalSent = shopResults.reduce((sum, r) => sum + (r.sentCount || 0), 0)

    const result = {
      success: true,
      message: `รายงานประจำวัน - ประมวลผล ${shopResults.length} ร้าน ส่งสำเร็จรวม ${totalSent} ครั้ง`,
      shops: shopResults,
      currentTime,
      timestamp
    }

    console.log('🎉 Daily report completed:', JSON.stringify(result))

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })


  } catch (error) {
    console.error('❌ Fatal error:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Function to send Discord notification
async function sendDiscordReport(reportData: any, webhookUrl: string) {
  const topMenusList = reportData.topMenus
    .map((menu: any, index: number) => 
      `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
    )
    .join('\n')

  const isManualTrigger = reportData.triggerType === 'manual';
  
  let statusIcon = '🤖';
  let statusText = `ส่งอัตโนมัติ ตามเวลาที่กำหนด (${reportData.scheduledTime})`;
  let colorCode = 0x00ff00; // เขียว
  
  if (isManualTrigger) {
    statusIcon = '🖱️';
    statusText = 'ส่งด้วยตนเอง';
    colorCode = 0x0099ff; // น้ำเงิน
  }

  const shopLabel = reportData.shopName ? `🏪 ${reportData.shopName}` : '';

  const embed = {
    title: `${shopLabel ? `${shopLabel} | ` : ''}📊 รายงานประจำวัน - ${statusText} ${statusIcon}`,
    description: `รายงานสรุปยอดขายประจำวันที่ ${reportData.date}`,
    color: colorCode,
    fields: [
      {
        name: '📅 วันที่สร้างรายงาน',
        value: `${reportData.date} เวลา ${reportData.time}`,
        inline: true
      },
      {
        name: '⏰ เวลาส่ง',
        value: `${reportData.currentTime} (กำหนดส่งตอน ${reportData.scheduledTime} น.)`,
        inline: true
      },
      {
        name: '🔄 ประเภทการส่ง',
        value: `${statusIcon} ${statusText}`,
        inline: true
      },
      {
        name: '🛒 จำนวนออเดอร์ทั้งหมด',
        value: `${reportData.totalOrders} รายการ`,
        inline: true
      },
      {
        name: '💰 ยอดขายรวม',
        value: `${reportData.totalSales.toLocaleString()} บาท`,
        inline: true
      },
      {
        name: '💸 ส่วนลดรวม',
        value: `${reportData.totalDiscount.toLocaleString()} บาท`,
        inline: true
      },
      {
        name: '💵 ยอดขายสุทธิ',
        value: `${reportData.netSales.toLocaleString()} บาท`,
        inline: true
      },
      {
        name: '🏆 เมนูขายดี (Top 10)',
        value: topMenusList || 'ไม่มีข้อมูล',
        inline: false
      }
    ],
    footer: {
      text: `${reportData.shopName ? `${reportData.shopName} | ` : ''}ระบบแจ้งเตือนอัตโนมัติ ตามเวลาที่กำหนด - Bangkok Time`
    },
    timestamp: new Date().toISOString()
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `${shopLabel ? `${shopLabel}\n` : ''}📊 **รายงานประจำวัน - ส่งอัตโนมัติ ตามเวลาที่กำหนด** ${statusIcon} (เวลา ${reportData.currentTime})`,
      embeds: [embed]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`)
  }
}

// Function to send LINE notification
async function sendLineReport(reportData: any, lineId: string, type: string = 'user', shopId?: string | null) {
  // บัญชี LINE ของสาขา (scope: รายงานประจำวัน) ถ้าไม่ได้ตั้งไว้จะใช้บัญชีกลาง
  const { accessToken: channelAccessToken, source } = await resolveLineCredentials(shopId, 'daily_reports');
  console.log('🔑 LINE credentials source:', source, 'shop:', shopId || '-')
  
  if (!channelAccessToken) {
    throw new Error('ยังไม่ได้ตั้งค่า LINE Channel Access Token')
  }

  const topMenusList = reportData.topMenus
    .slice(0, 5) // LINE has message length limits
    .map((menu: any, index: number) => 
      `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
    )
    .join('\n')

  const isManualTrigger = reportData.triggerType === 'manual';
  const statusIcon = isManualTrigger ? '🖱️' : '🤖';
  const statusText = isManualTrigger ? 'ส่งด้วยตนเอง' : `ส่งอัตโนมัติ ตามเวลาที่กำหนด (${reportData.scheduledTime})`;
  const recipientType = type === 'group' ? 'กลุ่ม LINE' : 'ผู้ใช้';

  const message = `${reportData.shopName ? `🏪 ${reportData.shopName}\n` : ''}📊 รายงานประจำวัน - ${statusText} ${statusIcon}

📅 วันที่: ${reportData.date} เวลา ${reportData.time}
⏰ เวลาส่ง: ${reportData.currentTime} (กำหนดส่งตอน ${reportData.scheduledTime} น.)

🛒 จำนวนออเดอร์: ${reportData.totalOrders} รายการ
💰 ยอดขายรวม: ${reportData.totalSales.toLocaleString()} บาท
💸 ส่วนลดรวม: ${reportData.totalDiscount.toLocaleString()} บาท
💵 ยอดขายสุทธิ: ${reportData.netSales.toLocaleString()} บาท

🏆 เมนูขายดี (Top 5):
${topMenusList || 'ไม่มีข้อมูล'}

ระบบแจ้งเตือนอัตโนมัติ ตามเวลาที่กำหนด - Bangkok Time`

  console.log(`📤 Sending LINE message to ${recipientType}:`, lineId);

  // ส่งข้อความไปยัง LINE User ID หรือ Group ID ที่ระบุ
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: lineId, // สามารถเป็น userId หรือ groupId ก็ได้
      messages: [{
        type: 'text',
        text: message
      }]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LINE API failed: ${response.status} - ${errorText}`)
  }
  
  console.log(`✅ LINE message sent successfully to ${recipientType}:`, lineId);
}

// Function to send Telegram notification
async function sendTelegramReport(reportData: any, token: string) {
  const topMenusList = reportData.topMenus
    .map((menu: any, index: number) => 
      `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
    )
    .join('\n')

  const isManualTrigger = reportData.triggerType === 'manual';
  const statusIcon = isManualTrigger ? '🖱️' : '🤖';
  const statusText = isManualTrigger ? 'ส่งด้วยตนเอง' : `ส่งอัตโนมัติ ตามเวลาที่กำหนด (${reportData.scheduledTime})`;

  const message = `${reportData.shopName ? `🏪 *${reportData.shopName}*\n` : ''}📊 *รายงานประจำวัน - ${statusText}* ${statusIcon}

📅 *วันที่:* ${reportData.date} เวลา ${reportData.time}
⏰ *เวลาส่ง:* ${reportData.currentTime} (กำหนดส่งตอน ${reportData.scheduledTime} น.)

🛒 *จำนวนออเดอร์:* ${reportData.totalOrders} รายการ
💰 *ยอดขายรวม:* ${reportData.totalSales.toLocaleString()} บาท
💸 *ส่วนลดรวม:* ${reportData.totalDiscount.toLocaleString()} บาท
💵 *ยอดขายสุทธิ:* ${reportData.netSales.toLocaleString()} บาท

🏆 *เมนูขายดี (Top 10):*
${topMenusList || 'ไม่มีข้อมูล'}

_ระบบแจ้งเตือนอัตโนมัติ ตามเวลาที่กำหนด - Bangkok Time_`

  // Extract chat_id from token (format: bot_token:chat_id)
  const [botToken, chatId] = token.split(':')
  if (!botToken || !chatId) {
    throw new Error('Invalid Telegram token format. Expected format: bot_token:chat_id')
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Telegram API failed: ${response.status} - ${errorText}`)
  }
}

// Function to send Instagram notification (via Instagram Basic Display API)
async function sendInstagramReport(reportData: any, token: string) {
  console.log('📱 Instagram notification - อยู่ระหว่างการพัฒนา (Instagram API มีข้อจำกัดในการส่งข้อความอัตโนมัติ)')
  
  // Note: Instagram doesn't support automated messaging like other platforms
  // This would require Instagram Business Account and special permissions
  // For now, we'll just log that Instagram notifications are not fully supported
  
  throw new Error('Instagram automated notifications are not supported due to platform limitations. Consider using other platforms like Discord, LINE, or Telegram.')
}
