-- ===========================================================
-- Phase 2: Lock down SECURITY DEFINER functions
-- ===========================================================

-- 2.1 Fix search_path for functions lacking it
ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.claim_limited_promotion(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.claim_limited_reward(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.validate_input(text, text) SET search_path TO 'public';

-- 2.2 Revoke EXECUTE from anon AND authenticated for internal/trigger functions
-- (service_role bypasses regardless; triggers run as owner)
REVOKE EXECUTE ON FUNCTION public.apply_member_points_redeem() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_member_updates_after_order() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_member_tier_upgrade() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_points_from_order() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_shop_id_from_request_header() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_ingredient_data() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_input(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_input_secure(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hash_password(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_shop_id(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_and_mark_wifi_voucher(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.test_order_number_generation(integer) FROM anon, authenticated;

-- 2.3 Revoke EXECUTE from anon only (keep authenticated) for staff/admin functions
REVOKE EXECUTE ON FUNCTION public.restore_stock_for_cancelled_order(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.toggle_menu_availability(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_menu_cost(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_active_promotions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_low_stock_ingredients() FROM anon;

-- NOTE: current_shop_id_from_header, authenticate_user, claim_limited_reward, claim_limited_promotion
-- remain executable by anon/authenticated (required by RLS policies & customer-facing flows)
