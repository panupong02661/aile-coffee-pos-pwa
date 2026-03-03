
-- Assign all existing data with NULL shop_id to Aile Coffee (f365df0c-c026-4a8d-9172-21ab196f584e)

UPDATE public.orders SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.menu_items SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.categories SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.members SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.ingredients SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.addons SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.addon_groups SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.promotions SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.coupons SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
UPDATE public.expenses SET shop_id = 'f365df0c-c026-4a8d-9172-21ab196f584e' WHERE shop_id IS NULL;
