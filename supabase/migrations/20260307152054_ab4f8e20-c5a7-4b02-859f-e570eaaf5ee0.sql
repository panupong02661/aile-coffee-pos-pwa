CREATE TABLE IF NOT EXISTS public.table_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  table_number text NOT NULL,
  cart_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  bill_discount numeric NOT NULL DEFAULT 0,
  bill_discount_type text NOT NULL DEFAULT 'amount',
  status text NOT NULL DEFAULT 'active',
  member_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.table_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_orders_auth_all" ON public.table_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "table_orders_anon_all" ON public.table_orders FOR ALL TO anon USING (true) WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.table_orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TRIGGER update_table_orders_updated_at BEFORE UPDATE ON public.table_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();