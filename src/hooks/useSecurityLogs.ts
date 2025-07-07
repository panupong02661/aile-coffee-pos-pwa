
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityLogs = () => {
  return useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useLogSecurityEvent = () => {
  return useMutation({
    mutationFn: async (event: {
      event_type: string;
      user_id?: string;
      ip_address?: string;
      user_agent?: string;
      details?: any;
    }) => {
      const { error } = await supabase
        .from('security_logs')
        .insert(event);

      if (error) throw error;
    },
  });
};

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useLogActivity = () => {
  return useMutation({
    mutationFn: async (activity: {
      action: string;
      resource_type?: string;
      resource_id?: string;
      details?: any;
      ip_address?: string;
    }) => {
      const { error } = await supabase
        .from('activity_logs')
        .insert(activity);

      if (error) throw error;
    },
  });
};
