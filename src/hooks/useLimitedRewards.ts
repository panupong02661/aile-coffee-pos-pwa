
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LimitedReward {
  id: string;
  name: string;
  description?: string;
  reward_type: 'discount' | 'voucher' | 'item';
  discount_value: number;
  discount_type: 'percent' | 'amount';
  reward_code?: string;
  max_claims: number;
  current_claims: number;
  start_date: string;
  end_date: string;
  target_month?: number;
  is_active: boolean;
}

export const useLimitedRewards = () => {
  return useQuery({
    queryKey: ['limited-rewards'],
    queryFn: async () => {
      console.log('Fetching limited rewards...');
      
      const { data, error } = await supabase
        .from('limited_rewards')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching limited rewards:', error);
        throw error;
      }

      console.log('Limited rewards:', data);
      return data as LimitedReward[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useClaimLimitedReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rewardId, userId }: { rewardId: string; userId: string }) => {
      console.log('Claiming limited reward:', rewardId, userId);
      
      const { data, error } = await supabase.rpc('claim_limited_reward', {
        reward_id: rewardId,
        user_id: userId
      });
      
      if (error) {
        console.error('Error claiming reward:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Claim result:', data);
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['limited-rewards'] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      console.error('Claim error:', error);
      toast.error('เกิดข้อผิดพลาดในการรับรางวัล');
    }
  });
};
