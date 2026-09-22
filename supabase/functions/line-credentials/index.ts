import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shop-id',
};

const SCOPES = ['default', 'online_orders', 'pos_orders', 'daily_reports', 'monthly_reports'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const shopId = String(body.shopId || '').trim();

    if (!UUID_RE.test(shopId)) {
      return json({ error: 'shopId is required' }, 400);
    }

    // shop must exist
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shopId)
      .maybeSingle();
    if (!shop) {
      return json({ error: 'shop not found' }, 404);
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('line_channel_credentials')
        .select('scope, channel_access_token, channel_secret, updated_at')
        .eq('shop_id', shopId);

      if (error) return json({ error: error.message }, 500);

      const items = (data || []).map((row: any) => ({
        scope: row.scope,
        configured: !!row.channel_access_token,
        tokenLast4: row.channel_access_token
          ? String(row.channel_access_token).slice(-4)
          : null,
        secretConfigured: !!row.channel_secret,
        updatedAt: row.updated_at,
      }));

      return json({ items, envFallback: !!Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') });
    }

    const scope = String(body.scope || '');
    if (!SCOPES.includes(scope)) {
      return json({ error: 'invalid scope' }, 400);
    }

    if (action === 'save') {
      const token = typeof body.channelAccessToken === 'string' ? body.channelAccessToken.trim() : '';
      const secret = typeof body.channelSecret === 'string' ? body.channelSecret.trim() : '';

      if (!token) {
        return json({ error: 'channelAccessToken is required' }, 400);
      }
      if (token.length < 20 || token.length > 1000) {
        return json({ error: 'channelAccessToken format looks invalid' }, 400);
      }

      const { error } = await supabase
        .from('line_channel_credentials')
        .upsert(
          {
            shop_id: shopId,
            scope,
            channel_access_token: token,
            channel_secret: secret || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'shop_id,scope' }
        );

      if (error) return json({ error: error.message }, 500);
      return json({ success: true, scope, tokenLast4: token.slice(-4) });
    }

    if (action === 'clear') {
      const { error } = await supabase
        .from('line_channel_credentials')
        .delete()
        .eq('shop_id', shopId)
        .eq('scope', scope);

      if (error) return json({ error: error.message }, 500);
      return json({ success: true, scope });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (error) {
    console.error('❌ line-credentials error:', error);
    return json({ error: (error as Error).message }, 500);
  }
});
