
-- เปิดใช้งาน pg_cron extension สำหรับการทำงานตามเวลา
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ลบ cron job เก่าหากมี
SELECT cron.unschedule('daily-report-trigger');

-- สร้าง cron job ใหม่ที่ทำงานทุกนาทีเพื่อตรวจสอบเวลา
SELECT cron.schedule(
  'daily-report-trigger',
  '* * * * *', -- ทำงานทุกนาที
  $$
  SELECT
    net.http_post(
        url:='https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/send-daily-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"}'::jsonb,
        body:=concat('{"scheduled_trigger": true, "current_time": "', to_char(now() at time zone 'Asia/Bangkok', 'HH24:MI'), '", "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- ตรวจสอบว่า cron job ถูกสร้างสำเร็จหรือไม่
SELECT 
  jobname,
  schedule,
  active,
  created_at as job_created_at
FROM cron.job 
WHERE jobname = 'daily-report-trigger';
