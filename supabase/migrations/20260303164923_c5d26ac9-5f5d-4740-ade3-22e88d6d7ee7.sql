
-- Create shops/branches table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  branch_name TEXT,
  branch_code TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  database_mode TEXT NOT NULL DEFAULT 'multi_tenant' CHECK (database_mode IN ('multi_tenant', 'separate_project')),
  supabase_project_url TEXT,
  supabase_project_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user-shop assignment table
CREATE TABLE public.user_shop_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by TEXT,
  UNIQUE(user_id, shop_id)
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shop_assignments ENABLE ROW LEVEL SECURITY;

-- Public access policies (matching existing pattern)
CREATE POLICY "Allow public read shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Allow public insert shops" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update shops" ON public.shops FOR UPDATE USING (true);
CREATE POLICY "Allow public delete shops" ON public.shops FOR DELETE USING (true);

CREATE POLICY "Allow public read user_shop_assignments" ON public.user_shop_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_shop_assignments" ON public.user_shop_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_shop_assignments" ON public.user_shop_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete user_shop_assignments" ON public.user_shop_assignments FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
