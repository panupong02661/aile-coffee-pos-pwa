-- First, drop the foreign key constraint
ALTER TABLE notification_settings 
DROP CONSTRAINT IF EXISTS notification_settings_selected_sound_id_fkey;

-- Then change the column type to text
ALTER TABLE notification_settings 
ALTER COLUMN selected_sound_id TYPE text;