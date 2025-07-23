
-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  online_orders JSONB DEFAULT '{
    "enabled": true,
    "platforms": {
      "line": {"enabled": false, "token": ""},
      "instagram": {"enabled": false, "token": ""},
      "discord": {"enabled": false, "token": ""},
      "telegram": {"enabled": false, "token": ""}
    },
    "message": "มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท"
  }'::jsonb,
  daily_reports JSONB DEFAULT '{
    "enabled": true,
    "time": "18:00",
    "platforms": {
      "line": {"enabled": false},
      "instagram": {"enabled": false},
      "discord": {"enabled": false},
      "telegram": {"enabled": false}
    },
    "message": "สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ"
  }'::jsonb,
  monthly_reports JSONB DEFAULT '{
    "enabled": true,
    "dayOfMonth": 1,
    "time": "09:00",
    "platforms": {
      "line": {"enabled": false},
      "instagram": {"enabled": false},
      "discord": {"enabled": false},
      "telegram": {"enabled": false}
    },
    "message": "สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO notification_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();
