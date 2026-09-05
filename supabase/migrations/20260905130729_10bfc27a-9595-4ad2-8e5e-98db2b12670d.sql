-- Fix overly permissive RLS policies for api_integrations, cancelled_orders, and delivery_tracking
-- Scope all access to current_shop_id_from_header() instead of allowing public full access.

-- ===================== api_integrations =====================
-- Remove the dangerous public all-operations policy
DROP POLICY IF EXISTS "Allow all operations on api_integrations" ON public.api_integrations;

-- Add shop-scoped policies for staff access via shop header
CREATE POLICY "Shop-scoped select on api_integrations"
  ON public.api_integrations
  FOR SELECT
  TO public
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped insert on api_integrations"
  ON public.api_integrations
  FOR INSERT
  TO public
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped update on api_integrations"
  ON public.api_integrations
  FOR UPDATE
  TO public
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped delete on api_integrations"
  ON public.api_integrations
  FOR DELETE
  TO public
  USING (shop_id = public.current_shop_id_from_header());

-- ===================== cancelled_orders =====================
-- Remove unrestricted public CRUD policies
DROP POLICY IF EXISTS "Anyone can view cancelled orders" ON public.cancelled_orders;
DROP POLICY IF EXISTS "Anyone can insert cancelled orders" ON public.cancelled_orders;
DROP POLICY IF EXISTS "Anyone can update cancelled orders" ON public.cancelled_orders;
DROP POLICY IF EXISTS "Anyone can delete cancelled orders" ON public.cancelled_orders;

-- Add shop-scoped policies
CREATE POLICY "Shop-scoped select on cancelled_orders"
  ON public.cancelled_orders
  FOR SELECT
  TO public
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped insert on cancelled_orders"
  ON public.cancelled_orders
  FOR INSERT
  TO public
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped update on cancelled_orders"
  ON public.cancelled_orders
  FOR UPDATE
  TO public
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped delete on cancelled_orders"
  ON public.cancelled_orders
  FOR DELETE
  TO public
  USING (shop_id = public.current_shop_id_from_header());

-- ===================== delivery_tracking =====================
-- Remove the public full-access policy that exposes PII
DROP POLICY IF EXISTS "Public access delivery_tracking" ON public.delivery_tracking;

-- Replace the old shop-scoped policy with explicit per-operation policies
DROP POLICY IF EXISTS "Shop-scoped access to delivery_tracking" ON public.delivery_tracking;

CREATE POLICY "Shop-scoped select on delivery_tracking"
  ON public.delivery_tracking
  FOR SELECT
  TO public
  USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped insert on delivery_tracking"
  ON public.delivery_tracking
  FOR INSERT
  TO public
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped update on delivery_tracking"
  ON public.delivery_tracking
  FOR UPDATE
  TO public
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped delete on delivery_tracking"
  ON public.delivery_tracking
  FOR DELETE
  TO public
  USING (shop_id = public.current_shop_id_from_header());