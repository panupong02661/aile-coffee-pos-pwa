-- Drop the duplicate database trigger that calls the edge function
DROP TRIGGER IF EXISTS trigger_notify_new_order ON public.orders;
DROP FUNCTION IF EXISTS public.notify_new_order();

-- Keep realtime enabled for client-side notifications in UI
-- (no trigger needed, GlobalNotificationProvider handles edge function call)
