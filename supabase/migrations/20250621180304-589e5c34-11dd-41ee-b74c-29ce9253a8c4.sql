
-- Add gift_code column to customer_gifts table
ALTER TABLE customer_gifts ADD COLUMN gift_code TEXT;

-- Create unique index on gift_code (excluding null values)
CREATE UNIQUE INDEX idx_customer_gifts_gift_code ON customer_gifts (gift_code) WHERE gift_code IS NOT NULL;
