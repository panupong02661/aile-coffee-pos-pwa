-- Enable Row Level Security on tables that are missing it

-- Enable RLS on lottery table
ALTER TABLE public.lottery ENABLE ROW LEVEL SECURITY;

-- Enable RLS on menu_ingredients table  
ALTER TABLE public.menu_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for lottery table
CREATE POLICY "Allow all operations on lottery" 
ON public.lottery 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for menu_ingredients table
CREATE POLICY "Allow all operations on menu_ingredients" 
ON public.menu_ingredients 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON POLICY "Allow all operations on lottery" ON public.lottery 
IS 'Allow all operations on lottery table for system management';

COMMENT ON POLICY "Allow all operations on menu_ingredients" ON public.menu_ingredients 
IS 'Allow all operations on menu_ingredients table for menu management';