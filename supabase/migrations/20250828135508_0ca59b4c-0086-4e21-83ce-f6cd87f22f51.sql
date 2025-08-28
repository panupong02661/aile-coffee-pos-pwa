-- Add pos_orders field to notification_settings table for POS order notifications
ALTER TABLE public.notification_settings 
ADD COLUMN IF NOT EXISTS pos_orders JSONB;