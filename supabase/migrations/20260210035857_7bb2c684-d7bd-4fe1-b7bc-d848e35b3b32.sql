
CREATE POLICY "Allow public insert to ingredients"
ON public.ingredients
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to ingredients"
ON public.ingredients
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to ingredients"
ON public.ingredients
FOR DELETE
USING (true);
