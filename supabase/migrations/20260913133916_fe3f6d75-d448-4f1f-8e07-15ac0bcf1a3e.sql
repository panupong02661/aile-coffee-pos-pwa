DROP POLICY IF EXISTS "Authenticated users can manage business settings" ON public.business_settings;
CREATE POLICY "business_settings_shop_scoped_manage"
ON public.business_settings
FOR ALL
TO authenticated
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());

DROP POLICY IF EXISTS "Authenticated users can view all rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Authenticated users can manage rewards" ON public.customer_rewards;

DROP POLICY IF EXISTS "Authenticated users can view point transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Authenticated users can manage point transactions" ON public.point_transactions;
CREATE POLICY "point_transactions_shop_scoped_select"
ON public.point_transactions
FOR SELECT
TO authenticated
USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "point_transactions_shop_scoped_insert"
ON public.point_transactions
FOR INSERT
TO authenticated
WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "point_transactions_shop_scoped_update"
ON public.point_transactions
FOR UPDATE
TO authenticated
USING (shop_id = public.current_shop_id_from_header())
WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "point_transactions_shop_scoped_delete"
ON public.point_transactions
FOR DELETE
TO authenticated
USING (shop_id = public.current_shop_id_from_header());