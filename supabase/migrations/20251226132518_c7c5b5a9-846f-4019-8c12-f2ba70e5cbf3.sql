-- Drop existing constraint on customer_gifts
ALTER TABLE customer_gifts DROP CONSTRAINT IF EXISTS fk_customer_gifts_menu_item;

-- Re-create with ON DELETE CASCADE (gifts should be deleted when menu item is deleted)
ALTER TABLE customer_gifts
ADD CONSTRAINT fk_customer_gifts_menu_item
FOREIGN KEY (gift_id)
REFERENCES menu_items(id)
ON DELETE CASCADE;

-- Also fix bulk_discounts constraint
ALTER TABLE bulk_discounts DROP CONSTRAINT IF EXISTS bulk_discounts_menu_item_id_fkey;
ALTER TABLE bulk_discounts
ADD CONSTRAINT bulk_discounts_menu_item_id_fkey
FOREIGN KEY (menu_item_id)
REFERENCES menu_items(id)
ON DELETE CASCADE;

-- Also fix product_reservations constraint
ALTER TABLE product_reservations DROP CONSTRAINT IF EXISTS product_reservations_menu_item_id_fkey;
ALTER TABLE product_reservations
ADD CONSTRAINT product_reservations_menu_item_id_fkey
FOREIGN KEY (menu_item_id)
REFERENCES menu_items(id)
ON DELETE SET NULL;