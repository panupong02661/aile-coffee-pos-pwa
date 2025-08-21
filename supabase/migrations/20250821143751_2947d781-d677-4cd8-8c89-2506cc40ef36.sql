
-- ตรวจสอบเวลาปัจจุบันและเปรียบเทียบกับเวลาที่ตั้งค่าแจ้งเตือน
SELECT 
  daily_reports->>'time' as scheduled_time,
  daily_reports->>'enabled' as notification_enabled,
  
  -- เวลาปัจจุบันในประเทศไทย
  to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') as current_time_bangkok,
  to_char(now() at time zone 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') as full_datetime_bangkok,
  
  -- ตรวจสอบว่าเวลาตรงกันหรือไม่
  CASE 
    WHEN daily_reports->>'time' = to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') 
    THEN '✅ ตรงกัน - ควรส่งแจ้งเตือน' 
    ELSE '❌ ไม่ตรงกัน' 
  END as time_match_result,
  
  -- คำนวณเวลาที่เหลือจนถึงเวลาแจ้งเตือน
  CASE 
    WHEN daily_reports->>'time' > to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') THEN
      'เหลืออีก ' || (
        EXTRACT(HOUR FROM (daily_reports->>'time')::time - (now() at time zone 'Asia/Bangkok')::time) || ' ชั่วโมง ' ||
        EXTRACT(MINUTE FROM (daily_reports->>'time')::time - (now() at time zone 'Asia/Bangkok')::time) || ' นาที'
      )
    WHEN daily_reports->>'time' < to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI') THEN
      'ผ่านมาแล้ว ' || (
        EXTRACT(HOUR FROM (now() at time zone 'Asia/Bangkok')::time - (daily_reports->>'time')::time) || ' ชั่วโมง ' ||
        EXTRACT(MINUTE FROM (now() at time zone 'Asia/Bangkok')::time - (daily_reports->>'time')::time) || ' นาที'
      )
    ELSE 'ตอนนี้เป็นเวลาส่งแจ้งเตือนพอดี!'
  END as time_difference
  
FROM notification_settings
WHERE daily_reports IS NOT NULL
LIMIT 1;
