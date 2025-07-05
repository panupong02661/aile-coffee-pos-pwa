
-- Add duration column to notification_settings table
ALTER TABLE public.notification_settings 
ADD COLUMN duration integer DEFAULT 2;

-- Update existing records to have the default duration value
UPDATE public.notification_settings 
SET duration = 2 
WHERE duration IS NULL;
