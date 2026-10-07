# แผน: เพิ่มเมนู "ข้อมูลระบบ POS"

## สิ่งที่จะทำ

สร้างหน้าใหม่ "ข้อมูลระบบ POS" ในหมวดเมนู "ตั้งค่า & ระบบ" แสดงสรุปเทคโนโลยีและฐานข้อมูลที่ระบบใช้ เพื่อให้ทีมพัฒนาต่อดูข้อมูลได้จากในแอปโดยตรง

## รายละเอียดงาน

1. **สร้างหน้าใหม่ `src/pages/POSSystemInfo.tsx`**
   - ใช้ layout เดียวกับหน้าอื่น (MainSidebar + Header)
   - แสดงเป็นการ์ด 4 ส่วน:
     - **ส่วนหน้าแอป (Frontend):** React + TypeScript (สร้างด้วย Vite), Tailwind CSS, Capacitor (แพ็กเป็นแอป Android/iOS)
     - **ฐานข้อมูลและระบบหลังบ้าน (Backend):** PostgreSQL ผ่าน Supabase, ฟังก์ชัน PL/pgSQL (แต้มสมาชิก เลขออเดอร์ สิทธิ์ admin), Edge Functions (TypeScript — แจ้งเตือน LINE, ล็อกอินพนักงาน, รายงานรายวัน)
     - **แอปแท็บเล็ต:** Capacitor แพ็กเป็น APK Android
     - **แนะนำสำหรับพัฒนาต่อ:** Node.js 18+ + npm, แก้โค้ดด้วย VS Code หรือผ่านหน้า Lovable, จัดการฐานข้อมูลผ่าน Supabase Dashboard, ต้องคุ้นเคย JavaScript/TypeScript (PHP/C# ต่อไม่ได้โดยตรง)
   - ใช้สี/ไอคอนตามระบบเดิม (lucide-react + semantic tokens)

2. **เพิ่ม Route ใน `src/App.tsx`**
   - Route ใหม่ `/pos-system-info` (ProtectedRoute, lazy import เหมือนหน้าอื่น)

3. **เพิ่มรายการเมนูใน `src/components/sidebar/menuConfig.ts`**
   - หมวด `settings` (ตั้งค่า & ระบบ) เพิ่ม: `{ id: 'pos-system-info', label: 'ข้อมูลระบบ POS', icon: Info, path: '/pos-system-info' }`

4. **เพิ่มใน launcher `src/data/launcherMenu.ts`**
   - หมวด `settings` เพิ่มไอคอนเดียวกัน พร้อมสีพื้นหลังไอคอนตามสไตล์เดิม

## หมายเหตุ
- เป็นการแก้ frontend เท่านั้น ไม่มีการเปลี่ยนฐานข้อมูลหรือ business logic
- ผู้ใช้ต้องล็อกอินก่อนจึงเห็นหน้านี้ (อยู่หลัง ProtectedRoute)
