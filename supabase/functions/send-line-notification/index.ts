
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  webhook_url: string;
  message: string;
  platform?: 'line' | 'instagram' | 'discord';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url, message, platform = 'line' }: NotificationRequest = await req.json();

    if (!webhook_url || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing webhook_url or message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let response;
    
    switch (platform) {
      case 'line':
        response = await sendLineNotification(webhook_url, message);
        break;
      case 'discord':
        response = await sendDiscordNotification(webhook_url, message);
        break;
      case 'instagram':
        // Instagram API would require more complex setup
        response = { success: true, message: 'Instagram notification not implemented yet' };
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendLineNotification(token: string, message: string) {
  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'message': message
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return { success: true, response: result };
}

async function sendDiscordNotification(webhook_url: string, message: string) {
  const response = await fetch(webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord API error: ${response.status} - ${errorText}`);
  }

  return { success: true, message: 'Discord notification sent successfully' };
}
