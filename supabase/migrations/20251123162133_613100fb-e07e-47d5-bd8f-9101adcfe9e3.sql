-- Relax RLS for wifi_vouchers to allow inserts from POS without auth
DROP POLICY IF EXISTS "Authenticated users can manage wifi vouchers" ON public.wifi_vouchers;

-- Allow all roles (including anon) to manage wifi_vouchers, similar to shop_settings
CREATE POLICY "Allow all operations on wifi_vouchers"
  ON public.wifi_vouchers
  FOR ALL
  USING (true)
  WITH CHECK (true);