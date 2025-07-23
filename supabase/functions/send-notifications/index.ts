
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    console.log('Sending notification:', { type, data })

    // Get notification settings from database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .single()

    if (settingsError) {
      console.error('Error fetching notification settings:', settingsError)
      throw new Error('Failed to fetch notification settings')
    }

    const results = []

    if (type === 'order') {
      // ส่งแจ้งเตือนออเดอร์ออนไลน์
      const orderSettings = settings.online_orders as any
      if (orderSettings?.enabled) {
        const platforms = orderSettings.platforms

        // ส่งผ่าน LINE
        if (platforms?.line?.enabled && platforms?.line?.token) {
          try {
            const lineMessage = orderSettings.message
              .replace('{{orderNumber}}', data.orderNumber)
              .replace('{{amount}}', data.totalAmount)
              .replace('{{customerName}}', data.customerName || 'ลูกค้า')

            const lineResponse = await fetch('https://api.line.me/v2/bot/message/broadcast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${platforms.line.token}`
              },
              body: JSON.stringify({
                messages: [{
                  type: 'text',
                  text: `🛒 ${lineMessage}\n\n📋 รายละเอียดออเดอร์:\n${data.items.map((item: any) => 
                    `• ${item.name} x${item.quantity} = ฿${item.total}`
                  ).join('\n')}\n\n💰 ยอดรวม: ฿${data.totalAmount}\n⏰ เวลาที่สั่ง: ${new Date(data.createdAt).toLocaleString('th-TH')}`
                }]
              })
            })
            results.push({ platform: 'LINE', success: lineResponse.ok })
          } catch (error) {
            console.error('LINE error:', error)
            results.push({ platform: 'LINE', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Discord
        if (platforms?.discord?.enabled && platforms?.discord?.token) {
          try {
            const discordMessage = {
              content: '🛒 **มีออเดอร์ออนไลน์ใหม่!**',
              embeds: [{
                title: `ออเดอร์ #${data.orderNumber}`,
                description: `ลูกค้า: ${data.customerName || 'ไม่ระบุ'}`,
                color: 0x00ff00,
                fields: [
                  {
                    name: '📋 รายการสินค้า',
                    value: data.items.map((item: any) => 
                      `• ${item.name} x${item.quantity} = ฿${item.total}`
                    ).join('\n') || 'ไม่มีรายการ',
                    inline: false
                  },
                  {
                    name: '💰 ยอดรวม',
                    value: `฿${data.totalAmount}`,
                    inline: true
                  },
                  {
                    name: '⏰ เวลาที่สั่ง',
                    value: new Date(data.createdAt).toLocaleString('th-TH'),
                    inline: true
                  }
                ],
                footer: {
                  text: 'ระบบแจ้งเตือนร้านอาหาร'
                },
                timestamp: new Date().toISOString()
              }]
            }

            const discordResponse = await fetch(platforms.discord.token, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(discordMessage)
            })
            results.push({ platform: 'Discord', success: discordResponse.ok })
          } catch (error) {
            console.error('Discord error:', error)
            results.push({ platform: 'Discord', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Telegram
        if (platforms?.telegram?.enabled && platforms?.telegram?.token) {
          try {
            const telegramMessage = `🛒 *มีออเดอร์ออนไลน์ใหม่!*\n\n` +
              `📋 ออเดอร์ #${data.orderNumber}\n` +
              `👤 ลูกค้า: ${data.customerName || 'ไม่ระบุ'}\n\n` +
              `📄 รายการสินค้า:\n${data.items.map((item: any) => 
                `• ${item.name} x${item.quantity} = ฿${item.total}`
              ).join('\n')}\n\n` +
              `💰 ยอดรวม: ฿${data.totalAmount}\n` +
              `⏰ เวลาที่สั่ง: ${new Date(data.createdAt).toLocaleString('th-TH')}`

            // Note: This is a basic implementation - you'll need to set up a bot and get chat_id
            const telegramResponse = await fetch(`https://api.telegram.org/bot${platforms.telegram.token}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                chat_id: '@your_channel', // ต้องกำหนด chat_id หรือ channel
                text: telegramMessage,
                parse_mode: 'Markdown'
              })
            })
            results.push({ platform: 'Telegram', success: telegramResponse.ok })
          } catch (error) {
            console.error('Telegram error:', error)
            results.push({ platform: 'Telegram', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Instagram (Facebook Graph API)
        if (platforms?.instagram?.enabled && platforms?.instagram?.token) {
          try {
            // Note: Instagram API requires specific setup and permissions
            const instagramMessage = `🛒 มีออเดอร์ออนไลน์ใหม่!\n\nออเดอร์ #${data.orderNumber}\nยอดรวม: ฿${data.totalAmount}`
            
            // This is a placeholder - actual Instagram API implementation would be different
            results.push({ platform: 'Instagram', success: false, error: 'Instagram API not fully implemented' })
          } catch (error) {
            console.error('Instagram error:', error)
            results.push({ platform: 'Instagram', success: false, error: error.message })
          }
        }
      }
    } else if (type === 'daily_report') {
      // ส่งรายงานประจำวัน
      const reportSettings = settings.daily_reports as any
      if (reportSettings?.enabled) {
        const platforms = reportSettings.platforms
        const reportMessage = `📊 สรุปยอดขายประจำวัน ${data.date}\n\n` +
          `📈 สถิติรวม:\n` +
          `• จำนวนออเดอร์ทั้งหมด: ${data.totalOrders} รายการ\n` +
          `• ยอดขายรวม: ฿${data.totalSales}\n\n` +
          `🍽️ เมนูขายดี (เรียงจากมากไปน้อย):\n${data.topMenuItems.map((item: any, index: number) => 
            `${index + 1}. ${item.name} - ${item.quantity} ชิ้น (฿${item.total})`
          ).join('\n')}\n\n` +
          `⏰ เวลาที่สร้างรายงาน: ${new Date().toLocaleString('th-TH')}`

        // ส่งผ่าน LINE
        if (platforms?.line?.enabled) {
          try {
            const lineResponse = await fetch('https://api.line.me/v2/bot/message/broadcast', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.online_orders.platforms.line.token}`
              },
              body: JSON.stringify({
                messages: [{
                  type: 'text',
                  text: reportMessage
                }]
              })
            })
            results.push({ platform: 'LINE', success: lineResponse.ok })
          } catch (error) {
            results.push({ platform: 'LINE', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Discord
        if (platforms?.discord?.enabled) {
          try {
            const discordMessage = {
              content: '📊 **รายงานประจำวัน**',
              embeds: [{
                title: `สรุปยอดขายประจำวัน ${data.date}`,
                color: 0x0099ff,
                fields: [
                  {
                    name: '📈 สถิติรวม',
                    value: `จำนวนออเดอร์: ${data.totalOrders} รายการ\nยอดขายรวม: ฿${data.totalSales}`,
                    inline: false
                  },
                  {
                    name: '🍽️ เมนูขายดี',
                    value: data.topMenuItems.slice(0, 10).map((item: any, index: number) => 
                      `${index + 1}. ${item.name} - ${item.quantity} ชิ้น (฿${item.total})`
                    ).join('\n') || 'ไม่มีข้อมูล',
                    inline: false
                  }
                ],
                footer: {
                  text: 'รายงานประจำวัน'
                },
                timestamp: new Date().toISOString()
              }]
            }

            const discordResponse = await fetch(settings.online_orders.platforms.discord.token, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(discordMessage)
            })
            results.push({ platform: 'Discord', success: discordResponse.ok })
          } catch (error) {
            results.push({ platform: 'Discord', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Telegram
        if (platforms?.telegram?.enabled) {
          try {
            const telegramResponse = await fetch(`https://api.telegram.org/bot${settings.online_orders.platforms.telegram.token}/sendMessage`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                chat_id: '@your_channel',
                text: reportMessage,
                parse_mode: 'Markdown'
              })
            })
            results.push({ platform: 'Telegram', success: telegramResponse.ok })
          } catch (error) {
            results.push({ platform: 'Telegram', success: false, error: error.message })
          }
        }

        // ส่งผ่าน Instagram
        if (platforms?.instagram?.enabled) {
          results.push({ platform: 'Instagram', success: false, error: 'Instagram API not fully implemented' })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-notifications function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  }
})
