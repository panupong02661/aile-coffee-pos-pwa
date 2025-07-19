
-- เพิ่มโปรโมชั่นพิเศษ 2 รายการที่ต้องแสดงในหน้าลูกค้า
INSERT INTO public.limited_promotions (
  title, 
  description, 
  discount_type, 
  discount_value, 
  max_claims, 
  current_claims, 
  start_date, 
  end_date, 
  min_purchase, 
  is_active, 
  promo_code
) VALUES 
(
  'Flash Sale 50% Off!',
  'ลดราคา 50% สำหรับเมนูเครื่องดื่มทุกแก้ว',
  'percentage',
  50,
  100,
  0,
  NOW(),
  NOW() + INTERVAL '30 days',
  0,
  true,
  'FLASH50'
),
(
  'ส่วนลด 30 บาท ทันที!',
  'ส่วนลด 30 บาท เมื่อสั่งซื้อครบ 200 บาท',
  'amount',
  30,
  50,
  0,
  NOW(),
  NOW() + INTERVAL '7 days',
  200,
  true,
  'SAVE30'
);
