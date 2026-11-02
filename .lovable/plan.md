# คู่มือ Aile POS — PDF พร้อมภาพประกอบทุกหน้า

## เป้าหมาย
สร้างคู่มือการใช้งานภาษาไทยฉบับเต็ม (PDF) พร้อมภาพหน้าจอจริงของทุกหน้า/ทุกเมนู สำหรับให้ลูกค้าที่สนใจบริการ POS ไว้ก่อนที่ `/mnt/documents`

## ขั้นตอน

### 1. ถ่ายภาพหน้าจอทุกหน้า (Playwright)
- เข้า http://localhost:8080 ล็อกอินด้วยบัญชีทดสอบ (admin/admin ผ่านฟอร์มเข้าสู่ระบบของแอป)
- เปิดทีละหน้า ถ่ายภาพ 1280px กว้าง บันทึกใน /tmp/manual/shots/:
  - หน้าขาย: /pos, /dashboard, /shift-close, /shop-benchmark, /kitchen-display, /customer-display, /online-orders, /delivery-integration, /delivery-management, /delivery-tracking, /queue-management, /queue-display, /table-management
  - เมนู/สต็อก/สมาชิก: /menu-management, /inventory, /cost-analysis, /members, /customer-app-management, /promotions, /menu-promotions, /coupon-management, /engagement
  - รายงาน/การเงิน/พนักงาน: /advanced-reports (4 แท็บ), /analytics-dashboard, /financial-dashboard, /accounting, /staff, /permissions, /crm, /security-dashboard
  - ตั้งค่า: /shop-settings (ทุกแท็บ), /business-settings, /printer-settings (ทุกแท็บ), /notifications (ทุกแท็บ), /line-messaging, /review-management, /wifi-vouchers, /mobile-settings, /app-build-guide, /pos-system-info
  - สาธารณะ: /customer-mobile-app, /member-registration, /queue-tracker
- หน้าที่ต้องกดแท็บย่อยจะถ่ายภาพแท็บสำคัญแยกกัน (รวม ~60-70 ภาพ)

### 2. เรียบเรียงเนื้อหา
- ใช้ข้อมูลที่ตรวจจากโค้ดจริงที่สำรวจแล้วครบ 4 กลุ่ม (ขาย/เมนู-สมาชิก/รายงาน-พนักงาน/ตั้งค่า-เครื่องพิมพ์)
- โครงสร้าง: ปก → สารบัญ → วิธีเข้าสู่ระบบ → แผนที่เมนู → หมวดหมู่ข้างต้น หน้าละหนึ่งหัวข้อ พร้อมภาพ + ปุ่มสำคัญ + ขั้นตอนการใช้
- หมายเหตุหน้าดีโม (เช่น FinancialSystem, TechnologySystem, SecuritySystem, DeliveryIntegration ทดสอบเชื่อมต่อจำลอง) จะระบุชัดว่า "ตัวอย่าง/ยังไม่เชื่อมข้อมูลจริง"

### 3. สร้าง PDF (Python reportlab + ฟอนต์ไทย DejaVu)
- ฟอนต์: ลงทะเบียน DejaVu Sans (รองรับภาษาไทย) ทั้งปกติ/หนา
- ภาพประกอบแบบ fit-width ในกรอบ พร้อมคำบรรยายใต้ภาพ
- QA ภาคบังคับ: แปลงทุกหน้า PDF เป็นภาพแล้วตรวจ (ข้อความตกขอบ, ภาพซ้อน, หน้าว่าง, สารบัญตรงกับเนื้อหา) แก้ซ้ำจนสะอาด

### 4. ส่งมอบ
- ไฟล์ `Aile-POS-คู่มือการใช้งาน.pdf` ใน Files (/mnt/documents) พร้อมพรีวิวในแชท

## การตรวจสอบ
- ตรวจภาพหน้าจอที่ถ่ายได้ครบทุกหน้า (หน้าที่ล็อกอินไม่ได้จะแจ้งแทนการเว้นว่าง)
- ตรวจภาพทุกหน้าของ PDF สุดท้ายก่อนส่งมอบ
