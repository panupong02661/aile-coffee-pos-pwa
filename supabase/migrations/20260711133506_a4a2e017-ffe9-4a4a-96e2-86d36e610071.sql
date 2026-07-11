
-- delivery_integrations: remove public access
DROP POLICY IF EXISTS "Allow all operations on delivery_integrations" ON public.delivery_integrations;
DROP POLICY IF EXISTS "Public can manage delivery_integrations" ON public.delivery_integrations;
DROP POLICY IF EXISTS "Enable all for delivery_integrations" ON public.delivery_integrations;
REVOKE ALL ON public.delivery_integrations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_integrations TO authenticated;
CREATE POLICY "Authenticated users can manage delivery_integrations"
  ON public.delivery_integrations FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- delivery_orders: remove public access
DROP POLICY IF EXISTS "Allow all operations on delivery_orders" ON public.delivery_orders;
DROP POLICY IF EXISTS "Public can manage delivery_orders" ON public.delivery_orders;
DROP POLICY IF EXISTS "Enable all for delivery_orders" ON public.delivery_orders;
REVOKE ALL ON public.delivery_orders FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_orders TO authenticated;
CREATE POLICY "Authenticated users can manage delivery_orders"
  ON public.delivery_orders FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- delivery_tracking: remove public access
DROP POLICY IF EXISTS "Allow all operations on delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Public can manage delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Enable all for delivery_tracking" ON public.delivery_tracking;
REVOKE ALL ON public.delivery_tracking FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_tracking TO authenticated;
CREATE POLICY "Authenticated users can manage delivery_tracking"
  ON public.delivery_tracking FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);
