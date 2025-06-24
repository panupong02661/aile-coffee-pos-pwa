
-- ล้างสถานะโค้ดทั้งหมดให้กลับเป็นยังไม่ใช้งาน
UPDATE customer_gifts 
SET 
  is_used = false,
  used_at = NULL
WHERE is_used = true OR used_at IS NOT NULL;

-- ตรวจสอบข้อมูลหลังการอัปเดต
SELECT 
  id,
  gift_code,
  gift_name,
  gift_type,
  is_used,
  used_at,
  created_at
FROM customer_gifts 
WHERE gift_code IS NOT NULL
ORDER BY created_at DESC;
