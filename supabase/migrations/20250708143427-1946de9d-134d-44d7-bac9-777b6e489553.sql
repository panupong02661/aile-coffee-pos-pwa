
-- Create time_attendance table for staff time tracking
CREATE TABLE public.time_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  work_hours NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Add RLS policy
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on time_attendance"
  ON public.time_attendance
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_time_attendance_updated_at
  BEFORE UPDATE ON public.time_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
