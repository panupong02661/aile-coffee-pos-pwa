
-- เพิ่มคอลัมน์วันเกิดและเพศในตาราง members
ALTER TABLE public.members 
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
