-- 1) ลบ cancelled_orders ที่ซ้ำ เก็บแค่รายการแรกสุด (cancelled_at เก่าสุด) ต่อ original_order_id
DELETE FROM public.cancelled_orders a
USING public.cancelled_orders b
WHERE a.original_order_id = b.original_order_id
  AND a.cancelled_at > b.cancelled_at;

-- กรณีที่ cancelled_at เท่ากันเป๊ะ ให้ใช้ id เป็นตัวตัดสิน
DELETE FROM public.cancelled_orders a
USING public.cancelled_orders b
WHERE a.original_order_id = b.original_order_id
  AND a.cancelled_at = b.cancelled_at
  AND a.id > b.id;

-- 2) เพิ่ม unique constraint เพื่อป้องกันการบันทึกซ้ำในอนาคต
ALTER TABLE public.cancelled_orders
  ADD CONSTRAINT cancelled_orders_original_order_id_unique UNIQUE (original_order_id);