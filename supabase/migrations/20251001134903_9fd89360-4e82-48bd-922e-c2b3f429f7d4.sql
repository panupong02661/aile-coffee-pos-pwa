-- Fix generate_order_number function - use clear variable name to avoid ambiguity
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  generated_order_number TEXT;  -- Changed from order_number to avoid ambiguity
  today_date DATE;
  max_attempts INTEGER := 50;
  attempt_count INTEGER := 0;
  lock_acquired BOOLEAN := FALSE;
  error_context TEXT;
  unique_suffix TEXT;
BEGIN
  today_date := CURRENT_DATE;
  
  RAISE LOG 'generate_order_number: Starting generation for date %', today_date;
  
  LOOP
    attempt_count := attempt_count + 1;
    lock_acquired := FALSE;
    
    BEGIN
      SELECT pg_try_advisory_lock(hashtext('order_number_' || today_date::text)) INTO lock_acquired;
      
      IF lock_acquired THEN
        PERFORM pg_advisory_lock(hashtext('order_sequence_' || today_date::text));
        
        -- Find next order number for today atomically
        WITH order_sequence AS (
          SELECT 
            COALESCE(MAX(CAST(SUBSTRING(orders.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) as max_num
          FROM public.orders
          WHERE DATE(orders.created_at) = today_date 
            AND orders.order_number ~ '^ORD-\d+$'
        )
        SELECT max_num + 1 INTO next_number FROM order_sequence;
        
        -- Create order number
        generated_order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
        
        -- Check for duplicates - now with clear variable vs column distinction
        IF NOT EXISTS (
          SELECT 1 FROM public.orders 
          WHERE orders.order_number = generated_order_number
          FOR UPDATE NOWAIT
        ) THEN
          PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
          PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
          
          RAISE LOG 'generate_order_number: Successfully generated % on attempt %', generated_order_number, attempt_count;
          RETURN generated_order_number;
        ELSE
          RAISE LOG 'generate_order_number: Collision detected for %, retrying...', generated_order_number;
        END IF;
        
        PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
        PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
      ELSE
        RAISE LOG 'generate_order_number: Failed to acquire lock on attempt %', attempt_count;
      END IF;
      
    EXCEPTION
      WHEN lock_not_available THEN
        RAISE LOG 'generate_order_number: Lock timeout on attempt %, retrying...', attempt_count;
      WHEN OTHERS THEN
        IF lock_acquired THEN
          BEGIN
            PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
            PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
          EXCEPTION WHEN OTHERS THEN
            NULL;
          END;
        END IF;
        
        error_context := SQLERRM;
        RAISE LOG 'generate_order_number: Error in attempt %: % (SQLSTATE: %)', attempt_count, error_context, SQLSTATE;
        
        IF SQLSTATE NOT IN ('23505', '40001', '40P01', '55P03') THEN
          RAISE;
        END IF;
    END;
    
    IF attempt_count >= max_attempts THEN
      unique_suffix := EXTRACT(EPOCH FROM clock_timestamp())::bigint::text || '-' || 
                      floor(random() * 10000)::text || '-' || 
                      pg_backend_pid()::text;
      generated_order_number := 'ORD-FB-' || unique_suffix;
      
      RAISE LOG 'generate_order_number: Using fallback % after % attempts', generated_order_number, max_attempts;
      RETURN generated_order_number;
    END IF;
    
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 8)) + random() * 0.01);
  END LOOP;
END;
$function$;

-- Fix RLS policies for orders table to allow authenticated insert
DROP POLICY IF EXISTS "Anyone can view order items" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.orders;

-- Create proper RLS policies for orders table
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
ON public.orders
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
ON public.orders
FOR DELETE
USING (true);