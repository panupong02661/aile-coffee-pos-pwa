-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Set replica identity to full to ensure all order data is captured
ALTER TABLE public.orders REPLICA IDENTITY FULL;