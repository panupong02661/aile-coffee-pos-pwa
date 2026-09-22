import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { resolveLineCredentials } from '../_shared/lineCredentials.ts';

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
      console.log('🔍 Full webhook payload:', JSON.stringify(events, null, 2));
      
      // Process each event
      for (const event of events) {
        console.log('📋 Event type:', event.type);
        console.log('🎯 Event source:', JSON.stringify(event.source));
        
        // Handle text message
        if (event.type === 'message' && event.message.type === 'text') {
          console.log('💬 Text message received:', event.message.text);
          
          const replyToken = event.replyToken;
          const source = event.source;
          let replyMessage = '';
          
          // Check source type (user, group, room)
          if (source.type === 'user') {
            console.log('👤 User ID:', source.userId);
            replyMessage = `✅ ได้รับข้อความของคุณแล้ว!\n\n📝 User ID:\n${source.userId}\n\nนำ User ID นี้ไปใส่ในหน้า Notification (เลือกประเภท User)`;
          } else if (source.type === 'group') {
            console.log('👥 Group ID:', source.groupId);
            console.log('👤 User ID in group:', source.userId);
            replyMessage = `✅ ได้รับข้อความในกลุ่มแล้ว!\n\n📝 Group ID:\n${source.groupId}\n\n👤 User ID:\n${source.userId}\n\nนำ Group ID นี้ไปใส่ในหน้า Notification (เลือกประเภท Group)`;
          } else if (source.type === 'room') {
            console.log('🏠 Room ID:', source.roomId);
            console.log('👤 User ID in room:', source.userId);
            replyMessage = `✅ ได้รับข้อความในห้องแล้ว!\n\n📝 Room ID:\n${source.roomId}\n\n👤 User ID:\n${source.userId}\n\nนำ Room ID นี้ไปใส่ในหน้า Notification`;
          }
          
          // Reply with IDs
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
        
        // Handle join event (bot added to group/room)
        if (event.type === 'join') {
          console.log('🎉 Bot joined a group/room!');
          const replyToken = event.replyToken;
          const source = event.source;
          let welcomeMessage = '';
          
          if (source.type === 'group') {
            console.log('👥 Joined Group ID:', source.groupId);
            welcomeMessage = `🎉 สวัสดีครับ! ขอบคุณที่เพิ่มบอทเข้ากลุ่ม\n\n📝 Group ID ของกลุ่มนี้:\n${source.groupId}\n\nนำ Group ID นี้ไปใส่ในหน้า Notification เพื่อรับการแจ้งเตือน (เลือกประเภท Group)`;
          } else if (source.type === 'room') {
            console.log('🏠 Joined Room ID:', source.roomId);
            welcomeMessage = `🎉 สวัสดีครับ! ขอบคุณที่เพิ่มบอทเข้าห้อง\n\n📝 Room ID:\n${source.roomId}`;
          }
          
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
                text: welcomeMessage
              }]
            })
          });
        }
        
        // Handle leave event
        if (event.type === 'leave') {
          console.log('👋 Bot left a group/room');
          console.log('🎯 Left source:', JSON.stringify(event.source));
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON body for API requests (not webhook)
    let requestData;
    try {
      const bodyText = await req.text();
      requestData = bodyText ? JSON.parse(bodyText) : {};
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userId, message, messages } = requestData;

    // Verify that the bot can actually reach the target (group / room / user)
    if (action === 'verifyTarget') {
      if (!LINE_CHANNEL_ACCESS_TOKEN) {
        return new Response(
          JSON.stringify({ ok: false, status: 0, reason: 'no_token', lineError: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const target = String(userId || '').trim();
      let checkUrl = '';
      if (target.startsWith('C')) checkUrl = `https://api.line.me/v2/bot/group/${target}/summary`;
      else if (target.startsWith('R')) checkUrl = `https://api.line.me/v2/bot/room/${target}/members/count`;
      else checkUrl = `https://api.line.me/v2/bot/profile/${target}`;

      const checkRes = await fetch(checkUrl, {
        headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
      });
      const checkBody = await checkRes.text();
      console.log('🔎 verifyTarget', target, checkRes.status, checkBody);

      return new Response(
        JSON.stringify({
          ok: checkRes.ok,
          status: checkRes.status,
          lineError: checkRes.ok ? null : checkBody,
          info: checkRes.ok ? (() => { try { return JSON.parse(checkBody); } catch { return null; } })() : null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        console.error(`❌ LINE API Error [${response.status}] to=${userId}:`, errorText);
        // Return 200 so the client can read the real reason instead of a generic non-2xx error
        return new Response(
          JSON.stringify({
            success: false,
            status: response.status,
            lineError: errorText,
            error: `LINE API Error ${response.status}: ${errorText}`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
