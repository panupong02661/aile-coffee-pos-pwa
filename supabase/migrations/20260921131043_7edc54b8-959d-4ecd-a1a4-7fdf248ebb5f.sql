DROP POLICY IF EXISTS "Verified staff create shop mobile sessions" ON public.customer_mobile_sessions;
CREATE POLICY "Verified staff create shop mobile sessions"
ON public.customer_mobile_sessions FOR INSERT
WITH CHECK (
  (authenticated_user_role() = ANY (ARRAY['admin'::text,'manager'::text,'staff'::text]))
  AND has_verified_shop_access(shop_id)
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id = customer_mobile_sessions.customer_id
      AND cp.shop_id = customer_mobile_sessions.shop_id
  )
);

DROP POLICY IF EXISTS "Verified staff update shop mobile sessions" ON public.customer_mobile_sessions;
CREATE POLICY "Verified staff update shop mobile sessions"
ON public.customer_mobile_sessions FOR UPDATE
USING (
  (authenticated_user_role() = ANY (ARRAY['admin'::text,'manager'::text,'staff'::text]))
  AND has_verified_shop_access(shop_id)
)
WITH CHECK (
  (authenticated_user_role() = ANY (ARRAY['admin'::text,'manager'::text,'staff'::text]))
  AND has_verified_shop_access(shop_id)
  AND EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id = customer_mobile_sessions.customer_id
      AND cp.shop_id = customer_mobile_sessions.shop_id
  )
);