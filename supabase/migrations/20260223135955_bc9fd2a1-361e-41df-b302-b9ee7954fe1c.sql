
-- Drop old staff_permissions if exists
DROP TABLE IF EXISTS staff_permissions;

-- Create user_permissions table linked to users
CREATE TABLE public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  is_granted boolean NOT NULL DEFAULT true,
  granted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- Add full_name column to users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;
-- Add is_active column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Public access policies (matching existing pattern for POS system)
CREATE POLICY "Allow all operations on user_permissions"
ON public.user_permissions
FOR ALL
USING (true)
WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_permissions_updated_at();
