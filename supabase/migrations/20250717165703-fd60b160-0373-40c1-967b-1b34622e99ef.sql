
-- สร้างตารางสำหรับ Delivery Integration (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS public.delivery_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL, -- 'LINE_MAN', 'GRAB_FOOD', 'FOODPANDA'
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  api_key TEXT,
  webhook_url TEXT,
  auto_sync_enabled BOOLEAN DEFAULT false,
  auto_notification_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตารางสำหรับ Daily Report Settings
CREATE TABLE IF NOT EXISTS public.daily_report_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  report_time TIME NOT NULL DEFAULT '18:00:00', -- เวลาส่งรายงาน
  line_enabled BOOLEAN DEFAULT false,
  line_webhook_url TEXT,
  telegram_enabled BOOLEAN DEFAULT false,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  discord_enabled BOOLEAN DEFAULT false,
  discord_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เพิ่ม trigger สำหรับ updated_at (ถ้ายังไม่มี)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_delivery_integrations_updated_at') THEN
        CREATE TRIGGER update_delivery_integrations_updated_at
            BEFORE UPDATE ON public.delivery_integrations
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_report_settings_updated_at') THEN
        CREATE TRIGGER update_daily_report_settings_updated_at
            BEFORE UPDATE ON public.daily_report_settings
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END$$;

-- เพิ่มข้อมูลเริ่มต้นสำหรับ delivery platforms (ถ้ายังไม่มี)
INSERT INTO public.delivery_integrations (platform_name) 
SELECT platform_name FROM (VALUES 
    ('LINE_MAN'),
    ('GRAB_FOOD'), 
    ('FOODPANDA')
) AS v(platform_name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.delivery_integrations 
    WHERE delivery_integrations.platform_name = v.platform_name
);

-- เพิ่มข้อมูลเริ่มต้นสำหรับ daily report settings (ถ้ายังไม่มี)
INSERT INTO public.daily_report_settings (is_enabled)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM public.daily_report_settings);
