-- Add min_purchase column to limited_rewards table
ALTER TABLE public.limited_rewards 
ADD COLUMN IF NOT EXISTS min_purchase NUMERIC DEFAULT 0;

-- Add comment to the column
COMMENT ON COLUMN public.limited_rewards.min_purchase IS 'Minimum purchase amount required to claim this reward';