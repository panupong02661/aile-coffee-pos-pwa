-- Allow public access to membership_settings table (no login required)
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read" ON public.membership_settings;
DROP POLICY IF EXISTS "Allow public insert" ON public.membership_settings;
DROP POLICY IF EXISTS "Allow public update" ON public.membership_settings;
DROP POLICY IF EXISTS "Allow public delete" ON public.membership_settings;

-- Create policies for public access
CREATE POLICY "Allow public read" ON public.membership_settings
FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.membership_settings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.membership_settings
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete" ON public.membership_settings
FOR DELETE USING (true);