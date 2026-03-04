
-- Assign existing data to Aile Coffee
UPDATE public.cancelled_orders SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.stock_movements SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.point_transactions SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.staff SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.shifts SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.time_attendance SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.shop_settings SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.receipt_settings SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.notification_settings SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.online_orders SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.reviews SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.expense_categories SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.suppliers SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
