
-- Roll back overly-strict authenticated-only policies from previous migration
DROP POLICY IF EXISTS "Authenticated users can manage delivery_integrations" ON public.delivery_integrations;
DROP POLICY IF EXISTS "Authenticated users can manage delivery_orders" ON public.delivery_orders;
DROP POLICY IF EXISTS "Authenticated users can manage delivery_tracking" ON public.delivery_tracking;

-- Re-grant anon (app uses custom auth via x-shop-id header, not Supabase Auth)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_integrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_tracking TO anon;

-- Scope every row to the calling shop (from x-shop-id header)
CREATE POLICY "Shop-scoped access to delivery_integrations"
  ON public.delivery_integrations FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped access to delivery_orders"
  ON public.delivery_orders FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());

CREATE POLICY "Shop-scoped access to delivery_tracking"
  ON public.delivery_tracking FOR ALL
  USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
