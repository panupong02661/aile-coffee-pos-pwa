-- สร้างตาราง wifi_price_tiers สำหรับเก็บช่วงราคาและระยะเวลา WiFi
CREATE TABLE IF NOT EXISTS public.wifi_price_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_amount NUMERIC NOT NULL,
  duration_hours INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เพิ่ม constraint ให้ min_amount < max_amount
ALTER TABLE public.wifi_price_tiers 
ADD CONSTRAINT wifi_price_tiers_amount_check 
CHECK (min_amount < max_amount);

-- เพิ่ม constraint ให้ duration_hours > 0
ALTER TABLE public.wifi_price_tiers 
ADD CONSTRAINT wifi_price_tiers_duration_check 
CHECK (duration_hours > 0);

-- Enable RLS
ALTER TABLE public.wifi_price_tiers ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ authenticated users
CREATE POLICY "Authenticated users can manage wifi price tiers"
ON public.wifi_price_tiers
FOR ALL
USING (true)
WITH CHECK (true);

-- สร้าง index
CREATE INDEX idx_wifi_price_tiers_active ON public.wifi_price_tiers(is_active);
CREATE INDEX idx_wifi_price_tiers_amount ON public.wifi_price_tiers(min_amount, max_amount);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO public.wifi_price_tiers (min_amount, max_amount, duration_hours) VALUES
(0, 49.99, 1),
(50, 99.99, 3),
(100, 199.99, 5),
(200, 999999, 24);