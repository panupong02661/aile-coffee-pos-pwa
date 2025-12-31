-- Add is_favorite column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;