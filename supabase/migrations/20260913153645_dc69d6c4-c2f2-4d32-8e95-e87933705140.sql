-- product_reservations
DROP POLICY IF EXISTS "Allow all operations on product_reservations" ON public.product_reservations;
CREATE POLICY "product_reservations_shop_all" ON public.product_reservations
  FOR ALL USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

-- promotions: drop all permissive/unscoped policies
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='promotions' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.promotions', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "promotions_select_shop" ON public.promotions
  FOR SELECT USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());
CREATE POLICY "promotions_insert_admin" ON public.promotions
  FOR INSERT WITH CHECK (public.is_admin_header() AND (shop_id IS NULL OR shop_id = public.current_shop_id_from_header()));
CREATE POLICY "promotions_update_admin" ON public.promotions
  FOR UPDATE USING (public.is_admin_header() AND shop_id = public.current_shop_id_from_header())
  WITH CHECK (public.is_admin_header() AND shop_id = public.current_shop_id_from_header());
CREATE POLICY "promotions_delete_admin" ON public.promotions
  FOR DELETE USING (public.is_admin_header() AND shop_id = public.current_shop_id_from_header());

-- shifts: drop unscoped policies, keep shop-scoped access
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='shifts' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.shifts', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "shifts_shop_all" ON public.shifts
  FOR ALL USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

-- sync_logs
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='sync_logs' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sync_logs', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "sync_logs_shop_all" ON public.sync_logs
  FOR ALL USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());