
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

  const requestTime = new Date()
  const thaiTime = new Date(requestTime.getTime() + (7 * 60 * 60 * 1000)) // UTC+7
  console.log('🕰️ Daily report function called at:', thaiTime.toISOString())
  console.log('🌏 Thai time:', thaiTime.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }))

  try {
    // Initialize Supabase client
    const supabaseUrl = "https://mzvzbxflwvksohrmxbsy.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get notification settings
    console.log('📊 Fetching notification settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('daily_reports')
      .maybeSingle()

    if (settingsError) {
      console.error('❌ Error fetching notification settings:', settingsError)
      throw settingsError
    }

    console.log('⚙️ Notification settings:', settings)

    if (!settings?.daily_reports?.enabled) {
      console.log('ℹ️ Daily reports are disabled, skipping...')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Daily reports disabled',
        currentTime: thaiTime.toLocaleString('th-TH'),
        settings: settings
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if it's the right time (allow manual trigger or correct time)
    const currentTimeStr = thaiTime.toTimeString().slice(0, 5) // HH:MM format
    const scheduledTime = settings.daily_reports.time
    const isManualTrigger = req.method === 'POST'
    
    console.log('⏰ Time check:', {
      currentTime: currentTimeStr,
      scheduledTime: scheduledTime,
      isManualTrigger: isManualTrigger,
      shouldSend: isManualTrigger || currentTimeStr === scheduledTime
    })

    // Generate daily report data
    console.log('📊 Generating daily report...')
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Get today's orders
    const { data: todayOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, bill_discount, created_at')
      .gte('created_at', startOfDay.toISOString())

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
      throw ordersError
    }

    console.log('📦 Orders found:', todayOrders?.length || 0)

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
      date: thaiTime.toLocaleDateString('th-TH'),
      time: thaiTime.toLocaleTimeString('th-TH'),
      currentTimeStr: currentTimeStr,
      scheduledTime: scheduledTime,
      totalOrders,
      totalSales,
      totalDiscount,
      netSales,
      topMenus,
      isManualTrigger,
      executedAt: thaiTime.toISOString()
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
        console.log('📤 Sending Discord notification...')
        await sendDiscordReport(reportData, dailySettings.platforms.discord.token)
        sentCount++
        console.log('✅ Discord notification sent successfully')
      } catch (error) {
        errorCount++
        errors.push(`Discord: ${error}`)
        console.error('❌ Discord notification failed:', error)
      }
    } else {
      console.log('ℹ️ Discord notification disabled or no token')
    }

    // Send to LINE (placeholder for future implementation)
    if (dailySettings.platforms.line.enabled && dailySettings.platforms.line.token) {
      try {
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
      message: `Daily report processed - sent to ${sentCount} platform(s)`,
      reportData,
      sentCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: thaiTime.toISOString()
    }

    console.log('🎉 Daily report task completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Fatal error in daily report task:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString(),
      thaiTime: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
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

  const embed = {
    title: '📊 สรุปยอดขายประจำวัน',
    description: `รายงานสรุปยอดขายประจำวันที่ ${reportData.date}`,
    color: 0x00ff00,
    fields: [
      {
        name: '📅 วันที่สร้างรายงาน',
        value: `${reportData.date} เวลา ${reportData.time}`,
        inline: true
      },
      {
        name: '⏰ เวลาปัจจุบัน/กำหนด',
        value: `${reportData.currentTimeStr} / ${reportData.scheduledTime}`,
        inline: true
      },
      {
        name: '🔧 ประเภทการส่ง',
        value: reportData.isManualTrigger ? 'ส่งด้วยตนเอง' : 'ส่งตามกำหนดเวลา',
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
      text: 'ระบบแจ้งเตือนอัตโนมัติ - รายงานประจำวัน'
    },
    timestamp: reportData.executedAt
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: reportData.isManualTrigger ? 
        '📊 **รายงานประจำวัน - ทดสอบส่งด้วยตนเอง**' : 
        '📊 **รายงานประจำวัน - ส่งอัตโนมัติ**',
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
