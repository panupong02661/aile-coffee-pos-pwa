-- Add DELETE policy for promotions table
CREATE POLICY "Allow delete promotions"
ON public.promotions
FOR DELETE
USING (true);

-- Also ensure promotion_menu_items has DELETE policy
CREATE POLICY "Allow delete promotion_menu_items"
ON public.promotion_menu_items
FOR DELETE
USING (true);

-- Also ensure promotion_categories has DELETE policy  
CREATE POLICY "Allow delete promotion_categories"
ON public.promotion_categories
FOR DELETE
USING (true);