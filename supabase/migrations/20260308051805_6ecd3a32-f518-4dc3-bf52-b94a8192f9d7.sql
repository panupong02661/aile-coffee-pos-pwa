
ALTER TABLE public.receipt_settings 
ADD COLUMN IF NOT EXISTS show_queue_number boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_queue_qr boolean DEFAULT true;
