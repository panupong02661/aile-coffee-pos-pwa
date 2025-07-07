
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOfflineSyncQueue = () => {
  return useQuery({
    queryKey: ['offline-sync-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offline_sync_queue')
        .select('*')
        .eq('is_synced', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddToSyncQueue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (syncItem: {
      device_id: string;
      action_type: string;
      table_name: string;
      data: any;
    }) => {
      const { error } = await supabase
        .from('offline_sync_queue')
        .insert(syncItem);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-sync-queue'] });
    },
  });
};

export const useMarkAsSynced = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offline_sync_queue')
        .update({ 
          is_synced: true, 
          synced_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-sync-queue'] });
    },
  });
};
