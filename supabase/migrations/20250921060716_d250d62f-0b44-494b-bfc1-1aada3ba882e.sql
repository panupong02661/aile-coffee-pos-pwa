-- ลบ policies ที่มีอยู่แล้วทั้งหมดสำหรับตาราง ingredients
DROP POLICY IF EXISTS "Allow public read access to ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON public.ingredients;

-- สร้าง policy ใหม่ที่อนุญาตให้ทุกคนดูข้อมูล ingredients ได้
CREATE POLICY "Allow public read access to ingredients" 
ON public.ingredients 
FOR SELECT 
USING (true);

-- สร้าง policy สำหรับการ insert ข้อมูล ingredients สำหรับ authenticated users
CREATE POLICY "Authenticated users can insert ingredients" 
ON public.ingredients 
FOR INSERT
WITH CHECK (auth.role() = 'authenticated'::text);

-- สร้าง policy สำหรับการ update ข้อมูล ingredients สำหรับ authenticated users
CREATE POLICY "Authenticated users can update ingredients" 
ON public.ingredients 
FOR UPDATE
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);

-- สร้าง policy สำหรับการ delete ข้อมูล ingredients สำหรับ authenticated users
CREATE POLICY "Authenticated users can delete ingredients" 
ON public.ingredients 
FOR DELETE
USING (auth.role() = 'authenticated'::text);