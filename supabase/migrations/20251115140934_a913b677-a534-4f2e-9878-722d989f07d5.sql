-- Fix security issues: Add search_path to functions to prevent SQL injection

-- 1. Fix check_member_tier_upgrade function
CREATE OR REPLACE FUNCTION public.check_member_tier_upgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_tier TEXT;
BEGIN
  -- Check for tier upgrade based on total spent
  IF NEW.total_spent >= 15000 THEN
    new_tier := 'platinum';
  ELSIF NEW.total_spent >= 5000 THEN
    new_tier := 'gold';
  ELSE
    new_tier := 'silver';
  END IF;
  
  -- Update tier if it has changed
  IF NEW.tier != new_tier THEN
    NEW.tier := new_tier;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 3. Fix calculate_menu_cost function
CREATE OR REPLACE FUNCTION public.calculate_menu_cost(menu_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_cost NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(mi.quantity_needed * i.cost_per_unit), 0)
  INTO total_cost
  FROM menu_ingredients mi
  JOIN ingredients i ON mi.ingredient_id = i.id
  WHERE mi.menu_item_id = menu_id;
  
  RETURN total_cost;
END;
$function$;

-- 4. Fix get_low_stock_ingredients function
CREATE OR REPLACE FUNCTION public.get_low_stock_ingredients()
RETURNS TABLE(id uuid, name text, category text, quantity numeric, unit text, minimum_stock numeric, shortage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.category,
    i.quantity,
    i.unit,
    i.minimum_stock,
    (i.minimum_stock - i.quantity) as shortage
  FROM ingredients i
  WHERE i.quantity <= i.minimum_stock AND i.is_active = true
  ORDER BY (i.minimum_stock - i.quantity) DESC;
END;
$function$;

-- 5. Fix validate_ingredient_data function
CREATE OR REPLACE FUNCTION public.validate_ingredient_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- ตรวจสอบว่าชื่อวัตถุดิบไม่เป็นค่าว่าง
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'ชื่อวัตถุดิบไม่สามารถเป็นค่าว่างได้';
  END IF;
  
  -- ตรวจสอบค่าตัวเลขที่ต้องไม่เป็นลบ
  IF NEW.quantity < 0 OR NEW.cost_per_unit < 0 OR NEW.minimum_stock < 0 THEN
    RAISE EXCEPTION 'ค่าตัวเลขต้องไม่เป็นค่าลบ';
  END IF;
  
  -- ทำความสะอาดข้อมูล
  NEW.name := trim(NEW.name);
  NEW.supplier := COALESCE(trim(NEW.supplier), '');
  
  -- ตั้งค่าเริ่มต้นสำหรับ sort_order ถ้าไม่มี
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO NEW.sort_order FROM ingredients;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Fix test_order_number_generation function
CREATE OR REPLACE FUNCTION public.test_order_number_generation(test_count integer DEFAULT 10)
RETURNS TABLE(test_num integer, order_number text, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  i INTEGER;
  generated_number TEXT;
  test_success BOOLEAN;
  test_error TEXT;
BEGIN
  FOR i IN 1..test_count LOOP
    BEGIN
      generated_number := generate_order_number();
      test_success := TRUE;
      test_error := NULL;
    EXCEPTION
      WHEN OTHERS THEN
        generated_number := NULL;
        test_success := FALSE;
        test_error := SQLERRM;
    END;
    
    RETURN QUERY SELECT i, generated_number, test_success, test_error;
  END LOOP;
END;
$function$;

-- 7. Fix get_active_promotions function
CREATE OR REPLACE FUNCTION public.get_active_promotions()
RETURNS TABLE(id uuid, name text, description text, discount_type text, discount_value numeric, apply_to text, menu_item_ids uuid[], category_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.discount_type,
    p.discount_value,
    p.apply_to,
    COALESCE(ARRAY_AGG(DISTINCT pmi.menu_item_id) FILTER (WHERE pmi.menu_item_id IS NOT NULL), ARRAY[]::UUID[]) as menu_item_ids,
    COALESCE(ARRAY_AGG(DISTINCT pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), ARRAY[]::UUID[]) as category_ids
  FROM public.promotions p
  LEFT JOIN public.promotion_menu_items pmi ON p.id = pmi.promotion_id
  LEFT JOIN public.promotion_categories pc ON p.id = pc.promotion_id
  WHERE p.is_active = true 
    AND p.start_date <= now() 
    AND p.end_date >= now()
  GROUP BY p.id, p.name, p.description, p.discount_type, p.discount_value, p.apply_to;
END;
$function$;

-- 8. Fix restore_stock_for_cancelled_order function
CREATE OR REPLACE FUNCTION public.restore_stock_for_cancelled_order(order_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;