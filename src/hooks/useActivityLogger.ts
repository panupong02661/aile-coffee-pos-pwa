import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ActivityAction = 
  | 'menu_created' | 'menu_updated' | 'menu_deleted'
  | 'order_cancelled' | 'order_created'
  | 'discount_applied' | 'discount_exceeded'
  | 'member_created' | 'member_updated' | 'member_deleted'
  | 'settings_changed' | 'stock_adjusted'
  | 'category_created' | 'category_deleted'
  | 'promotion_created' | 'promotion_deleted'
  | 'login' | 'logout'
  | 'backup_created' | 'backup_restored';

interface LogActivityParams {
  action: ActivityAction;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

export const useActivityLogger = () => {
  const logActivity = useCallback(async ({ action, resource_type, resource_id, details }: LogActivityParams) => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const parsed = currentUser ? JSON.parse(currentUser) : null;
      
      await supabase.from('activity_logs').insert({
        action,
        resource_type,
        resource_id,
        details: {
          ...details,
          username: parsed?.username || 'unknown',
          user_role: parsed?.role || 'unknown',
          timestamp: new Date().toISOString(),
        },
        user_id: parsed?.id || null,
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, []);

  return { logActivity };
};
