
-- Create staff table for employee management
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policy for staff management
CREATE POLICY "Allow all operations on staff" 
ON public.staff 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.staff (name, position, role, phone, email, salary) VALUES
('นางสาวสมใจ ใจดี', 'พนักงานเสิร์ฟ', 'staff', '081-234-5678', 'somjai@example.com', 15000),
('นายสมชาย รักงาน', 'บาริสต้า', 'staff', '082-345-6789', 'somchai@example.com', 18000),
('นางสาวมาลี ขยันทำ', 'ผู้จัดการ', 'manager', '083-456-7890', 'malee@example.com', 25000);
