
-- Secure customer_promotion_claims, customer_rewards, customer_stamp_cards, customer_stamps
-- Restrict access to the current shop (via x-shop-id header) instead of public

-- customer_promotion_claims
DROP POLICY IF EXISTS "Anyone can view promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Anyone can insert promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Anyone can update promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Anyone can delete promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Public can view promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Public can manage promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "shop_scoped_select" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "shop_scoped_insert" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "shop_scoped_update" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "shop_scoped_delete" ON public.customer_promotion_claims;

ALTER TABLE public.customer_promotion_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_scoped_select" ON public.customer_promotion_claims
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_insert" ON public.customer_promotion_claims
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_update" ON public.customer_promotion_claims
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_delete" ON public.customer_promotion_claims
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- customer_rewards
DROP POLICY IF EXISTS "Anyone can view customer rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Anyone can manage customer rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Public can view customer rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Public can manage customer rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "shop_scoped_select" ON public.customer_rewards;
DROP POLICY IF EXISTS "shop_scoped_insert" ON public.customer_rewards;
DROP POLICY IF EXISTS "shop_scoped_update" ON public.customer_rewards;
DROP POLICY IF EXISTS "shop_scoped_delete" ON public.customer_rewards;

ALTER TABLE public.customer_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_scoped_select" ON public.customer_rewards
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_insert" ON public.customer_rewards
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_update" ON public.customer_rewards
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_delete" ON public.customer_rewards
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- customer_stamp_cards
DROP POLICY IF EXISTS "Anyone can manage stamp cards" ON public.customer_stamp_cards;
DROP POLICY IF EXISTS "Public can manage stamp cards" ON public.customer_stamp_cards;
DROP POLICY IF EXISTS "shop_scoped_select" ON public.customer_stamp_cards;
DROP POLICY IF EXISTS "shop_scoped_insert" ON public.customer_stamp_cards;
DROP POLICY IF EXISTS "shop_scoped_update" ON public.customer_stamp_cards;
DROP POLICY IF EXISTS "shop_scoped_delete" ON public.customer_stamp_cards;

ALTER TABLE public.customer_stamp_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_scoped_select" ON public.customer_stamp_cards
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_insert" ON public.customer_stamp_cards
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_update" ON public.customer_stamp_cards
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_delete" ON public.customer_stamp_cards
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());

-- customer_stamps
DROP POLICY IF EXISTS "Anyone can manage stamps" ON public.customer_stamps;
DROP POLICY IF EXISTS "Public can manage stamps" ON public.customer_stamps;
DROP POLICY IF EXISTS "shop_scoped_select" ON public.customer_stamps;
DROP POLICY IF EXISTS "shop_scoped_insert" ON public.customer_stamps;
DROP POLICY IF EXISTS "shop_scoped_update" ON public.customer_stamps;
DROP POLICY IF EXISTS "shop_scoped_delete" ON public.customer_stamps;

ALTER TABLE public.customer_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_scoped_select" ON public.customer_stamps
  FOR SELECT USING (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_insert" ON public.customer_stamps
  FOR INSERT WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_update" ON public.customer_stamps
  FOR UPDATE USING (shop_id = public.current_shop_id_from_header())
  WITH CHECK (shop_id = public.current_shop_id_from_header());
CREATE POLICY "shop_scoped_delete" ON public.customer_stamps
  FOR DELETE USING (shop_id = public.current_shop_id_from_header());
