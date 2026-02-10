
CREATE TABLE public.ingredient_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  value text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredient_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ingredient_categories" ON public.ingredient_categories FOR SELECT USING (true);
CREATE POLICY "Public insert ingredient_categories" ON public.ingredient_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ingredient_categories" ON public.ingredient_categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete ingredient_categories" ON public.ingredient_categories FOR DELETE USING (true);

-- Insert default categories
INSERT INTO public.ingredient_categories (name, value, sort_order) VALUES
  ('กาแฟ', 'coffee', 1),
  ('นม & ของหวาน', 'dairy', 2),
  ('สารให้ความหวาน', 'sweetener', 3),
  ('ไซรัป', 'syrup', 4),
  ('เบเกอรี่', 'bakery', 5),
  ('บรรจุภัณฑ์', 'packaging', 6),
  ('อื่นๆ', 'other', 7);
