import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to prefetch commonly accessed data for faster navigation
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch menu items
    queryClient.prefetchQuery({
      queryKey: ['menu_items'],
      queryFn: async () => {
        const { data } = await supabase
          .from('menu_items')
          .select('*, categories!menu_items_category_id_fkey(id, name)')
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Prefetch categories
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch members
    queryClient.prefetchQuery({
      queryKey: ['members'],
      queryFn: async () => {
        const { data } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch shop settings
    queryClient.prefetchQuery({
      queryKey: ['shop_settings'],
      queryFn: async () => {
        const { data } = await supabase
          .from('shop_settings')
          .select('*')
          .limit(1)
          .single();
        return data;
      },
      staleTime: 10 * 60 * 1000, // Settings rarely change
    });

    // Prefetch addon groups
    queryClient.prefetchQuery({
      queryKey: ['addon_groups'],
      queryFn: async () => {
        const { data } = await supabase
          .from('addon_groups')
          .select('*')
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch addons
    queryClient.prefetchQuery({
      queryKey: ['addons'],
      queryFn: async () => {
        const { data } = await supabase
          .from('addons')
          .select('*, addon_groups!addons_addon_group_id_fkey(id, name, is_required, allow_multiple)')
          .order('sort_order', { ascending: true });
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
};
