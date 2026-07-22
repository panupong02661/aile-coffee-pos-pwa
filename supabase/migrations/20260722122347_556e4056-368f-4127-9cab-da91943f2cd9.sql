
-- table_reservations: shop-scoped, authenticated only
DROP POLICY IF EXISTS "Users can manage reservations for their shop" ON public.table_reservations;
DROP POLICY IF EXISTS "Allow all operations on table_reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Enable all access for table_reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Public access" ON public.table_reservations;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.table_reservations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_reservations TO authenticated;
CREATE POLICY "Authenticated shop access reservations"
  ON public.table_reservations FOR ALL TO authenticated
  USING (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id')
  WITH CHECK (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id');

-- time_attendance: shop-scoped, authenticated only
DROP POLICY IF EXISTS "Allow all operations on time_attendance" ON public.time_attendance;
DROP POLICY IF EXISTS "Enable all access for time_attendance" ON public.time_attendance;
DROP POLICY IF EXISTS "Public access" ON public.time_attendance;
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.time_attendance FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_attendance TO authenticated;
CREATE POLICY "Authenticated shop access attendance"
  ON public.time_attendance FOR ALL TO authenticated
  USING (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id')
  WITH CHECK (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id');

-- user_permissions: shop-scoped, authenticated only (block privilege escalation)
DROP POLICY IF EXISTS "Allow all operations on user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Enable all access for user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Public access" ON public.user_permissions;
DROP POLICY IF EXISTS "Anonymous read user_permissions" ON public.user_permissions;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_permissions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
CREATE POLICY "Authenticated shop access permissions"
  ON public.user_permissions FOR ALL TO authenticated
  USING (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id')
  WITH CHECK (shop_id::text = current_setting('request.headers', true)::json->>'x-shop-id');
