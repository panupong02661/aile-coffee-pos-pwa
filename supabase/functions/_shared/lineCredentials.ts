import { createClient } from 'npm:@supabase/supabase-js@2';

export type LineScope =
  | 'default'
  | 'online_orders'
  | 'pos_orders'
  | 'daily_reports'
  | 'monthly_reports';

export interface LineCredentials {
  accessToken: string | null;
  channelSecret: string | null;
  source: 'scope' | 'shop_default' | 'env' | 'none';
}

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Resolve LINE credentials: scope-specific -> shop default -> global env secret.
 */
export async function resolveLineCredentials(
  shopId?: string | null,
  scope: LineScope = 'default'
): Promise<LineCredentials> {
  const envToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN') ?? null;
  const envSecret = Deno.env.get('LINE_CHANNEL_SECRET') ?? null;

  if (shopId) {
    try {
      const supabase = serviceClient();
      const { data, error } = await supabase
        .from('line_channel_credentials')
        .select('scope, channel_access_token, channel_secret')
        .eq('shop_id', shopId)
        .in('scope', Array.from(new Set([scope, 'default'])));

      if (error) {
        console.error('⚠️ resolveLineCredentials query error:', error.message);
      } else if (data && data.length > 0) {
        const scoped = data.find(
          (r: any) => r.scope === scope && r.channel_access_token
        );
        if (scoped) {
          return {
            accessToken: scoped.channel_access_token,
            channelSecret: scoped.channel_secret ?? envSecret,
            source: 'scope',
          };
        }
        const fallback = data.find(
          (r: any) => r.scope === 'default' && r.channel_access_token
        );
        if (fallback) {
          return {
            accessToken: fallback.channel_access_token,
            channelSecret: fallback.channel_secret ?? envSecret,
            source: 'shop_default',
          };
        }
      }
    } catch (e) {
      console.error('⚠️ resolveLineCredentials failed:', e);
    }
  }

  return {
    accessToken: envToken,
    channelSecret: envSecret,
    source: envToken ? 'env' : 'none',
  };
}
