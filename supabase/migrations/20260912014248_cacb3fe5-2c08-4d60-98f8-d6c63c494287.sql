
-- helper: user id from request header
CREATE OR REPLACE FUNCTION public.header_user_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NULLIF(((current_setting('request.headers', true))::json ->> 'x-user-id'), '')::uuid
$$;

CREATE OR REPLACE FUNCTION public.is_admin_header()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = public.header_user_id()
      AND u.role IN ('admin','manager')
      AND COALESCE(u.is_active, true)
  )
$$;

CREATE OR REPLACE FUNCTION public.header_user_shop_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT shop_id FROM public.user_shop_assignments WHERE user_id = public.header_user_id()
$$;

-- shops: allow reading shops the user is assigned to
DROP POLICY IF EXISTS shops_shop_scoped_select ON public.shops;
CREATE POLICY shops_shop_scoped_select ON public.shops FOR SELECT
USING (
  id = public.current_shop_id_from_header()
  OR id IN (SELECT public.header_user_shop_ids())
  OR public.is_admin_header()
);

-- users: remove blanket access
DROP POLICY IF EXISTS "Allow anon to read users" ON public.users;
DROP POLICY IF EXISTS "Allow anon to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon to update users" ON public.users;
DROP POLICY IF EXISTS "Allow anon to delete users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can manage users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;

CREATE POLICY users_select_self_or_admin ON public.users FOR SELECT
USING (id = public.header_user_id() OR public.is_admin_header());
CREATE POLICY users_admin_insert ON public.users FOR INSERT
WITH CHECK (public.is_admin_header());
CREATE POLICY users_admin_update ON public.users FOR UPDATE
USING (public.is_admin_header() OR id = public.header_user_id())
WITH CHECK (public.is_admin_header() OR id = public.header_user_id());
CREATE POLICY users_admin_delete ON public.users FOR DELETE
USING (public.is_admin_header());

-- never expose password material through the API
REVOKE SELECT ON public.users FROM anon, authenticated;
GRANT SELECT (id, username, role, created_at, updated_at, last_login, failed_login_attempts, locked_until, full_name, is_active, shop_id)
  ON public.users TO anon, authenticated;
REVOKE UPDATE ON public.users FROM anon, authenticated;
GRANT UPDATE (username, role, updated_at, last_login, failed_login_attempts, locked_until, full_name, is_active, shop_id)
  ON public.users TO anon, authenticated;
GRANT INSERT, DELETE ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;

-- user_permissions: only admins/managers of the shop
DROP POLICY IF EXISTS "Allow anon to read user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow anon to insert user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow anon to update user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Allow anon to delete user_permissions" ON public.user_permissions;

CREATE POLICY user_permissions_select ON public.user_permissions FOR SELECT
USING (user_id = public.header_user_id() OR public.is_admin_header());
CREATE POLICY user_permissions_admin_write ON public.user_permissions FOR ALL
USING (public.is_admin_header())
WITH CHECK (public.is_admin_header());

-- wifi vouchers: shop scoped only
DROP POLICY IF EXISTS "Anyone can view wifi vouchers" ON public.wifi_vouchers;
DROP POLICY IF EXISTS "Allow all operations on wifi_vouchers" ON public.wifi_vouchers;
CREATE POLICY wifi_vouchers_shop_scoped ON public.wifi_vouchers FOR ALL
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());
