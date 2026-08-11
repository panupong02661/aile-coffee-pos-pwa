-- ===========================================================
-- Phase 2 (fix): REVOKE EXECUTE FROM PUBLIC + targeted grants
-- ===========================================================

-- 2A. Trigger-only / owner-called functions: revoke from PUBLIC, no grant back
REVOKE EXECUTE ON FUNCTION public.apply_member_points_redeem() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_member_updates_after_order() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_member_tier_upgrade() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_points_from_order() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_shop_id_from_request_header() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_ingredient_data() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC;

-- 2B. Internal functions called by edge functions / service: service_role only
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.validate_input(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_input(text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.validate_input_secure(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_input_secure(text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.hash_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hash_password(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_shop_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_shop_id(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_and_mark_wifi_voucher(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_and_mark_wifi_voucher(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.test_order_number_generation(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.test_order_number_generation(integer) TO service_role;

-- 2C. Staff/admin functions: authenticated + service_role (anon blocked)
REVOKE EXECUTE ON FUNCTION public.restore_stock_for_cancelled_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_stock_for_cancelled_order(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.toggle_menu_availability(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_menu_availability(uuid, boolean) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.calculate_menu_cost(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_menu_cost(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_active_promotions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_promotions() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_low_stock_ingredients() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_low_stock_ingredients() TO authenticated, service_role;

-- NOTE: current_shop_id_from_header, authenticate_user, claim_limited_reward, claim_limited_promotion
-- remain executable by PUBLIC (anon) — required by RLS policies & customer-facing login/claim flows
