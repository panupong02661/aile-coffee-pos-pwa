-- อัปเดต RLS policies สำหรับ menu_items ให้ทุกคนดูได้
DROP POLICY IF EXISTS "Authenticated users can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;

-- สร้าง policy ใหม่ให้ทุกคนดูเมนูได้
CREATE POLICY "Anyone can view available menu items" 
ON public.menu_items 
FOR SELECT 
USING (is_available = true);

-- อัปเดต policy สำหรับ categories ให้ทุกคนดูได้
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;

CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- อัปเดต policy สำหรับ addons ให้ทุกคนดูได้
DROP POLICY IF EXISTS "Authenticated users can view addons" ON public.addons;
DROP POLICY IF EXISTS "Anyone can view active addons" ON public.addons;

CREATE POLICY "Anyone can view active addons" 
ON public.addons 
FOR SELECT 
USING (is_active = true);

-- อัปเดต policy สำหรับ addon_groups (ถ้ามีอยู่แล้วจะข้าม)
DROP POLICY IF EXISTS "Authenticated users can view addon groups" ON public.addon_groups;
DROP POLICY IF EXISTS "Anyone can view addon groups" ON public.addon_groups;

CREATE POLICY "Anyone can view addon groups" 
ON public.addon_groups 
FOR SELECT 
USING (true);

-- อัปเดต policy สำหรับ menu_addon_groups ให้ทุกคนดูได้
DROP POLICY IF EXISTS "Authenticated users can view menu addon groups" ON public.menu_addon_groups;
DROP POLICY IF EXISTS "Anyone can view menu addon groups" ON public.menu_addon_groups;

CREATE POLICY "Anyone can view menu addon groups" 
ON public.menu_addon_groups 
FOR SELECT 
USING (true);