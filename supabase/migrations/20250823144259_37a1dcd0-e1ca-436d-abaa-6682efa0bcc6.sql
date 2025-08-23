
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing cron job if it exists
SELECT cron.unschedule('daily-report-scheduler');

-- Create a cron job that runs every minute to check for scheduled reports
SELECT cron.schedule(
  'daily-report-scheduler',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url := 'https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/send-daily-report',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"}'::jsonb,
        body := '{"cron_trigger": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to manually trigger daily reports for testing
CREATE OR REPLACE FUNCTION trigger_daily_report_manual()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT
    net.http_post(
        url := 'https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/send-daily-report',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnpieGZsd3Zrc29ocm14YnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDU3NTksImV4cCI6MjA2NTI4MTc1OX0.h3nU_8JyrAaDI6NwxvnxTeb3kuiLpSSueuKcDOd33Jo"}'::jsonb,
        body := '{"manual_trigger": true}'::jsonb
    ) INTO result;
  
  RETURN json_build_object('success', true, 'message', 'Manual trigger sent', 'result', result);
END;
$$;
