
-- แก้ไขฟังก์ชัน generate_order_number เพื่อป้องกันการสร้างเลขซ้ำ
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
  current_timestamp TIMESTAMP WITH TIME ZONE;
  date_prefix TEXT;
BEGIN
  -- ใช้ current timestamp เพื่อความแม่นยำ
  current_timestamp := now();
  date_prefix := to_char(current_timestamp, 'YYYYMMDD');
  
  -- ใช้ LOCK เพื่อป้องกันการเรียกใช้พร้อมกัน
  LOCK TABLE public.orders IN EXCLUSIVE MODE;
  
  -- หาเลขออเดอร์ถัดไปสำหรับวันนี้
  SELECT COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders o
  WHERE DATE(o.created_at) = DATE(current_timestamp);
  
  -- สร้างเลขออเดอร์ในรูปแบบ ORD-XXX
  order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN order_number;
END;
$function$;
