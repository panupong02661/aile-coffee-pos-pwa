
-- Create shop_settings table for store configuration
CREATE TABLE public.shop_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL DEFAULT 'ร้านกาแฟแสนดี',
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipt_settings table for receipt configuration
CREATE TABLE public.receipt_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_logo BOOLEAN NOT NULL DEFAULT true,
  show_shop_info BOOLEAN NOT NULL DEFAULT true,
  show_tax_id BOOLEAN NOT NULL DEFAULT true,
  show_date_time BOOLEAN NOT NULL DEFAULT true,
  show_order_number BOOLEAN NOT NULL DEFAULT true,
  show_item_details BOOLEAN NOT NULL DEFAULT true,
  show_total BOOLEAN NOT NULL DEFAULT true,
  show_payment_method BOOLEAN NOT NULL DEFAULT true,
  show_customer_info BOOLEAN NOT NULL DEFAULT false,
  footer_message TEXT DEFAULT 'ขอบคุณที่ใช้บริการ',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.shop_settings (shop_name, address, phone, email, tax_id) 
VALUES ('ร้านกาแฟแสนดี', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', '02-123-4567', 'info@cafe.com', '1234567890123');

INSERT INTO public.receipt_settings DEFAULT VALUES;

-- Enable RLS
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on shop_settings" ON public.shop_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on receipt_settings" ON public.receipt_settings FOR ALL USING (true);

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true);

-- Create storage policy for shop logos
CREATE POLICY "Allow public access to shop logos" ON storage.objects FOR ALL USING (bucket_id = 'shop-logos');
