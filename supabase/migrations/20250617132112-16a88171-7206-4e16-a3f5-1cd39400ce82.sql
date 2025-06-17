
-- Create tables for inventory management system

-- Update ingredients table with additional fields (already exists, just adding missing columns if needed)
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS minimum_stock NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'g',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create menu_ingredients table for recipe management
CREATE TABLE IF NOT EXISTS menu_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_movements table for tracking inventory changes
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'purchase', 'adjustment', 'usage', 'waste'
  quantity_change NUMERIC NOT NULL,
  cost_per_unit NUMERIC DEFAULT 0,
  reference_number TEXT, -- Order number for usage, receipt for purchase
  notes TEXT,
  created_by TEXT DEFAULT 'system',
  order_id TEXT, -- For linking to sales orders
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to calculate menu item cost based on ingredients
CREATE OR REPLACE FUNCTION calculate_menu_cost(menu_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
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
$$;

-- Create function to get low stock ingredients
CREATE OR REPLACE FUNCTION get_low_stock_ingredients()
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  quantity NUMERIC,
  unit TEXT,
  minimum_stock NUMERIC,
  shortage NUMERIC
)
LANGUAGE plpgsql
AS $$
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
$$;

-- Insert sample ingredients for coffee shop (removed ON CONFLICT clause)
INSERT INTO ingredients (name, category, quantity, unit, minimum_stock, cost_per_unit, supplier, sort_order) 
SELECT 'Coffee Beans - Arabica', 'coffee', 50, 'kg', 10, 450, 'Bangkok Coffee Co.', 1
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Coffee Beans - Arabica')
UNION ALL
SELECT 'Coffee Beans - Robusta', 'coffee', 30, 'kg', 5, 350, 'Bangkok Coffee Co.', 2
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Coffee Beans - Robusta')
UNION ALL
SELECT 'Fresh Milk', 'dairy', 100, 'L', 20, 25, 'Thai Dairy Farm', 3
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Fresh Milk')
UNION ALL
SELECT 'Sugar', 'sweetener', 25, 'kg', 5, 35, 'Local Supplier', 4
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sugar')
UNION ALL
SELECT 'Vanilla Syrup', 'syrup', 15, 'L', 3, 120, 'Flavor House', 5
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Vanilla Syrup')
UNION ALL
SELECT 'Caramel Syrup', 'syrup', 12, 'L', 3, 120, 'Flavor House', 6
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Caramel Syrup')
UNION ALL
SELECT 'Croissant', 'bakery', 50, 'pcs', 10, 8, 'French Bakery', 7
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Croissant')
UNION ALL
SELECT 'Muffin Mix', 'bakery', 20, 'kg', 5, 85, 'Baking Supplies', 8
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Muffin Mix')
UNION ALL
SELECT 'Cups 12oz', 'packaging', 500, 'pcs', 100, 2.5, 'Pack Pro', 9
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cups 12oz')
UNION ALL
SELECT 'Cups 16oz', 'packaging', 300, 'pcs', 50, 3, 'Pack Pro', 10
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cups 16oz')
UNION ALL
SELECT 'Straws', 'packaging', 1000, 'pcs', 200, 0.5, 'Pack Pro', 11
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Straws')
UNION ALL
SELECT 'Napkins', 'packaging', 2000, 'pcs', 500, 0.2, 'Pack Pro', 12
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Napkins');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient_id ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_menu_item_id ON menu_ingredients(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_sort_order ON ingredients(sort_order);
