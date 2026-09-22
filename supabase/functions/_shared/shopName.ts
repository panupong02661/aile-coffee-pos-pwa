import { createClient } from 'npm:@supabase/supabase-js@2';

function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Resolve the display name of a shop: shop_settings.shop_name -> shops.name.
 * Never throws; returns null when it cannot be resolved.
 */
export async function resolveShopName(shopId?: string | null): Promise<string | null> {
  if (!shopId) return null;
  try {
    const supabase = serviceClient();

    const { data: settings } = await supabase
      .from('shop_settings')
      .select('shop_name')
      .eq('shop_id', shopId)
      .maybeSingle();

    const settingsName = (settings?.shop_name || '').trim();
    if (settingsName) return settingsName;

    const { data: shop } = await supabase
      .from('shops')
      .select('name')
      .eq('id', shopId)
      .maybeSingle();

    const shopName = (shop?.name || '').trim();
    return shopName || null;
  } catch (error) {
    console.error('⚠️ resolveShopName failed:', error);
    return null;
  }
}
