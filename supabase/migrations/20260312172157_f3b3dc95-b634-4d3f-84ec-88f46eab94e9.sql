-- Drop duplicate FK constraints named fk_*_shop_id when another shop_id->shops FK already exists on same table
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT rel.relname AS table_name, c.conname AS constraint_name
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    JOIN unnest(c.conkey) AS ck(attnum) ON true
    JOIN pg_attribute a ON a.attrelid = rel.oid AND a.attnum = ck.attnum
    WHERE n.nspname = 'public'
      AND c.contype = 'f'
      AND a.attname = 'shop_id'
      AND c.conname ~ '^fk_.*_shop_id$'
      AND pg_get_constraintdef(c.oid) ILIKE '%REFERENCES shops%'
      AND EXISTS (
        SELECT 1
        FROM pg_constraint c2
        JOIN unnest(c2.conkey) AS ck2(attnum) ON true
        JOIN pg_attribute a2 ON a2.attrelid = c2.conrelid AND a2.attnum = ck2.attnum
        WHERE c2.conrelid = c.conrelid
          AND c2.contype = 'f'
          AND c2.conname <> c.conname
          AND a2.attname = 'shop_id'
          AND pg_get_constraintdef(c2.oid) ILIKE '%REFERENCES shops%'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', r.table_name, r.constraint_name);
  END LOOP;
END $$;