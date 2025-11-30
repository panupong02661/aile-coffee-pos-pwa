-- Allow viewing all menu items (active and inactive) from the frontend
ALTER POLICY "Anyone can view available menu items"
ON public.menu_items
USING (true);

-- Allow viewing all addons (active and inactive) from the frontend
ALTER POLICY "Anyone can view active addons"
ON public.addons
USING (true);