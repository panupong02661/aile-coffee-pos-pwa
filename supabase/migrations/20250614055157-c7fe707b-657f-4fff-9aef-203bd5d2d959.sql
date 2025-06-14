
-- เพิ่ม foreign key constraints ที่ขาดหายไป
ALTER TABLE addons 
ADD CONSTRAINT fk_addons_addon_group_id 
FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE SET NULL;

ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE menu_addon_groups 
ADD CONSTRAINT fk_menu_addon_groups_menu_item_id 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE;

ALTER TABLE menu_addon_groups 
ADD CONSTRAINT fk_menu_addon_groups_addon_group_id 
FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE CASCADE;

ALTER TABLE category_addon_groups 
ADD CONSTRAINT fk_category_addon_groups_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

ALTER TABLE category_addon_groups 
ADD CONSTRAINT fk_category_addon_groups_addon_group_id 
FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE CASCADE;

-- เพิ่ม unique constraints เพื่อป้องกันข้อมูลซ้ำ
ALTER TABLE menu_addon_groups 
ADD CONSTRAINT unique_menu_addon_group 
UNIQUE (menu_item_id, addon_group_id);

ALTER TABLE category_addon_groups 
ADD CONSTRAINT unique_category_addon_group 
UNIQUE (category_id, addon_group_id);
