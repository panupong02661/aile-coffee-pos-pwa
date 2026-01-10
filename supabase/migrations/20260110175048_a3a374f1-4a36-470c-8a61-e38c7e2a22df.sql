-- Add sound_popup column for sound and popup notification settings
ALTER TABLE public.notification_settings 
ADD COLUMN IF NOT EXISTS sound_popup jsonb DEFAULT '{"online": {"soundEnabled": true, "popupEnabled": true, "volume": 80}, "pos": {"soundEnabled": false, "popupEnabled": false, "volume": 80}}'::jsonb;