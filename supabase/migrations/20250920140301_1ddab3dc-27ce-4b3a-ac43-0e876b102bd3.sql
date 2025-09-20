-- อนุญาตให้ดูออเดอร์และสมาชิกได้โดยไม่ต้องล็อกอิน (สำหรับการจัดการภายใน)
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage all orders" ON public.orders;

-- สร้าง policy ให้ทุกคนดูออเดอร์ได้
CREATE POLICY "Anyone can view all orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- แต่การจัดการยังคงต้อง authenticated
CREATE POLICY "Authenticated users can manage all orders" 
ON public.orders 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- อนุญาตให้ดูสมาชิกได้โดยไม่ต้องล็อกอิน
DROP POLICY IF EXISTS "Authenticated users can view all members" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage all members" ON public.members;

CREATE POLICY "Anyone can view all members" 
ON public.members 
FOR SELECT 
USING (true);

-- การจัดการสมาชิกต้อง authenticated
CREATE POLICY "Authenticated users can manage all members" 
ON public.members 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');