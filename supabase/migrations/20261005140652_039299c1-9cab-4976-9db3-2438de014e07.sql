DROP FUNCTION IF EXISTS public.get_shop_benchmark(timestamp with time zone);

CREATE FUNCTION public.get_shop_benchmark(p_start timestamp with time zone)
RETURNS TABLE(shop_id uuid, shop_name text, branch_name text, total_orders bigint, total_revenue numeric, total_members bigint, total_items bigint, top_items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.authenticated_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  RETURN QUERY
  SELECT
    s.id AS shop_id,
    s.shop_name,
    s.branch_name,
    COALESCE(o.cnt, 0)::bigint AS total_orders,
    COALESCE(o.rev, 0)::numeric AS total_revenue,
    COALESCE(m.cnt, 0)::bigint AS total_members,
    COALESCE(it.qty, 0)::bigint AS total_items,
    COALESCE(ti.items, '[]'::jsonb) AS top_items
  FROM public.shops s
  LEFT JOIN (
    SELECT shop_id, COUNT(*) AS cnt, SUM(total_amount) AS rev
    FROM public.orders
    WHERE created_at >= p_start
    GROUP BY shop_id
  ) o ON o.shop_id = s.id
  LEFT JOIN (
    SELECT shop_id, COUNT(*) AS cnt
    FROM public.members
    GROUP BY shop_id
  ) m ON m.shop_id = s.id
  LEFT JOIN (
    SELECT o2.shop_id, SUM(oi.quantity) AS qty
    FROM public.order_items oi
    JOIN public.orders o2 ON o2.id = oi.order_id
    WHERE o2.created_at >= p_start
    GROUP BY o2.shop_id
  ) it ON it.shop_id = s.id
  LEFT JOIN (
    SELECT shop_id, jsonb_agg(jsonb_build_object('name', name, 'count', cnt) ORDER BY cnt DESC) AS items
    FROM (
      SELECT o3.shop_id, oi2.name, SUM(oi2.quantity) AS cnt
      FROM public.order_items oi2
      JOIN public.orders o3 ON o3.id = oi2.order_id
      WHERE o3.created_at >= p_start
      GROUP BY o3.shop_id, oi2.name
    ) t
    GROUP BY shop_id
  ) ti ON ti.shop_id = s.id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shop_benchmark(timestamp with time zone) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_shop_benchmark(timestamp with time zone) TO authenticated;