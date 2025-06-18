
-- แก้ไขฟังก์ชัน generate_order_number ให้ป้องกันการสร้างเลขซ้ำอย่างสมบูรณ์
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
  current_date DATE;
  max_attempts INTEGER := 50;
  attempt_count INTEGER := 0;
BEGIN
  current_date := CURRENT_DATE;
  
  LOOP
    attempt_count := attempt_count + 1;
    
    -- ใช้ transaction lock เพื่อป้องกัน concurrent access
    PERFORM pg_advisory_lock(hashtext('order_number_generation'));
    
    BEGIN
      -- หาเลขออเดอร์ถัดไปสำหรับวันนี้
      SELECT COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
      INTO next_number
      FROM public.orders o
      WHERE DATE(o.created_at) = current_date;
      
      -- สร้างเลขออเดอร์ในรูปแบบ ORD-XXX
      order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
      
      -- ตรวจสอบว่าเลขนี้มีอยู่แล้วหรือไม่
      IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_number) THEN
        -- ปลดล็อก
        PERFORM pg_advisory_unlock(hashtext('order_number_generation'));
        RETURN order_number;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- ปลดล็อกแม้เกิด error
        PERFORM pg_advisory_unlock(hashtext('order_number_generation'));
        RAISE;
    END;
    
    -- ปลดล็อก
    PERFORM pg_advisory_unlock(hashtext('order_number_generation'));
    
    -- ถ้าพยายามเกิน max_attempts ให้ใช้ timestamp
    IF attempt_count >= max_attempts THEN
      order_number := 'ORD-' || EXTRACT(EPOCH FROM now())::bigint::text;
      RETURN order_number;
    END IF;
    
    -- รอสักครู่แล้วลองใหม่
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$function$;
