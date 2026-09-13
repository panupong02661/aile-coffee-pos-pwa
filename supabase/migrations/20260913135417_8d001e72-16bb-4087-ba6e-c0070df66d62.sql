-- purchase_orders
DROP POLICY IF EXISTS "Authenticated users can manage purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Authenticated users can view purchase orders" ON public.purchase_orders;
CREATE POLICY "purchase_orders_shop_scoped" ON public.purchase_orders
  FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- purchase_order_items
DROP POLICY IF EXISTS "Authenticated users can manage purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can view purchase order items" ON public.purchase_order_items;
CREATE POLICY "purchase_order_items_shop_scoped" ON public.purchase_order_items
  FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- reviews
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON public.reviews;
CREATE POLICY "reviews_shop_scoped_manage" ON public.reviews
  FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- table_orders
DROP POLICY IF EXISTS "table_orders_anon_all" ON public.table_orders;
DROP POLICY IF EXISTS "table_orders_auth_all" ON public.table_orders;
CREATE POLICY "table_orders_shop_scoped_anon" ON public.table_orders
  FOR ALL TO anon
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "table_orders_shop_scoped_auth" ON public.table_orders
  FOR ALL TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());