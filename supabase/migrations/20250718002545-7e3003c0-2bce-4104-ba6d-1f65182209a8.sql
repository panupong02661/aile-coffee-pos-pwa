
-- สร้างตารางสำหรับ Delivery Integration
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

-- เพิ่ม RLS policies
ALTER TABLE public.delivery_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on delivery_integrations" 
  ON public.delivery_integrations 
  FOR ALL 
  USING (true);

-- เพิ่ม trigger สำหรับ updated_at
CREATE TRIGGER update_delivery_integrations_updated_at
    BEFORE UPDATE ON public.delivery_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- เพิ่มข้อมูลเริ่มต้นสำหรับ delivery platforms
INSERT INTO public.delivery_integrations (platform_name) 
VALUES 
    ('LINE_MAN'),
    ('GRAB_FOOD'), 
    ('FOODPANDA')
ON CONFLICT DO NOTHING;
