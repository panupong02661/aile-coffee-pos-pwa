-- Create table for syncing cart data to customer display
CREATE TABLE public.cart_display_sync (
  id TEXT PRIMARY KEY DEFAULT 'current-cart',
  cart_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE cart_display_sync;

-- Make it publicly accessible (no auth required for display screen)
ALTER TABLE public.cart_display_sync ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cart display data
CREATE POLICY "Anyone can read cart display sync" 
ON public.cart_display_sync 
FOR SELECT 
USING (true);

-- Allow anyone to insert/update cart display data
CREATE POLICY "Anyone can update cart display sync" 
ON public.cart_display_sync 
FOR ALL 
USING (true) 
WITH CHECK (true);