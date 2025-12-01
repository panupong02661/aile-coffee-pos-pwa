-- Drop the restrictive policy that only shows active categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;

-- The remaining policies will allow viewing all categories (active and inactive)
-- "Allow all operations on categories" (ALL operations)
-- "Anyone can view categories" (SELECT without restrictions)