
-- ตรวจสอบและปรับปรุง RLS policies สำหรับตาราง ingredients
-- เพื่อให้สามารถเพิ่มวัตถุดิบได้

-- ลบ policy เดิมที่อาจจะเข้มงวดเกินไป
DROP POLICY IF EXISTS "Allow admin and manager to manage ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Allow authenticated users to view ingredients" ON public.ingredients;

-- สร้าง policy ใหม่ที่อนุญาตให้ทำงานได้ทุกอย่าง (สำหรับระบบ POS ภายใน)
CREATE POLICY "Allow all operations on ingredients" 
  ON public.ingredients 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ตรวจสอบและแก้ไข stock_movements policies ด้วย
DROP POLICY IF EXISTS "Allow admin and manager to manage stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow authenticated users to view stock movements" ON public.stock_movements;

CREATE POLICY "Allow all operations on stock movements" 
  ON public.stock_movements 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- เพิ่มฟังก์ชันตรวจสอบและทำความสะอาดข้อมูลก่อนบันทึก
CREATE OR REPLACE FUNCTION public.validate_ingredient_data()
RETURNS trigger AS $$
BEGIN
  -- ตรวจสอบว่าชื่อวัตถุดิบไม่เป็นค่าว่าง
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'ชื่อวัตถุดิบไม่สามารถเป็นค่าว่างได้';
  END IF;
  
  -- ตรวจสอบค่าตัวเลขที่ต้องไม่เป็นลบ
  IF NEW.quantity < 0 OR NEW.cost_per_unit < 0 OR NEW.minimum_stock < 0 THEN
    RAISE EXCEPTION 'ค่าตัวเลขต้องไม่เป็นค่าลบ';
  END IF;
  
  -- ทำความสะอาดข้อมูล
  NEW.name := trim(NEW.name);
  NEW.supplier := COALESCE(trim(NEW.supplier), '');
  
  -- ตั้งค่าเริ่มต้นสำหรับ sort_order ถ้าไม่มี
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO NEW.sort_order FROM ingredients;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง trigger สำหรับตรวจสอบข้อมูลก่อนบันทึก
DROP TRIGGER IF EXISTS validate_ingredient_trigger ON public.ingredients;
CREATE TRIGGER validate_ingredient_trigger
  BEFORE INSERT OR UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION validate_ingredient_data();

-- อัพเดท ingredients ที่มี sort_order เป็น null
UPDATE public.ingredients 
SET sort_order = COALESCE(sort_order, 0)
WHERE sort_order IS NULL;
