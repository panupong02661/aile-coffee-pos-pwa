DROP POLICY IF EXISTS "Public access queue_tickets" ON public.queue_tickets;

DROP POLICY IF EXISTS "Public access restaurant_tables" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_shop_scoped_select" ON public.restaurant_tables
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "restaurant_tables_shop_scoped_insert" ON public.restaurant_tables
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "restaurant_tables_shop_scoped_update" ON public.restaurant_tables
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "restaurant_tables_shop_scoped_delete" ON public.restaurant_tables
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());