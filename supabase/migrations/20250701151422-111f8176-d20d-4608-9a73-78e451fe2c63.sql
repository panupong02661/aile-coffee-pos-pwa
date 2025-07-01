
-- Create order_addons table to store addon information for orders
CREATE TABLE public.order_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  order_item_id UUID NOT NULL,
  addon_id UUID NOT NULL,
  addon_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.order_addons 
ADD CONSTRAINT fk_order_addons_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_addons 
ADD CONSTRAINT fk_order_addons_order_item_id 
FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.order_addons ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on order_addons" 
ON public.order_addons 
FOR ALL 
USING (true) 
WITH CHECK (true);
