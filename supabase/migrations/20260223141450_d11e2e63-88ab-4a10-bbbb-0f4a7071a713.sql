-- Allow anon role to manage users (since app uses custom auth, not Supabase Auth)
CREATE POLICY "Allow anon to read users"
ON public.users FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow anon to insert users"
ON public.users FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to update users"
ON public.users FOR UPDATE TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete users"
ON public.users FOR DELETE TO anon
USING (true);

-- Same for user_permissions table
CREATE POLICY "Allow anon to read user_permissions"
ON public.user_permissions FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow anon to insert user_permissions"
ON public.user_permissions FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to update user_permissions"
ON public.user_permissions FOR UPDATE TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon to delete user_permissions"
ON public.user_permissions FOR DELETE TO anon
USING (true);