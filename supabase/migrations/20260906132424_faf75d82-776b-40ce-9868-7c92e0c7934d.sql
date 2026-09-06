DROP POLICY IF EXISTS "Anyone can view all members" ON public.members;
DROP POLICY IF EXISTS "Anyone can update member favorite status" ON public.members;
DROP POLICY IF EXISTS "Authenticated users can manage all members" ON public.members;

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can delete order items" ON public.order_items;

DROP POLICY IF EXISTS "Anyone can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage all orders" ON public.orders;