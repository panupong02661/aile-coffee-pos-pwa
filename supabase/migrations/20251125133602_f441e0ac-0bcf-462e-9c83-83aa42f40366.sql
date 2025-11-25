-- Add WiFi voucher fields to orders table
ALTER TABLE orders 
ADD COLUMN wifi_voucher_id uuid REFERENCES wifi_vouchers(id),
ADD COLUMN wifi_voucher_username text,
ADD COLUMN wifi_voucher_password text;

-- Add index for better performance
CREATE INDEX idx_orders_wifi_voucher_id ON orders(wifi_voucher_id);