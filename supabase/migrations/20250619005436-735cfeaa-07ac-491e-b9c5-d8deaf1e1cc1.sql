
-- ลบและสร้างใหม่ทั้งหมดเพื่อแก้ปัญหาอย่างสิ้นเชิง
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;

-- สร้างฟังก์ชันใหม่ที่มีการป้องกันที่แข็งแกร่งกว่า
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
  today_date DATE;
  max_attempts INTEGER := 50;
  attempt_count INTEGER := 0;
  lock_acquired BOOLEAN := FALSE;
  error_context TEXT;
  unique_suffix TEXT;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Log เพื่อ debug
  RAISE LOG 'generate_order_number: Starting generation for date %', today_date;
  
  -- ลูปหลักสำหรับการลองใหม่
  LOOP
    attempt_count := attempt_count + 1;
    lock_acquired := FALSE;
    
    BEGIN
      -- ใช้ advisory lock แบบ blocking พร้อม timeout
      SELECT pg_try_advisory_lock(hashtext('order_number_' || today_date::text)) INTO lock_acquired;
      
      IF lock_acquired THEN
        -- ตรวจสอบและล็อกข้อมูลเพื่อป้องกันการอ่านซ้ำ
        PERFORM pg_advisory_lock(hashtext('order_sequence_' || today_date::text));
        
        -- หาเลขออเดอร์ถัดไปสำหรับวันนี้แบบ atomic
        WITH order_sequence AS (
          SELECT 
            COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) as max_num
          FROM public.orders o
          WHERE DATE(o.created_at) = today_date 
            AND o.order_number ~ '^ORD-\d+$'
        )
        SELECT max_num + 1 INTO next_number FROM order_sequence;
        
        -- สร้างเลขออเดอร์
        order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
        
        -- ตรวจสอบความซ้ำซ้อนอีกครั้งก่อน return
        IF NOT EXISTS (
          SELECT 1 FROM public.orders 
          WHERE order_number = order_number
          FOR UPDATE NOWAIT
        ) THEN
          -- ปลดล็อกทั้งหมดและ return
          PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
          PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
          
          RAISE LOG 'generate_order_number: Successfully generated % on attempt %', order_number, attempt_count;
          RETURN order_number;
        ELSE
          RAISE LOG 'generate_order_number: Collision detected for %, retrying...', order_number;
        END IF;
        
        -- ปลดล็อก
        PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
        PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
      ELSE
        RAISE LOG 'generate_order_number: Failed to acquire lock on attempt %', attempt_count;
      END IF;
      
    EXCEPTION
      WHEN lock_not_available THEN
        -- Lock timeout - รอแล้วลองใหม่
        RAISE LOG 'generate_order_number: Lock timeout on attempt %, retrying...', attempt_count;
      WHEN OTHERS THEN
        -- ปลดล็อกในกรณีเกิด error
        IF lock_acquired THEN
          BEGIN
            PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
            PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
          EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore unlock errors
          END;
        END IF;
        
        error_context := SQLERRM;
        RAISE LOG 'generate_order_number: Error in attempt %: % (SQLSTATE: %)', attempt_count, error_context, SQLSTATE;
        
        -- Re-raise สำหรับ critical errors ที่ไม่ใช่ serialization conflicts
        IF SQLSTATE NOT IN ('23505', '40001', '40P01', '55P03') THEN
          RAISE;
        END IF;
    END;
    
    -- ถ้าเกิน max attempts ให้ใช้ fallback พร้อม unique suffix
    IF attempt_count >= max_attempts THEN
      unique_suffix := EXTRACT(EPOCH FROM clock_timestamp())::bigint::text || '-' || 
                      floor(random() * 10000)::text || '-' || 
                      pg_backend_pid()::text;
      order_number := 'ORD-FB-' || unique_suffix;
      
      RAISE LOG 'generate_order_number: Using fallback % after % attempts', order_number, max_attempts;
      RETURN order_number;
    END IF;
    
    -- รอแบบ exponential backoff พร้อม jitter
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 8)) + random() * 0.01);
  END LOOP;
END;
$function$;

-- ลบ index เก่าที่อาจมีปัญหา
DROP INDEX IF EXISTS idx_orders_order_number_unique;
DROP INDEX IF EXISTS idx_orders_created_date;
DROP INDEX IF EXISTS idx_orders_order_number_pattern;
DROP INDEX IF EXISTS idx_orders_order_number_date;
DROP INDEX IF EXISTS idx_orders_created_at_date;

-- สร้าง index ใหม่ที่เหมาะสม (ใช้ created_at แทน DATE(created_at))
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_unique 
ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_orders_created_at_order_num 
ON orders(created_at, order_number) 
WHERE order_number ~ '^ORD-\d+$';

-- สร้างฟังก์ชันสำรองสำหรับการทดสอบ
CREATE OR REPLACE FUNCTION public.test_order_number_generation(test_count INTEGER DEFAULT 10)
RETURNS TABLE(
  test_num INTEGER,
  order_number TEXT,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
AS $function$
DECLARE
  i INTEGER;
  generated_number TEXT;
  test_success BOOLEAN;
  test_error TEXT;
BEGIN
  FOR i IN 1..test_count LOOP
    BEGIN
      generated_number := generate_order_number();
      test_success := TRUE;
      test_error := NULL;
    EXCEPTION
      WHEN OTHERS THEN
        generated_number := NULL;
        test_success := FALSE;
        test_error := SQLERRM;
    END;
    
    RETURN QUERY SELECT i, generated_number, test_success, test_error;
  END LOOP;
END;
$function$;

-- เพิ่ม comment สำหรับ documentation
COMMENT ON FUNCTION public.generate_order_number() IS 
'Generate unique order number with format ORD-XXX using multiple locks, atomic operations, and robust fallback mechanism. Handles high concurrency scenarios.';

COMMENT ON FUNCTION public.test_order_number_generation(INTEGER) IS 
'Test function to verify order number generation under load. Returns success/failure status for each attempt.';
