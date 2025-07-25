-- Remove the notify_new_order trigger and function with CASCADE since net extension is not available
-- We'll use realtime subscriptions instead

-- Drop the trigger and function with CASCADE
DROP FUNCTION IF EXISTS public.notify_new_order() CASCADE;