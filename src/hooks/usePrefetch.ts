import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

/**
 * Hook to prefetch commonly accessed data for faster navigation
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { shopId, loading: shopLoading } = useCurrentShop();

  useEffect(() => {
    if (shopLoading || !shopId) return;

    // Prefetch menu items
    queryClient.prefetchQuery({
      queryKey: ['menu_items', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('menu_items')
          .select('*, categories!menu_items_category_id_fkey(id, name)')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch categories
    queryClient.prefetchQuery({
      queryKey: ['categories', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('shop_id', shopId)
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch members
    queryClient.prefetchQuery({
      queryKey: ['members', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('members')
          .select('*')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch shop settings
    queryClient.prefetchQuery({
      queryKey: ['shop_settings', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('shop_settings')
          .select('*')
          .eq('shop_id', shopId)
          .limit(1)
          .maybeSingle();
        return data;
      },
      staleTime: 10 * 60 * 1000,
    });

    // Prefetch addon groups
    queryClient.prefetchQuery({
      queryKey: ['addon_groups', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('addon_groups')
          .select('*')
          .eq('shop_id', shopId)
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch addons
    queryClient.prefetchQuery({
      queryKey: ['addons', shopId],
      queryFn: async () => {
        const { data } = await supabase
          .from('addons')
          .select('*, addon_groups!addons_addon_group_id_fkey(id, name, is_required, allow_multiple)')
          .eq('shop_id', shopId)
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, shopId, shopLoading]);
};
