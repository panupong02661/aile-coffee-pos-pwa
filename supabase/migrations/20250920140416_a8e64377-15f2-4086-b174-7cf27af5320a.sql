-- อนุญาตให้ดู order_items ได้โดยไม่ต้องล็อกอิน (สำหรับดูรายละเอียดออเดอร์)
DROP POLICY IF EXISTS "Authenticated users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;

CREATE POLICY "Anyone can view order items" 
ON public.order_items 
FOR SELECT 
USING (true);

-- การจัดการยังคงต้อง authenticated
CREATE POLICY "Authenticated users can manage order items" 
ON public.order_items 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');