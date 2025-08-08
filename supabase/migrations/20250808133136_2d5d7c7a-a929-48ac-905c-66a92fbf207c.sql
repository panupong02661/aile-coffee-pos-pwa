
-- Create areas table for restaurant layout management
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- Create policy for areas
CREATE POLICY "Allow all operations on areas" ON public.areas FOR ALL USING (true);

-- Update tables table to add foreign key reference to areas
ALTER TABLE public.tables 
ADD CONSTRAINT fk_tables_area_id 
FOREIGN KEY (area_id) REFERENCES public.areas(id);

-- Create staff permissions table
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  permission_name TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id, permission_name)
);

-- Enable RLS
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for staff permissions
CREATE POLICY "Allow all operations on staff_permissions" ON public.staff_permissions FOR ALL USING (true);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for expense categories
CREATE POLICY "Allow all operations on expense_categories" ON public.expense_categories FOR ALL USING (true);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.expense_categories(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  receipt_url TEXT,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for expenses
CREATE POLICY "Allow all operations on expenses" ON public.expenses FOR ALL USING (true);

-- Insert default areas
INSERT INTO public.areas (name, description, sort_order) VALUES
('ชั้น 1', 'พื้นที่ชั้น 1', 1),
('ชั้น 2', 'พื้นที่ชั้น 2', 2),
('ระเบียง', 'พื้นที่ระเบียง', 3),
('VIP', 'ห้อง VIP', 4)
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, sort_order) VALUES
('วัตถุดิบ', 'ค่าซื้อวัตถุดิบอาหาร', 1),
('ค่าเช่า', 'ค่าเช่าสถานที่', 2),
('ค่าไฟฟ้า', 'ค่าไฟฟ้ารายเดือน', 3),
('ค่าน้ำ', 'ค่าน้ำประปา', 4),
('เงินเดือน', 'เงินเดือนพนักงาน', 5),
('การตลาด', 'ค่าใช้จ่ายการตลาด', 6),
('ซ่อมบำรุง', 'ค่าซ่อมบำรุงอุปกรณ์', 7),
('อื่นๆ', 'ค่าใช้จ่ายอื่นๆ', 8)
ON CONFLICT DO NOTHING;

-- Insert default staff permissions
INSERT INTO public.staff_permissions (staff_id, permission_name, is_granted) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  unnest(ARRAY[
    'view_reports',
    'manage_menu',
    'manage_orders',
    'manage_members',
    'manage_inventory',
    'manage_staff',
    'manage_settings',
    'manage_promotions',
    'cancel_orders',
    'refund_orders',
    'view_financial_reports',
    'manage_expenses'
  ]),
  true
ON CONFLICT (staff_id, permission_name) DO NOTHING;
