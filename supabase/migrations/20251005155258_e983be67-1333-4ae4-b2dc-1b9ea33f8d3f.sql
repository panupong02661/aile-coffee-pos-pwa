
-- สร้างฟังก์ชันสำหรับคำนวณและสร้างแต้มจากออเดอร์
CREATE OR REPLACE FUNCTION create_points_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_tier TEXT;
  points_multiplier NUMERIC;
  points_to_add INTEGER;
BEGIN
  -- ตรวจสอบว่ามี member_id หรือไม่
  IF NEW.member_id IS NOT NULL THEN
    -- ดึง tier ของสมาชิก
    SELECT tier INTO member_tier
    FROM members
    WHERE id = NEW.member_id;
    
    -- กำหนด multiplier ตาม tier
    CASE member_tier
      WHEN 'bronze' THEN points_multiplier := 1;
      WHEN 'silver' THEN points_multiplier := 1;
      WHEN 'gold' THEN points_multiplier := 1.5;
      WHEN 'platinum' THEN points_multiplier := 2;
      ELSE points_multiplier := 1;
    END CASE;
    
    -- คำนวณแต้มที่จะได้รับ (1 บาท = 1 แต้ม x multiplier)
    points_to_add := FLOOR(NEW.total_amount * points_multiplier);
    
    -- สร้าง point transaction
    IF points_to_add > 0 THEN
      INSERT INTO point_transactions (
        member_id,
        points_change,
        transaction_type,
        description,
        order_id
      ) VALUES (
        NEW.member_id,
        points_to_add,
        'earn',
        'แต้มจากการสั่งซื้อ',
        NEW.order_number
      );
      
      -- อัพเดทแต้มของสมาชิก
      UPDATE members
      SET points = points + points_to_add
      WHERE id = NEW.member_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- สร้าง trigger สำหรับออเดอร์ใหม่
DROP TRIGGER IF EXISTS trigger_create_points_on_order ON orders;
CREATE TRIGGER trigger_create_points_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_points_from_order();

-- สร้างแต้มให้กับออเดอร์เดือนตุลาคม 2025 ที่ยังไม่มีแต้ม
DO $$
DECLARE
  order_record RECORD;
  member_tier TEXT;
  points_multiplier NUMERIC;
  points_to_add INTEGER;
BEGIN
  -- วนลูปออเดอร์ที่มี member_id และยังไม่มี point_transactions
  FOR order_record IN 
    SELECT DISTINCT o.id, o.member_id, o.total_amount, o.order_number, o.created_at
    FROM orders o
    WHERE o.member_id IS NOT NULL
      AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND NOT EXISTS (
        SELECT 1 FROM point_transactions pt 
        WHERE pt.order_id = o.order_number
      )
  LOOP
    -- ดึง tier ของสมาชิก
    SELECT tier INTO member_tier
    FROM members
    WHERE id = order_record.member_id;
    
    -- กำหนด multiplier ตาม tier
    CASE member_tier
      WHEN 'bronze' THEN points_multiplier := 1;
      WHEN 'silver' THEN points_multiplier := 1;
      WHEN 'gold' THEN points_multiplier := 1.5;
      WHEN 'platinum' THEN points_multiplier := 2;
      ELSE points_multiplier := 1;
    END CASE;
    
    -- คำนวณแต้มที่จะได้รับ
    points_to_add := FLOOR(order_record.total_amount * points_multiplier);
    
    -- สร้าง point transaction
    IF points_to_add > 0 THEN
      INSERT INTO point_transactions (
        member_id,
        points_change,
        transaction_type,
        description,
        order_id,
        created_at
      ) VALUES (
        order_record.member_id,
        points_to_add,
        'earn',
        'แต้มจากการสั่งซื้อ (ปรับปรุงย้อนหลัง)',
        order_record.order_number,
        order_record.created_at
      );
      
      -- อัพเดทแต้มของสมาชิก
      UPDATE members
      SET points = points + points_to_add
      WHERE id = order_record.member_id;
      
      RAISE NOTICE 'Created % points for order % (member: %)', points_to_add, order_record.order_number, order_record.member_id;
    END IF;
  END LOOP;
END $$;
