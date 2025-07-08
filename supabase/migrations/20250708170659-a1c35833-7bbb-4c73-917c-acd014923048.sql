-- Change selected_sound_id column type from uuid to text to support both UUID and sound names
ALTER TABLE notification_settings 
ALTER COLUMN selected_sound_id TYPE text;