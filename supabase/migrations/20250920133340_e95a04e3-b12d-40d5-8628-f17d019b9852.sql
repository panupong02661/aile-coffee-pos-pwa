-- Fix business operations data exposure by securing RLS policies
-- This migration restricts access to sensitive business data to authenticated users only

-- 1. Update shop_settings policies to restrict access to authenticated users
DROP POLICY IF EXISTS "Allow all operations on shop_settings" ON public.shop_settings;

CREATE POLICY "Authenticated users can view shop settings"
ON public.shop_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage shop settings"
ON public.shop_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Update menu_items policies to remove public read access
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;

CREATE POLICY "Authenticated users can view menu items"
ON public.menu_items
FOR SELECT
TO authenticated
USING (true);

-- 3. Update addons policies to remove public read access  
DROP POLICY IF EXISTS "Anyone can view addons" ON public.addons;

CREATE POLICY "Authenticated users can view addons"
ON public.addons
FOR SELECT
TO authenticated
USING (true);

-- 4. Check and update addon_groups policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations" ON public.addon_groups;
    DROP POLICY IF EXISTS "Authenticated users can manage addon groups" ON public.addon_groups;
    DROP POLICY IF EXISTS "Authenticated users can view addon groups" ON public.addon_groups;
    
    -- Create new secure policies
    CREATE POLICY "Authenticated users can view addon groups"
    ON public.addon_groups
    FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "Authenticated users can manage addon groups"
    ON public.addon_groups
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- 5. Check and update categories policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
    DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
    DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
    
    -- Create new secure policies
    CREATE POLICY "Authenticated users can view categories"
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "Authenticated users can manage categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- 6. Check and update menu_addon_groups policies if they exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations" ON public.menu_addon_groups;
    DROP POLICY IF EXISTS "Authenticated users can manage menu addon groups" ON public.menu_addon_groups;
    DROP POLICY IF EXISTS "Authenticated users can view menu addon groups" ON public.menu_addon_groups;
    
    -- Create new secure policies
    CREATE POLICY "Authenticated users can view menu addon groups"
    ON public.menu_addon_groups
    FOR SELECT
    TO authenticated
    USING (true);

    CREATE POLICY "Authenticated users can manage menu addon groups"
    ON public.menu_addon_groups
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
END $$;

-- Log this security fix
INSERT INTO public.security_logs (event_type, details)
VALUES ('security_policy_update', jsonb_build_object(
  'action', 'restricted_business_data_access',
  'tables_secured', ARRAY['shop_settings', 'menu_items', 'addons', 'addon_groups', 'categories', 'menu_addon_groups'],
  'change', 'removed public read access to sensitive business data',
  'timestamp', now()
));