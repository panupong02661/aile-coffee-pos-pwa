-- Add tax display setting to receipt_settings
ALTER TABLE receipt_settings 
ADD COLUMN IF NOT EXISTS show_tax boolean DEFAULT true;

-- Add WiFi settings to shop_settings
ALTER TABLE shop_settings 
ADD COLUMN IF NOT EXISTS wifi_header_text text,
ADD COLUMN IF NOT EXISTS wifi_footer_text text;

-- Add WiFi voucher display settings to receipt_settings
ALTER TABLE receipt_settings 
ADD COLUMN IF NOT EXISTS show_wifi_voucher boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_wifi_qr boolean DEFAULT true;