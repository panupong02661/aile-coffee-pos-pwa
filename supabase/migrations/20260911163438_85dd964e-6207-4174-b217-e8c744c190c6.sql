-- Drop permissive members policies
DROP POLICY IF EXISTS "Allow public insert on members" ON public.members;
DROP POLICY IF EXISTS "Staff can create members" ON public.members;
DROP POLICY IF EXISTS "Staff can delete members" ON public.members;
DROP POLICY IF EXISTS "Staff can view all members" ON public.members;

-- Drop permissive orders policies
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;

-- Drop permissive shops policies
DROP POLICY IF EXISTS "Allow public delete shops" ON public.shops;
DROP POLICY IF EXISTS "Allow public insert shops" ON public.shops;
DROP POLICY IF EXISTS "Allow public read shops" ON public.shops;
DROP POLICY IF EXISTS "Allow public update shops" ON public.shops;
DROP POLICY IF EXISTS "shops_public_select" ON public.shops;

-- Add a shop-scoped select policy for public visitors on shops
CREATE POLICY "shops_shop_scoped_select"
ON public.shops
FOR SELECT
TO public
USING (id = public.current_shop_id_from_header());

-- Remove public access to embedded Supabase credentials on the shops table
REVOKE SELECT (supabase_project_key, supabase_project_url) ON public.shops FROM anon;
