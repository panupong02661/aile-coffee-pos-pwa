ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON public.users(auth_user_id);

CREATE OR REPLACE FUNCTION public.header_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
    AND COALESCE(u.is_active, true)
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.authenticated_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.role
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
    AND COALESCE(u.is_active, true)
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin_header()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.authenticated_user_role() IN ('admin', 'manager'), false)
$$;

CREATE OR REPLACE FUNCTION public.header_user_shop_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT usa.shop_id
  FROM public.user_shop_assignments usa
  WHERE usa.user_id = public.header_user_id()
  UNION
  SELECT u.shop_id
  FROM public.users u
  WHERE u.id = public.header_user_id()
    AND u.shop_id IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.current_shop_id_from_header()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_shop_id uuid;
  v_user_role text;
BEGIN
  BEGIN
    requested_shop_id := NULLIF(
      current_setting('request.headers', true)::jsonb ->> 'x-shop-id',
      ''
    )::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  IF requested_shop_id IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  v_user_role := public.authenticated_user_role();

  IF v_user_role = 'admin'
     OR requested_shop_id IN (SELECT public.header_user_shop_ids()) THEN
    RETURN requested_shop_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_verified_shop_access(_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
     AND _shop_id IS NOT NULL
     AND _shop_id = public.current_shop_id_from_header()
     AND (
       public.authenticated_user_role() = 'admin'
       OR _shop_id IN (SELECT public.header_user_shop_ids())
     )
$$;

REVOKE ALL ON FUNCTION public.authenticate_user(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO service_role;

REVOKE ALL ON FUNCTION public.header_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.authenticated_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_header() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.header_user_shop_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_shop_id_from_header() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_verified_shop_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.header_user_id(), public.authenticated_user_role(), public.is_admin_header(), public.header_user_shop_ids(), public.current_shop_id_from_header(), public.has_verified_shop_access(uuid) TO anon, authenticated, service_role;

REVOKE ALL ON public.users FROM anon, authenticated;
GRANT SELECT (id, username, role, created_at, updated_at, last_login, failed_login_attempts, locked_until, full_name, is_active, shop_id, auth_user_id) ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

DROP POLICY IF EXISTS users_select_self_or_admin ON public.users;
DROP POLICY IF EXISTS users_admin_insert ON public.users;
DROP POLICY IF EXISTS users_admin_update ON public.users;
DROP POLICY IF EXISTS users_admin_delete ON public.users;
DROP POLICY IF EXISTS users_shop_scoped ON public.users;

CREATE POLICY users_authenticated_read
ON public.users FOR SELECT TO authenticated
USING (
  auth_user_id = auth.uid()
  OR public.authenticated_user_role() = 'admin'
  OR shop_id IN (SELECT public.header_user_shop_ids())
);

COMMENT ON COLUMN public.users.auth_user_id IS 'Verified Supabase Auth identity linked to the legacy POS user profile';
COMMENT ON FUNCTION public.header_user_id() IS 'Returns the POS user id mapped from the verified Supabase Auth JWT';
COMMENT ON FUNCTION public.current_shop_id_from_header() IS 'Returns the requested shop only after validating it against the verified user identity';