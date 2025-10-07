-- Add robust server-side updates for member points and total_spent
-- 1) Apply updates after an order is created
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

    -- Record point transaction (earn)
    INSERT INTO public.point_transactions (
      member_id,
      points_change,
      transaction_type,
      description,
      order_id
    ) VALUES (
      NEW.member_id,
      points_to_add,
      'earned',
      'แต้มจากการสั่งซื้อ',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it's present and up-to-date
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_after_insert_member_updates'
  ) THEN
    DROP TRIGGER trg_orders_after_insert_member_updates ON public.orders;
  END IF;
END $$;

CREATE TRIGGER trg_orders_after_insert_member_updates
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.apply_member_updates_after_order();


-- 2) Adjust member points when a redeem transaction is recorded
CREATE OR REPLACE FUNCTION public.apply_member_points_redeem()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only handle redeem transactions here
  IF NEW.transaction_type = 'redeem' THEN
    UPDATE public.members
    SET points = GREATEST(0, COALESCE(points, 0) + COALESCE(NEW.points_change, 0))
    WHERE id = NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_point_transactions_after_insert_redeem'
  ) THEN
    DROP TRIGGER trg_point_transactions_after_insert_redeem ON public.point_transactions;
  END IF;
END $$;

CREATE TRIGGER trg_point_transactions_after_insert_redeem
AFTER INSERT ON public.point_transactions
FOR EACH ROW
WHEN (NEW.transaction_type = 'redeem')
EXECUTE FUNCTION public.apply_member_points_redeem();


-- 3) Ensure member tier upgrades are applied when total_spent changes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_members_before_update_tier'
  ) THEN
    DROP TRIGGER trg_members_before_update_tier ON public.members;
  END IF;
END $$;

CREATE TRIGGER trg_members_before_update_tier
BEFORE UPDATE OF total_spent ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.check_member_tier_upgrade();


-- 4) Enable realtime with full row images for members (idempotent)
ALTER TABLE public.members REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
  EXCEPTION WHEN duplicate_object THEN
    -- Already added, ignore
    NULL;
  END;
END $$;