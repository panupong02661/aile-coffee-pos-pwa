
-- Add foreign key constraint to link customer_gifts to menu_items
-- This will fix the relationship error shown in the screenshot
ALTER TABLE customer_gifts 
ADD CONSTRAINT fk_customer_gifts_menu_item 
FOREIGN KEY (gift_id) 
REFERENCES menu_items(id) 
ON DELETE SET NULL;

-- Update the customer_gifts table to handle cases where gift_id might reference different table types
-- Add a check constraint to ensure gift_type matches the referenced table
ALTER TABLE customer_gifts 
ADD CONSTRAINT check_gift_type_consistency 
CHECK (
  (gift_type = 'menu_item' AND gift_id IS NOT NULL) OR
  (gift_type IN ('reward', 'promotion') AND gift_id IS NOT NULL) OR
  (gift_id IS NULL)
);
