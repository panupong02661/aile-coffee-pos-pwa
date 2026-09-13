DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'shop_settings','receipt_settings','notification_settings','engagement_settings','wifi_reset_schedule','language_settings',
    'menu_items','categories','addons','addon_groups','menu_addon_groups','category_addon_groups',
    'promotion_menu_items','promotion_categories','areas','tables','table_areas','order_addons','menu_ingredients',
    'stamp_cards','stamp_card_milestones','customer_stamp_cards','customer_stamps','festival_events','festival_prizes',
    'festival_themes','limited_promotions','limited_rewards','wifi_price_tiers','membership_settings'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO public USING (shop_id = public.current_shop_id_from_header())', t || '_shop_read', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO public WITH CHECK (shop_id = public.current_shop_id_from_header() AND public.is_admin_header())', t || '_admin_insert', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO public USING (shop_id = public.current_shop_id_from_header() AND public.is_admin_header()) WITH CHECK (shop_id = public.current_shop_id_from_header() AND public.is_admin_header())', t || '_admin_update', t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO public USING (shop_id = public.current_shop_id_from_header() AND public.is_admin_header())', t || '_admin_delete', t);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_shop_assignments' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_shop_assignments', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_shop_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_shop_assignments_own_or_admin_read
ON public.user_shop_assignments FOR SELECT TO public
USING (user_id = public.header_user_id() OR public.is_admin_header());
CREATE POLICY user_shop_assignments_admin_insert
ON public.user_shop_assignments FOR INSERT TO public
WITH CHECK (public.is_admin_header());
CREATE POLICY user_shop_assignments_admin_update
ON public.user_shop_assignments FOR UPDATE TO public
USING (public.is_admin_header()) WITH CHECK (public.is_admin_header());
CREATE POLICY user_shop_assignments_admin_delete
ON public.user_shop_assignments FOR DELETE TO public
USING (public.is_admin_header());