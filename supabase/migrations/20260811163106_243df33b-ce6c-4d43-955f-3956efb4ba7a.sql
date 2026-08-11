-- ===========================================================
-- Phase 1: RLS shop-scoping for expenses, expense_categories, shifts
-- ===========================================================

-- ---------- expenses ----------
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Staff can view expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can insert expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can update expenses in their shop" ON public.expenses;
DROP POLICY IF EXISTS "Staff can delete expenses in their shop" ON public.expenses;

CREATE POLICY "Staff can view expenses in their shop"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can insert expenses in their shop"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can update expenses in their shop"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can delete expenses in their shop"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

-- ---------- expense_categories ----------
-- ปัจจุบันเปิด public ทั้งหมด ปิด anon และขอบเขตตามร้าน
DROP POLICY IF EXISTS "Allow all operations" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can view expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can insert expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can update expense categories in their shop" ON public.expense_categories;
DROP POLICY IF EXISTS "Staff can delete expense categories in their shop" ON public.expense_categories;

REVOKE ALL ON public.expense_categories FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;

CREATE POLICY "Staff can view expense categories in their shop"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can insert expense categories in their shop"
  ON public.expense_categories FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can update expense categories in their shop"
  ON public.expense_categories FOR UPDATE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can delete expense categories in their shop"
  ON public.expense_categories FOR DELETE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

-- ---------- shifts ----------
DROP POLICY IF EXISTS "Authenticated users can view shifts" ON public.shifts;
DROP POLICY IF EXISTS "Staff can view shifts in their shop" ON public.shifts;
DROP POLICY IF EXISTS "Staff can insert shifts in their shop" ON public.shifts;
DROP POLICY IF EXISTS "Staff can update shifts in their shop" ON public.shifts;
DROP POLICY IF EXISTS "Staff can delete shifts in their shop" ON public.shifts;

CREATE POLICY "Staff can view shifts in their shop"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can insert shifts in their shop"
  ON public.shifts FOR INSERT
  TO authenticated
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can update shifts in their shop"
  ON public.shifts FOR UPDATE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can delete shifts in their shop"
  ON public.shifts FOR DELETE
  TO authenticated
  USING (shop_id = public.current_shop_id_from_header());

-- ---------- auto-inject shop_id triggers ----------
DROP TRIGGER IF EXISTS trg_set_shop_id_shifts ON public.shifts;
CREATE TRIGGER trg_set_shop_id_shifts
  BEFORE INSERT ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.set_shop_id_from_request_header();

DROP TRIGGER IF EXISTS trg_set_shop_id_expense_categories ON public.expense_categories;
CREATE TRIGGER trg_set_shop_id_expense_categories
  BEFORE INSERT ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_shop_id_from_request_header();
