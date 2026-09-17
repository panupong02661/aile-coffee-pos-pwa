
INSERT INTO public.user_shop_assignments (user_id, shop_id, is_primary)
SELECT u.id, u.shop_id, true
FROM public.users u
WHERE u.shop_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_shop_assignments a
    WHERE a.user_id = u.id AND a.shop_id = u.shop_id
  );

CREATE OR REPLACE FUNCTION public.header_user_shop_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.user_shop_assignments WHERE user_id = public.header_user_id()
  UNION
  SELECT shop_id FROM public.users WHERE id = public.header_user_id() AND shop_id IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier text, max_requests integer DEFAULT 100, time_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count INTEGER;
  uname text := regexp_replace(identifier, '^login_', '');
BEGIN
  SELECT COUNT(*) INTO failed_count
  FROM public.security_logs
  WHERE event_type = 'login_failed'
    AND (details->>'identifier' = identifier OR lower(details->>'username') = lower(uname))
    AND created_at > NOW() - (time_window_minutes || ' minutes')::INTERVAL;

  RETURN failed_count < max_requests;
END;
$$;

UPDATE public.users SET failed_login_attempts = 0, locked_until = NULL;
