import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      line: { enabled: boolean; token: string };
      telegram: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
    };
    message: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestBody = await req.json().catch(() => ({}));
  const isScheduledTrigger = requestBody.scheduled_trigger === true;
  const isManualTrigger = requestBody.manual_trigger === true;

  console.log('🕰️ Daily report function triggered at:', new Date().toISOString())
  console.log('🔄 Trigger type:', { isScheduledTrigger, isManualTrigger, requestBody })

  try {
    // Initialize Supabase client
    const supabaseUrl = "https://mzvzbxflwvksohrmxbsy.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('daily_reports')
      .maybeSingle()

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError)
      throw settingsError
    }

    console.log('⚙️ Raw settings from database:', settings)

    if (!settings?.daily_reports?.enabled) {
      console.log('ℹ️ Daily reports are disabled, skipping...')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Daily reports disabled'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const scheduledTime = settings.daily_reports.time;
    console.log('🎯 Scheduled time from database:', scheduledTime)

    // สร้าง Bangkok time อย่างถูกต้อง
    const now = new Date();
    const bangkokTime = new Date(now.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok"
    }));
    
    // ดึงชั่วโมงและนาทีในรูปแบบ HH:MM
    const currentHour = bangkokTime.getHours().toString().padStart(2, '0');
    const currentMinute = bangkokTime.getMinutes().toString().padStart(2, '0');
    const currentTimeFormatted = `${currentHour}:${currentMinute}`;
    
    console.log('🌏 Current Bangkok time:', bangkokTime.toISOString())
    console.log('⏰ Current time formatted (HH:MM):', currentTimeFormatted)
    console.log('🔍 Time comparison:', { 
      currentTime: currentTimeFormatted, 
      scheduledTime, 
      matches: currentTimeFormatted === scheduledTime,
      triggerType: isManualTrigger ? 'manual' : (isScheduledTrigger ? 'scheduled' : 'unknown')
    })

    // ปรับปรุงการตรวจสอบเวลา - ให้ยืดหยุ่นมากขึ้น (+-1 นาที)
    const timeMatches = currentTimeFormatted === scheduledTime;
    const isNearScheduledTime = checkTimeRange(currentTimeFormatted, scheduledTime, 1);
    
    console.log('⏱️ Time validation:', {
      exactMatch: timeMatches,
      nearScheduledTime: isNearScheduledTime,
      isScheduledTrigger,
      isManualTrigger,
      shouldProceed: isManualTrigger || (isScheduledTrigger && isNearScheduledTime)
    });

    // ตรวจสอบเงื่อนไขการส่ง
    const shouldProceed = isManualTrigger || (isScheduledTrigger && isNearScheduledTime);
    
    if (!shouldProceed) {
      console.log('⏭️ Not the right time or trigger type, skipping...')
      console.log(`   Expected: ${scheduledTime}, Current: ${currentTimeFormatted}`)
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Not scheduled time yet',
        currentTime: currentTimeFormatted,
        scheduledTime: scheduledTime,
        bangkokTime: bangkokTime.toISOString(),
        timeMatches: timeMatches,
        triggerType: isManualTrigger ? 'manual' : 'scheduled',
        debug: {
          hour: currentHour,
          minute: currentMinute,
          rawBangkokTime: bangkokTime.toString(),
          isScheduledTrigger,
          isManualTrigger,
          shouldProceed
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Conditions met! Generating daily report...')
    console.log(`📍 Trigger: ${isManualTrigger ? 'Manual' : 'Scheduled'}, Time match: ${isNearScheduledTime}`)

    // Generate daily report data - ใช้ Bangkok timezone สำหรับวันที่
    const startOfDay = new Date(bangkokTime.getFullYear(), bangkokTime.getMonth(), bangkokTime.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
    
    console.log('📅 Report date range:', { 
      startOfDay: startOfDay.toISOString(), 
      endOfDay: endOfDay.toISOString() 
    })

    // Get today's orders
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, bill_discount, created_at')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())

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
      .lt('order.created_at', endOfDay.toISOString())

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

    // กำหนดประเภทการส่งอย่างชัดเจน
    const actualTriggerType = isManualTrigger ? 'manual' : 'scheduled';
    const isExactTimeMatch = timeMatches;

    const reportData = {
      date: bangkokTime.toLocaleDateString('th-TH'),
      time: bangkokTime.toLocaleTimeString('th-TH'),
      currentTime: currentTimeFormatted,
      scheduledTime: scheduledTime,
      totalOrders,
      totalSales,
      totalDiscount,
      netSales,
      topMenus,
      triggerType: actualTriggerType,
      isExactTimeMatch,
      debugInfo: {
        bangkokTime: bangkokTime.toISOString(),
        bangkokTimeString: bangkokTime.toString(),
        timeMatches: isExactTimeMatch,
        isScheduledTrigger,
        isManualTrigger,
        exactTimeMatch: isExactTimeMatch,
        timezoneOffset: bangkokTime.getTimezoneOffset(),
        nearScheduledTime: isNearScheduledTime
      }
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

    // Send to LINE (placeholder for future implementation)
    if (dailySettings.platforms.line.enabled && dailySettings.platforms.line.token) {
      try {
        console.log('📤 Sending to LINE...')
        await sendLineReport(reportData, dailySettings.platforms.line.token)
        sentCount++
        console.log('✅ LINE notification sent successfully')
      } catch (error) {
        errorCount++
        errors.push(`LINE: ${error}`)
        console.error('❌ LINE notification failed:', error)
      }
    }

    // Send to Telegram (placeholder for future implementation)  
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

    // Send to Instagram (placeholder for future implementation)
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
      message: `Daily report sent to ${sentCount} platform(s)`,
      reportData,
      sentCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      debugInfo: {
        bangkokTime: bangkokTime.toISOString(),
        bangkokTimeString: bangkokTime.toString(),
        currentTime: currentTimeFormatted,
        scheduledTime,
        triggerType: actualTriggerType,
        timeMatched: isNearScheduledTime,
        exactMatch: isExactTimeMatch,
        timezoneDetails: {
          offset: bangkokTime.getTimezoneOffset(),
          hour: currentHour,
          minute: currentMinute
        }
      }
    }

    console.log('🎉 Daily report task completed successfully:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Fatal error in daily report task:', error)
    
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

// ฟังก์ชันตรวจสอบช่วงเวลา (ยืดหยุ่น +-n นาที)
function checkTimeRange(currentTime: string, scheduledTime: string, toleranceMinutes: number = 1): boolean {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
  
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
  
  const difference = Math.abs(currentTotalMinutes - scheduledTotalMinutes);
  
  console.log('🕐 Time range check:', {
    currentTime,
    scheduledTime,
    currentTotalMinutes,
    scheduledTotalMinutes,
    difference,
    toleranceMinutes,
    withinRange: difference <= toleranceMinutes
  });
  
  return difference <= toleranceMinutes;
}

// Function to send Discord notification
async function sendDiscordReport(reportData: any, webhookUrl: string) {
  const topMenusList = reportData.topMenus
    .map((menu: any, index: number) => 
      `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
    )
    .join('\n')

  // ปรับปรุงการแสดงผลสถานะการส่ง
  const isAutoSend = reportData.triggerType === 'scheduled';
  const isExactTime = reportData.isExactTimeMatch;
  
  let statusIcon = '🤖';
  let statusText = 'ส่งอัตโนมัติตามกำหนด';
  let colorCode = 0x00ff00; // เขียว
  
  if (reportData.triggerType === 'manual') {
    statusIcon = '🖱️';
    statusText = 'ส่งด้วยตนเอง';
    colorCode = 0x0099ff; // น้ำเงิน
  } else if (!isExactTime) {
    statusIcon = '⏰';
    statusText = 'ส่งอัตโนมัติ (ช่วงเวลาใกล้เคียง)';
    colorCode = 0xffa500; // ส้ม
  }

  const embed = {
    title: `📊 สรุปยอดขายประจำวัน - ${statusText} ${statusIcon}`,
    description: `รายงานสรุปยอดขายประจำวันที่ ${reportData.date}`,
    color: colorCode,
    fields: [
      {
        name: '📅 วันที่สร้างรายงาน',
        value: `${reportData.date} เวลา ${reportData.time}`,
        inline: true
      },
      {
        name: '⏰ เวลาส่ง vs กำหนด',
        value: `ส่งเมื่อ: ${reportData.currentTime}\nกำหนด: ${reportData.scheduledTime}\n${isExactTime ? '✅ ตรงเวลาพอดี' : '🎯 ภายในช่วงเวลา'}`,
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
      text: `ระบบแจ้งเตือนอัตโนมัติ - Bangkok Time: ${reportData.debugInfo?.bangkokTimeString || 'N/A'}`
    },
    timestamp: new Date().toISOString()
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `📊 **รายงานประจำวัน** - ${statusText} ${statusIcon}`,
      embeds: [embed]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`)
  }
}

// Placeholder functions for future implementation
async function sendLineReport(reportData: any, token: string) {
  console.log('📱 LINE notification - placeholder implementation')
  // TODO: Implement LINE notification
}

async function sendTelegramReport(reportData: any, token: string) {
  console.log('📱 Telegram notification - placeholder implementation')
  // TODO: Implement Telegram notification
}

async function sendInstagramReport(reportData: any, token: string) {
  console.log('📱 Instagram notification - placeholder implementation')  
  // TODO: Implement Instagram notification
}
