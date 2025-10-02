// Supabase Edge Function: get-promptpay-phone
// Returns the PromptPay phone number from shop_settings using the service role key
// CORS enabled for public usage from customer app

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables are provided by Supabase automatically
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type'
    }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return jsonResponse({}, 204)

  try {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('phone')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Edge get-promptpay-phone: query error', error)
      return jsonResponse({ error: 'query_failed' }, 500)
    }

    const phone = data?.phone || null
    return jsonResponse({ phone })
  } catch (e) {
    console.error('Edge get-promptpay-phone: unexpected error', e)
    return jsonResponse({ error: 'unexpected_error' }, 500)
  }
})