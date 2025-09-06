import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing notification system...');
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create test order data
    const testOrderData = {
      order_number: 'TEST-' + Date.now(),
      total_amount: 250,
      items_count: 2,
      member_id: '123e4567-e89b-12d3-a456-426614174000',
      payment_method: 'online',
      order_source: 'online',
      status: 'confirmed',
      created_at: new Date().toISOString(),
      customer_notes: 'ทดสอบระบบการแจ้งเตือน',
      customer_name: 'ลูกค้าทดสอบ',
      customer_phone: '0801234567',
      order_items: [
        {
          menu_item_name: 'ข้าวผัดกุ้ง',
          quantity: 1,
          unit_price: 120,
          total_price: 140,
          selected_addons: [
            {
              id: 'addon1',
              name: 'เพิ่มกุ้ง',
              price: 20
            }
          ]
        },
        {
          menu_item_name: 'น้ำส้มคั้น',
          quantity: 1,
          unit_price: 110,
          total_price: 110,
          selected_addons: []
        }
      ]
    };

    console.log('📦 Test order data:', testOrderData);

    // Call the send-order-notification function
    const { data: result, error } = await supabase.functions.invoke('send-order-notification', {
      body: { orderData: testOrderData }
    });

    if (error) {
      console.error('❌ Test notification failed:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Test notification result:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test notification sent successfully',
        result 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Error in test notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});