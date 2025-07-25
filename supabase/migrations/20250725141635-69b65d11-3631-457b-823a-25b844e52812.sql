-- Remove the notify_new_order trigger and function since net extension is not available
-- We'll use realtime subscriptions instead

-- Drop the trigger first
DROP TRIGGER IF EXISTS notify_new_order_trigger ON public.orders;

-- Drop the function
DROP FUNCTION IF EXISTS public.notify_new_order();