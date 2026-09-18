DROP POLICY IF EXISTS "Customers can view their own mobile sessions" ON public.customer_mobile_sessions;
DROP POLICY IF EXISTS "Customers can create their own mobile sessions" ON public.customer_mobile_sessions;
DROP POLICY IF EXISTS "Customers can update their own mobile sessions" ON public.customer_mobile_sessions;
DROP POLICY IF EXISTS "Customers can delete their own mobile sessions" ON public.customer_mobile_sessions;

CREATE POLICY "Customers view only their own mobile sessions"
ON public.customer_mobile_sessions
FOR SELECT TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Customers create only their own mobile sessions"
ON public.customer_mobile_sessions
FOR INSERT TO authenticated
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Customers update only their own mobile sessions"
ON public.customer_mobile_sessions
FOR UPDATE TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Customers delete only their own mobile sessions"
ON public.customer_mobile_sessions
FOR DELETE TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Verified staff view shop mobile sessions"
ON public.customer_mobile_sessions
FOR SELECT TO authenticated
USING (
  public.authenticated_user_role() IN ('admin', 'manager', 'staff')
  AND public.has_verified_shop_access(shop_id)
);

CREATE POLICY "Verified staff create shop mobile sessions"
ON public.customer_mobile_sessions
FOR INSERT TO authenticated
WITH CHECK (
  public.authenticated_user_role() IN ('admin', 'manager', 'staff')
  AND public.has_verified_shop_access(shop_id)
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id = customer_id AND cp.shop_id = shop_id
  )
);

CREATE POLICY "Verified staff update shop mobile sessions"
ON public.customer_mobile_sessions
FOR UPDATE TO authenticated
USING (
  public.authenticated_user_role() IN ('admin', 'manager', 'staff')
  AND public.has_verified_shop_access(shop_id)
)
WITH CHECK (
  public.authenticated_user_role() IN ('admin', 'manager', 'staff')
  AND public.has_verified_shop_access(shop_id)
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id = customer_id AND cp.shop_id = shop_id
  )
);

CREATE POLICY "Verified staff delete shop mobile sessions"
ON public.customer_mobile_sessions
FOR DELETE TO authenticated
USING (
  public.authenticated_user_role() IN ('admin', 'manager', 'staff')
  AND public.has_verified_shop_access(shop_id)
);