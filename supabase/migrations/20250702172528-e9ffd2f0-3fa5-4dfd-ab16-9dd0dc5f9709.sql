
-- Create table for limited-time rewards/coupons
CREATE TABLE public.limited_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL DEFAULT 'discount', -- 'discount', 'voucher', 'item'
  discount_value NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'percent', -- 'percent', 'amount'
  reward_code TEXT,
  max_claims INTEGER NOT NULL DEFAULT 1,
  current_claims INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_month INTEGER, -- 1-12 for birthday month targeting
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table to track who claimed limited rewards
CREATE TABLE public.limited_reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  limited_reward_id UUID REFERENCES public.limited_rewards(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(limited_reward_id, customer_id)
);

-- Enable RLS
ALTER TABLE public.limited_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_reward_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for limited_rewards (visible to all authenticated users)
CREATE POLICY "Anyone can view active limited rewards" ON public.limited_rewards
  FOR SELECT USING (is_active = true AND start_date <= now() AND end_date >= now());

-- RLS policies for limited_reward_claims (users can only see their own claims)
CREATE POLICY "Users can view their own claims" ON public.limited_reward_claims
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create their own claims" ON public.limited_reward_claims
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Function to claim limited reward
CREATE OR REPLACE FUNCTION public.claim_limited_reward(
  reward_id UUID,
  user_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reward_record public.limited_rewards;
  result JSON;
BEGIN
  -- Get reward details with row lock
  SELECT * INTO reward_record 
  FROM public.limited_rewards 
  WHERE id = reward_id 
  AND is_active = true 
  AND start_date <= now() 
  AND end_date >= now()
  FOR UPDATE;
  
  -- Check if reward exists and is available
  IF NOT FOUND THEN
    RETURN '{"success": false, "message": "รางวัลไม่พร้อมใช้งาน"}';
  END IF;
  
  -- Check if user already claimed
  IF EXISTS (SELECT 1 FROM public.limited_reward_claims WHERE limited_reward_id = reward_id AND customer_id = user_id) THEN
    RETURN '{"success": false, "message": "คุณได้รับรางวัลนี้แล้ว"}';
  END IF;
  
  -- Check if reward is full
  IF reward_record.current_claims >= reward_record.max_claims THEN
    RETURN '{"success": false, "message": "รางวัลหมดแล้ว"}';
  END IF;
  
  -- Claim the reward
  INSERT INTO public.limited_reward_claims (limited_reward_id, customer_id)
  VALUES (reward_id, user_id);
  
  -- Update claim count
  UPDATE public.limited_rewards 
  SET current_claims = current_claims + 1,
      updated_at = now()
  WHERE id = reward_id;
  
  RETURN '{"success": true, "message": "รับรางวัลสำเร็จ"}';
END;
$$;
