
-- Reset all gift codes to unused status
UPDATE customer_gifts 
SET 
  is_used = false,
  used_at = NULL
WHERE is_used = true;
