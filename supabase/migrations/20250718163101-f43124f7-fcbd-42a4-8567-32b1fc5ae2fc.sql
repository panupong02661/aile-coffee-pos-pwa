
-- สร้างตาราง notification_schedules สำหรับการจัดเก็บการตั้งค่าการแจ้งเตือน
CREATE TABLE public.notification_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'line',
  webhook_url TEXT NOT NULL,
  daily_enabled BOOLEAN NOT NULL DEFAULT false,
  daily_time TIME NOT NULL DEFAULT '09:00',
  monthly_enabled BOOLEAN NOT NULL DEFAULT false,
  monthly_date INTEGER NOT NULL DEFAULT 1,
  monthly_time TIME NOT NULL DEFAULT '09:00',
  report_types TEXT[] NOT NULL DEFAULT ARRAY['sales'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เพิ่ม RLS policies
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

-- สร้าง policy ให้อนุญาตการดำเนินการทั้งหมด (สำหรับระบบแอดมิน)
CREATE POLICY "Allow all operations on notification_schedules" 
  ON public.notification_schedules 
  FOR ALL 
  USING (true);

-- เพิ่ม constraint สำหรับ platform
ALTER TABLE public.notification_schedules 
ADD CONSTRAINT notification_schedules_platform_check 
CHECK (platform IN ('line', 'telegram', 'discord', 'instagram'));

-- เพิ่ม constraint สำหรับ monthly_date
ALTER TABLE public.notification_schedules 
ADD CONSTRAINT notification_schedules_monthly_date_check 
CHECK (monthly_date >= 1 AND monthly_date <= 28);

-- สร้าง trigger สำหรับ updated_at
CREATE TRIGGER update_notification_schedules_updated_at
  BEFORE UPDATE ON public.notification_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
