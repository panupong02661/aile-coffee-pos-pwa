-- Fix transaction_type values to match existing constraint
-- The constraint expects 'earn' not 'earned', and 'spend' not 'redeem'

DROP TRIGGER IF EXISTS trg_orders_after_insert_member_updates ON public.orders;
DROP TRIGGER IF EXISTS trg_point_transactions_after_insert_redeem ON public.point_transactions;
DROP FUNCTION IF EXISTS public.apply_member_updates_after_order();
DROP FUNCTION IF EXISTS public.apply_member_points_redeem();

-- 1) Updated function with correct transaction_type value
CREATE OR REPLACE FUNCTION public.apply_member_updates_after_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_tier TEXT;
  points_multiplier NUMERIC;
  points_to_add INTEGER;
BEGIN
  IF NEW.member_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update member total_spent
  UPDATE public.members
  SET total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.total_amount, 0)
  WHERE id = NEW.member_id;

  -- Determine points multiplier by tier
  SELECT m.tier INTO member_tier
  FROM public.members m
  WHERE m.id = NEW.member_id;

  SELECT ms.points_per_baht INTO points_multiplier
  FROM public.membership_settings ms
  WHERE ms.tier = member_tier
  LIMIT 1;

  IF points_multiplier IS NULL THEN
    points_multiplier := 1;
  END IF;

  -- Calculate and award points
  points_to_add := FLOOR(COALESCE(NEW.total_amount, 0) * points_multiplier);
  IF points_to_add > 0 THEN
    UPDATE public.members
    SET points = COALESCE(points, 0) + points_to_add
    WHERE id = NEW.member_id;

    -- Record point transaction with correct type 'earn'
    INSERT INTO public.point_transactions (
      member_id,
      points_change,
      transaction_type,
      description,
      order_id
    ) VALUES (
      NEW.member_id,
      points_to_add,
      'earn',  -- Changed from 'earned' to 'earn'
      'แต้มจากการสั่งซื้อ',
      NEW.order_number
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_after_insert_member_updates
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.apply_member_updates_after_order();


-- 2) Updated redeem function with correct transaction_type value
CREATE OR REPLACE FUNCTION public.apply_member_points_redeem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle redeem transactions (using 'redeem' as per constraint)
  IF NEW.transaction_type IN ('redeem', 'spend') THEN
    UPDATE public.members
    SET points = GREATEST(0, COALESCE(points, 0) + COALESCE(NEW.points_change, 0))
    WHERE id = NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_point_transactions_after_insert_redeem
AFTER INSERT ON public.point_transactions
FOR EACH ROW
WHEN (NEW.transaction_type IN ('redeem', 'spend'))
EXECUTE FUNCTION public.apply_member_points_redeem();