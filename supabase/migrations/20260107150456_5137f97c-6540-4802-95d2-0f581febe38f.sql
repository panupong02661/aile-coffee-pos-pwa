-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can manage addons" ON public.addons;

-- Create new policy that allows public access for all operations
CREATE POLICY "Allow public access for addons management"
ON public.addons
FOR ALL
USING (true)
WITH CHECK (true);