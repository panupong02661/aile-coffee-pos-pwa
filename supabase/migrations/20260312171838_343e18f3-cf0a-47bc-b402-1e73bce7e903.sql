-- Multi-tenant hardening: ensure business tables have shop_id
-- and auto-populate shop_id from request header x-shop-id when missing.

CREATE OR REPLACE FUNCTION public.current_shop_id_from_header()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shop_id uuid;
BEGIN
  BEGIN
    v_shop_id := NULLIF(
      (current_setting('request.headers', true)::jsonb ->> 'x-shop-id'),
      ''
    )::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_shop_id := NULL;
  END;

  RETURN v_shop_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_shop_id_from_request_header()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shop_id uuid;
BEGIN
  IF NEW.shop_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_shop_id := public.current_shop_id_from_header();
  IF v_shop_id IS NOT NULL THEN
    NEW.shop_id := v_shop_id;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t record;
  v_constraint_name text;
  v_trigger_name text;
BEGIN
  FOR t IN
    SELECT tbl.table_name
    FROM information_schema.tables tbl
    WHERE tbl.table_schema = 'public'
      AND tbl.table_type = 'BASE TABLE'
      AND tbl.table_name <> 'shops'
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = tbl.table_name
          AND c.column_name = 'shop_id'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS shop_id uuid', t.table_name);
  END LOOP;

  FOR t IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables tbl
      ON tbl.table_schema = c.table_schema
     AND tbl.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'shop_id'
      AND tbl.table_type = 'BASE TABLE'
      AND c.table_name <> 'shops'
  LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (shop_id)', 'idx_' || t.table_name || '_shop_id', t.table_name);

    v_constraint_name := 'fk_' || t.table_name || '_shop_id';

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.table_name = t.table_name
        AND tc.constraint_name = v_constraint_name
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (shop_id) REFERENCES public.shops(id) ON DELETE SET NULL',
        t.table_name,
        v_constraint_name
      );
    END IF;

    IF t.table_name NOT IN ('user_shop_assignments', 'users') THEN
      v_trigger_name := 'trg_set_shop_id_' || t.table_name;

      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.triggers tr
        WHERE tr.event_object_schema = 'public'
          AND tr.event_object_table = t.table_name
          AND tr.trigger_name = v_trigger_name
      ) THEN
        EXECUTE format(
          'CREATE TRIGGER %I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_shop_id_from_request_header()',
          v_trigger_name,
          t.table_name
        );
      END IF;
    END IF;
  END LOOP;
END $$;