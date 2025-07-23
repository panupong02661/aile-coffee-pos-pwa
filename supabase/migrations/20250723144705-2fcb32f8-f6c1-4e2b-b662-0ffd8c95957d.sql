
-- Add the missing JSONB columns to notification_settings table
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS online_orders JSONB DEFAULT '{
  "enabled": true,
  "platforms": {
    "line": {"enabled": false, "token": ""},
    "instagram": {"enabled": false, "token": ""},
    "discord": {"enabled": false, "token": ""},
    "telegram": {"enabled": false, "token": ""}
  },
  "message": "มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท"
}'::jsonb;

ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS daily_reports JSONB DEFAULT '{
  "enabled": true,
  "time": "18:00",
  "platforms": {
    "line": {"enabled": false},
    "instagram": {"enabled": false},
    "discord": {"enabled": false},
    "telegram": {"enabled": false}
  },
  "message": "สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ"
}'::jsonb;

ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS monthly_reports JSONB DEFAULT '{
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
}'::jsonb;

-- Insert default settings if no record exists
INSERT INTO notification_settings (online_orders, daily_reports, monthly_reports) 
SELECT 
  '{
    "enabled": true,
    "platforms": {
      "line": {"enabled": false, "token": ""},
      "instagram": {"enabled": false, "token": ""},
      "discord": {"enabled": false, "token": ""},
      "telegram": {"enabled": false, "token": ""}
    },
    "message": "มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท"
  }'::jsonb,
  '{
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
  '{
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
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM notification_settings LIMIT 1);
