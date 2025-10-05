-- Ensure points are created via trigger on orders inserts
-- Attach trigger to orders table to call create_points_from_order()
DROP TRIGGER IF EXISTS trg_create_points_from_order ON public.orders;
CREATE TRIGGER trg_create_points_from_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_points_from_order();

-- Optional: ensure realtime picks up full row data (safe no-op if already configured)
-- Not strictly required by Supabase, but harmless
ALTER TABLE public.orders REPLICA IDENTITY FULL;