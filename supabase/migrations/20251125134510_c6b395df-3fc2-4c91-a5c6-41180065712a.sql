-- Create function to get and mark WiFi voucher as used atomically
CREATE OR REPLACE FUNCTION get_and_mark_wifi_voucher(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  password text,
  qr_code_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voucher_id uuid;
BEGIN
  -- Select and lock the first unused voucher
  SELECT wifi_vouchers.id INTO v_voucher_id
  FROM wifi_vouchers
  WHERE is_used = false
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED; -- Skip if another transaction is locking it
  
  -- If no voucher found, return empty
  IF v_voucher_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Mark as used
  UPDATE wifi_vouchers
  SET 
    is_used = true,
    used_at = now()
  WHERE wifi_vouchers.id = v_voucher_id;
  
  -- Return the voucher data
  RETURN QUERY
  SELECT 
    wifi_vouchers.id,
    wifi_vouchers.username,
    wifi_vouchers.password,
    wifi_vouchers.qr_code_url
  FROM wifi_vouchers
  WHERE wifi_vouchers.id = v_voucher_id;
END;
$$;