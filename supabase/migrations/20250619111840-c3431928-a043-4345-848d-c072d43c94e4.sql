
-- สร้างตารางเก็บข้อมูลการยกเลิกบิล
CREATE TABLE public.cancelled_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_order_id UUID NOT NULL,
  original_order_number TEXT NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_by TEXT DEFAULT 'system',
  reason TEXT,
  original_total_amount NUMERIC NOT NULL DEFAULT 0,
  original_items_count INTEGER NOT NULL DEFAULT 0,
  original_payment_method TEXT NOT NULL DEFAULT 'cash',
  original_member_id UUID,
  stock_restored BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เพิ่มดัชนีแบบธรรมดา
CREATE INDEX idx_cancelled_orders_datetime ON public.cancelled_orders(cancelled_at);
CREATE INDEX idx_cancelled_orders_original_order ON public.cancelled_orders(original_order_id);

-- สร้าง function สำหรับคืนสต็อกเมื่อยกเลิกบิล
CREATE OR REPLACE FUNCTION public.restore_stock_for_cancelled_order(order_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  order_items_cursor CURSOR FOR 
    SELECT oi.menu_item_id, oi.quantity, oi.menu_item_name
    FROM order_items oi 
    WHERE oi.order_id = order_id_param;
  
  menu_ingredients_cursor CURSOR (menu_item_id_param UUID, quantity_param INTEGER) FOR
    SELECT mi.ingredient_id, mi.quantity_needed * quantity_param as total_needed, i.name as ingredient_name
    FROM menu_ingredients mi
    JOIN ingredients i ON mi.ingredient_id = i.id
    WHERE mi.menu_item_id = menu_item_id_param;
    
  order_item_record RECORD;
  ingredient_record RECORD;
  result_json JSON;
  restored_items JSON[] := '{}';
  temp_json JSON;
BEGIN
  -- วนลูปผ่านรายการในออเดอร์
  FOR order_item_record IN order_items_cursor LOOP
    -- วนลูปผ่านวัตถุดิบของแต่ละเมนู
    FOR ingredient_record IN menu_ingredients_cursor(order_item_record.menu_item_id, order_item_record.quantity) LOOP
      -- คืนสต็อกวัตถุดิบ
      UPDATE ingredients 
      SET quantity = quantity + ingredient_record.total_needed
      WHERE id = ingredient_record.ingredient_id;
      
      -- บันทึกการเคลื่อนไหวสต็อก
      INSERT INTO stock_movements (
        ingredient_id,
        movement_type,
        quantity_change,
        notes,
        created_by,
        order_id
      ) VALUES (
        ingredient_record.ingredient_id,
        'adjustment',
        ingredient_record.total_needed,
        'คืนสต็อกจากการยกเลิกออเดอร์ ' || (SELECT order_number FROM orders WHERE id = order_id_param),
        'system',
        order_id_param::text
      );
      
      -- เก็บข้อมูลที่คืนแล้ว
      temp_json := json_build_object(
        'ingredient_name', ingredient_record.ingredient_name,
        'quantity_restored', ingredient_record.total_needed,
        'menu_item', order_item_record.menu_item_name
      );
      restored_items := array_append(restored_items, temp_json);
    END LOOP;
  END LOOP;
  
  result_json := json_build_object(
    'success', true,
    'restored_items', array_to_json(restored_items),
    'message', 'คืนสต็อกสำเร็จ'
  );
  
  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'เกิดข้อผิดพลาดในการคืนสต็อก'
    );
END;
$$;
