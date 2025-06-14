
-- เพิ่มหมวดหมู่เครื่องดื่ม
INSERT INTO categories (name, description, sort_order, is_active) VALUES
('เครื่องดื่มร้อน', 'เครื่องดื่มร้อนทุกประเภท', 1, true),
('เครื่องดื่มเย็น', 'เครื่องดื่มเย็นทุกประเภท', 2, true),
('กาแฟ', 'กาแฟทุกประเภท', 3, true),
('ชา', 'ชาทุกประเภท', 4, true),
('นม', 'เครื่องดื่มจากนม', 5, true),
('โซดา', 'เครื่องดื่มโซดา', 6, true);

-- เพิ่มเมนูเครื่องดื่มกาแฟร้อน
INSERT INTO menu_items (name, description, price, cost_price, category_id, is_available)
SELECT 
  'เอสเพรสโซ่', 'กาแฟเอสเพรสโซ่แท้ๆ', 45, 20, id, true
FROM categories WHERE name = 'กาแฟ'
UNION ALL
SELECT 
  'อเมริกาโน่', 'กาแฟอเมริกาโน่หอมกรุ่น', 50, 25, id, true
FROM categories WHERE name = 'กาแฟ'
UNION ALL
SELECT 
  'คาปูชิโน่', 'กาแฟคาปูชิโน่หอมนุ่ม', 65, 30, id, true
FROM categories WHERE name = 'กาแฟ'
UNION ALL
SELECT 
  'ลาเต้', 'กาแฟลาเต้นุ่มนวล', 65, 30, id, true
FROM categories WHERE name = 'กาแฟ'
UNION ALL
SELECT 
  'มอคค่า', 'กาแฟมอคค่าหวานหอม', 70, 35, id, true
FROM categories WHERE name = 'กาแฟ'
UNION ALL
SELECT 
  'ไอซ์อเมริกาโน่', 'กาแฟอเมริกาโน่เย็น', 55, 25, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'ไอซ์ลาเต้', 'กาแฟลาเต้เย็น', 70, 30, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'ไอซ์มอคค่า', 'กาแฟมอคค่าเย็น', 75, 35, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'ฟราปเป้', 'กาแฟปั่นเย็น', 85, 40, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น';

-- เพิ่มเมนูชา
INSERT INTO menu_items (name, description, price, cost_price, category_id, is_available)
SELECT 
  'ชาไทยร้อน', 'ชาไทยหอมหวานร้อน', 40, 20, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาไทยเย็น', 'ชาไทยหอมหวานเย็น', 45, 20, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาเขียวร้อน', 'ชาเขียวแท้ร้อน', 35, 15, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาเขียวเย็น', 'ชาเขียวแท้เย็น', 40, 15, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาอูหลงร้อน', 'ชาอูหลงหอมกรุ่นร้อน', 45, 20, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาอูหลงเย็น', 'ชาอูหลงหอมกรุ่นเย็น', 50, 20, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาน้ำผึ้งมะนาวร้อน', 'ชาน้ำผึ้งมะนาวร้อน', 50, 25, id, true
FROM categories WHERE name = 'ชา'
UNION ALL
SELECT 
  'ชาน้ำผึ้งมะนาวเย็น', 'ชาน้ำผึ้งมะนาวเย็น', 55, 25, id, true
FROM categories WHERE name = 'ชา';

-- เพิ่มเมนูนม
INSERT INTO menu_items (name, description, price, cost_price, category_id, is_available)
SELECT 
  'นมสดร้อน', 'นมสดหอมหวานร้อน', 35, 15, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'นมสดเย็น', 'นมสดหอมหวานเย็น', 40, 15, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'นมชมพูร้อน', 'นมชมพูหวานหอมร้อน', 40, 20, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'นมชมพูเย็น', 'นมชมพูหวานหอมเย็น', 45, 20, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'นมเขียวร้อน', 'นมเขียวหอมหวานร้อน', 40, 20, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'นมเขียวเย็น', 'นมเขียวหอมหวานเย็น', 45, 20, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'ฮอตช็อกโกแลต', 'ช็อกโกแลตร้อนหอมหวาน', 55, 25, id, true
FROM categories WHERE name = 'นม'
UNION ALL
SELECT 
  'ไอซ์ช็อกโกแลต', 'ช็อกโกแลตเย็นหอมหวาน', 60, 25, id, true
FROM categories WHERE name = 'นม';

-- เพิ่มเมนูโซดา
INSERT INTO menu_items (name, description, price, cost_price, category_id, is_available)
SELECT 
  'โซดาน้ำผึ้งมะนาว', 'โซดาน้ำผึ้งมะนาวสดชื่น', 50, 25, id, true
FROM categories WHERE name = 'โซดา'
UNION ALL
SELECT 
  'โซดามะนาว', 'โซดามะนาวสดชื่น', 45, 20, id, true
FROM categories WHERE name = 'โซดา'
UNION ALL
SELECT 
  'โซดาส้ม', 'โซดาส้มสดชื่น', 45, 20, id, true
FROM categories WHERE name = 'โซดา'
UNION ALL
SELECT 
  'โซดาสตรอเบอร์รี่', 'โซดาสตรอเบอร์รี่หวานซ่า', 55, 25, id, true
FROM categories WHERE name = 'โซดา'
UNION ALL
SELECT 
  'โซดาขิง', 'โซดาขิงเผ็ดร้อน', 50, 25, id, true
FROM categories WHERE name = 'โซดา'
UNION ALL
SELECT 
  'โซดาบลูฮาวาย', 'โซดาบลูฮาวายสีสวย', 55, 25, id, true
FROM categories WHERE name = 'โซดา';

-- เพิ่มเครื่องดื่มเย็นอื่นๆ
INSERT INTO menu_items (name, description, price, cost_price, category_id, is_available)
SELECT 
  'น้ำส้มสด', 'น้ำส้มคั้นสด', 45, 20, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'น้ำมะนาวสด', 'น้ำมะนาวคั้นสด', 40, 18, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'น้ำแอปเปิ้ลสด', 'น้ำแอปเปิ้ลคั้นสด', 50, 25, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น'
UNION ALL
SELECT 
  'น้ำเปล่า', 'น้ำดื่มบริสุทธิ์', 15, 5, id, true
FROM categories WHERE name = 'เครื่องดื่มเย็น';
