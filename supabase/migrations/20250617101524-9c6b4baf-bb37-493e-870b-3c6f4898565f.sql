
-- Create orders table to store order information
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  member_id UUID REFERENCES public.members(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items_count INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  bill_discount NUMERIC DEFAULT 0,
  bill_discount_type TEXT DEFAULT 'amount',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table to store individual items in each order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  menu_item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  item_discount NUMERIC DEFAULT 0,
  item_discount_type TEXT DEFAULT 'amount',
  total_price NUMERIC NOT NULL DEFAULT 0,
  selected_addons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_member_id ON public.orders(member_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get the next order number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format as ORD-XXX
  order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Add RLS policies for order_items table  
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on order_items" ON public.order_items
  FOR ALL USING (true) WITH CHECK (true);
