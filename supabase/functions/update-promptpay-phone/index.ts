// Supabase Edge Function: update-promptpay-phone
// Updates the PromptPay phone number in shop_settings using the service role key
// CORS enabled for usage from admin panel

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
  })
}

// Validate Thai mobile phone number
function validateThaiMobilePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  
  // Must be 10 digits and start with 08 or 09
  if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
    return true
  }
  
  return false
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const { phone } = await req.json()

    if (!phone) {
      console.error('Edge update-promptpay-phone: No phone provided')
      return jsonResponse({ error: 'phone_required' }, 400)
    }

    // Validate phone number
    if (!validateThaiMobilePhone(phone)) {
      console.error('Edge update-promptpay-phone: Invalid mobile phone', phone)
      return jsonResponse({ 
        error: 'invalid_mobile_phone',
        message: 'เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาใช้เบอร์มือถือที่ขึ้นต้นด้วย 08 หรือ 09 เท่านั้น'
      }, 400)
    }

    console.log('📱 Updating PromptPay phone to:', phone)

    // Check existing rows in shop_settings (should be single-row table)
    const { data: existingRows, error: selectError } = await supabase
      .from('shop_settings')
      .select('id')

    if (selectError) {
      console.error('Edge update-promptpay-phone: select error', selectError)
      return jsonResponse({ error: 'query_failed', details: selectError.message }, 500)
    }

    if (existingRows && existingRows.length > 0) {
      const primaryId = existingRows[0].id

      // Update primary row
      const { error: updateError } = await supabase
        .from('shop_settings')
        .update({ phone, updated_at: new Date().toISOString() })
        .eq('id', primaryId)

      if (updateError) {
        console.error('Edge update-promptpay-phone: update error', updateError)
        return jsonResponse({ error: 'update_failed', details: updateError.message }, 500)
      }

      // If multiple rows exist, delete extras to enforce single row
      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id)
        const { error: deleteError } = await supabase
          .from('shop_settings')
          .delete()
          .in('id', extraIds)
        if (deleteError) {
          console.warn('Edge update-promptpay-phone: cleanup extra rows failed', deleteError)
        } else {
          console.log(`🧹 Cleaned up ${extraIds.length} extra shop_settings rows`)
        }
      }

      console.log('✅ PromptPay phone updated successfully (single-row enforced)')
      return jsonResponse({ success: true, phone, message: 'อัปเดตเบอร์ PromptPay สำเร็จ' })
    } else {
      // Create new single row
      const { error: insertError } = await supabase
        .from('shop_settings')
        .insert({ phone })

      if (insertError) {
        console.error('Edge update-promptpay-phone: insert error', insertError)
        return jsonResponse({ error: 'insert_failed', details: insertError.message }, 500)
      }

      console.log('✅ PromptPay phone created successfully (single-row)')
      return jsonResponse({ success: true, phone, message: 'บันทึกเบอร์ PromptPay สำเร็จ' })
    }
  } catch (e) {
    console.error('Edge update-promptpay-phone: unexpected error', e)
    return jsonResponse({ error: 'unexpected_error', details: e.message }, 500)
  }
})
