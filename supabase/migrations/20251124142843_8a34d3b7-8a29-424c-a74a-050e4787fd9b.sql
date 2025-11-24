-- เพิ่มคอลัมน์ duration_hours ในตาราง wifi_vouchers
ALTER TABLE wifi_vouchers 
ADD COLUMN duration_hours integer DEFAULT 24;

-- เพิ่มตาราง wifi_reset_schedule สำหรับเก็บการตั้งค่า auto reset
CREATE TABLE IF NOT EXISTS wifi_reset_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT false,
  reset_time time NOT NULL DEFAULT '00:00:00',
  reset_days text[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  last_reset_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE wifi_reset_schedule ENABLE ROW LEVEL SECURITY;

-- RLS policies for wifi_reset_schedule
CREATE POLICY "Allow all operations on wifi_reset_schedule" 
ON wifi_reset_schedule 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update trigger for wifi_reset_schedule
CREATE TRIGGER update_wifi_reset_schedule_updated_at
  BEFORE UPDATE ON wifi_reset_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default schedule settings
INSERT INTO wifi_reset_schedule (is_enabled, reset_time, reset_days)
VALUES (false, '00:00:00', ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])
ON CONFLICT DO NOTHING;