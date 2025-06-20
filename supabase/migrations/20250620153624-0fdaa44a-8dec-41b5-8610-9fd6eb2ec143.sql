
-- สร้างตาราง customer_mobile_sessions สำหรับจัดการเซสชั่นลูกค้า
CREATE TABLE public.customer_mobile_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_type TEXT DEFAULT 'mobile',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- สร้างตาราง customer_orders สำหรับเก็บออเดอร์จากแอปมือถือ
CREATE TABLE public.customer_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id),
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'online',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  delivery_type TEXT DEFAULT 'pickup',
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- สร้างตาราง customer_transactions สำหรับเก็บประวัติการชำระเงิน
CREATE TABLE public.customer_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customer_profiles(id),
  order_id UUID REFERENCES public.customer_orders(id),
  transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'points_earn', 'points_redeem'
  amount NUMERIC NOT NULL DEFAULT 0,
  points_change INTEGER DEFAULT 0,
  payment_method TEXT,
  transaction_status TEXT DEFAULT 'completed',
  reference_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- เพิ่มคอลัมน์ reward_points ในตาราง customer_profiles ถ้ายังไม่มี
ALTER TABLE public.customer_profiles 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- สร้างดัชนีเพื่อประสิทธิภาพ
CREATE INDEX idx_customer_mobile_sessions_customer_id ON public.customer_mobile_sessions(customer_id);
CREATE INDEX idx_customer_mobile_sessions_device_id ON public.customer_mobile_sessions(device_id);
CREATE INDEX idx_customer_orders_customer_id ON public.customer_orders(customer_id);
CREATE INDEX idx_customer_orders_created_at ON public.customer_orders(created_at);
CREATE INDEX idx_customer_transactions_customer_id ON public.customer_transactions(customer_id);

-- เปิดใช้งาน RLS
ALTER TABLE public.customer_mobile_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_transactions ENABLE ROW LEVEL SECURITY;

-- สร้าง RLS policies
CREATE POLICY "Customers can view their own sessions" ON public.customer_mobile_sessions
FOR SELECT USING (customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create their own sessions" ON public.customer_mobile_sessions
FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view their own orders" ON public.customer_orders
FOR SELECT USING (customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create their own orders" ON public.customer_orders
FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view their own transactions" ON public.customer_transactions
FOR SELECT USING (customer_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow all operations for staff on customer data" ON public.customer_mobile_sessions
FOR ALL USING (true);

CREATE POLICY "Allow all operations for staff on customer orders" ON public.customer_orders
FOR ALL USING (true);

CREATE POLICY "Allow all operations for staff on customer transactions" ON public.customer_transactions
FOR ALL USING (true);
