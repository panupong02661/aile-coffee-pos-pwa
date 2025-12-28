-- Update the promotion start_date to now so it starts immediately
UPDATE public.promotions 
SET start_date = now() 
WHERE id = '47195bad-7ba9-4263-9b17-44fa930cf2d0';

-- Add SELECT policy for promotions table to allow reading all active promotions
CREATE POLICY "Allow select promotions"
ON public.promotions
FOR SELECT
USING (true);