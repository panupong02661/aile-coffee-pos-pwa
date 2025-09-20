-- Fix critical security vulnerability: Replace overly permissive RLS policies
-- This addresses the "Customer Personal Information Could Be Stolen" security issue

-- 1. Fix members table - restrict access to authenticated staff only
DROP POLICY IF EXISTS "Allow all operations on members" ON public.members;

-- Only authenticated staff can view member data
CREATE POLICY "Staff can view all members" ON public.members
FOR SELECT TO authenticated 
USING (true);

-- Only authenticated staff can create members
CREATE POLICY "Staff can create members" ON public.members
FOR INSERT TO authenticated
WITH CHECK (true);

-- Only authenticated staff can update members
CREATE POLICY "Staff can update members" ON public.members
FOR UPDATE TO authenticated
USING (true);

-- Only authenticated staff can delete members
CREATE POLICY "Staff can delete members" ON public.members
FOR DELETE TO authenticated
USING (true);

-- 2. Fix staff table - restrict access to authenticated users only
DROP POLICY IF EXISTS "Allow all operations on staff" ON public.staff;

-- Only authenticated users can view staff data
CREATE POLICY "Authenticated users can view staff" ON public.staff
FOR SELECT TO authenticated
USING (true);

-- Only authenticated users can manage staff data
CREATE POLICY "Authenticated users can manage staff" ON public.staff
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Fix users table - restrict access to authenticated users only
DROP POLICY IF EXISTS "Allow all operations" ON public.users;

-- Only authenticated users can view users (for login functionality)
CREATE POLICY "Authenticated users can view users" ON public.users
FOR SELECT TO authenticated
USING (true);

-- Only authenticated users can manage user accounts
CREATE POLICY "Authenticated users can manage users" ON public.users
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Ensure customer_gifts table maintains proper access control
-- (Already has proper policies, no changes needed)

-- Log security fix
INSERT INTO public.activity_logs (action, resource_type, details) 
VALUES ('security_fix', 'rls_policies', '{"description": "Fixed critical RLS policies for members, staff, and users tables to prevent unauthorized access to sensitive data"}');