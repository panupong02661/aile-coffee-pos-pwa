
-- สร้างตาราง customer_profiles สำหรับข้อมูลลูกค้า
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  points INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- สร้างตาราง rewards สำหรับของขวัญ
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- สร้างตาราง customer_rewards สำหรับเก็บของขวัญที่ลูกค้าได้รับ
CREATE TABLE public.customer_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false
);

-- สร้างตาราง coupons สำหรับคูปอง
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percent', 'amount')),
  discount_value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- สร้างตาราง customer_coupons สำหรับเก็บคูปองของลูกค้า
CREATE TABLE public.customer_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  received_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false
);

-- สร้างตาราง online_orders สำหรับออเดอร์ออนไลน์
CREATE TABLE public.online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'online',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- เปิด RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับ customer_profiles
CREATE POLICY "customers_own_profile" ON customer_profiles
  FOR ALL USING (user_id = auth.uid());

-- สร้าง policies สำหรับ customer_rewards
CREATE POLICY "customers_own_rewards" ON customer_rewards
  FOR SELECT USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- สร้าง policies สำหรับ customer_coupons
CREATE POLICY "customers_own_coupons" ON customer_coupons
  FOR SELECT USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- สร้าง policies สำหรับ online_orders
CREATE POLICY "customers_own_orders" ON online_orders
  FOR ALL USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- สร้าง policies สำหรับ rewards (อ่านได้ทุกคน)
CREATE POLICY "rewards_public_read" ON rewards
  FOR SELECT TO authenticated USING (is_active = true);

-- สร้าง policies สำหรับ coupons (อ่านได้ทุกคน)
CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT TO authenticated USING (is_active = true);

-- เพิ่มข้อมูลตัวอย่าง rewards
INSERT INTO rewards (name, description, points_required, image_url) VALUES
('กาแฟฟรี 1 แก้ว', 'รับกาแฟฟรี 1 แก้ว ใดก็ได้', 100, '/placeholder.svg'),
('ส่วนลด 50 บาท', 'ส่วนลด 50 บาท สำหรับการซื้อครั้งถัดไป', 200, '/placeholder.svg'),
('เค้กฟรี 1 ชิ้น', 'รับเค้กฟรี 1 ชิ้น ใดก็ได้', 300, '/placeholder.svg');

-- เพิ่มข้อมูลตัวอย่าง coupons
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit) VALUES
('WELCOME10', 'ส่วนลดสมาชิกใหม่', 'ส่วนลด 10% สำหรับสมาชิกใหม่', 'percent', 10, 100, now(), now() + interval '30 days', 100),
('SAVE50', 'ส่วนลด 50 บาท', 'ส่วนลด 50 บาท เมื่อซื้อครบ 300 บาท', 'amount', 50, 300, now(), now() + interval '7 days', 50);

-- สร้าง trigger สำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_online_orders_updated_at BEFORE UPDATE ON online_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
