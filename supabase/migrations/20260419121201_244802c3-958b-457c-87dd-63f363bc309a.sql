
-- Helper to safely drop and recreate FK with new ON DELETE behavior
DO $$
DECLARE
  r RECORD;
BEGIN
  -- For each table that references public.orders(id), drop existing FK and recreate
  FOR r IN
    SELECT
      tc.table_schema,
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'public'
      AND ccu.table_name = 'orders'
      AND ccu.column_name = 'id'
      AND tc.table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.table_schema, r.table_name, r.constraint_name);

    IF r.table_name = 'order_items' THEN
      EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.orders(id) ON DELETE CASCADE',
        r.table_schema, r.table_name, r.constraint_name, r.column_name
      );
    ELSE
      EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.orders(id) ON DELETE SET NULL',
        r.table_schema, r.table_name, r.constraint_name, r.column_name
      );
    END IF;
  END LOOP;
END $$;
