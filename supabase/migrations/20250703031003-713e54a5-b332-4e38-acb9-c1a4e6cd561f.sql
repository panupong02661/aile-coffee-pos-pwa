
-- สร้างตารางสำหรับจัดการโปรโมชั่นพิเศษแบบ Limited Time
CREATE TABLE IF NOT EXISTS public.limited_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_value NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'amount')),
  max_claims INTEGER NOT NULL DEFAULT 1,
  current_claims INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  promo_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- สร้างตารางสำหรับเก็บการรับโปรโมชั่นของลูกค้า
CREATE TABLE IF NOT EXISTS public.customer_promotion_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  promotion_id UUID REFERENCES public.limited_promotions(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  order_id UUID
);

-- เพิ่ม RLS policies
ALTER TABLE public.limited_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_promotion_claims ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับโปรโมชั่น - ให้ทุกคนดูได้ แต่เฉพาะ admin จัดการได้
CREATE POLICY "Anyone can view active promotions" ON public.limited_promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage promotions" ON public.limited_promotions FOR ALL USING (true);

-- Policy สำหรับการรับโปรโมชั่น - ลูกค้าดูและสร้างของตัวเองได้
CREATE POLICY "Customers can view their claims" ON public.customer_promotion_claims FOR SELECT 
USING (customer_id IN (SELECT id FROM customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create claims" ON public.customer_promotion_claims FOR INSERT 
WITH CHECK (customer_id IN (SELECT id FROM customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage all claims" ON public.customer_promotion_claims FOR ALL USING (true);

-- สร้าง function สำหรับรับโปรโมชั่น
CREATE OR REPLACE FUNCTION claim_limited_promotion(
  promotion_id_param UUID,
  customer_id_param UUID
) RETURNS JSON AS $$
DECLARE
  promotion_record public.limited_promotions;
  result JSON;
BEGIN
  -- ล็อกและดึงข้อมูลโปรโมชั่น
  SELECT * INTO promotion_record 
  FROM public.limited_promotions 
  WHERE id = promotion_id_param 
  AND is_active = true 
  AND start_date <= now() 
  AND end_date >= now()
  FOR UPDATE;
  
  -- ตรวจสอบว่าโปรโมชั่นยังใช้ได้
  IF NOT FOUND THEN
    RETURN '{"success": false, "message": "โปรโมชั่นไม่พร้อมใช้งาน"}';
  END IF;
  
  -- ตรวจสอบว่าลูกค้ารับแล้วหรือยัง
  IF EXISTS (
    SELECT 1 FROM public.customer_promotion_claims 
    WHERE promotion_id = promotion_id_param 
    AND customer_id = customer_id_param
  ) THEN
    RETURN '{"success": false, "message": "คุณได้รับโปรโมชั่นนี้แล้ว"}';
  END IF;
  
  -- ตรวจสอบจำนวนที่รับได้
  IF promotion_record.current_claims >= promotion_record.max_claims THEN
    RETURN '{"success": false, "message": "โปรโมชั่นหมดแล้ว"}';
  END IF;
  
  -- รับโปรโมชั่น
  INSERT INTO public.customer_promotion_claims (promotion_id, customer_id)
  VALUES (promotion_id_param, customer_id_param);
  
  -- อัปเดตจำนวนที่รับแล้ว
  UPDATE public.limited_promotions 
  SET current_claims = current_claims + 1,
      updated_at = now()
  WHERE id = promotion_id_param;
  
  RETURN '{"success": true, "message": "รับโปรโมชั่นสำเร็จ"}';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO public.limited_promotions (title, description, discount_value, discount_type, max_claims, start_date, end_date, promo_code)
VALUES 
('Flash Sale 50% Off!', 'ลดราคา 50% สำหรับเมนูเครื่องดื่มทุกแก้ว', 50, 'percentage', 100, now(), now() + interval '2 hours', 'FLASH50'),
('ส่วนลด 30 บาท ทันที!', 'ส่วนลด 30 บาท เมื่อสั่งซื้อครบ 200 บาท', 30, 'amount', 50, now(), now() + interval '24 hours', 'SAVE30');
