import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      // Get users who have logged in recently (within last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, last_login')
        .gte('last_login', thirtyMinutesAgo)
        .order('last_login', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useSessionActivity = () => {
  return useQuery({
    queryKey: ['session-activity'],
    queryFn: async () => {
      // Get login activity from security logs
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .in('event_type', ['login_success', 'login_failed', 'logout'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useSessionStats = () => {
  return useQuery({
    queryKey: ['session-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's login attempts
      const { data: loginAttempts, error: loginError } = await supabase
        .from('security_logs')
        .select('event_type, created_at')
        .in('event_type', ['login_success', 'login_failed'])
        .gte('created_at', today);

      if (loginError) throw loginError;

      const successfulLogins = loginAttempts?.filter(l => l.event_type === 'login_success').length || 0;
      const failedLogins = loginAttempts?.filter(l => l.event_type === 'login_failed').length || 0;

      // Get currently active users
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: activeUsers, error: activeError } = await supabase
        .from('users')
        .select('id')
        .gte('last_login', thirtyMinutesAgo);

      if (activeError) throw activeError;

      return {
        successfulLogins,
        failedLogins,
        activeUsers: activeUsers?.length || 0,
        totalAttempts: successfulLogins + failedLogins,
        successRate: successfulLogins + failedLogins > 0 ? 
          Math.round((successfulLogins / (successfulLogins + failedLogins)) * 100) : 0
      };
    },
  });
};

export const useTerminateSession = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      // Log the session termination
      const { error } = await supabase
        .from('security_logs')
        .insert({
          event_type: 'session_terminated',
          details: { terminated_user_id: userId, terminated_by: 'admin' }
        });

      if (error) throw error;

      // In a real implementation, you would also invalidate the user's tokens
      // For now, we'll just log the event
      return { success: true };
    },
  });
};