-- Fix RLS policy for rewards table to allow public read access for active rewards
-- This will fix the white screen issue in customer mobile app

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "rewards_public_read" ON public.rewards;

-- Create new policy allowing public to view active rewards
CREATE POLICY "Public can view active rewards"
ON public.rewards
FOR SELECT
TO public
USING (is_active = true);

-- Ensure authenticated users can still manage rewards
CREATE POLICY "Authenticated users can manage rewards"
ON public.rewards
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);