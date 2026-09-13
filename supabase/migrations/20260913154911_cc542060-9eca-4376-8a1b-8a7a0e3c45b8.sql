DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('bulk_discounts','cart_display_sync','offline_sync_queue')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

CREATE POLICY bulk_discounts_shop_scoped ON public.bulk_discounts FOR ALL
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY cart_display_sync_shop_scoped ON public.cart_display_sync FOR ALL
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY offline_sync_queue_shop_scoped ON public.offline_sync_queue FOR ALL
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());