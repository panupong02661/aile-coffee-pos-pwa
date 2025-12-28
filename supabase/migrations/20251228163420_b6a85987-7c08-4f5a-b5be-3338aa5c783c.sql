-- Add INSERT policy for promotions table
CREATE POLICY "Allow insert promotions"
ON public.promotions
FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy for promotions table
CREATE POLICY "Allow update promotions"
ON public.promotions
FOR UPDATE
USING (true)
WITH CHECK (true);