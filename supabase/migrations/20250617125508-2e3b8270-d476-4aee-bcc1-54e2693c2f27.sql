
-- สร้างตาราง ingredients สำหรับจัดการวัตถุดิบ
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'g',
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  minimum_stock NUMERIC NOT NULL DEFAULT 10,
  supplier TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- สร้างตาราง menu_ingredients สำหรับเชื่อมโยงเมนูกับวัตถุดิบ
CREATE TABLE public.menu_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_item_id, ingredient_id)
);

-- สร้างตาราง stock_movements สำหรับบันทึกการเคลื่อนไหวสต็อก
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'adjustment', 'usage', 'waste')),
  quantity_change NUMERIC NOT NULL,
  cost_per_unit NUMERIC DEFAULT 0,
  reference_number TEXT,
  order_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'system'
);

-- เพิ่มข้อมูลวัตถุดิบเริ่มต้น
INSERT INTO public.ingredients (name, category, quantity, unit, cost_per_unit, minimum_stock, supplier) VALUES
-- Coffee & Beverages
('Coffee Beans (Arabica)', 'coffee', 5000, 'g', 0.8, 1000, 'Coffee Supplier Co.'),
('Coffee Beans (Robusta)', 'coffee', 3000, 'g', 0.6, 1000, 'Coffee Supplier Co.'),
('Fresh Milk', 'dairy', 20, 'L', 25, 5, 'Dairy Farm Ltd.'),
('Sugar', 'sweetener', 2000, 'g', 0.02, 500, 'Sugar Mills Inc.'),
('Vanilla Syrup', 'syrup', 1500, 'ml', 0.15, 300, 'Flavor House'),
('Caramel Syrup', 'syrup', 1200, 'ml', 0.15, 300, 'Flavor House'),
('Chocolate Syrup', 'syrup', 1000, 'ml', 0.18, 300, 'Flavor House'),

-- Bakery
('Croissant (Frozen)', 'bakery', 50, 'pieces', 8, 10, 'Bakery Supply Co.'),
('Muffin Mix', 'bakery', 3000, 'g', 0.05, 1000, 'Bakery Supply Co.'),
('Butter', 'dairy', 2, 'kg', 120, 0.5, 'Dairy Farm Ltd.'),

-- Packaging
('Paper Cups 12oz', 'packaging', 500, 'pieces', 1.2, 100, 'Package Pro'),
('Paper Cups 16oz', 'packaging', 300, 'pieces', 1.5, 100, 'Package Pro'),
('Plastic Lids', 'packaging', 800, 'pieces', 0.3, 200, 'Package Pro'),
('Paper Straws', 'packaging', 1000, 'pieces', 0.1, 300, 'Package Pro'),
('Napkins', 'packaging', 2000, 'pieces', 0.05, 500, 'Package Pro');

-- เพิ่มข้อมูล menu_ingredients เริ่มต้น (สูตรพื้นฐาน)
-- สมมติว่ามีเมนู Espresso, Cappuccino, Latte อยู่แล้ว
-- ถ้าไม่มีจะต้องสร้างเมนูเหล่านี้ก่อน หรือปรับ ID ตามเมนูที่มีอยู่

-- สร้าง trigger สำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingredients_updated_at 
  BEFORE UPDATE ON ingredients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- สร้าง function สำหรับตรวจสอบสต็อกต่ำ
CREATE OR REPLACE FUNCTION get_low_stock_ingredients()
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  quantity NUMERIC,
  unit TEXT,
  minimum_stock NUMERIC,
  shortage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.category,
    i.quantity,
    i.unit,
    i.minimum_stock,
    (i.minimum_stock - i.quantity) as shortage
  FROM ingredients i
  WHERE i.quantity <= i.minimum_stock AND i.is_active = true
  ORDER BY (i.minimum_stock - i.quantity) DESC;
END;
$$ LANGUAGE plpgsql;

-- สร้าง function สำหรับคำนวณต้นทุนเมนู
CREATE OR REPLACE FUNCTION calculate_menu_cost(menu_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_cost NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(mi.quantity_needed * i.cost_per_unit), 0)
  INTO total_cost
  FROM menu_ingredients mi
  JOIN ingredients i ON mi.ingredient_id = i.id
  WHERE mi.menu_item_id = menu_id;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql;
