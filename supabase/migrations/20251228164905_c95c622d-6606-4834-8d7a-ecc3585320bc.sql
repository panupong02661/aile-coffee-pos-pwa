-- Add min_purchase column to promotions table
ALTER TABLE public.promotions 
ADD COLUMN IF NOT EXISTS min_purchase numeric DEFAULT 0;