-- ลบ trigger และ function ที่จำกัดการอัพเดท menu_items
DROP TRIGGER IF EXISTS restrict_menu_item_update_trg ON public.menu_items;
DROP FUNCTION IF EXISTS public.restrict_menu_item_update() CASCADE;