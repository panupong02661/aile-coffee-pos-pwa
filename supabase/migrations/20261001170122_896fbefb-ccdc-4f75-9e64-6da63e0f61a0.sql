CREATE OR REPLACE FUNCTION public.get_shop_benchmark(p_start timestamptz)
RETURNS TABLE(shop_id uuid, total_orders bigint, total_revenue numeric, total_members bigint, top_items jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.authenticated_user_role() IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  RETURN QUERY
  SELECT s.id,
    (SELECT count(*) FROM orders o WHERE o.shop_id = s.id AND o.created_at >= p_start),
    (SELECT COALESCE(sum(o.total_amount),0) FROM orders o WHERE o.shop_id = s.id AND o.created_at >= p_start),
    (SELECT count(*) FROM members m WHERE m.shop_id = s.id),
    COALESCE((SELECT jsonb_agg(jsonb_build_object('name', t.name, 'count', t.cnt) ORDER BY t.cnt DESC)
      FROM (SELECT oi.menu_item_name AS name, sum(COALESCE(oi.quantity,1)) AS cnt
            FROM order_items oi JOIN orders o ON o.id = oi.order_id
            WHERE o.shop_id = s.id AND o.created_at >= p_start
            GROUP BY oi.menu_item_name ORDER BY cnt DESC LIMIT 5) t), '[]'::jsonb)
  FROM shops s WHERE s.is_active = true;
END $$;
REVOKE ALL ON FUNCTION public.get_shop_benchmark(timestamptz) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_shop_benchmark(timestamptz) TO authenticated;