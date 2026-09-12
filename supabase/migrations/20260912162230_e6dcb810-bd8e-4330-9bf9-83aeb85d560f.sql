CREATE OR REPLACE FUNCTION public.has_verified_shop_access(_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _shop_id IS NOT NULL
     AND _shop_id = public.current_shop_id_from_header()
     AND (
       public.is_admin_header()
       OR _shop_id IN (SELECT public.header_user_shop_ids())
       OR EXISTS (
         SELECT 1 FROM public.users u
         WHERE u.id = public.header_user_id()
           AND u.shop_id = _shop_id
           AND COALESCE(u.is_active, true)
       )
     )
$$;

DROP POLICY IF EXISTS "Admin only access to activity logs" ON public.activity_logs;
CREATE POLICY "Admins manage activity logs" ON public.activity_logs
  FOR ALL USING (public.is_admin_header()) WITH CHECK (public.is_admin_header());

DROP POLICY IF EXISTS "Admin only access to security logs" ON public.security_logs;
CREATE POLICY "Admins manage security logs" ON public.security_logs
  FOR ALL USING (public.is_admin_header()) WITH CHECK (public.is_admin_header());

DROP POLICY IF EXISTS "Admin only access to error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert error logs" ON public.error_logs;
CREATE POLICY "Admins manage error logs" ON public.error_logs
  FOR ALL USING (public.is_admin_header()) WITH CHECK (public.is_admin_header());
CREATE POLICY "Anyone can report error logs" ON public.error_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Shop-scoped select on api_integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Shop-scoped insert on api_integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Shop-scoped update on api_integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Shop-scoped delete on api_integrations" ON public.api_integrations;
CREATE POLICY "Verified shop members manage api_integrations" ON public.api_integrations
  FOR ALL USING (public.has_verified_shop_access(shop_id))
  WITH CHECK (public.has_verified_shop_access(shop_id));

DROP POLICY IF EXISTS "Shop-scoped access to delivery_orders" ON public.delivery_orders;
CREATE POLICY "Verified shop members read delivery_orders" ON public.delivery_orders
  FOR SELECT USING (public.has_verified_shop_access(shop_id));
CREATE POLICY "Verified shop members update delivery_orders" ON public.delivery_orders
  FOR UPDATE USING (public.has_verified_shop_access(shop_id))
  WITH CHECK (public.has_verified_shop_access(shop_id));
CREATE POLICY "Verified shop members delete delivery_orders" ON public.delivery_orders
  FOR DELETE USING (public.has_verified_shop_access(shop_id));
CREATE POLICY "Shop-scoped insert on delivery_orders" ON public.delivery_orders
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());