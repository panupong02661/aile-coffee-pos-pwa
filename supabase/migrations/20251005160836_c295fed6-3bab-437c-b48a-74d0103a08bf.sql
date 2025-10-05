
-- อัพเดท function ให้ดึงค่าจาก membership_settings แทนการ hardcode
CREATE OR REPLACE FUNCTION create_points_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    
    -- ดึง points_per_baht จาก membership_settings
    SELECT points_per_baht INTO points_multiplier
    FROM membership_settings
    WHERE tier = member_tier;
    
    -- ถ้าไม่พบ tier ใน settings ให้ใช้ค่า default
    IF points_multiplier IS NULL THEN
      points_multiplier := 1;
    END IF;
    
    -- คำนวณแต้มที่จะได้รับ (1 บาท = points_per_baht แต้ม)
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
      
      -- Log สำหรับ debug
      RAISE LOG 'Created % points for order % (member tier: %, multiplier: %)', 
        points_to_add, NEW.order_number, member_tier, points_multiplier;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ทดสอบว่า function ทำงานได้
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_points_from_order';
