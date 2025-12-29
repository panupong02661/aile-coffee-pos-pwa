import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  reportType: 'daily' | 'monthly';
  date: string;
  time: string;
  totalOrders: number;
  totalSales: number;
  totalDiscount: number;
  netSales: number;
  topMenus: Array<{
    name: string;
    quantity: number;
    totalSales: number;
  }>;
  paymentMethods?: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  newMembers?: number;
  comparison?: {
    salesGrowth: number;
    ordersGrowth: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType = 'daily' } = await req.json();
    
    console.log(`📊 Generating ${reportType} report image...`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch report data from database
    const now = new Date();
    const bangkokNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    
    let startDate: Date;
    let endDate: Date = bangkokNow;
    let reportTitle: string;

    if (reportType === 'monthly') {
      // First day of current month
      startDate = new Date(bangkokNow.getFullYear(), bangkokNow.getMonth(), 1);
      reportTitle = `รายงานประจำเดือน ${bangkokNow.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`;
    } else {
      // Today
      startDate = new Date(bangkokNow.getFullYear(), bangkokNow.getMonth(), bangkokNow.getDate());
      reportTitle = `รายงานประจำวัน ${bangkokNow.toLocaleDateString('th-TH')}`;
    }

    // Convert to UTC for query
    const startUTC = new Date(startDate.getTime() - (7 * 60 * 60 * 1000)).toISOString();

    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, bill_discount, payment_method, member_id, created_at')
      .gte('created_at', startUTC);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      throw ordersError;
    }

    // Fetch order items for top menus
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        menu_item_name,
        quantity,
        total_price,
        order:orders!inner(created_at)
      `)
      .gte('order.created_at', startUTC);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      throw itemsError;
    }

    // Fetch new members
    const { data: newMembers, error: membersError } = await supabase
      .from('members')
      .select('id')
      .gte('created_at', startUTC);

    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSales = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
    const totalDiscount = orders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0;
    const netSales = totalSales - totalDiscount;

    // Top menus calculation
    const menuStats = orderItems?.reduce((acc: Record<string, { quantity: number; totalSales: number }>, item) => {
      const name = item.menu_item_name;
      if (!acc[name]) {
        acc[name] = { quantity: 0, totalSales: 0 };
      }
      acc[name].quantity += item.quantity;
      acc[name].totalSales += Number(item.total_price) || 0;
      return acc;
    }, {}) || {};

    const topMenus = Object.entries(menuStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        totalSales: stats.totalSales
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    // Payment methods breakdown
    const paymentGroups = orders?.reduce((acc: Record<string, { amount: number; count: number }>, order) => {
      const method = order.payment_method || 'cash';
      if (!acc[method]) {
        acc[method] = { amount: 0, count: 0 };
      }
      acc[method].amount += Number(order.total_amount) || 0;
      acc[method].count += 1;
      return acc;
    }, {}) || {};

    const paymentMethods = Object.entries(paymentGroups).map(([method, data]) => ({
      method: getPaymentMethodName(method),
      amount: data.amount,
      count: data.count
    }));

    // Format data for prompt
    const topMenusText = topMenus
      .map((menu, i) => `${i + 1}. ${menu.name} - ${menu.quantity} ชิ้น (${formatNumber(menu.totalSales)} บาท)`)
      .join('\n');

    const paymentText = paymentMethods
      .map(p => `${p.method}: ${formatNumber(p.amount)} บาท (${p.count} รายการ)`)
      .join('\n');

    // Generate image using AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Create a professional Thai restaurant sales dashboard report image with the following data:

TITLE: ${reportTitle}
Generated at: ${bangkokNow.toLocaleTimeString('th-TH')}

📊 SALES SUMMARY:
- Total Orders: ${totalOrders} orders
- Total Sales: ${formatNumber(totalSales)} THB
- Discounts: ${formatNumber(totalDiscount)} THB  
- Net Sales: ${formatNumber(netSales)} THB

🏆 TOP 5 BEST SELLERS:
${topMenusText || 'No data available'}

💳 PAYMENT METHODS:
${paymentText || 'No data available'}

👥 New Members: ${newMembers?.length || 0}

Design requirements:
- Modern, clean dashboard style with dark theme
- Use Thai language for labels
- Include bar chart visualization for top 5 items
- Use colors: primary blue (#3b82f6), success green (#22c55e), warning orange (#f59e0b)
- Include decorative icons/emojis
- Make it visually appealing for sharing on LINE/Discord
- Image dimensions should be 1200x800 pixels
- Add coffee/cafe themed decorations since this is a coffee shop POS`;

    console.log('🎨 Calling AI Gateway to generate image...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    // Extract image from response
    const base64ImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!base64ImageUrl) {
      console.error('❌ No image in AI response:', JSON.stringify(aiData));
      throw new Error('No image generated by AI');
    }

    // Upload image to Supabase Storage for Discord compatibility
    // Discord doesn't support base64 data URLs, needs public URL
    let publicImageUrl = base64ImageUrl;
    
    try {
      // Extract base64 data from data URL
      const base64Match = base64ImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const imageFormat = base64Match[1]; // png, jpeg, etc.
        const base64Data = base64Match[2];
        
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Generate unique filename
        const fileName = `report-${reportType}-${Date.now()}.${imageFormat}`;
        const filePath = `reports/${fileName}`;
        
        console.log(`📤 Uploading image to Storage: ${filePath}`);
        
        // Upload to receipts bucket (already exists and is public)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, bytes, {
            contentType: `image/${imageFormat}`,
            upsert: true
          });
        
        if (uploadError) {
          console.error('❌ Storage upload error:', uploadError);
          // Continue with base64 URL as fallback (will work for LINE but not Discord)
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
          
          if (urlData?.publicUrl) {
            publicImageUrl = urlData.publicUrl;
            console.log(`✅ Image uploaded successfully: ${publicImageUrl}`);
          }
        }
      }
    } catch (uploadErr) {
      console.error('❌ Error uploading to storage:', uploadErr);
      // Continue with base64 URL as fallback
    }

    // Return the report data along with the image
    const reportData: ReportData = {
      reportType,
      date: bangkokNow.toLocaleDateString('th-TH'),
      time: bangkokNow.toLocaleTimeString('th-TH'),
      totalOrders,
      totalSales,
      totalDiscount,
      netSales,
      topMenus,
      paymentMethods,
      newMembers: newMembers?.length || 0
    };

    console.log('✅ Report image generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicImageUrl,
        reportData,
        reportTitle
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error generating report image:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate report image'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function formatNumber(num: number): string {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    'cash': 'เงินสด',
    'promptpay': 'พร้อมเพย์',
    'transfer': 'โอนเงิน',
    'credit': 'บัตรเครดิต',
    'debit': 'บัตรเดบิต',
    'qr': 'QR Code'
  };
  return names[method.toLowerCase()] || method;
}
