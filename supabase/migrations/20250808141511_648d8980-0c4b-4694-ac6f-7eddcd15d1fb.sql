
-- Add missing columns to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'service';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
