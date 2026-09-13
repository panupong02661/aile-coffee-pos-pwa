-- lottery: drop permissive policy, add shop-scoped ones
DROP POLICY IF EXISTS "Allow all operations on lottery" ON public.lottery;

CREATE POLICY "lottery_select_shop" ON public.lottery
  FOR SELECT USING (shop_id = public.current_shop_id_from_header() OR public.is_admin_header());

CREATE POLICY "lottery_insert_admin" ON public.lottery
  FOR INSERT WITH CHECK (public.is_admin_header() AND (shop_id IS NULL OR shop_id = public.current_shop_id_from_header()));

CREATE POLICY "lottery_update_admin" ON public.lottery
  FOR UPDATE USING (public.is_admin_header() AND shop_id = public.current_shop_id_from_header())
  WITH CHECK (public.is_admin_header() AND shop_id = public.current_shop_id_from_header());

CREATE POLICY "lottery_delete_admin" ON public.lottery
  FOR DELETE USING (public.is_admin_header() AND shop_id = public.current_shop_id_from_header());

-- notification_schedules: remove the unrestricted policy that overrides tenant isolation
DROP POLICY IF EXISTS "Allow all operations on notification_schedules" ON public.notification_schedules;