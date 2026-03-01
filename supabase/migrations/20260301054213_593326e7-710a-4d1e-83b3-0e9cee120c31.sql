-- Add INSERT policy for members table (public access like other tables)
CREATE POLICY "Allow public insert on members"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
