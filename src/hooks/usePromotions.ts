
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  apply_to: 'menu_item' | 'category' | 'all';
  menu_item_ids: string[];
  category_ids: string[];
}

export const usePromotions = () => {
  return useQuery({
    queryKey: ['active-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_promotions');
      if (error) throw error;
      return data as Promotion[];
    },
    refetchInterval: 30000, // รีเฟรชทุก 30 วินาที
  });
};
