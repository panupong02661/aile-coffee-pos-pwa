
-- Add shop_id to core tables
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.addons ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.addon_groups ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_shop_id ON public.menu_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_members_shop_id ON public.members(shop_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_shop_id ON public.ingredients(shop_id);

-- Helper function to get user's primary shop_id
CREATE OR REPLACE FUNCTION public.get_user_shop_id(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.user_shop_assignments
  WHERE user_id = p_user_id AND is_primary = true
  LIMIT 1;
$$;
