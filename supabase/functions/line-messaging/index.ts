import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LINE Messaging API Configuration
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET');
const LINE_API_URL = 'https://api.line.me/v2/bot/message';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if it's a webhook from LINE
    if (req.method === 'POST' && req.headers.get('x-line-signature')) {
      console.log('📩 Received webhook from LINE');
      
      const body = await req.text();
      const events = JSON.parse(body).events;
      
      console.log('📬 Events received:', events.length);
      
      // Process each event
      for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
          console.log('💬 Text message received:', event.message.text);
          
          // You can add auto-reply logic here
          // Example: Reply with the same message
          const replyToken = event.replyToken;
          const replyMessage = `คุณส่งข้อความ: "${event.message.text}"`;
          
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: replyToken,
              messages: [{
                type: 'text',
                text: replyMessage
              }]
            })
          });
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle send message request from your app
    const { action, userId, message, messages } = await req.json();

    if (action === 'send') {
      console.log('📤 Sending message to LINE user:', userId);
      
      if (!LINE_CHANNEL_ACCESS_TOKEN) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
      }

      // Prepare messages array
      const messagesToSend = messages || [{ type: 'text', text: message }];

      // Send message via LINE Messaging API
      const response = await fetch(`${LINE_API_URL}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: userId,
          messages: messagesToSend
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LINE API Error:', errorText);
        throw new Error(`LINE API Error: ${errorText}`);
      }

      console.log('✅ Message sent successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Message sent successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle broadcast message
    if (action === 'broadcast') {
      console.log('📣 Broadcasting message');
      
      if (!LINE_CHANNEL_ACCESS_TOKEN) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
      }

      const messagesToSend = messages || [{ type: 'text', text: message }];

      const response = await fetch(`${LINE_API_URL}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          messages: messagesToSend
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LINE API Error:', errorText);
        throw new Error(`LINE API Error: ${errorText}`);
      }

      console.log('✅ Broadcast sent successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Broadcast sent successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get profile information
    if (action === 'getProfile') {
      console.log('👤 Getting user profile:', userId);
      
      if (!LINE_CHANNEL_ACCESS_TOKEN) {
        throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
      }

      const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LINE API Error:', errorText);
        throw new Error(`LINE API Error: ${errorText}`);
      }

      const profile = await response.json();
      console.log('✅ Profile retrieved successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          profile 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in LINE messaging function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
