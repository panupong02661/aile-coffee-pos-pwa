
-- Backfill shop_id for all tables with NULL shop_id

-- category_addon_groups
UPDATE public.category_addon_groups cag
SET shop_id = COALESCE(
  (SELECT c.shop_id FROM public.categories c WHERE c.id = cag.category_id),
  (SELECT ag.shop_id FROM public.addon_groups ag WHERE ag.id = cag.addon_group_id)
)
WHERE cag.shop_id IS NULL;

-- order_items
UPDATE public.order_items oi
SET shop_id = (SELECT o.shop_id FROM public.orders o WHERE o.id = oi.order_id)
WHERE oi.shop_id IS NULL;

-- order_addons
UPDATE public.order_addons oa
SET shop_id = (SELECT oi.shop_id FROM public.order_items oi WHERE oi.id = oa.order_item_id)
WHERE oa.shop_id IS NULL;

-- menu_ingredients
UPDATE public.menu_ingredients mi
SET shop_id = (SELECT m.shop_id FROM public.menu_items m WHERE m.id = mi.menu_item_id)
WHERE mi.shop_id IS NULL;

-- stock_movements
UPDATE public.stock_movements sm
SET shop_id = (SELECT i.shop_id FROM public.ingredients i WHERE i.id = sm.ingredient_id)
WHERE sm.shop_id IS NULL;

-- cancelled_orders
UPDATE public.cancelled_orders co
SET shop_id = (SELECT o.shop_id FROM public.orders o WHERE o.id = co.original_order_id)
WHERE co.shop_id IS NULL;

-- user_permissions
UPDATE public.user_permissions up
SET shop_id = (SELECT usa.shop_id FROM public.user_shop_assignments usa WHERE usa.user_id = up.user_id AND usa.is_primary = true LIMIT 1)
WHERE up.shop_id IS NULL;

-- festival_prizes
UPDATE public.festival_prizes fp
SET shop_id = (SELECT fe.shop_id FROM public.festival_events fe WHERE fe.id = fp.festival_event_id)
WHERE fp.shop_id IS NULL;

-- customer_prize_claims
UPDATE public.customer_prize_claims cpc
SET shop_id = (SELECT fe.shop_id FROM public.festival_events fe WHERE fe.id = cpc.festival_event_id)
WHERE cpc.shop_id IS NULL;

-- users
UPDATE public.users u
SET shop_id = (SELECT usa.shop_id FROM public.user_shop_assignments usa WHERE usa.user_id = u.id AND usa.is_primary = true LIMIT 1)
WHERE u.shop_id IS NULL;

-- All remaining tables: default to primary shop
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables tbl ON tbl.table_schema = c.table_schema AND tbl.table_name = c.table_name
    WHERE c.table_schema = 'public' AND c.column_name = 'shop_id' AND tbl.table_type = 'BASE TABLE' AND c.table_name != 'shops'
  LOOP
    EXECUTE format('UPDATE public.%I SET shop_id = %L WHERE shop_id IS NULL', t.table_name, 'f365df0c-c026-4a8d-9172-21ab196f584e');
  END LOOP;
END $$;
