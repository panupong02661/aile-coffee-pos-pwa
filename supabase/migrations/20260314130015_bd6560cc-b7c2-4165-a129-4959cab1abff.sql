-- Add VAT and service charge columns to shop_settings
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS vat_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS vat_rate numeric DEFAULT 7,
  ADD COLUMN IF NOT EXISTS vat_included boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS service_charge_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_charge_rate numeric DEFAULT 10;

-- Add area_id and position columns to restaurant_tables for floor plan
ALTER TABLE public.restaurant_tables
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pos_x numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pos_y numeric DEFAULT 0;

-- Add max_discount_percent to user_permissions for discount limits
ALTER TABLE public.user_permissions
  ADD COLUMN IF NOT EXISTS max_discount_percent numeric DEFAULT null;