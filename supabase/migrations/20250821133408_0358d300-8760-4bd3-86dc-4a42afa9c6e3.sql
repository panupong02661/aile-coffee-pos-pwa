
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to send daily reports at 18:00 (6 PM) every day
SELECT cron.schedule(
  'send-daily-reports',
  '0 18 * * *', -- At 6:00 PM every day
  $$
  SELECT
    net.http_post(
        url:='https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/send-daily-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"}'::jsonb,
        body:=concat('{"scheduled_time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
