-- business_settings: replace public read with shop-scoped read
DROP POLICY IF EXISTS "Anyone can view business settings" ON public.business_settings;
CREATE POLICY "business_settings_shop_scoped_select" ON public.business_settings
  FOR SELECT TO anon, authenticated
  USING (shop_id = current_shop_id_from_header());

-- customer_orders: replace public all-access with shop-scoped access
DROP POLICY IF EXISTS "Allow all operations for staff on customer orders" ON public.customer_orders;
CREATE POLICY "customer_orders_shop_scoped_select" ON public.customer_orders
  FOR SELECT TO anon, authenticated
  USING (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_orders_shop_scoped_insert" ON public.customer_orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_orders_shop_scoped_update" ON public.customer_orders
  FOR UPDATE TO anon, authenticated
  USING (shop_id = current_shop_id_from_header())
  WITH CHECK (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_orders_shop_scoped_delete" ON public.customer_orders
  FOR DELETE TO anon, authenticated
  USING (shop_id = current_shop_id_from_header());

-- customer_transactions: replace public all-access with shop-scoped access
DROP POLICY IF EXISTS "Allow all operations for staff on customer transactions" ON public.customer_transactions;
CREATE POLICY "customer_transactions_shop_scoped_select" ON public.customer_transactions
  FOR SELECT TO anon, authenticated
  USING (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_transactions_shop_scoped_insert" ON public.customer_transactions
  FOR INSERT TO anon, authenticated
  WITH CHECK (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_transactions_shop_scoped_update" ON public.customer_transactions
  FOR UPDATE TO anon, authenticated
  USING (shop_id = current_shop_id_from_header())
  WITH CHECK (shop_id = current_shop_id_from_header());
CREATE POLICY "customer_transactions_shop_scoped_delete" ON public.customer_transactions
  FOR DELETE TO anon, authenticated
  USING (shop_id = current_shop_id_from_header());