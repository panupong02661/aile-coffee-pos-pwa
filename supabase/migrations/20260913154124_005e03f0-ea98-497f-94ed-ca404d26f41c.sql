DROP POLICY IF EXISTS shops_self_update ON public.shops;
CREATE POLICY shops_admin_or_assigned_update ON public.shops FOR UPDATE
USING (public.is_admin_header() OR id = public.current_shop_id_from_header() OR id IN (SELECT public.header_user_shop_ids()))
WITH CHECK (public.is_admin_header() OR id = public.current_shop_id_from_header() OR id IN (SELECT public.header_user_shop_ids()));
CREATE POLICY shops_admin_insert ON public.shops FOR INSERT WITH CHECK (public.is_admin_header());
CREATE POLICY shops_admin_delete ON public.shops FOR DELETE USING (public.is_admin_header());