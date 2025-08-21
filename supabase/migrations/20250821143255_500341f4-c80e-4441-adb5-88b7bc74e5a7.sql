
-- ตรวจสอบว่ามีข้อมูลในตาราง notification_settings หรือไม่
SELECT 
  id,
  daily_reports,
  created_at,
  updated_at,
  -- เวลาปัจจุบันในประเทศไทย  
  now() at time zone 'Asia/Bangkok' as current_bangkok_time,
  to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') as current_time_formatted
FROM notification_settings;

-- หากไม่มีข้อมูล ให้สร้างข้อมูลเริ่มต้น
INSERT INTO notification_settings (daily_reports) 
SELECT '{"enabled": true, "time": "18:00", "message": "สรุปยอดขายประจำวัน", "platforms": {"discord": {"enabled": false, "token": ""}, "line": {"enabled": false, "token": ""}, "telegram": {"enabled": false, "token": ""}, "instagram": {"enabled": false, "token": ""}}}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM notification_settings);

-- ตรวจสอบข้อมูลอีกครั้งหลังจากสร้าง
SELECT 
  daily_reports->>'time' as scheduled_time,
  daily_reports->>'enabled' as is_enabled,
  to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') as current_bangkok_time,
  CASE 
    WHEN daily_reports->>'time' = to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') 
    THEN 'ตรงกัน - ควรส่งรายงาน' 
    ELSE 'ไม่ตรงกัน' 
  END as time_match_status
FROM notification_settings
LIMIT 1;
