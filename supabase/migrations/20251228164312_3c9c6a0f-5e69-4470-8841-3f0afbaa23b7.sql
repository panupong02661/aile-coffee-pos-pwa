-- Add SELECT policy for promotion_menu_items 
CREATE POLICY "Allow select promotion_menu_items"
ON public.promotion_menu_items
FOR SELECT
USING (true);

-- Add SELECT policy for promotion_categories
CREATE POLICY "Allow select promotion_categories"
ON public.promotion_categories
FOR SELECT
USING (true);

-- Add INSERT policy for promotion_menu_items
CREATE POLICY "Allow insert promotion_menu_items"
ON public.promotion_menu_items
FOR INSERT
WITH CHECK (true);

-- Add INSERT policy for promotion_categories
CREATE POLICY "Allow insert promotion_categories"
ON public.promotion_categories
FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy for promotion_menu_items
CREATE POLICY "Allow update promotion_menu_items"
ON public.promotion_menu_items
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add UPDATE policy for promotion_categories
CREATE POLICY "Allow update promotion_categories"
ON public.promotion_categories
FOR UPDATE
USING (true)
WITH CHECK (true);