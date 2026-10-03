DROP FUNCTION IF EXISTS public.get_shop_benchmark(timestamptz);

DO $$ BEGIN
  CREATE TYPE public.shop_benchmark_row AS (
    shop_id uuid, shop_name text, branch_name text,
    total_orders bigint, total_revenue numeric, total_members bigint, top_items jsonb
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.get_shop_benchmark(p_start timestamptz)
RETURNS SETOF public.shop_benchmark_row
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.authenticated_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  RETURN QUERY
  SELECT s.id, s.shop_name::text, s.branch_name::text,
    (SELECT count(*) FROM orders o WHERE o.shop_id = s.id AND o.created_at >= p_start),
    (SELECT COALESCE(sum(o.total_amount),0)::numeric FROM orders o WHERE o.shop_id = s.id AND o.created_at >= p_start),
    (SELECT count(*) FROM members m WHERE m.shop_id = s.id),
    COALESCE((SELECT jsonb_agg(jsonb_build_object('name', t.name, 'count', t.cnt) ORDER BY t.cnt DESC)
      FROM (SELECT oi.menu_item_name AS name, sum(COALESCE(oi.quantity,1)) AS cnt
            FROM order_items oi JOIN orders o ON o.id = oi.order_id
            WHERE o.shop_id = s.id AND o.created_at >= p_start
            GROUP BY oi.menu_item_name ORDER BY cnt DESC LIMIT 5) t), '[]'::jsonb)
  FROM shops s WHERE s.is_active = true;
END $function$;

-- Compatibility overload: older app versions auto-attach shop_id to RPC calls; ignore it.
CREATE OR REPLACE FUNCTION public.get_shop_benchmark(p_start timestamptz, shop_id uuid)
RETURNS SETOF public.shop_benchmark_row
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT * FROM public.get_shop_benchmark(p_start) $$;

REVOKE ALL ON FUNCTION public.get_shop_benchmark(timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_shop_benchmark(timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_shop_benchmark(timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shop_benchmark(timestamptz, uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';