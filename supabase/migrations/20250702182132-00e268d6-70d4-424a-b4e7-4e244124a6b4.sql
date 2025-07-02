
-- Update RLS policies for limited_rewards table to allow admin operations
DROP POLICY IF EXISTS "Anyone can view active limited rewards" ON public.limited_rewards;

-- Allow viewing of active limited rewards for everyone
CREATE POLICY "Anyone can view active limited rewards" 
ON public.limited_rewards 
FOR SELECT 
USING ((is_active = true) AND (start_date <= now()) AND (end_date >= now()));

-- Allow admin to insert limited rewards
CREATE POLICY "Admin can create limited rewards" 
ON public.limited_rewards 
FOR INSERT 
WITH CHECK (true);

-- Allow admin to update limited rewards
CREATE POLICY "Admin can update limited rewards" 
ON public.limited_rewards 
FOR UPDATE 
USING (true);

-- Allow admin to delete limited rewards
CREATE POLICY "Admin can delete limited rewards" 
ON public.limited_rewards 
FOR DELETE 
USING (true);
