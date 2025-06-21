
-- สร้างตารางสำหรับเก็บของรางวัลและโปรโมชั่นที่ส่งให้ลูกค้า
CREATE TABLE public.customer_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('reward', 'promotion', 'menu_item')),
  gift_id UUID NOT NULL, -- อ้างอิงไปยัง rewards, promotions หรือ menu_items
  gift_name TEXT NOT NULL,
  gift_description TEXT,
  gift_value NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  sent_by TEXT DEFAULT 'admin',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_customer_gifts_customer_id ON public.customer_gifts(customer_id);
CREATE INDEX idx_customer_gifts_is_used ON public.customer_gifts(is_used);
CREATE INDEX idx_customer_gifts_expires_at ON public.customer_gifts(expires_at);

-- สร้าง trigger สำหรับ updated_at
CREATE TRIGGER update_customer_gifts_updated_at
  BEFORE UPDATE ON public.customer_gifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- เพิ่ม RLS policies
ALTER TABLE public.customer_gifts ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับให้ admin/staff ดูได้ทั้งหมด
CREATE POLICY "Admin can view all customer gifts" 
  ON public.customer_gifts 
  FOR SELECT 
  USING (true);

-- Policy สำหรับให้ admin/staff สร้างได้
CREATE POLICY "Admin can create customer gifts" 
  ON public.customer_gifts 
  FOR INSERT 
  WITH CHECK (true);

-- Policy สำหรับให้ admin/staff อัพเดทได้
CREATE POLICY "Admin can update customer gifts" 
  ON public.customer_gifts 
  FOR UPDATE 
  USING (true);

-- สร้างตารางสำหรับเก็บประวัติการใช้งาน
CREATE TABLE public.gift_usage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_gift_id UUID NOT NULL REFERENCES public.customer_gifts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  order_id UUID,
  used_amount NUMERIC DEFAULT 0,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_gift_usage_history_customer_id ON public.gift_usage_history(customer_id);
CREATE INDEX idx_gift_usage_history_customer_gift_id ON public.gift_usage_history(customer_gift_id);

-- RLS policies สำหรับ gift_usage_history
ALTER TABLE public.gift_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all gift usage history" 
  ON public.gift_usage_history 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can create gift usage history" 
  ON public.gift_usage_history 
  FOR INSERT 
  WITH CHECK (true);
