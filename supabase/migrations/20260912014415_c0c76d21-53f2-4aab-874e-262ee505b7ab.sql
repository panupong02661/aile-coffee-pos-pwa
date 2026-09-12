
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO anon, authenticated;
GRANT ALL ON public.user_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wifi_vouchers TO anon, authenticated;
GRANT ALL ON public.wifi_vouchers TO service_role;
GRANT SELECT ON public.shops TO anon, authenticated;
