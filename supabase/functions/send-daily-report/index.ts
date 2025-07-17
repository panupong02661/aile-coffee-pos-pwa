
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationSetting {
  line_webhook_url: string | null;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  discord_webhook_url: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // ดึงการตั้งค่าการแจ้งเตือน
    const { data: settings, error: settingsError } = await supabaseClient
      .from('notification_settings')
      .select('*')
      .eq('notification_type', 'daily_sales_report')
      .eq('is_enabled', true)
      .single()

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'Notification settings not found or disabled' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // ดึงข้อมูลยอดขายวันนี้
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          menu_item_name,
          quantity,
          total_price
        )
      `)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())

    if (ordersError) {
      throw ordersError
    }

    // คำนวณสถิติ
    const totalOrders = orders?.length || 0
    const totalSales = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const averagePerOrder = totalOrders > 0 ? totalSales / totalOrders : 0

    // จัดกลุ่มตามช่องทางชำระเงิน
    const paymentMethods = orders?.reduce((acc: any, order) => {
      const method = order.payment_method || 'cash'
      acc[method] = (acc[method] || 0) + (order.total_amount || 0)
      return acc
    }, {}) || {}

    // หาเมนูขายดี
    const menuSales = orders?.flatMap(order => order.order_items || [])
      .reduce((acc: any, item) => {
        acc[item.menu_item_name] = (acc[item.menu_item_name] || 0) + item.quantity
        return acc
      }, {}) || {}

    const topMenus = Object.entries(menuSales)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    // สร้างรายงาน
    const report = generateReport(today, totalSales, totalOrders, averagePerOrder, topMenus, paymentMethods)

    // ส่งการแจ้งเตือน
    const results = []

    if (settings.line_webhook_url) {
      try {
        const lineResult = await sendLineNotification(settings.line_webhook_url, report)
        results.push({ platform: 'LINE', success: true, result: lineResult })
      } catch (error) {
        results.push({ platform: 'LINE', success: false, error: error.message })
      }
    }

    if (settings.telegram_bot_token && settings.telegram_chat_id) {
      try {
        const telegramResult = await sendTelegramNotification(
          settings.telegram_bot_token,
          settings.telegram_chat_id,
          report
        )
        results.push({ platform: 'Telegram', success: true, result: telegramResult })
      } catch (error) {
        results.push({ platform: 'Telegram', success: false, error: error.message })
      }
    }

    if (settings.discord_webhook_url) {
      try {
        const discordResult = await sendDiscordNotification(settings.discord_webhook_url, report)
        results.push({ platform: 'Discord', success: true, result: discordResult })
      } catch (error) {
        results.push({ platform: 'Discord', success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        notifications: results,
        stats: {
          totalOrders,
          totalSales,
          averagePerOrder
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateReport(
  date: Date,
  totalSales: number,
  totalOrders: number,
  averagePerOrder: number,
  topMenus: [string, number][],
  paymentMethods: Record<string, number>
): string {
  const dateStr = date.toLocaleDateString('th-TH')
  
  let report = `📊 รายงานยอดขายประจำวัน ${dateStr}\n\n`
  report += `💰 ยอดขายรวม: ฿${totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n`
  report += `🛒 จำนวนออเดอร์: ${totalOrders} ออเดอร์\n`
  report += `📈 เฉลี่ยต่อออเดอร์: ฿${averagePerOrder.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n\n`

  if (topMenus.length > 0) {
    report += `🏆 เมนูขายดี:\n`
    topMenus.forEach(([name, quantity], index) => {
      report += `${index + 1}. ${name} - ${quantity} ${quantity === 1 ? 'รายการ' : 'รายการ'}\n`
    })
    report += '\n'
  }

  if (Object.keys(paymentMethods).length > 0) {
    report += `💳 ช่องทางชำระเงิน:\n`
    Object.entries(paymentMethods).forEach(([method, amount]) => {
      const percentage = ((amount / totalSales) * 100).toFixed(1)
      const methodName = method === 'cash' ? 'เงินสด' : 'โอนเงิน'
      report += `- ${methodName}: ฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (${percentage}%)\n`
    })
    report += '\n'
  }

  report += `ขอบคุณสำหรับการขายที่ดีในวันนี้! 🙏`

  return report
}

async function sendLineNotification(webhookUrl: string, message: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `message=${encodeURIComponent(message)}`
  })

  if (!response.ok) {
    throw new Error(`LINE notification failed: ${response.statusText}`)
  }

  return await response.json()
}

async function sendTelegramNotification(botToken: string, chatId: string, message: string) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  })

  if (!response.ok) {
    throw new Error(`Telegram notification failed: ${response.statusText}`)
  }

  return await response.json()
}

async function sendDiscordNotification(webhookUrl: string, message: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message
    })
  })

  if (!response.ok) {
    throw new Error(`Discord notification failed: ${response.statusText}`)
  }

  return await response.json()
}
