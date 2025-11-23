-- Create wifi_vouchers table
CREATE TABLE IF NOT EXISTS public.wifi_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  qr_code_url TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.wifi_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wifi vouchers"
  ON public.wifi_vouchers
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage wifi vouchers"
  ON public.wifi_vouchers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add index for faster queries
CREATE INDEX idx_wifi_vouchers_is_used ON public.wifi_vouchers(is_used);

-- Add trigger for updated_at
CREATE TRIGGER update_wifi_vouchers_updated_at
  BEFORE UPDATE ON public.wifi_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();