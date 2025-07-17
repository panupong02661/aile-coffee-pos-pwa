
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DailyReportData {
  totalSales: number;
  totalOrders: number;
  newCustomers: number;
  topItems: string[];
}

async function generateDailyReport(): Promise<DailyReportData> {
  const today = new Date().toISOString().split('T')[0];
  
  // ดึงยอดขายรวม
  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  const totalSales = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const totalOrders = ordersData?.length || 0;

  // ดึงลูกค้าใหม่
  const { data: newMembersData } = await supabase
    .from('members')
    .select('id')
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  const newCustomers = newMembersData?.length || 0;

  // ดึงเมนูขายดี (จำลอง)
  const topItems = ['กาแฟเย็น', 'ชาเขียวมัทฉะ', 'เค้กช็อกโกแลต'];

  return {
    totalSales,
    totalOrders,
    newCustomers,
    topItems
  };
}

async function sendLineNotify(token: string, message: string) {
  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `message=${encodeURIComponent(message)}`,
  });
  
  return response.ok;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    }),
  });
  
  return response.ok;
}

async function sendDiscordWebhook(webhookUrl: string, message: string) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
    }),
  });
  
  return response.ok;
}

function formatReportMessage(data: DailyReportData): string {
  const today = new Date().toLocaleDateString('th-TH');
  
  return `📊 สรุปยอดขาย - ${today}

💰 ยอดขายรวม: ฿${data.totalSales.toLocaleString()}
🛍️ จำนวนออเดอร์: ${data.totalOrders} ออเดอร์
👥 ลูกค้าใหม่: ${data.newCustomers} คน
⭐ เมนูขายดี: ${data.topItems.join(', ')}

ส่งโดยระบบ Aile Coffee POS`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ดึงการตั้งค่าการแจ้งเตือน
    const { data: settings, error } = await supabase
      .from('daily_report_settings')
      .select('*')
      .eq('is_enabled', true)
      .single();

    if (error || !settings) {
      return new Response(
        JSON.stringify({ message: "Daily report is disabled or not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // สร้างรายงาน
    const reportData = await generateDailyReport();
    const message = formatReportMessage(reportData);

    const results = [];

    // ส่ง LINE Notify
    if (settings.line_enabled && settings.line_webhook_url) {
      try {
        const success = await sendLineNotify(settings.line_webhook_url, message);
        results.push({ platform: 'LINE', success });
      } catch (error) {
        results.push({ platform: 'LINE', success: false, error: error.message });
      }
    }

    // ส่ง Telegram
    if (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
      try {
        const success = await sendTelegramMessage(
          settings.telegram_bot_token,
          settings.telegram_chat_id,
          message
        );
        results.push({ platform: 'Telegram', success });
      } catch (error) {
        results.push({ platform: 'Telegram', success: false, error: error.message });
      }
    }

    // ส่ง Discord
    if (settings.discord_enabled && settings.discord_webhook_url) {
      try {
        const success = await sendDiscordWebhook(settings.discord_webhook_url, message);
        results.push({ platform: 'Discord', success });
      } catch (error) {
        results.push({ platform: 'Discord', success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Daily report sent",
        reportData,
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-daily-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
