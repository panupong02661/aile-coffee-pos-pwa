# AILE POS Cloud v1.8 — รองรับจอและเตรียม Android / iOS

## สิ่งที่เพิ่มแล้ว

- Responsive Overrides ของ POS, KDS, โต๊ะ, บุฟเฟ่, Dashboard, รายงาน, สต็อก, Settings, Guest QR และ Customer App
- เมนูด้านล่างบนมือถือ 5 ปุ่ม (POS, ครัว, โต๊ะ, สรุป, เมนู) และแถบ Sidebar แบบ Drawer
- Mobile safe areas, แนวตั้ง/แนวนอน, ปุ่มขนาดสัมผัส, ตารางเลื่อนแนวนอน, ผังโต๊ะเลื่อนในกรอบ
- Customer App บนแท็บเล็ตใช้หน้าจอเต็มพื้นที่ที่เหมาะสม แทนบังคับกรอบมือถือกว้าง 430px
- หน้าศูนย์อุปกรณ์สำหรับดู viewport, เปลี่ยนความหนาแน่นและวิธีติดตั้ง PWA
- 3 manifest แยก POS / Guest QR / Customer App พร้อม icon 180, 192, 512
- Service worker แบบ cache เฉพาะ static assets (ไม่ cache API/QR token/receipt/slip)
- ตัวเตรียม static web bundle และ Capacitor 8 configurations สำหรับทำ Android/iOS ภายหลัง แยก **Staff POS** และ **Customer App** เป็นคนละแอป

## ทดสอบ

`npm run check` — ตรวจ JavaScript syntax หลักของระบบเดิม + v1.8

`npm test` — unit tests รุ่นก่อนและ v1.8

`npm run test:responsive` — ต้องมี Python Playwright + Chromium ติดตั้ง; ใช้ script ที่ให้มาทดสอบ viewport ขนาดต่าง ๆ (หากสภาพแวดล้อมไม่พร้อมอาจทดสอบไม่ได้)

`npm run mobile:prepare` — สร้าง `apps/mobile-shell/www` สำหรับ Capacitor (ยังไม่ใช่ native build)

## กลุ่มขนาดหน้าจอที่ออกแบบ

- โทรศัพท์แนวตั้ง: 320×700, 360×800, 390×844, 430×932
- โทรศัพท์แนวนอน: 844×390, 932×430
- แท็บเล็ตแนวตั้ง: 768×1024, 820×1180
- แท็บเล็ตแนวนอน: 1024×768, 1180×820
- คอมพิวเตอร์: 1280×720, 1440×900, 1920×1080

Responsive ไม่ได้หมายถึงใช้ได้ผ่านการทดสอบทุกเครื่องจริง: ต้องทดสอบอุปกรณ์จริงและรุ่น Android / iOS หลายรุ่นก่อนเปิดบริการ

## สิ่งที่ยังไม่สำเร็จ

- Native binaries APK/AAB/IPA, signing keys, Apple Developer/Google Play account, ส่ง App Review
- การเชื่อม Backend แบบหลายอุปกรณ์ผ่าน HTTPS, ออเดอร์ QR token จริงข้ามเครื่อง
- การเชื่อมเครื่องพิมพ์ USB/LAN/Wi-Fi และ ESC/POS ภาษาไทยบนแต่ละแพลตฟอร์ม
- Production-grade offline reconciliation, Secure Storage, Push Notification, Biometric Login
- Payment Gateway และการออกใบกำกับภาษีทางการ

ห้ามเผยแพร่ระบบนี้เป็น Production หรือประกาศว่าส่ง Store สำเร็จก่อนทำ/ทดสอบข้างต้น
