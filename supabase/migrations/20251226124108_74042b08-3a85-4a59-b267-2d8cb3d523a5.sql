-- Drop the existing foreign key constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- Re-create with ON DELETE SET NULL
ALTER TABLE order_items 
ADD CONSTRAINT order_items_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) 
REFERENCES menu_items(id) 
ON DELETE SET NULL;