-- ===========================================================
-- Phase 3: RLS policies on storage.objects for receipts bucket
-- ===========================================================

-- Drop existing receipts-related policies on storage.objects
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
    AND (qual::text ~ 'receipts' OR COALESCE(with_check::text,'') ~ 'receipts')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- anon: upload (INSERT) receipts only — cannot read/list
CREATE POLICY "Anon can upload receipts"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'receipts');

-- authenticated staff: full manage of receipts (read/list/update/delete)
CREATE POLICY "Staff can manage receipts"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'receipts')
  WITH CHECK (bucket_id = 'receipts');

-- service_role: full manage of receipts
CREATE POLICY "Service role can manage receipts"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'receipts')
  WITH CHECK (bucket_id = 'receipts');
