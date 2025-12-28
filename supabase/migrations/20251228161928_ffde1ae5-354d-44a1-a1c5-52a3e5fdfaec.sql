-- Add policy for managing promotion_categories
CREATE POLICY "Allow all operations on promotion_categories" 
ON public.promotion_categories 
FOR ALL 
USING (true) 
WITH CHECK (true);