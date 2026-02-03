-- Add sort_order column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;