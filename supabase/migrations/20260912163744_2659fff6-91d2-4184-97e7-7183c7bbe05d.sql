-- coupons: scope all access to own shop
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON public.coupons;
DROP POLICY IF EXISTS "Authenticated users can view coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
CREATE POLICY "coupons_shop_read" ON public.coupons FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "coupons_shop_write" ON public.coupons FOR ALL USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());

-- credit_customers: scope to own shop
DROP POLICY IF EXISTS "Authenticated users can manage credit customers" ON public.credit_customers;
DROP POLICY IF EXISTS "Authenticated users can view credit customers" ON public.credit_customers;
CREATE POLICY "credit_customers_shop_read" ON public.credit_customers FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "credit_customers_shop_write" ON public.credit_customers FOR ALL USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());

-- credit_sales: scope to own shop
DROP POLICY IF EXISTS "Authenticated users can manage credit sales" ON public.credit_sales;
DROP POLICY IF EXISTS "Authenticated users can view credit sales" ON public.credit_sales;
CREATE POLICY "credit_sales_shop_read" ON public.credit_sales FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "credit_sales_shop_write" ON public.credit_sales FOR ALL USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());

-- delivery_drivers: scope to own shop
DROP POLICY IF EXISTS "Allow all operations on delivery_drivers" ON public.delivery_drivers;
CREATE POLICY "delivery_drivers_shop_read" ON public.delivery_drivers FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "delivery_drivers_shop_write" ON public.delivery_drivers FOR ALL USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());

-- delivery_assignments: scope to own shop
DROP POLICY IF EXISTS "Allow all operations on delivery_assignments" ON public.delivery_assignments;
CREATE POLICY "delivery_assignments_shop_read" ON public.delivery_assignments FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "delivery_assignments_shop_write" ON public.delivery_assignments FOR ALL USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());