-- ปรับปรุง RLS policies สำหรับตาราง ingredients ให้สามารถ select ได้แม้ไม่ authenticate
DROP POLICY IF EXISTS "Authenticated users can view ingredients" ON public.ingredients;

-- สร้าง policy ใหม่ที่อนุญาตให้ทุกคนดูข้อมูล ingredients ได้
CREATE POLICY "Allow public read access to ingredients" 
ON public.ingredients 
FOR SELECT 
USING (true);

-- เพิ่ม policy สำหรับการจัดการข้อมูล ingredients สำหรับ authenticated users
CREATE POLICY "Authenticated users can manage ingredients" 
ON public.ingredients 
FOR ALL 
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);