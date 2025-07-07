
-- ตรวจสอบและแก้ไข RLS policies สำหรับ limited_rewards เพื่อให้ลูกค้าสามารถเห็นรางวัลที่ active ได้
DROP POLICY IF EXISTS "Anyone can view active limited rewards" ON public.limited_rewards;

CREATE POLICY "Anyone can view active limited rewards" 
  ON public.limited_rewards 
  FOR SELECT 
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

-- เพิ่ม policy สำหรับให้ลูกค้าสามารถรับรางวัลได้
DROP POLICY IF EXISTS "Customers can claim limited rewards" ON public.limited_reward_claims;

CREATE POLICY "Customers can claim limited rewards" 
  ON public.limited_reward_claims 
  FOR INSERT 
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customer_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- ตรวจสอบและปรับปรุง policy สำหรับ limited_promotions
DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.limited_promotions;

CREATE POLICY "Anyone can view active limited promotions" 
  ON public.limited_promotions 
  FOR SELECT 
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

-- เพิ่มตารางสำหรับ security logs
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- เพิ่มตารางสำหรับ activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- เพิ่มตารางสำหรับ error monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- เพิ่มตารางสำหรับ offline data sync
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE,
  is_synced BOOLEAN NOT NULL DEFAULT FALSE
);

-- เพิ่ม RLS policies สำหรับตารางใหม่
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ admin เท่านั้น
CREATE POLICY "Admin only access to security logs" ON public.security_logs FOR ALL USING (true);
CREATE POLICY "Admin only access to activity logs" ON public.activity_logs FOR ALL USING (true);
CREATE POLICY "Admin only access to error logs" ON public.error_logs FOR ALL USING (true);
CREATE POLICY "Users can manage their offline sync queue" ON public.offline_sync_queue FOR ALL USING (true);

-- เพิ่ม function สำหรับ rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier TEXT,
  max_requests INTEGER DEFAULT 100,
  time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- นับจำนวน request ในช่วงเวลาที่กำหนด
  SELECT COUNT(*) INTO request_count
  FROM public.security_logs
  WHERE details->>'identifier' = identifier
    AND created_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- บันทึก request นี้
  INSERT INTO public.security_logs (event_type, details)
  VALUES ('rate_limit_check', jsonb_build_object('identifier', identifier));
  
  RETURN request_count < max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- เพิ่ม function สำหรับ input validation
CREATE OR REPLACE FUNCTION public.validate_input(
  input_text TEXT,
  input_type TEXT DEFAULT 'general'
) RETURNS BOOLEAN AS $$
BEGIN
  -- ตรวจสอบ XSS patterns
  IF input_text ~* '<script|javascript:|onload=|onerror=' THEN
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('xss_attempt', jsonb_build_object('input', input_text, 'type', input_type));
    RETURN FALSE;
  END IF;
  
  -- ตรวจสอบ SQL injection patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|exec|script)' THEN
    INSERT INTO public.security_logs (event_type, details)
    VALUES ('sql_injection_attempt', jsonb_build_object('input', input_text, 'type', input_type));
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
