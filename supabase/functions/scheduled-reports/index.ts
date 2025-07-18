
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.getDate();

    // Get active notification schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('notification_schedules')
      .select('*')
      .eq('is_active', true);

    if (schedulesError) throw schedulesError;

    const results = [];

    for (const schedule of schedules || []) {
      let shouldSendDaily = false;
      let shouldSendMonthly = false;

      // Check if it's time for daily report
      if (schedule.daily_enabled && schedule.daily_time === currentTime) {
        shouldSendDaily = true;
      }

      // Check if it's time for monthly report
      if (schedule.monthly_enabled && 
          schedule.monthly_date === currentDate && 
          schedule.monthly_time === currentTime) {
        shouldSendMonthly = true;
      }

      if (shouldSendDaily || shouldSendMonthly) {
        try {
          const reportData = await generateReport(supabase, schedule.report_types, shouldSendMonthly);
          const message = formatReportMessage(reportData, shouldSendDaily, shouldSendMonthly);

          // Send notification
          const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/send-line-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              webhook_url: schedule.webhook_url,
              message: message,
              platform: schedule.platform
            })
          });

          if (notificationResponse.ok) {
            results.push({
              schedule_id: schedule.id,
              status: 'success',
              type: shouldSendMonthly ? 'monthly' : 'daily'
            });
          } else {
            throw new Error(`Failed to send notification: ${notificationResponse.statusText}`);
          }

        } catch (error) {
          console.error(`Error processing schedule ${schedule.id}:`, error);
          results.push({
            schedule_id: schedule.id,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scheduled reports:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateReport(supabase: any, reportTypes: string[], isMonthly: boolean) {
  const reports: any = {};
  const now = new Date();
  
  // Calculate date range
  let startDate: Date;
  if (isMonthly) {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 1);
  }

  const endDate = new Date(now);

  for (const reportType of reportTypes) {
    switch (reportType) {
      case 'sales':
        reports.sales = await generateSalesReport(supabase, startDate, endDate);
        break;
      case 'inventory':
        reports.inventory = await generateInventoryReport(supabase);
        break;
      case 'customers':
        reports.customers = await generateCustomerReport(supabase, startDate, endDate);
        break;
      case 'profit':
        reports.profit = await generateProfitReport(supabase, startDate, endDate);
        break;
    }
  }

  return reports;
}

async function generateSalesReport(supabase: any, startDate: Date, endDate: Date) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed');

  if (error) throw error;

  const totalSales = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;

  return {
    totalSales: totalSales.toFixed(2),
    orderCount,
    averageOrder: orderCount > 0 ? (totalSales / orderCount).toFixed(2) : '0.00'
  };
}

async function generateInventoryReport(supabase: any) {
  const { data: lowStock, error } = await supabase
    .rpc('get_low_stock_ingredients');

  if (error) throw error;

  return {
    lowStockCount: lowStock?.length || 0,
    lowStockItems: lowStock?.slice(0, 5) || []
  };
}

async function generateCustomerReport(supabase: any, startDate: Date, endDate: Date) {
  const { data: newCustomers, error } = await supabase
    .from('customer_profiles')
    .select('id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) throw error;

  return {
    newCustomers: newCustomers?.length || 0
  };
}

async function generateProfitReport(supabase: any, startDate: Date, endDate: Date) {
  // This would need more complex calculation based on costs and revenues
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed');

  if (error) throw error;

  const revenue = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0) || 0;
  // Simplified profit calculation (would need actual cost data)
  const estimatedProfit = revenue * 0.3; // Assuming 30% profit margin

  return {
    revenue: revenue.toFixed(2),
    estimatedProfit: estimatedProfit.toFixed(2)
  };
}

function formatReportMessage(reportData: any, isDaily: boolean, isMonthly: boolean) {
  const reportType = isMonthly ? 'รายงานประจำเดือน' : 'รายงานประจำวัน';
  const date = new Date().toLocaleDateString('th-TH');
  
  let message = `📊 ${reportType}\n📅 ${date}\n\n`;

  if (reportData.sales) {
    message += `💰 ยอดขาย\n`;
    message += `- ยอดรวม: ฿${reportData.sales.totalSales}\n`;
    message += `- จำนวนออเดอร์: ${reportData.sales.orderCount} รายการ\n`;
    message += `- ออเดอร์เฉลี่ย: ฿${reportData.sales.averageOrder}\n\n`;
  }

  if (reportData.inventory && reportData.inventory.lowStockCount > 0) {
    message += `📦 สต็อกต่ำ\n`;
    message += `- จำนวนรายการ: ${reportData.inventory.lowStockCount} รายการ\n`;
    if (reportData.inventory.lowStockItems.length > 0) {
      message += `- รายการสำคัญ:\n`;
      reportData.inventory.lowStockItems.forEach((item: any) => {
        message += `  • ${item.name}\n`;
      });
    }
    message += `\n`;
  }

  if (reportData.customers) {
    message += `👥 ลูกค้าใหม่: ${reportData.customers.newCustomers} คน\n\n`;
  }

  if (reportData.profit) {
    message += `📈 กำไร (ประมาณ)\n`;
    message += `- รายได้: ฿${reportData.profit.revenue}\n`;
    message += `- กำไรประมาณ: ฿${reportData.profit.estimatedProfit}\n`;
  }

  return message;
}
