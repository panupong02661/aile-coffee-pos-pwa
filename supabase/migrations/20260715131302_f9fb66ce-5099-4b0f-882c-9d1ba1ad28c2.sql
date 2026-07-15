
-- ORDERS
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.orders;
DROP POLICY IF EXISTS "orders_all_public" ON public.orders;
CREATE POLICY "orders_shop_scoped_select" ON public.orders FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "orders_shop_scoped_insert" ON public.orders FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "orders_shop_scoped_update" ON public.orders FOR UPDATE USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "orders_shop_scoped_delete" ON public.orders FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- QUEUE_TICKETS
DROP POLICY IF EXISTS "Public can view queue_tickets" ON public.queue_tickets;
DROP POLICY IF EXISTS "Public can manage queue_tickets" ON public.queue_tickets;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.queue_tickets;
DROP POLICY IF EXISTS "Enable all for public" ON public.queue_tickets;
DROP POLICY IF EXISTS "queue_tickets_all_public" ON public.queue_tickets;
CREATE POLICY "queue_tickets_shop_scoped_select" ON public.queue_tickets FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "queue_tickets_shop_scoped_insert" ON public.queue_tickets FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "queue_tickets_shop_scoped_update" ON public.queue_tickets FOR UPDATE USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "queue_tickets_shop_scoped_delete" ON public.queue_tickets FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- SHOPS (id = shop identifier itself)
DROP POLICY IF EXISTS "Public can view shops" ON public.shops;
DROP POLICY IF EXISTS "Public can insert shops" ON public.shops;
DROP POLICY IF EXISTS "Public can update shops" ON public.shops;
DROP POLICY IF EXISTS "Public can delete shops" ON public.shops;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shops;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.shops;
DROP POLICY IF EXISTS "Enable update for all users" ON public.shops;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.shops;
DROP POLICY IF EXISTS "shops_all_public" ON public.shops;
-- Login flow needs to look up shops by user before header is set: keep SELECT open, restrict writes
CREATE POLICY "shops_public_select" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_self_update" ON public.shops FOR UPDATE USING (id = public.current_shop_id_from_header()) WITH CHECK (id = public.current_shop_id_from_header());
-- INSERT/DELETE not allowed via Data API — must go through service_role
