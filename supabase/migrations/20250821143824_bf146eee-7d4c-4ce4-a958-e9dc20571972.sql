
-- สร้างข้อมูลเริ่มต้นสำหรับ notification_settings หากยังไม่มี
INSERT INTO notification_settings (
  daily_reports,
  online_orders,
  monthly_reports,
  sound_enabled,
  volume,
  duration
) 
SELECT 
  '{"enabled": true, "time": "18:00", "message": "สรุปยอดขายประจำวัน", "platforms": {"discord": {"enabled": false, "token": ""}, "line": {"enabled": false, "token": ""}, "telegram": {"enabled": false, "token": ""}, "instagram": {"enabled": false, "token": ""}}}'::jsonb,
  '{"enabled": true, "message": "มีออเดอร์ออนไลน์ใหม่เข้ามา!", "platforms": {"discord": {"enabled": false, "token": ""}, "line": {"enabled": false, "token": ""}, "telegram": {"enabled": false, "token": ""}, "instagram": {"enabled": false, "token": ""}}}'::jsonb,
  '{"enabled": false, "time": "09:00", "dayOfMonth": 1, "message": "สรุปยอดขายประจำเดือน", "platforms": {"discord": {"enabled": false, "token": ""}, "line": {"enabled": false, "token": ""}, "telegram": {"enabled": false, "token": ""}, "instagram": {"enabled": false, "token": ""}}}'::jsonb,
  true,
  0.8,
  2
WHERE NOT EXISTS (SELECT 1 FROM notification_settings);

-- ตรวจสอบข้อมูลและเปรียบเทียบเวลา
SELECT 
  '🕐 เวลาที่ตั้งค่าแจ้งเตือน' as label,
  daily_reports->>'time' as scheduled_time,
  daily_reports->>'enabled' as notification_enabled
FROM notification_settings
WHERE daily_reports IS NOT NULL

UNION ALL

SELECT 
  '🌏 เวลาปัจจุบัน (Bangkok)' as label,
  to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') as current_time,
  to_char(now() at time zone 'Asia/Bangkok', 'YYYY-MM-DD') as current_date

UNION ALL

SELECT 
  '✅ สถานะการตรงกัน' as label,
  CASE 
    WHEN (SELECT daily_reports->>'time' FROM notification_settings LIMIT 1) = to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') 
    THEN 'ตรงกัน - ควรส่งแจ้งเตือน' 
    ELSE 'ไม่ตรงกัน' 
  END as match_status,
  '' as extra_info;
