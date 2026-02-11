
ALTER TABLE public.receipt_settings 
ADD COLUMN show_shop_name boolean NOT NULL DEFAULT true,
ADD COLUMN show_shop_address boolean NOT NULL DEFAULT true,
ADD COLUMN show_shop_phone boolean NOT NULL DEFAULT true;

-- Migrate existing data: if show_shop_info was true, set all three to true
UPDATE public.receipt_settings 
SET show_shop_name = show_shop_info,
    show_shop_address = show_shop_info,
    show_shop_phone = show_shop_info;
