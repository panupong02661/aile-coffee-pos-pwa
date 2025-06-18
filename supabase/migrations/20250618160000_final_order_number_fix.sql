
-- แก้ไขฟังก์ชัน generate_order_number ให้ป้องกันการสร้างเลขซ้ำอย่างสมบูรณ์
DROP FUNCTION IF EXISTS public.generate_order_number();

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
  current_date DATE;
  max_attempts INTEGER := 100;
  attempt_count INTEGER := 0;
  lock_key BIGINT;
BEGIN
  current_date := CURRENT_DATE;
  -- สร้าง lock key ที่ unique สำหรับวันนี้
  lock_key := hashtext('order_number_generation_' || current_date::text);
  
  LOOP
    attempt_count := attempt_count + 1;
    
    -- ใช้ advisory lock เพื่อป้องกัน concurrent access
    IF pg_try_advisory_lock(lock_key) THEN
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
          -- ปลดล็อกและ return
          PERFORM pg_advisory_unlock(lock_key);
          RETURN order_number;
        END IF;
        
      EXCEPTION
        WHEN OTHERS THEN
          -- ปลดล็อกแม้เกิด error
          PERFORM pg_advisory_unlock(lock_key);
          RAISE;
      END;
      
      -- ปลดล็อก
      PERFORM pg_advisory_unlock(lock_key);
    END IF;
    
    -- ถ้าพยายามเกิน max_attempts ให้ใช้ timestamp + random
    IF attempt_count >= max_attempts THEN
      order_number := 'ORD-' || EXTRACT(EPOCH FROM now())::bigint::text || '-' || floor(random() * 1000)::text;
      RETURN order_number;
    END IF;
    
    -- รอสักครู่แล้วลองใหม่ (exponential backoff)
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 10)));
  END LOOP;
END;
$function$;

-- เพิ่ม index เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_orders_order_number_date ON orders(order_number, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_orders_created_at_date ON orders(DATE(created_at));
