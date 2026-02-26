
-- =============================================
-- 1. ENGAGEMENT SETTINGS - ควบคุมเปิด/ปิดฟีเจอร์
-- =============================================
CREATE TABLE public.engagement_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyalty_mode TEXT NOT NULL DEFAULT 'points' CHECK (loyalty_mode IN ('points', 'stamp_card', 'both_separate')),
  stamp_card_enabled BOOLEAN NOT NULL DEFAULT false,
  festival_events_enabled BOOLEAN NOT NULL DEFAULT false,
  spin_wheel_enabled BOOLEAN NOT NULL DEFAULT false,
  advent_calendar_enabled BOOLEAN NOT NULL DEFAULT false,
  gift_box_enabled BOOLEAN NOT NULL DEFAULT false,
  tier_rewards_enabled BOOLEAN NOT NULL DEFAULT false,
  festival_themes_enabled BOOLEAN NOT NULL DEFAULT false,
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on engagement_settings" ON public.engagement_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO public.engagement_settings (loyalty_mode) VALUES ('points');

-- =============================================
-- 2. STAMP CARDS - บัตรสะสมแสตมป์
-- =============================================
CREATE TABLE public.stamp_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_stamps INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  min_purchase_per_stamp NUMERIC NOT NULL DEFAULT 0,
  allow_multiple_cards BOOLEAN NOT NULL DEFAULT true,
  auto_reset_on_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stamp_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on stamp_cards" ON public.stamp_cards FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 3. STAMP CARD MILESTONES - รางวัลตามจำนวนแสตมป์
-- =============================================
CREATE TABLE public.stamp_card_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stamp_card_id UUID NOT NULL REFERENCES public.stamp_cards(id) ON DELETE CASCADE,
  stamp_number INTEGER NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'discount_percent' CHECK (reward_type IN ('discount_percent', 'discount_fixed', 'free_item', 'free_drink', 'bonus_points', 'custom')),
  reward_value NUMERIC NOT NULL DEFAULT 0,
  reward_description TEXT,
  reward_menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stamp_card_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on stamp_card_milestones" ON public.stamp_card_milestones FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 4. CUSTOMER STAMP CARDS - บัตรแสตมป์ของลูกค้า
-- =============================================
CREATE TABLE public.customer_stamp_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  stamp_card_id UUID NOT NULL REFERENCES public.stamp_cards(id) ON DELETE CASCADE,
  current_stamps INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_stamp_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on customer_stamp_cards" ON public.customer_stamp_cards FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 5. CUSTOMER STAMPS - ประวัติแสตมป์แต่ละดวง
-- =============================================
CREATE TABLE public.customer_stamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_stamp_card_id UUID NOT NULL REFERENCES public.customer_stamp_cards(id) ON DELETE CASCADE,
  stamp_number INTEGER NOT NULL,
  order_id UUID,
  order_amount NUMERIC NOT NULL DEFAULT 0,
  stamped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on customer_stamps" ON public.customer_stamps FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 6. FESTIVAL EVENTS - กิจกรรมเทศกาล
-- =============================================
CREATE TABLE public.festival_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'lucky_envelope' CHECK (event_type IN ('lucky_envelope', 'spin_wheel', 'advent_calendar', 'gift_box')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  theme_color TEXT DEFAULT '#FF0000',
  theme_secondary_color TEXT DEFAULT '#FFD700',
  background_image_url TEXT,
  max_claims_per_customer INTEGER DEFAULT 1,
  min_tier TEXT DEFAULT 'silver',
  advent_total_days INTEGER DEFAULT 25,
  gift_box_choices INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.festival_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on festival_events" ON public.festival_events FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 7. FESTIVAL PRIZES - รางวัลในกิจกรรม
-- =============================================
CREATE TABLE public.festival_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  festival_event_id UUID NOT NULL REFERENCES public.festival_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL DEFAULT 'discount_percent' CHECK (prize_type IN ('discount_percent', 'discount_fixed', 'free_item', 'free_drink', 'bonus_points', 'coupon', 'custom', 'no_prize')),
  prize_value NUMERIC NOT NULL DEFAULT 0,
  prize_menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  probability_weight NUMERIC NOT NULL DEFAULT 10,
  total_quantity INTEGER,
  claimed_quantity INTEGER NOT NULL DEFAULT 0,
  min_tier TEXT DEFAULT 'silver',
  advent_day INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.festival_prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on festival_prizes" ON public.festival_prizes FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 8. CUSTOMER PRIZE CLAIMS - รางวัลที่ลูกค้าได้รับ
-- =============================================
CREATE TABLE public.customer_prize_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  festival_event_id UUID NOT NULL REFERENCES public.festival_events(id) ON DELETE CASCADE,
  festival_prize_id UUID NOT NULL REFERENCES public.festival_prizes(id) ON DELETE CASCADE,
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value NUMERIC NOT NULL DEFAULT 0,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  reward_expires_at TIMESTAMP WITH TIME ZONE,
  claim_code TEXT,
  advent_day INTEGER,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_prize_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on customer_prize_claims" ON public.customer_prize_claims FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 9. FESTIVAL THEMES - ธีมเทศกาล
-- =============================================
CREATE TABLE public.festival_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT NOT NULL DEFAULT '#FF0000',
  secondary_color TEXT NOT NULL DEFAULT '#FFD700',
  accent_color TEXT DEFAULT '#FFFFFF',
  background_gradient TEXT,
  icon_set TEXT DEFAULT 'default',
  is_active BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.festival_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on festival_themes" ON public.festival_themes FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_engagement_settings_updated_at BEFORE UPDATE ON public.engagement_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stamp_cards_updated_at BEFORE UPDATE ON public.stamp_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stamp_card_milestones_updated_at BEFORE UPDATE ON public.stamp_card_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_stamp_cards_updated_at BEFORE UPDATE ON public.customer_stamp_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_festival_events_updated_at BEFORE UPDATE ON public.festival_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_festival_prizes_updated_at BEFORE UPDATE ON public.festival_prizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_festival_themes_updated_at BEFORE UPDATE ON public.festival_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
