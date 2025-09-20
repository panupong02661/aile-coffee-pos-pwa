-- Fix financial information exposure by securing RLS policies
-- This migration restricts access to financial data to authenticated users only

-- 1. Secure stock_movements table (contains cost information)
DROP POLICY IF EXISTS "Allow all operations on stock_movements" ON public.stock_movements;

CREATE POLICY "Authenticated users can view stock movements"
ON public.stock_movements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage stock movements"
ON public.stock_movements
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Secure expenses table (contains financial expenditure data)
DROP POLICY IF EXISTS "Allow all operations on expenses" ON public.expenses;

CREATE POLICY "Authenticated users can view expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage expenses"
ON public.expenses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Secure bulk_discounts table (contains pricing strategy information)
DROP POLICY IF EXISTS "Allow all operations on bulk_discounts" ON public.bulk_discounts;

CREATE POLICY "Authenticated users can view bulk discounts"
ON public.bulk_discounts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage bulk discounts"
ON public.bulk_discounts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Secure price_schedules table (contains pricing information)
DROP POLICY IF EXISTS "Allow all operations on price_schedules" ON public.price_schedules;

CREATE POLICY "Authenticated users can view price schedules"
ON public.price_schedules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage price schedules"
ON public.price_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Secure credit_sales table (contains financial credit information)
DROP POLICY IF EXISTS "Allow all operations on credit_sales" ON public.credit_sales;

CREATE POLICY "Authenticated users can view credit sales"
ON public.credit_sales
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage credit sales"
ON public.credit_sales
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Secure credit_customers table (contains financial credit limits)
DROP POLICY IF EXISTS "Allow all operations on credit_customers" ON public.credit_customers;

CREATE POLICY "Authenticated users can view credit customers"
ON public.credit_customers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage credit customers"
ON public.credit_customers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Secure purchase_orders table (contains supplier financial data)
DROP POLICY IF EXISTS "Allow all operations on purchase_orders" ON public.purchase_orders;

CREATE POLICY "Authenticated users can view purchase orders"
ON public.purchase_orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage purchase orders"
ON public.purchase_orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Secure purchase_order_items table (contains detailed cost information)
DROP POLICY IF EXISTS "Allow all operations on purchase_order_items" ON public.purchase_order_items;

CREATE POLICY "Authenticated users can view purchase order items"
ON public.purchase_order_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage purchase order items"
ON public.purchase_order_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Secure shifts table (contains cash handling information)
DROP POLICY IF EXISTS "Allow all operations on shifts" ON public.shifts;

CREATE POLICY "Authenticated users can view shifts"
ON public.shifts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage shifts"
ON public.shifts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Log this security fix
INSERT INTO public.security_logs (event_type, details)
VALUES ('security_policy_update', jsonb_build_object(
  'action', 'restricted_financial_data_access',
  'tables_secured', ARRAY['stock_movements', 'expenses', 'bulk_discounts', 'price_schedules', 'credit_sales', 'credit_customers', 'purchase_orders', 'purchase_order_items', 'shifts'],
  'change', 'removed public read access to sensitive financial data',
  'timestamp', now()
));