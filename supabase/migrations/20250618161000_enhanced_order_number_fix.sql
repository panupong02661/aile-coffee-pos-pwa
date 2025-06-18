
-- ปรับปรุงฟังก์ชัน generate_order_number ให้มี error handling ที่ดีกว่า
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
  error_context TEXT;
BEGIN
  current_date := CURRENT_DATE;
  -- สร้าง lock key ที่ unique สำหรับวันนี้
  lock_key := hashtext('order_number_generation_' || current_date::text);
  
  -- Log เพื่อ debug
  RAISE LOG 'generate_order_number: Starting generation for date %', current_date;
  
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
          RAISE LOG 'generate_order_number: Generated % on attempt %', order_number, attempt_count;
          RETURN order_number;
        ELSE
          RAISE LOG 'generate_order_number: Order number % already exists, retrying...', order_number;
        END IF;
        
      EXCEPTION
        WHEN OTHERS THEN
          -- บันทึก error details
          error_context := SQLERRM;
          RAISE LOG 'generate_order_number: Error in attempt %: %', attempt_count, error_context;
          -- ปลดล็อกแม้เกิด error
          PERFORM pg_advisory_unlock(lock_key);
          -- Re-raise error ถ้าเป็น critical error
          IF SQLSTATE IN ('23505', '40001') THEN
            -- Unique violation หรือ serialization failure - ลองใหม่ได้
            NULL;
          ELSE
            -- Error อื่นๆ ให้ throw
            RAISE;
          END IF;
      END;
      
      -- ปลดล็อก
      PERFORM pg_advisory_unlock(lock_key);
    ELSE
      RAISE LOG 'generate_order_number: Failed to acquire lock on attempt %', attempt_count;
    END IF;
    
    -- ถ้าพยายามเกิน max_attempts ให้ใช้ timestamp + random
    IF attempt_count >= max_attempts THEN
      order_number := 'ORD-' || EXTRACT(EPOCH FROM now())::bigint::text || '-' || floor(random() * 1000)::text;
      RAISE LOG 'generate_order_number: Using fallback order number % after % attempts', order_number, max_attempts;
      RETURN order_number;
    END IF;
    
    -- รอสักครู่แล้วลองใหม่ (exponential backoff)
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 10)));
  END LOOP;
  
  -- ไม่ควรมาถึงจุดนี้
  RAISE EXCEPTION 'generate_order_number: Unexpected end of function';
END;
$function$;

-- เพิ่มการจัดการ error สำหรับ trigger หรือ constraint อื่นๆ
DO $$
BEGIN
  -- ตรวจสอบว่า index มีอยู่แล้วหรือไม่
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_order_number_date') THEN
    CREATE INDEX idx_orders_order_number_date ON orders(order_number, DATE(created_at));
    RAISE LOG 'Created index: idx_orders_order_number_date';
  ELSE
    RAISE LOG 'Index idx_orders_order_number_date already exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at_date') THEN
    CREATE INDEX idx_orders_created_at_date ON orders(DATE(created_at));
    RAISE LOG 'Created index: idx_orders_created_at_date';
  ELSE
    RAISE LOG 'Index idx_orders_created_at_date already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating indexes: %', SQLERRM;
END
$$;

-- เพิ่ม comment สำหรับ documentation
COMMENT ON FUNCTION public.generate_order_number() IS 'Generate unique order number with format ORD-XXX, includes retry logic and fallback mechanism';
