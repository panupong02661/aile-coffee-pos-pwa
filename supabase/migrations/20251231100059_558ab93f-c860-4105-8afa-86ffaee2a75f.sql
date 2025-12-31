-- Drop existing update policy that requires authentication
DROP POLICY IF EXISTS "Staff can update members" ON public.members;

-- Create new policy that allows public update for is_favorite field
CREATE POLICY "Anyone can update member favorite status" 
ON public.members 
FOR UPDATE 
USING (true)
WITH CHECK (true);