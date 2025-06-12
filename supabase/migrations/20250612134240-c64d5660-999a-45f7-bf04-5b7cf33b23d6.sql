
-- Create categories table first
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addon_groups table
CREATE TABLE public.addon_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  allow_multiple BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for authentication
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table (now categories exists)
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addons table
CREATE TABLE public.addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  addon_group_id UUID REFERENCES public.addon_groups(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_addon_groups table (many-to-many relationship)
CREATE TABLE public.menu_addon_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  addon_group_id UUID REFERENCES public.addon_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(menu_item_id, addon_group_id)
);

-- Create category_addon_groups table (many-to-many relationship)
CREATE TABLE public.category_addon_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  addon_group_id UUID REFERENCES public.addon_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, addon_group_id)
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'amount', 'buy_get', 'free_item')),
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_group TEXT NOT NULL DEFAULT 'all' CHECK (target_group IN ('all', 'silver', 'gold', 'platinum')),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotion_menu_items table (many-to-many relationship)
CREATE TABLE public.promotion_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(promotion_id, menu_item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_addon_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_menu_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - will be refined with authentication)
CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.addon_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.addons FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.menu_addon_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.category_addon_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.promotions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.promotion_menu_items FOR ALL USING (true);

-- Insert default admin user (password: admin123)
INSERT INTO public.users (username, password_hash, role) VALUES 
('admin', '$2b$10$rOlbPQvQb2zKQmZjKQWKQeWzOqKqJQzOqKqJQzOqKqJQzOqKqJQz', 'admin');

-- Insert some default categories
INSERT INTO public.categories (name, description, sort_order) VALUES 
('กาแฟ', 'เครื่องดื่มกาแฟทุกประเภท', 1),
('ชา', 'เครื่องดื่มชาทุกประเภท', 2),
('เครื่องดื่มเย็น', 'เครื่องดื่มเย็นต่างๆ', 3),
('ขนมหวาน', 'ขนมหวานและเบเกอรี่', 4);

-- Insert some default addon groups
INSERT INTO public.addon_groups (name, description, is_required, allow_multiple, sort_order) VALUES 
('ความหวาน', 'ระดับความหวาน', true, false, 1),
('ชอต', 'จำนวนชอตกาแฟ', false, false, 2),
('ท็อปปิ้ง', 'ท็อปปิ้งเพิ่มเติม', false, true, 3),
('ขนาด', 'ขนาดเครื่องดื่ม', true, false, 4);

-- Insert some default addons
INSERT INTO public.addons (name, price, addon_group_id, sort_order) VALUES 
('หวานน้อย', 0, (SELECT id FROM public.addon_groups WHERE name = 'ความหวาน'), 1),
('หวานกลาง', 0, (SELECT id FROM public.addon_groups WHERE name = 'ความหวาน'), 2),
('หวานมาก', 0, (SELECT id FROM public.addon_groups WHERE name = 'ความหวาน'), 3),
('1 ชอต', 0, (SELECT id FROM public.addon_groups WHERE name = 'ชอต'), 1),
('2 ชอต', 10, (SELECT id FROM public.addon_groups WHERE name = 'ชอต'), 2),
('3 ชอต', 20, (SELECT id FROM public.addon_groups WHERE name = 'ชอต'), 3),
('วิปครีม', 15, (SELECT id FROM public.addon_groups WHERE name = 'ท็อปปิ้ง'), 1),
('ช็อกโกแลตชิป', 10, (SELECT id FROM public.addon_groups WHERE name = 'ท็อปปิ้ง'), 2),
('ขนาดเล็ก', -10, (SELECT id FROM public.addon_groups WHERE name = 'ขนาด'), 1),
('ขนาดกลาง', 0, (SELECT id FROM public.addon_groups WHERE name = 'ขนาด'), 2),
('ขนาดใหญ่', 15, (SELECT id FROM public.addon_groups WHERE name = 'ขนาด'), 3);

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- Allow public access to the images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "Allow updates" ON storage.objects FOR UPDATE USING (bucket_id = 'menu-images');
CREATE POLICY "Allow deletes" ON storage.objects FOR DELETE USING (bucket_id = 'menu-images');
