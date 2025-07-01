
-- เพิ่มคอลัมน์ในตาราง orders สำหรับระบุประเภทการสั่งซื้อและเก็บสลีป
ALTER TABLE orders 
ADD COLUMN order_source TEXT DEFAULT 'in_store',
ADD COLUMN receipt_image_url TEXT,
ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN customer_notes TEXT;

-- สร้างตารางสำหรับเก็บไฟล์เสียงแจ้งเตือน
CREATE TABLE notification_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- เพิ่มข้อมูลเสียงเริ่มต้น
INSERT INTO notification_sounds (name, file_url, is_active) VALUES 
('เสียงเริ่มต้น', '/sounds/default-notification.mp3', true);

-- สร้างตารางสำหรับการตั้งค่าเสียงแจ้งเตือน
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_enabled BOOLEAN DEFAULT true,
  selected_sound_id UUID REFERENCES notification_sounds(id),
  volume FLOAT DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- เพิ่มข้อมูลการตั้งค่าเริ่มต้น
INSERT INTO notification_settings (sound_enabled, selected_sound_id, volume) 
SELECT true, id, 0.8 FROM notification_sounds WHERE is_active = true LIMIT 1;

-- สร้าง storage bucket สำหรับเก็บสลีป
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('notification-sounds', 'notification-sounds', true);

-- สร้าง RLS policies สำหรับ storage buckets
CREATE POLICY "Allow public access to receipts" ON storage.objects
FOR ALL USING (bucket_id = 'receipts');

CREATE POLICY "Allow public access to notification sounds" ON storage.objects
FOR ALL USING (bucket_id = 'notification-sounds');

-- เปิดใช้งาน Realtime สำหรับตาราง orders
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
