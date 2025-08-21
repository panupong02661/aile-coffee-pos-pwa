
-- ตรวจสอบเวลาใน notification_settings และเปรียบเทียบกับเวลาปัจจุบัน
SELECT 
  daily_reports->>'time' as scheduled_time,
  daily_reports->>'enabled' as is_enabled,
  
  -- เวลาปัจจุบันในประเทศไทย
  to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') as current_bangkok_time,
  to_char(now() at time zone 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS TZ') as full_bangkok_time,
  
  -- เปรียบเทียบเวลา
  CASE 
    WHEN daily_reports->>'time' = to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') 
    THEN 'ตรงกัน - ควรส่งรายงาน' 
    ELSE 'ไม่ตรงกัน' 
  END as time_match_status,
  
  -- แสดงข้อมูลเต็ม
  daily_reports
FROM notification_settings
LIMIT 1;
