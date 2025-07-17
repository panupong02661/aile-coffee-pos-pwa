
-- Create table for delivery platform integrations
CREATE TABLE IF NOT EXISTS public.delivery_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL CHECK (platform_name IN ('line_man', 'grab_food', 'foodpanda')),
  api_key TEXT,
  webhook_url TEXT,
  is_enabled BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  auto_sync_enabled BOOLEAN DEFAULT false,
  auto_notification_enabled BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'disconnected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for synced delivery orders
CREATE TABLE IF NOT EXISTS public.delivery_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_order_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  order_data JSONB NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  order_status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  order_date TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform_order_id, platform_name)
);

-- Create table for sync logs
CREATE TABLE IF NOT EXISTS public.delivery_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'manual', 'auto', 'test'
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  orders_synced INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.delivery_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_integrations
CREATE POLICY "Allow all operations on delivery_integrations" ON public.delivery_integrations FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_orders" ON public.delivery_orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on delivery_sync_logs" ON public.delivery_sync_logs FOR ALL USING (true);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_delivery_integrations_updated_at 
    BEFORE UPDATE ON public.delivery_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_orders_updated_at 
    BEFORE UPDATE ON public.delivery_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
