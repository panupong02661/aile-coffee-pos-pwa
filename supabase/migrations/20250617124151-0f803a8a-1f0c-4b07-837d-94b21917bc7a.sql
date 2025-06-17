
-- แก้ไขฟังก์ชัน generate_order_number เพื่อแก้ปัญหา ambiguous column reference
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get the next order number for today โดยระบุชื่อตารางชัดเจน
  SELECT COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders o
  WHERE DATE(o.created_at) = CURRENT_DATE;
  
  -- Format as ORD-XXX
  order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;
