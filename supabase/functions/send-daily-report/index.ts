import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { resolveLineCredentials } from '../_shared/lineCredentials.ts'

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
      .select('shop_id, daily_reports')
    if (requestedShopId) settingsQuery = settingsQuery.eq('shop_id', requestedShopId)

    const { data: settingsRows, error: settingsError } = await settingsQuery

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError)
      throw settingsError
    }

    console.log('⚙️ Settings rows found:', settingsRows?.length || 0)

    // pick the first row whose daily reports are enabled (per shop)
    const settingsRow = (settingsRows || []).find((r: any) => r?.daily_reports?.enabled) || (settingsRows || [])[0] || null
    const settings = settingsRow as any
    const shopId: string | null = settingsRow?.shop_id || requestedShopId || null

    if (!settings?.daily_reports?.enabled) {
      console.log('ℹ️ Daily reports are disabled')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Daily reports disabled',
        enabled: false,
        timestamp
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // อ่านเวลาที่กำหนดจากการตั้งค่าในฐานข้อมูล
    const scheduledTime = settings.daily_reports.time;
    console.log('🎯 Scheduled time from settings:', scheduledTime)

    // Get current Bangkok time
    const { date: bangkokTime, timeString: currentTime } = getBangkokTime();
    
    console.log('🌏 Time comparison:', {
      currentTime,
      scheduledTime,
      isManualTrigger,
      isCronTrigger
    });

    // ตรวจสอบเงื่อนไขการส่ง - ส่งเมื่อถึงเวลาที่กำหนด
    const isTimeMatch = currentTime === scheduledTime;
    const shouldSend = isManualTrigger || (isCronTrigger && isTimeMatch);
    
    console.log('⏱️ Should send report?', {
      isTimeMatch,
      shouldSend,
      reason: isManualTrigger ? 'manual trigger' : isTimeMatch ? `scheduled time (${scheduledTime})` : 'time not match'
    });

    if (!shouldSend) {
      console.log('⏭️ Not sending - conditions not met')
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Not scheduled time - will send at ${scheduledTime}`,
        currentTime,
        scheduledTime,
        isTimeMatch,
        triggerType: isManualTrigger ? 'manual' : 'cron',
        timestamp
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`✅ Sending daily report at ${scheduledTime} - conditions met!`)

    // Generate daily report data
    const startOfDay = new Date(bangkokTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bangkokTime);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    console.log('📅 Report date range:', { 
      startOfDay: startOfDay.toISOString(), 
      endOfDay: endOfDay.toISOString()
    });

    // Get today's orders (scoped to this shop)
    let ordersQuery = supabase
      .from('orders')
      .select('id, total_amount, bill_discount, created_at')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
    if (shopId) ordersQuery = ordersQuery.eq('shop_id', shopId)

    const { data: todayOrders, error: ordersError } = await ordersQuery

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      throw ordersError
    }

    console.log('📋 Orders found:', todayOrders?.length || 0)

    // Get today's order items for menu analysis
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        menu_item_name,
        quantity,
        total_price,
        order:orders!inner(created_at)
      `)
      .gte('order.created_at', startOfDay.toISOString())
      .lte('order.created_at', endOfDay.toISOString())

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError)
      throw itemsError
    }

    console.log('🍽️ Order items found:', orderItems?.length || 0)

    // Calculate statistics
    const totalOrders = todayOrders?.length || 0
    const totalSales = todayOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0
    const totalDiscount = todayOrders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0
    const netSales = totalSales - totalDiscount

    // Group menu items by name and calculate sales
    const menuStats = orderItems?.reduce((acc: any, item) => {
      const name = item.menu_item_name
      if (!acc[name]) {
        acc[name] = { quantity: 0, totalSales: 0 }
      }
      acc[name].quantity += item.quantity
      acc[name].totalSales += Number(item.total_price) || 0
      return acc
    }, {}) || {}

    // Get top 10 selling items
    const topMenus = Object.entries(menuStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        quantity: stats.quantity,
        totalSales: stats.totalSales
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)

    const reportData = {
      date: bangkokTime.toLocaleDateString('th-TH'),
      time: bangkokTime.toLocaleTimeString('th-TH'),
      currentTime,
      scheduledTime,
      totalOrders,
      totalSales,
      totalDiscount,
      netSales,
      topMenus,
      triggerType: isManualTrigger ? 'manual' : 'scheduled',
      isTimeMatch,
      timestamp
    }

    console.log('📈 Report data generated:', reportData)

    // Send notifications to enabled platforms
    let sentCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    const dailySettings = settings.daily_reports as NotificationSettings['daily_reports']

    // Send to Discord
    if (dailySettings.platforms.discord.enabled && dailySettings.platforms.discord.token) {
      try {
        console.log('📤 Sending to Discord...')
        await sendDiscordReport(reportData, dailySettings.platforms.discord.token)
        sentCount++
        console.log('✅ Discord notification sent successfully')
      } catch (error) {
        errorCount++
        errors.push(`Discord: ${error}`)
        console.error('❌ Discord notification failed:', error)
      }
    }

    // Send to LINE
    if (dailySettings.platforms.line.enabled && dailySettings.platforms.line.token) {
      try {
        const lineType = dailySettings.platforms.line.type || 'user';
        console.log(`📤 Sending to LINE (${lineType})...`)
        await sendLineReport(reportData, dailySettings.platforms.line.token, lineType, requestBody?.shopId || null)
        sentCount++
        console.log(`✅ LINE notification sent successfully to ${lineType}`)
      } catch (error) {
        errorCount++
        errors.push(`LINE: ${error}`)
        console.error('❌ LINE notification failed:', error)
      }
    }

    // Send to Telegram
    if (dailySettings.platforms.telegram.enabled && dailySettings.platforms.telegram.token) {
      try {
        console.log('📤 Sending to Telegram...')
        await sendTelegramReport(reportData, dailySettings.platforms.telegram.token)
        sentCount++
        console.log('✅ Telegram notification sent successfully')
      } catch (error) {
        errorCount++
        errors.push(`Telegram: ${error}`)
        console.error('❌ Telegram notification failed:', error)
      }
    }

    // Send to Instagram
    if (dailySettings.platforms.instagram.enabled && dailySettings.platforms.instagram.token) {
      try {
        console.log('📤 Sending to Instagram...')
        await sendInstagramReport(reportData, dailySettings.platforms.instagram.token)
        sentCount++
        console.log('✅ Instagram notification sent successfully')
      } catch (error) {
        errorCount++
        errors.push(`Instagram: ${error}`)
        console.error('❌ Instagram notification failed:', error)
      }
    }

    const result = {
      success: true,
      message: `รายงานประจำวัน - ส่งอัตโนมัติ ตามเวลาที่กำหนด ส่งไปยัง ${sentCount} แพลตฟอร์ม`,
      reportData,
      sentCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      debug: {
        timeMatched: isTimeMatch,
        bangkokTime: bangkokTime.toISOString(),
        triggerType: isManualTrigger ? 'manual' : `scheduled at ${scheduledTime}`
      },
      timestamp
    }

    console.log(`🎉 Daily report completed at ${scheduledTime}:`, result)

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

  const embed = {
    title: `📊 รายงานประจำวัน - ${statusText} ${statusIcon}`,
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
      text: `ระบบแจ้งเตือนอัตโนมัติ ตามเวลาที่กำหนด - Bangkok Time`
    },
    timestamp: new Date().toISOString()
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `📊 **รายงานประจำวัน - ส่งอัตโนมัติ ตามเวลาที่กำหนด** ${statusIcon} (เวลา ${reportData.currentTime})`,
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

  const message = `📊 รายงานประจำวัน - ${statusText} ${statusIcon}

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

  const message = `📊 *รายงานประจำวัน - ${statusText}* ${statusIcon}

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
