-- Create a secure RPC to toggle menu availability reliably
CREATE OR REPLACE FUNCTION public.toggle_menu_availability(menu_item_id uuid, new_status boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.menu_items
  SET is_available = new_status,
      updated_at = now()
  WHERE id = menu_item_id;

  RETURN FOUND; -- true if a row was updated
END;
$$;

-- Allow everyone to execute the function (will still run as definer)
GRANT EXECUTE ON FUNCTION public.toggle_menu_availability(uuid, boolean) TO public;