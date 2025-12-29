-- Add discount_apply_type column to promotions table
-- 'item' = ลดทุกรายการที่เข้าเงื่อนไข, 'bill' = ลดท้ายบิลรวม
ALTER TABLE public.promotions
ADD COLUMN IF NOT EXISTS discount_apply_type text DEFAULT 'item';