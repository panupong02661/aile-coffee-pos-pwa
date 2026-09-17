-- 1. Shop-scoped tables: replace raw x-shop-id header trust with verified helper
DROP POLICY IF EXISTS "sms_logs shop scoped" ON public.sms_logs;
CREATE POLICY "sms_logs shop scoped" ON public.sms_logs FOR ALL
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

DROP POLICY IF EXISTS "sms_settings shop scoped" ON public.sms_settings;
CREATE POLICY "sms_settings shop scoped" ON public.sms_settings FOR ALL
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

DROP POLICY IF EXISTS "staff shop scoped" ON public.staff;
CREATE POLICY "staff shop scoped" ON public.staff FOR ALL
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

DROP POLICY IF EXISTS "Authenticated shop access attendance" ON public.time_attendance;
CREATE POLICY "Authenticated shop access attendance" ON public.time_attendance FOR ALL
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

DROP POLICY IF EXISTS "Authenticated shop access reservations" ON public.table_reservations;
CREATE POLICY "Authenticated shop access reservations" ON public.table_reservations FOR ALL
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

-- 2. user_permissions: no more self-granted privileges via raw header
DROP POLICY IF EXISTS "Authenticated shop access permissions" ON public.user_permissions;
CREATE POLICY "user_permissions_shop_read" ON public.user_permissions FOR SELECT
  USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

-- 3. receipts storage: scope staff access to their own shop folder / own uploads
DROP POLICY IF EXISTS "Staff can manage receipts" ON storage.objects;
CREATE POLICY "Staff can read own shop receipts" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts' AND (
      owner = auth.uid()
      OR public.is_admin_header()
      OR (
        (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        AND public.has_verified_shop_access(((storage.foldername(name))[1])::uuid)
      )
    )
  );
CREATE POLICY "Staff can write own shop receipts" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts' AND (
      public.is_admin_header()
      OR (
        (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        AND public.has_verified_shop_access(((storage.foldername(name))[1])::uuid)
      )
    )
  );
CREATE POLICY "Staff can update own shop receipts" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts' AND (
      owner = auth.uid() OR public.is_admin_header()
      OR ((storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$' AND public.has_verified_shop_access(((storage.foldername(name))[1])::uuid))
    )
  );
CREATE POLICY "Staff can delete own shop receipts" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts' AND (
      owner = auth.uid() OR public.is_admin_header()
      OR ((storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$' AND public.has_verified_shop_access(((storage.foldername(name))[1])::uuid))
    )
  );