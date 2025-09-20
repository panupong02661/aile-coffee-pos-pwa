import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useErrorLogs = () => {
  return useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useLogError = () => {
  return useMutation({
    mutationFn: async (errorData: {
      error_type: string;
      error_message: string;
      stack_trace?: string;
      url?: string;
      user_agent?: string;
    }) => {
      const { error } = await supabase
        .from('error_logs')
        .insert(errorData);

      if (error) throw error;
    },
  });
};

export const useErrorStats = () => {
  return useQuery({
    queryKey: ['error-stats'],
    queryFn: async () => {
      // Get error counts by type
      const { data: errorCounts, error: errorCountsError } = await supabase
        .from('error_logs')
        .select('error_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (errorCountsError) throw errorCountsError;

      // Calculate stats
      const totalErrors = errorCounts?.length || 0;
      const errorsByType = errorCounts?.reduce((acc: Record<string, number>, error) => {
        acc[error.error_type] = (acc[error.error_type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get recent errors
      const { data: recentErrors, error: recentErrorsError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentErrorsError) throw recentErrorsError;

      return {
        totalErrors,
        errorsByType,
        recentErrors: recentErrors || []
      };
    },
  });
};