
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LimitedPromotion {
  id: string;
  title: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'amount';
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  min_purchase: number;
  is_active: boolean;
  promo_code: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionClaim {
  id: string;
  customer_id: string;
  promotion_id: string;
  claimed_at: string;
  used_at: string | null;
  is_used: boolean;
  order_id: string | null;
}

export const useLimitedPromotions = () => {
  return useQuery({
    queryKey: ['limited-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useClaimPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promotionId, customerId }: { promotionId: string; customerId: string }) => {
      const { data, error } = await supabase.rpc('claim_limited_promotion', {
        promotion_id_param: promotionId,
        customer_id_param: customerId
      });

      if (error) throw error;

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['limited-promotions'] });
      queryClient.invalidateQueries({ queryKey: ['customer-promotion-claims'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCustomerPromotionClaims = (customerId?: string) => {
  return useQuery({
    queryKey: ['customer-promotion-claims', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_promotion_claims')
        .select(`
          *,
          limited_promotions (*)
        `)
        .eq('customer_id', customerId)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
};
