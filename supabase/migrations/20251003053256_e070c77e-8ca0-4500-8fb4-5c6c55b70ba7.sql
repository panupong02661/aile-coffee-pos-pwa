-- เพิ่มฟิลด์ order_type ในตาราง orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'dine_in';

-- เพิ่ม comment อธิบายฟิลด์
COMMENT ON COLUMN public.orders.order_type IS 'ประเภทออเดอร์: dine_in (ทานที่ร้าน), takeaway (นำกลับบ้าน), delivery (จัดส่ง)';