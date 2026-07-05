-- Security hardening: remove unrestricted public RLS policies and replace with shop-scoped policies.
-- Tables affected: customer_gifts, customer_mobile_sessions, customer_prize_claims.

-- =============================================
-- 1. Backfill missing shop_id values
-- =============================================

-- customer_gifts: derive shop_id from the linked member record
UPDATE public.customer_gifts cg
SET shop_id = m.shop_id
FROM public.members m
WHERE cg.customer_id = m.id
  AND cg.shop_id IS NULL
  AND m.shop_id IS NOT NULL;

-- customer_mobile_sessions: derive shop_id from the linked customer profile
UPDATE public.customer_mobile_sessions cms
SET shop_id = cp.shop_id
FROM public.customer_profiles cp
WHERE cms.customer_id = cp.id
  AND cms.shop_id IS NULL
  AND cp.shop_id IS NOT NULL;

-- customer_prize_claims: derive shop_id from the linked festival event
UPDATE public.customer_prize_claims cpc
SET shop_id = fe.shop_id
FROM public.festival_events fe
WHERE cpc.festival_event_id = fe.id
  AND cpc.shop_id IS NULL
  AND fe.shop_id IS NOT NULL;

-- =============================================
-- 2. customer_gifts: drop unrestricted public policies
-- =============================================
DROP POLICY IF EXISTS "Admin can view all customer gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Admin can create customer gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Admin can update customer gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Authenticated users can view all gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Authenticated users can manage gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "customers_own_gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Admin can manage all customer gifts" ON public.customer_gifts;

-- Scoped policies: require a valid x-shop-id header matching the row's shop_id
CREATE POLICY "Staff can view customer gifts in their shop" ON public.customer_gifts
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can create customer gifts in their shop" ON public.customer_gifts
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can update customer gifts in their shop" ON public.customer_gifts
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can delete customer gifts in their shop" ON public.customer_gifts
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- =============================================
-- 3. customer_mobile_sessions: drop unrestricted public policy
-- =============================================
DROP POLICY IF EXISTS "Allow all operations for staff on customer data" ON public.customer_mobile_sessions;
DROP POLICY IF EXISTS "Customers can view their own sessions" ON public.customer_mobile_sessions;
DROP POLICY IF EXISTS "Customers can create their own sessions" ON public.customer_mobile_sessions;

-- Restrict to the customer's own record (via Supabase Auth) or to the matching shop
CREATE POLICY "Customers can view their own mobile sessions" ON public.customer_mobile_sessions
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
    OR shop_id = public.current_shop_id_from_header()
  );

CREATE POLICY "Customers can create their own mobile sessions" ON public.customer_mobile_sessions
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
    OR shop_id = public.current_shop_id_from_header()
  );

CREATE POLICY "Customers can update their own mobile sessions" ON public.customer_mobile_sessions
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
    OR shop_id = public.current_shop_id_from_header()
  );

CREATE POLICY "Customers can delete their own mobile sessions" ON public.customer_mobile_sessions
  FOR DELETE USING (
    customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
    OR shop_id = public.current_shop_id_from_header()
  );

-- =============================================
-- 4. customer_prize_claims: drop unrestricted public policy
-- =============================================
DROP POLICY IF EXISTS "Allow all operations on customer_prize_claims" ON public.customer_prize_claims;

CREATE POLICY "Staff can view prize claims in their shop" ON public.customer_prize_claims
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can create prize claims in their shop" ON public.customer_prize_claims
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Staff can update prize claims in their shop" ON public.customer_prize_claims
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header());
