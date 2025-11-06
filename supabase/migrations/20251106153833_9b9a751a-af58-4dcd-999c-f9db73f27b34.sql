-- Create business_settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- General Info
  business_name TEXT,
  business_type TEXT,
  business_description TEXT,
  established_date DATE,
  employee_count INTEGER DEFAULT 0,
  
  -- Legal Documents
  tax_id TEXT,
  business_registration TEXT,
  vat_registration TEXT,
  social_security TEXT,
  registered_address TEXT,
  
  -- Contact Info
  phone TEXT,
  mobile TEXT,
  email TEXT,
  website TEXT,
  contact_address TEXT,
  facebook TEXT,
  line_id TEXT,
  
  -- Advanced Settings
  fiscal_year TEXT,
  currency TEXT DEFAULT 'THB',
  timezone TEXT DEFAULT 'Asia/Bangkok',
  language TEXT DEFAULT 'ไทย',
  business_hours TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view business settings"
  ON public.business_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage business settings"
  ON public.business_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings if not exists
INSERT INTO public.business_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;