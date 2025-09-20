-- อัปเดต RLS policies สำหรับ orders ให้ผู้ดูแลระบบดูได้
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;

-- สร้าง policy ใหม่ให้ทุกคนที่ authenticated ดูออเดอร์ได้
CREATE POLICY "Authenticated users can view all orders" 
ON public.orders 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage all orders" 
ON public.orders 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- อัปเดต RLS policies สำหรับ members ให้ดูได้
DROP POLICY IF EXISTS "Authenticated users can view members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;

CREATE POLICY "Authenticated users can view all members" 
ON public.members 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage all members" 
ON public.members 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');