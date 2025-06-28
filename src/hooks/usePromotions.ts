
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'amount';
  discount_value: number;
  target_group: 'all' | 'silver' | 'gold' | 'platinum';
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const usePromotions = () => {
  return useQuery({
    queryKey: ['active-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());
      
      if (error) throw error;
      return data as Promotion[];
    },
    refetchInterval: 30000, // รีเฟรชทุก 30 วินาที
  });
};
