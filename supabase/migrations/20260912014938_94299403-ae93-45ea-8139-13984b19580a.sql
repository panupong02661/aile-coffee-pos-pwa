
-- COUPON USAGE
DROP POLICY IF EXISTS "Authenticated users can manage coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "Authenticated users can view coupon usage" ON public.coupon_usage;
CREATE POLICY "coupon_usage_shop_scoped" ON public.coupon_usage FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- CUSTOMER PROMOTION CLAIMS
DROP POLICY IF EXISTS "Authenticated users can manage promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Authenticated users can view all promotion claims" ON public.customer_promotion_claims;

-- GIFT USAGE HISTORY
DROP POLICY IF EXISTS "Admin can view all gift usage history" ON public.gift_usage_history;
DROP POLICY IF EXISTS "Admin can create gift usage history" ON public.gift_usage_history;
CREATE POLICY "gift_usage_history_shop_scoped" ON public.gift_usage_history FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- INGREDIENTS
DROP POLICY IF EXISTS "Allow public read access to ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public insert to ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public update to ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public delete to ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated users can view ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated users can insert ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated users can update ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated users can delete ingredients" ON public.ingredients;
CREATE POLICY "ingredients_shop_scoped" ON public.ingredients FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- INGREDIENT CATEGORIES
DROP POLICY IF EXISTS "Public read ingredient_categories" ON public.ingredient_categories;
DROP POLICY IF EXISTS "Public insert ingredient_categories" ON public.ingredient_categories;
DROP POLICY IF EXISTS "Public update ingredient_categories" ON public.ingredient_categories;
DROP POLICY IF EXISTS "Public delete ingredient_categories" ON public.ingredient_categories;
CREATE POLICY "ingredient_categories_shop_scoped" ON public.ingredient_categories FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- STOCK MOVEMENTS
DROP POLICY IF EXISTS "Allow all operations on stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can manage stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON public.stock_movements;
CREATE POLICY "stock_movements_shop_scoped" ON public.stock_movements FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- SUPPLIERS
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
CREATE POLICY "suppliers_shop_scoped" ON public.suppliers FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- EXPENSES
DROP POLICY IF EXISTS "Authenticated users can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Staff can view expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can insert expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can update expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can delete expenses in their shop" ON public.expenses;
CREATE POLICY "expenses_shop_scoped" ON public.expenses FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

-- EXPENSE CATEGORIES
DROP POLICY IF EXISTS "Allow all operations on expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can view expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can insert expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can update expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can delete expense categories in their shop" ON public.expense_categories;
CREATE POLICY "expense_categories_shop_scoped" ON public.expense_categories FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_usage, public.gift_usage_history, public.ingredients, public.ingredient_categories, public.stock_movements, public.suppliers, public.expenses, public.expense_categories TO anon, authenticated;
