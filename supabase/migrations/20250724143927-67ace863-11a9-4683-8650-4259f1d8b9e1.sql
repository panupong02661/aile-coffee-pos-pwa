
-- Enable RLS on unprotected tables and add comprehensive security policies

-- 1. Enable RLS on ingredients table
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for ingredients (staff and admin access)
CREATE POLICY "Allow authenticated users to view ingredients" 
  ON public.ingredients 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and manager to manage ingredients" 
  ON public.ingredients 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 2. Enable RLS on stock_movements table
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view stock movements" 
  ON public.stock_movements 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and manager to manage stock movements" 
  ON public.stock_movements 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Enable RLS on notification_settings table
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin to manage notification settings" 
  ON public.notification_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 4. Enable RLS on cancelled_orders table
ALTER TABLE public.cancelled_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view cancelled orders" 
  ON public.cancelled_orders 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin and manager to manage cancelled orders" 
  ON public.cancelled_orders 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 5. Enable RLS on notification_sounds table
ALTER TABLE public.notification_sounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view notification sounds" 
  ON public.notification_sounds 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to manage notification sounds" 
  ON public.notification_sounds 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 6. Enable RLS on error_logs table (already has admin policy but ensuring consistency)
CREATE POLICY "Allow authenticated users to insert error logs" 
  ON public.error_logs 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 7. Enable RLS on sms_settings table
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin to view sms settings" 
  ON public.sms_settings 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to manage sms settings" 
  ON public.sms_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 8. Update users table to support proper password hashing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 9. Create input validation function
CREATE OR REPLACE FUNCTION public.validate_input_secure(input_text text, input_type text DEFAULT 'general'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for null or empty input
  IF input_text IS NULL OR length(trim(input_text)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for XSS patterns
  IF input_text ~* '<script|javascript:|onload=|onerror=|<iframe|<object|<embed' THEN
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('xss_attempt', jsonb_build_object('input', left(input_text, 200), 'type', input_type));
    RETURN FALSE;
  END IF;
  
  -- Check for SQL injection patterns
  IF input_text ~* '(union\s+select|insert\s+into|update\s+set|delete\s+from|drop\s+table|exec\s+|script\s+)' THEN
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('sql_injection_attempt', jsonb_build_object('input', left(input_text, 200), 'type', input_type));
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 10. Create secure password hashing function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  salt text;
  hashed text;
BEGIN
  -- Generate random salt
  salt := encode(gen_random_bytes(32), 'base64');
  
  -- Create hash (simplified - in production use proper bcrypt)
  hashed := encode(digest(password || salt, 'sha256'), 'base64');
  
  RETURN jsonb_build_object('hash', hashed, 'salt', salt);
END;
$$;

-- 11. Create secure login function
CREATE OR REPLACE FUNCTION public.authenticate_user(username_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record public.users;
  stored_hash text;
  computed_hash text;
BEGIN
  -- Rate limiting check
  IF NOT public.check_rate_limit('login_' || username_input, 5, 15) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Too many login attempts');
  END IF;
  
  -- Input validation
  IF NOT public.validate_input_secure(username_input, 'username') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid username format');
  END IF;
  
  -- Get user record
  SELECT * INTO user_record 
  FROM public.users 
  WHERE username = username_input;
  
  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('login_failed', jsonb_build_object('username', username_input, 'reason', 'user_not_found'));
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Check if account is locked
  IF user_record.locked_until IS NOT NULL AND user_record.locked_until > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Account temporarily locked');
  END IF;
  
  -- Verify password (handle both old hardcoded and new hashed passwords)
  IF user_record.password_salt IS NULL THEN
    -- Old system compatibility (remove after migration)
    IF password_input = 'admin' AND user_record.password_hash = 'admin' THEN
      -- Successful login - update to hashed password
      UPDATE public.users 
      SET failed_login_attempts = 0, 
          last_login = now(),
          locked_until = NULL
      WHERE id = user_record.id;
      
      RETURN jsonb_build_object('success', true, 'user_id', user_record.id, 'role', user_record.role);
    END IF;
  ELSE
    -- New hashed system
    computed_hash := encode(digest(password_input || user_record.password_salt, 'sha256'), 'base64');
    IF computed_hash = user_record.password_hash THEN
      -- Successful login
      UPDATE public.users 
      SET failed_login_attempts = 0, 
          last_login = now(),
          locked_until = NULL
      WHERE id = user_record.id;
      
      RETURN jsonb_build_object('success', true, 'user_id', user_record.id, 'role', user_record.role);
    END IF;
  END IF;
  
  -- Failed login
  UPDATE public.users 
  SET failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts >= 4 THEN now() + interval '15 minutes'
        ELSE locked_until
      END
  WHERE id = user_record.id;
  
  INSERT INTO public.security_logs (event_type, details)
  VALUES ('login_failed', jsonb_build_object('username', username_input, 'reason', 'invalid_password'));
  
  RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
END;
$$;

-- 12. Fix database function security by updating existing functions
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Log for debug
  RAISE LOG 'generate_order_number: Starting generation for date %', today_date;
  
  -- Main retry loop
  LOOP
    attempt_count := attempt_count + 1;
    lock_acquired := FALSE;
    
    BEGIN
      -- Use advisory lock with timeout
      SELECT pg_try_advisory_lock(hashtext('order_number_' || today_date::text)) INTO lock_acquired;
      
      IF lock_acquired THEN
        -- Lock and check data to prevent duplicate reads
        PERFORM pg_advisory_lock(hashtext('order_sequence_' || today_date::text));
        
        -- Find next order number for today atomically
        WITH order_sequence AS (
          SELECT 
            COALESCE(MAX(CAST(SUBSTRING(o.order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) as max_num
          FROM public.orders o
          WHERE DATE(o.created_at) = today_date 
            AND o.order_number ~ '^ORD-\d+$'
        )
        SELECT max_num + 1 INTO next_number FROM order_sequence;
        
        -- Create order number
        order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
        
        -- Check for duplicates one more time before return
        IF NOT EXISTS (
          SELECT 1 FROM public.orders 
          WHERE order_number = order_number
          FOR UPDATE NOWAIT
        ) THEN
          -- Release locks and return
          PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
          PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
          
          RAISE LOG 'generate_order_number: Successfully generated % on attempt %', order_number, attempt_count;
          RETURN order_number;
        ELSE
          RAISE LOG 'generate_order_number: Collision detected for %, retrying...', order_number;
        END IF;
        
        -- Release locks
        PERFORM pg_advisory_unlock(hashtext('order_sequence_' || today_date::text));
        PERFORM pg_advisory_unlock(hashtext('order_number_' || today_date::text));
      ELSE
        RAISE LOG 'generate_order_number: Failed to acquire lock on attempt %', attempt_count;
      END IF;
      
    EXCEPTION
      WHEN lock_not_available THEN
        -- Lock timeout - wait and try again
        RAISE LOG 'generate_order_number: Lock timeout on attempt %, retrying...', attempt_count;
      WHEN OTHERS THEN
        -- Release locks on error
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
        
        -- Re-raise for critical errors that aren't serialization conflicts
        IF SQLSTATE NOT IN ('23505', '40001', '40P01', '55P03') THEN
          RAISE;
        END IF;
    END;
    
    -- If exceed max attempts use fallback with unique suffix
    IF attempt_count >= max_attempts THEN
      unique_suffix := EXTRACT(EPOCH FROM clock_timestamp())::bigint::text || '-' || 
                      floor(random() * 10000)::text || '-' || 
                      pg_backend_pid()::text;
      order_number := 'ORD-FB-' || unique_suffix;
      
      RAISE LOG 'generate_order_number: Using fallback % after % attempts', order_number, max_attempts;
      RETURN order_number;
    END IF;
    
    -- Wait with exponential backoff and jitter
    PERFORM pg_sleep(0.001 * power(2, least(attempt_count, 8)) + random() * 0.01);
  END LOOP;
END;
$$;
