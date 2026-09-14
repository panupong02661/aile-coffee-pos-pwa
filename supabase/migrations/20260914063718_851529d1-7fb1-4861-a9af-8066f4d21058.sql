-- ลบนโยบายเขียนที่เปิดให้ public ของถัง menu-images
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;

-- ลบนโยบาย ALL ที่เปิดให้ public ของถัง shop-logos และ notification-sounds
DROP POLICY IF EXISTS "Allow public access to shop logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to notification sounds" ON storage.objects;

-- คงการอ่าน menu-images ไว้สาธารณะ (มีอยู่แล้ว)
-- เพิ่มการอ่าน shop-logos และ notification-sounds สาธารณะ
CREATE POLICY "Public can read shop logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'shop-logos');

CREATE POLICY "Public can read notification sounds"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'notification-sounds');

-- อนุญาตให้ผู้ใช้ที่ล็อกอินแล้ว (ส่ง x-user-id) และระบุร้าน (ส่ง x-shop-id) อัปโหลด/แก้ไข/ลบไฟล์
CREATE POLICY "Authenticated users can upload menu images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'menu-images'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update menu images"
  ON storage.objects FOR UPDATE
  TO anon
  USING (
    bucket_id = 'menu-images'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete menu images"
  ON storage.objects FOR DELETE
  TO anon
  USING (
    bucket_id = 'menu-images'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can upload shop logos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'shop-logos'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update shop logos"
  ON storage.objects FOR UPDATE
  TO anon
  USING (
    bucket_id = 'shop-logos'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete shop logos"
  ON storage.objects FOR DELETE
  TO anon
  USING (
    bucket_id = 'shop-logos'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can upload notification sounds"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'notification-sounds'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update notification sounds"
  ON storage.objects FOR UPDATE
  TO anon
  USING (
    bucket_id = 'notification-sounds'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete notification sounds"
  ON storage.objects FOR DELETE
  TO anon
  USING (
    bucket_id = 'notification-sounds'
    AND public.header_user_id() IS NOT NULL
    AND public.current_shop_id_from_header() IS NOT NULL
  );