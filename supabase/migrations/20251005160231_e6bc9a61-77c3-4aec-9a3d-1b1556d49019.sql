
-- ลบ policy เดิมที่จำกัดการอ่าน
DROP POLICY IF EXISTS "Authenticated users can view membership settings" ON public.membership_settings;

-- สร้าง policy ใหม่ที่เปิดให้ทุกคนอ่านได้
CREATE POLICY "Anyone can view membership settings"
  ON public.membership_settings
  FOR SELECT
  USING (true);

-- แก้ไข policy สำหรับการแก้ไขให้เฉพาะ authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage membership settings" ON public.membership_settings;

CREATE POLICY "Authenticated users can manage membership settings"
  ON public.membership_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
