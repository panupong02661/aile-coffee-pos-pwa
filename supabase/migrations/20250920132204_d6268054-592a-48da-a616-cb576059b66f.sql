-- Fix critical security vulnerability: Secure all business-critical tables
-- This addresses "Complete Business Operations Exposed to Public" security issues

-- 1. Fix orders table - contains sensitive sales data
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;

CREATE POLICY "Authenticated users can view orders" ON public.orders
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage orders" ON public.orders
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Fix order_items table - contains detailed sales information
DROP POLICY IF EXISTS "Allow all operations on order_items" ON public.order_items;

CREATE POLICY "Authenticated users can view order items" ON public.order_items
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage order items" ON public.order_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Fix ingredients table - contains cost and supplier information
DROP POLICY IF EXISTS "Allow all operations on ingredients" ON public.ingredients;

CREATE POLICY "Authenticated users can view ingredients" ON public.ingredients
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage ingredients" ON public.ingredients
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Fix suppliers table - contains sensitive business relationships
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON public.suppliers;

CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Fix staff_permissions table - contains internal access control data
DROP POLICY IF EXISTS "Allow all operations on staff_permissions" ON public.staff_permissions;

CREATE POLICY "Authenticated users can view staff permissions" ON public.staff_permissions
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage staff permissions" ON public.staff_permissions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Fix point_transactions table - contains customer transaction data
DROP POLICY IF EXISTS "Allow all operations on point_transactions" ON public.point_transactions;

CREATE POLICY "Authenticated users can view point transactions" ON public.point_transactions
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage point transactions" ON public.point_transactions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Fix membership_settings table - contains business configuration
DROP POLICY IF EXISTS "Allow all operations on membership_settings" ON public.membership_settings;

CREATE POLICY "Authenticated users can view membership settings" ON public.membership_settings
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage membership settings" ON public.membership_settings
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Fix menu_items table - keep public read for customer app, restrict write operations
DROP POLICY IF EXISTS "Allow all operations" ON public.menu_items;

-- Allow anyone to view menu items (for customer ordering)
CREATE POLICY "Anyone can view menu items" ON public.menu_items
FOR SELECT 
USING (true);

-- Only authenticated users can manage menu items
CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Fix categories table - keep public read for customer app, restrict write operations  
DROP POLICY IF EXISTS "Allow all operations" ON public.categories;

-- Allow anyone to view categories (for customer ordering)
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT 
USING (true);

-- Only authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories" ON public.categories
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 10. Fix addons table - keep public read for customer app, restrict write operations
DROP POLICY IF EXISTS "Allow all operations" ON public.addons;

-- Allow anyone to view addons (for customer ordering)
CREATE POLICY "Anyone can view addons" ON public.addons
FOR SELECT 
USING (true);

-- Only authenticated users can manage addons
CREATE POLICY "Authenticated users can manage addons" ON public.addons
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 11. Fix addon_groups table - keep public read for customer app, restrict write operations
DROP POLICY IF EXISTS "Allow all operations" ON public.addon_groups;

-- Allow anyone to view addon groups (for customer ordering)
CREATE POLICY "Anyone can view addon groups" ON public.addon_groups
FOR SELECT 
USING (true);

-- Only authenticated users can manage addon groups
CREATE POLICY "Authenticated users can manage addon groups" ON public.addon_groups
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 12. Fix promotions table - keep existing public read for active promotions, secure management
DROP POLICY IF EXISTS "Allow all operations" ON public.promotions;
-- Keep existing: "Anyone can view active promotions" policy

-- Only authenticated users can manage promotions
CREATE POLICY "Authenticated users can manage promotions" ON public.promotions
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Log security fix
INSERT INTO public.activity_logs (action, resource_type, details) 
VALUES ('security_fix', 'business_rls_policies', '{"description": "Fixed critical RLS policies for business tables: orders, order_items, ingredients, suppliers, staff_permissions, point_transactions, membership_settings, menu_items, categories, addons, addon_groups, and promotions to prevent unauthorized access to sensitive business data"}');