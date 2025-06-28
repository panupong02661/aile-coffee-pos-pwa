
-- เพิ่มตารางสำหรับเก็บข้อมูลโปรโมชั่น
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  apply_to TEXT NOT NULL CHECK (apply_to IN ('menu_item', 'category', 'all')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- เพิ่มตารางสำหรับเก็บรายการเมนูที่ใช้โปรโมชั่น
CREATE TABLE IF NOT EXISTS public.promotion_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promotion_id, menu_item_id)
);

-- เพิ่มตารางสำหรับเก็บหมวดหมู่ที่ใช้โปรโมชั่น
CREATE TABLE IF NOT EXISTS public.promotion_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promotion_id, category_id)
);

-- เพิ่ม RLS policies
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_categories ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับการเข้าถึงข้อมูลโปรโมชั่น (อนุญาตให้ทุกคนอ่านได้)
CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Anyone can view promotion menu items" ON public.promotion_menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view promotion categories" ON public.promotion_categories FOR SELECT USING (true);

-- สร้าง function สำหรับตรวจสอบโปรโมชั่นที่ใช้ได้
CREATE OR REPLACE FUNCTION get_active_promotions()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value DECIMAL,
  apply_to TEXT,
  menu_item_ids UUID[],
  category_ids UUID[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.discount_type,
    p.discount_value,
    p.apply_to,
    COALESCE(ARRAY_AGG(DISTINCT pmi.menu_item_id) FILTER (WHERE pmi.menu_item_id IS NOT NULL), ARRAY[]::UUID[]) as menu_item_ids,
    COALESCE(ARRAY_AGG(DISTINCT pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), ARRAY[]::UUID[]) as category_ids
  FROM public.promotions p
  LEFT JOIN public.promotion_menu_items pmi ON p.id = pmi.promotion_id
  LEFT JOIN public.promotion_categories pc ON p.id = pc.promotion_id
  WHERE p.is_active = true 
    AND p.start_date <= now() 
    AND p.end_date >= now()
  GROUP BY p.id, p.name, p.description, p.discount_type, p.discount_value, p.apply_to;
END;
$$;
