-- Drop the existing restrictive policies for cancelled_orders
DROP POLICY IF EXISTS "Allow admin and manager to manage cancelled orders" ON public.cancelled_orders;
DROP POLICY IF EXISTS "Allow authenticated users to view cancelled orders" ON public.cancelled_orders;

-- Create new policies that allow public access for POS operations
-- Allow anyone to view cancelled orders
CREATE POLICY "Anyone can view cancelled orders" 
ON public.cancelled_orders 
FOR SELECT 
USING (true);

-- Allow anyone to insert cancelled orders (for POS cancellation)
CREATE POLICY "Anyone can insert cancelled orders" 
ON public.cancelled_orders 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update cancelled orders
CREATE POLICY "Anyone can update cancelled orders" 
ON public.cancelled_orders 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow anyone to delete cancelled orders
CREATE POLICY "Anyone can delete cancelled orders" 
ON public.cancelled_orders 
FOR DELETE 
USING (true);