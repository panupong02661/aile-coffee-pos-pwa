
-- Shop-scoped RLS for members, notification_schedules, order_items
-- App uses custom auth via x-shop-id header (current_shop_id_from_header())

-- MEMBERS
DROP POLICY IF EXISTS "Public can view members" ON public.members;
DROP POLICY IF EXISTS "Public can insert members" ON public.members;
DROP POLICY IF EXISTS "Public can update members" ON public.members;
DROP POLICY IF EXISTS "Public can delete members" ON public.members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.members;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.members;
DROP POLICY IF EXISTS "Enable update for all users" ON public.members;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.members;
DROP POLICY IF EXISTS "members_all_public" ON public.members;
CREATE POLICY "members_shop_scoped_select" ON public.members FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "members_shop_scoped_insert" ON public.members FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "members_shop_scoped_update" ON public.members FOR UPDATE USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "members_shop_scoped_delete" ON public.members FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- NOTIFICATION_SCHEDULES
DROP POLICY IF EXISTS "Public can view notification_schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Public can manage notification_schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notification_schedules;
DROP POLICY IF EXISTS "Enable all for public" ON public.notification_schedules;
DROP POLICY IF EXISTS "notification_schedules_all_public" ON public.notification_schedules;
CREATE POLICY "notif_sched_shop_scoped_select" ON public.notification_schedules FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "notif_sched_shop_scoped_insert" ON public.notification_schedules FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "notif_sched_shop_scoped_update" ON public.notification_schedules FOR UPDATE USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "notif_sched_shop_scoped_delete" ON public.notification_schedules FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Public can view order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can delete order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_items;
DROP POLICY IF EXISTS "order_items_all_public" ON public.order_items;
CREATE POLICY "order_items_shop_scoped_select" ON public.order_items FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "order_items_shop_scoped_insert" ON public.order_items FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "order_items_shop_scoped_update" ON public.order_items FOR UPDATE USING (shop_id = public.current_shop_id_from_header()) WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "order_items_shop_scoped_delete" ON public.order_items FOR DELETE USING (shop_id = public.current_shop_id_from_header());
