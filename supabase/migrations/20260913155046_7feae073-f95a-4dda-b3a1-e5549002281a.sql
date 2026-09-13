DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='price_schedules'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.price_schedules', p.policyname);
  END LOOP;
END $$;

CREATE POLICY price_schedules_shop_scoped ON public.price_schedules FOR ALL
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());