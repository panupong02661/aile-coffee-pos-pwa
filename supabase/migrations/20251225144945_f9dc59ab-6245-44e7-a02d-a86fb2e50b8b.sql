-- แก้ไข RLS policies สำหรับ menu_items ให้รองรับการนำเข้า/ส่งออกโดยไม่ต้อง Auth

-- ลบ policies เดิมที่มีอยู่
DROP POLICY IF EXISTS "Anon can toggle menu availability" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON public.menu_items;

-- สร้าง policy ใหม่ที่อนุญาตทุกการทำงานสำหรับทุกคน
CREATE POLICY "Allow all operations on menu_items"
ON public.menu_items
FOR ALL
USING (true)
WITH CHECK (true);