-- แก้ไข RLS policy สำหรับ notification_settings ให้อนุญาตการใช้งานทั่วไป
-- ลบ policy เดิมที่เข้มงวดเกินไป
DROP POLICY IF EXISTS "Allow admin to manage notification settings" ON public.notification_settings;

-- สร้าง policy ใหม่ที่อนุญาตให้ทุกคนใช้งานได้ (เนื่องจากเป็นการตั้งค่าทั่วไปของระบบ)
CREATE POLICY "Allow all operations on notification_settings" 
ON public.notification_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);