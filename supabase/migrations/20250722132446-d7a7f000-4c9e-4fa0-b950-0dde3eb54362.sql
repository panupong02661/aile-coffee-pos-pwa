
-- Add status column to orders table
ALTER TABLE public.orders 
ADD COLUMN status TEXT DEFAULT 'completed';

-- Add an index for better performance on status queries
CREATE INDEX idx_orders_status ON public.orders(status);
