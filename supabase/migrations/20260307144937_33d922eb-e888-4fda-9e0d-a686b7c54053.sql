
-- ระบบคิว (Queue System)
CREATE TABLE public.queue_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_number INTEGER NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  party_size INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'seated', 'completed', 'cancelled')),
  order_id UUID REFERENCES public.orders(id),
  table_id UUID,
  notes TEXT,
  called_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  shop_id UUID REFERENCES public.shops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ระบบจัดการโต๊ะ (Table Management)
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number TEXT NOT NULL,
  table_name TEXT,
  capacity INTEGER NOT NULL DEFAULT 4,
  area_id UUID REFERENCES public.areas(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance')),
  current_order_id UUID REFERENCES public.orders(id),
  current_queue_id UUID,
  shape TEXT DEFAULT 'square' CHECK (shape IN ('square', 'round', 'rectangle')),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  shop_id UUID REFERENCES public.shops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from queue_tickets to restaurant_tables
ALTER TABLE public.queue_tickets 
  ADD CONSTRAINT fk_queue_table FOREIGN KEY (table_id) REFERENCES public.restaurant_tables(id);

-- ระบบเดลิเวอรี่ขั้นสูง
CREATE TABLE public.delivery_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  delivery_assignment_id UUID REFERENCES public.delivery_assignments(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering', 'delivered', 'failed', 'cancelled')),
  status_note TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  estimated_prep_time INTEGER DEFAULT 15,
  estimated_delivery_time INTEGER DEFAULT 30,
  actual_prep_start TIMESTAMPTZ,
  actual_prep_end TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
  customer_feedback TEXT,
  total_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  shop_id UUID REFERENCES public.shops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access queue_tickets" ON public.queue_tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access restaurant_tables" ON public.restaurant_tables FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public access delivery_tracking" ON public.delivery_tracking FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable realtime for queue and tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
