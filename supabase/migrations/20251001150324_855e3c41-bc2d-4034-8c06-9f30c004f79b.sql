-- Fix RLS policies for order_items table to allow online orders
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;

-- Create new policies that allow public insert (for online orders)
CREATE POLICY "Anyone can view order items"
ON public.order_items
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update order items"
ON public.order_items
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete order items"
ON public.order_items
FOR DELETE
USING (true);