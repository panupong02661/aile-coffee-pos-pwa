-- Allow safe toggle of menu availability from client while keeping other fields protected

-- 1) Policy: allow public (anon + authenticated) to perform UPDATE on menu_items
--    We will restrict changes with a trigger so only is_available can be changed by anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'menu_items' 
      AND policyname = 'Anon can toggle menu availability'
  ) THEN
    CREATE POLICY "Anon can toggle menu availability"
    ON public.menu_items
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- 2) Trigger function: block anon updates that modify fields other than is_available
CREATE OR REPLACE FUNCTION public.restrict_menu_item_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always maintain updated_at
  NEW.updated_at := now();

  -- If caller is anon, only allow toggling is_available
  IF auth.role() = 'anon' THEN
    IF (NEW.name               IS DISTINCT FROM OLD.name)
    OR (NEW.price              IS DISTINCT FROM OLD.price)
    OR (NEW.cost_price         IS DISTINCT FROM OLD.cost_price)
    OR (NEW.category_id        IS DISTINCT FROM OLD.category_id)
    OR (NEW.description        IS DISTINCT FROM OLD.description)
    OR (NEW.image_url          IS DISTINCT FROM OLD.image_url)
    OR (NEW.created_at         IS DISTINCT FROM OLD.created_at)
    OR (NEW.id                 IS DISTINCT FROM OLD.id) THEN
      RAISE EXCEPTION 'Permission denied: anon can only update is_available field';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Create trigger if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'restrict_menu_item_update_trg'
  ) THEN
    CREATE TRIGGER restrict_menu_item_update_trg
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.restrict_menu_item_update();
  END IF;
END $$;