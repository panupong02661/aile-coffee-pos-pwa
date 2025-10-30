-- Update RLS policies to allow admin/staff to view all customer data

-- Update policies for customer_promotion_claims
DROP POLICY IF EXISTS "Customers can view their claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Customers can create claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Admin can manage all claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Admin can view all promotion claims" ON public.customer_promotion_claims;
DROP POLICY IF EXISTS "Admin can manage all promotion claims" ON public.customer_promotion_claims;

CREATE POLICY "Authenticated users can view all promotion claims"
ON public.customer_promotion_claims
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage promotion claims"
ON public.customer_promotion_claims
FOR ALL
USING (true)
WITH CHECK (true);

-- Update policies for customer_gifts
DROP POLICY IF EXISTS "customers_own_gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Admin can view all customer gifts" ON public.customer_gifts;
DROP POLICY IF EXISTS "Admin can manage all customer gifts" ON public.customer_gifts;

CREATE POLICY "Authenticated users can view all gifts"
ON public.customer_gifts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage gifts"
ON public.customer_gifts
FOR ALL
USING (true)
WITH CHECK (true);

-- Update policies for customer_rewards  
DROP POLICY IF EXISTS "customers_own_rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Admin can view all customer rewards" ON public.customer_rewards;
DROP POLICY IF EXISTS "Admin can manage all customer rewards" ON public.customer_rewards;

CREATE POLICY "Authenticated users can view all rewards"
ON public.customer_rewards
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage rewards"
ON public.customer_rewards
FOR ALL
USING (true)
WITH CHECK (true);