-- Add RLS policies for coupons table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view coupons" ON coupons;
DROP POLICY IF EXISTS "Authenticated users can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;

-- Enable RLS on coupons table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to view all coupons
CREATE POLICY "Authenticated users can view coupons" 
ON coupons FOR SELECT 
TO authenticated
USING (true);

-- Policy: Allow all authenticated users to insert, update, delete coupons
CREATE POLICY "Authenticated users can manage coupons" 
ON coupons FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow public/anonymous to view active coupons (for customer app)
CREATE POLICY "Public can view active coupons" 
ON coupons FOR SELECT 
TO anon
USING (is_active = true AND start_date <= now() AND end_date >= now());