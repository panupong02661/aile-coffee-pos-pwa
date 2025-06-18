
-- ลบฟังก์ชันเก่าและสร้างใหม่พร้อมการป้องกันที่แข็งแกร่งกว่า
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
  lock_acquired BOOLEAN := FALSE;
  error_context TEXT;
BEGIN
  current_date := CURRENT_DATE;
  
  -- Log เพื่อ debug
  RAISE LOG 'generate_order_number: Starting generation for date %', current_date;
  
  -- ลูปหลักสำหรับการลองใหม่
  LOOP
    attempt_count := attempt_count + 1;
    lock_acquired := FALSE;
    
    BEGIN
      -- ใช้ advisory lock แบบ exclusive
      SELECT pg_try_advisory_lock(hashtext('order_number_' || current_date::text)) INTO lock_acquired;
      
      IF lock_acquired THEN
        -- หาเลขออเดอร์ถัดไปสำหรับวันนี้ (ใช้ FOR UPDATE เพื่อล็อกแถว)
        WITH numbered_orders AS (
          SELECT 
            CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER) as order_num
          FROM public.orders 
          WHERE DATE(created_at) = current_date 
            AND order_number ~ '^ORD-\d+$'
          FOR UPDATE
        )
        SELECT COALESCE(MAX(order_num), 0) + 1 
        INTO next_number 
        FROM numbered_orders;
        
        -- สร้างเลขออเดอร์
        order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
        
        -- ตรวจสอบซ้ำอีกครั้งก่อน return
        IF NOT EXISTS (
          SELECT 1 FROM public.orders 
          WHERE order_number = order_number
        ) THEN
          -- ปลดล็อกและ return
          PERFORM pg_advisory_unlock(hashtext('order_number_' || current_date::text));
          RAISE LOG 'generate_order_number: Generated % on attempt %', order_number, attempt_count;
          RETURN order_number;
        ELSE
          RAISE LOG 'generate_order_number: Collision detected for %, retrying...', order_number;
        END IF;
        
        -- ปลดล็อก
        PERFORM pg_advisory_unlock(hashtext('order_number_' || current_date::text));
      ELSE
        RAISE LOG 'generate_order_number: Failed to acquire lock on attempt %', attempt_count;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- ปลดล็อกในกรณีเกิด error
        IF lock_acquired THEN
          PERFORM pg_advisory_unlock(hashtext('order_number_' || current_date::text));
        END IF;
        
        error_context := SQLERRM;
        RAISE LOG 'generate_order_number: Error in attempt %: %', attempt_count, error_context;
        
        -- Re-raise สำหรับ critical errors
        IF SQLSTATE NOT IN ('23505', '40001', '40P01') THEN
          RAISE;
        END IF;
    END;
    
    -- ถ้าเกิน max attempts ให้ใช้ fallback
    IF attempt_count >= max_attempts THEN
      order_number := 'ORD-' || EXTRACT(EPOCH FROM clock_timestamp())::bigint::text || '-' || floor(random() * 1000)::text;
      RAISE LOG 'generate_order_number: Using fallback % after % attempts', order_number, max_attempts;
      RETURN order_number;
    END IF;
    
    -- รอแบบ exponential backoff
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 8)));
  END LOOP;
END;
$function$;

-- สร้าง index เพื่อเพิ่มประสิทธิภาพ
DROP INDEX IF EXISTS idx_orders_order_number_unique;
DROP INDEX IF EXISTS idx_orders_created_date;
DROP INDEX IF EXISTS idx_orders_order_number_pattern;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number_unique 
ON orders(order_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_date 
ON orders(DATE(created_at));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number_pattern 
ON orders(order_number) 
WHERE order_number ~ '^ORD-\d+$';

-- เพิ่ม comment
COMMENT ON FUNCTION public.generate_order_number() IS 
'Generate unique order number with format ORD-XXX using advisory locks and collision detection';
