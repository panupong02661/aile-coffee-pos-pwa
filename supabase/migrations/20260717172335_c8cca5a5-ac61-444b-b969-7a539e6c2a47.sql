
-- Drop unrestricted public policies on sms_logs & sms_settings; add shop-scoped policies
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='sms_logs' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sms_logs', p.policyname);
  END LOOP;
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='sms_settings' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sms_settings', p.policyname);
  END LOOP;
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='staff' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.staff', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Shop-scoped policies using x-shop-id header (existing app pattern)
CREATE POLICY "sms_logs shop scoped"
ON public.sms_logs FOR ALL
USING (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid)
WITH CHECK (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid);

CREATE POLICY "sms_settings shop scoped"
ON public.sms_settings FOR ALL
USING (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid)
WITH CHECK (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid);

CREATE POLICY "staff shop scoped"
ON public.staff FOR ALL
USING (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid)
WITH CHECK (shop_id = (current_setting('request.headers', true)::json->>'x-shop-id')::uuid);
