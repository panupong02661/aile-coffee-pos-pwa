ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS daily_report_last_sent_date date;