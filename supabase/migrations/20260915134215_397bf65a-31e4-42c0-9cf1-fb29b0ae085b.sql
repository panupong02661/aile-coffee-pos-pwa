
DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['delivery_sync_logs','notification_sounds','rewards','translations','notification_outbox','limited_reward_claims']
  LOOP
    FOR p IN SELECT polname FROM pg_policy WHERE polrelid = format('public.%I', t)::regclass LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.polname, t);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$CREATE POLICY %I ON public.%I FOR ALL USING (shop_id = current_shop_id_from_header() OR is_admin_header()) WITH CHECK (shop_id = current_shop_id_from_header() OR is_admin_header())$f$, t || '_shop_scoped', t);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_sync_logs, public.notification_sounds, public.rewards, public.translations, public.notification_outbox, public.limited_reward_claims TO anon, authenticated;
