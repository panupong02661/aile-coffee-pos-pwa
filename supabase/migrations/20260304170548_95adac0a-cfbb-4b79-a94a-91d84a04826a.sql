
-- Add shop_id to critical tables missing it
ALTER TABLE public.cancelled_orders ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.time_attendance ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.shop_settings ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.receipt_settings ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.online_orders ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.expense_categories ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.shops(id);
