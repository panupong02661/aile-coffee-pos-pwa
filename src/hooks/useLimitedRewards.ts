
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type LimitedReward = Database['public']['Tables']['limited_rewards']['Row'];

interface ClaimRewardResponse {
  success: boolean;
  message: string;
}

export const useLimitedRewards = () => {
  return useQuery({
    queryKey: ['limited-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limited_rewards')
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

export const useClaimLimitedReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, userId }: { rewardId: string; userId: string }) => {
      const { data, error } = await supabase.rpc('claim_limited_reward', {
        reward_id: rewardId,
        user_id: userId
      });

      if (error) throw error;

      // Safely parse the JSON response
      let result: ClaimRewardResponse;
      
      try {
        if (typeof data === 'string') {
          result = JSON.parse(data) as ClaimRewardResponse;
        } else if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          result = data as unknown as ClaimRewardResponse;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Failed to parse claim response:', parseError);
        throw new Error('เกิดข้อผิดพลาดในการประมวลผลคำขอ');
      }

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['limited-rewards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateLimitedReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reward: Omit<LimitedReward, 'id' | 'created_at' | 'updated_at' | 'current_claims'>) => {
      const { data, error } = await supabase
        .from('limited_rewards')
        .insert(reward)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('สร้างรางวัลสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['limited-rewards'] });
    },
    onError: (error: Error) => {
      toast.error('เกิดข้อผิดพลาดในการสร้างรางวัล: ' + error.message);
    },
  });
};
