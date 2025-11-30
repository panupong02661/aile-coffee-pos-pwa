-- Add is_active column to addon_groups table
ALTER TABLE public.addon_groups 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;