
-- Create members table for member information
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'silver' CHECK (tier IN ('silver', 'gold', 'platinum')),
  points INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create membership_settings table for tier configuration
CREATE TABLE public.membership_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('silver', 'gold', 'platinum')),
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  points_per_baht NUMERIC NOT NULL DEFAULT 1,
  points_to_redeem INTEGER NOT NULL DEFAULT 100,
  redeem_value NUMERIC NOT NULL DEFAULT 10,
  minimum_spend_for_upgrade NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create point_transactions table for tracking point history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'adjust', 'expire')),
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default membership settings
INSERT INTO public.membership_settings (tier, discount_percentage, points_per_baht, points_to_redeem, redeem_value, minimum_spend_for_upgrade)
VALUES 
  ('silver', 5, 1, 100, 10, 0),
  ('gold', 10, 1.5, 80, 10, 5000),
  ('platinum', 15, 2, 60, 10, 15000);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on members" ON public.members FOR ALL USING (true);
CREATE POLICY "Allow all operations on membership_settings" ON public.membership_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on point_transactions" ON public.point_transactions FOR ALL USING (true);

-- Create function to automatically upgrade member tier
CREATE OR REPLACE FUNCTION public.check_member_tier_upgrade()
RETURNS TRIGGER AS $$
DECLARE
  new_tier TEXT;
BEGIN
  -- Check for tier upgrade based on total spent
  IF NEW.total_spent >= 15000 THEN
    new_tier := 'platinum';
  ELSIF NEW.total_spent >= 5000 THEN
    new_tier := 'gold';
  ELSE
    new_tier := 'silver';
  END IF;
  
  -- Update tier if it has changed
  IF NEW.tier != new_tier THEN
    NEW.tier := new_tier;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier upgrade
CREATE TRIGGER member_tier_upgrade_trigger
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_member_tier_upgrade();
