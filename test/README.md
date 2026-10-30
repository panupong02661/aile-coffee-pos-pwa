# AILE POS Cloud v9.7 — รวมเมนูและฟังก์ชัน v8.6 + v9.6

ใช้โค้ดrootนี้เป็นฐานหลัก. เมนูครบ24เดิม+ตั้งค่าแจ้งเตือนรวม25; คืน12ไฟล์nativeจากแนบพร้อม4commands. เก็บงานAPI/ธุรกรรม/สิทธิ์/แจ้งเตือน/รายงานรุ่นใหม่ครบ ไม่มีschemaเปลี่ยน. อ่าน FEATURE_PARITY_TH.md และ V97_RELEASE_NOTES_TH.md

เปิดBackendด้วยnpm ci/npm startตามคู่มือเดิม หรือดูDemoที่dist/AILE_POS_Cloud_v9.7_Standalone.html. อย่าเปิดpreviewเก่าแทนentryใหม่ และไม่ล้างข้อมูลเว็บไซต์เพื่ออัปเดต. ข้อจำกัดDemo/Backendเดิมยังคงอยู่ ไม่ใช้เมนูครบรับรองproduction

Unit437/437/builds/Browserparity24หน้าและregressionsผ่าน; native/liveprovider/เครื่องพิมพ์จริงยังไม่ยืนยัน

---

# AILE POS Cloud v9.6 — Cost & Report Consistency

ต่อจาก v9.5 เต็ม: เพิ่มต้นทุนใช้ไปหลังคืนสต็อก แยกจากค่าประมาณเดิม, snapshot รายงานกำไร และแก้ Backoffice3หน้า. ไม่มี schema/dependency upgrade. อ่าน V96_RELEASE_NOTES_TH.md และ COST_RECONCILIATION_TH.md

418 unit + regression/API/embedded SQL/Browser ผ่าน; native PostgreSQL และ live provider ยังไม่พร้อม ไม่รับรอง Pilot. หยุด API/Worker ก่อนอัปเดต npm ci และเก็บ key เดิม. กติกา restore hold v9.5 ยังคงใช้

---

# AILE POS Cloud v9.5 — Restore Hold & Destination Review

ต่อจากv9.4เต็ม เฉพาะแจ้งเตือน: พัก/เปิดคิว, กักงานหลังRestore, ผลตรวจปลายทางพร้อมauditและreviewก่อนretry, POS/QRUIE2Eและloadregression. อ่าน V95_RELEASE_NOTES_TH.md และ V95_RESTORE_QUEUE_TH.md

หยุดAPI/Workerเก่าทั้งหมดก่อนnpm ci / npm run db:init (เพิ่ม2ตาราง/2columns). Rawpg_restoreต้องเรียกnotifications:restore-holdก่อนเปิดWorker. เก็บencryptionkeyเดิม. 412unitและembedded/API/Browser/fakeproviderผ่าน แต่native/liveยังไม่ยืนยัน ไม่รับรองพร้อมPilot

---

# AILE POS Cloud v9.4 — Notification Validation & Retry Safety

ต่อจาก v9.3 เต็ม เฉพาะแจ้งเตือน: แก้ LINE retry เกินอายุก่อนเรียก provider, เพิ่ม Browser lifecycle/restore regression และ native local runner ไม่ต้อง Docker. ไม่มี schema/dependency upgrade อ่าน V94_RELEASE_NOTES_TH.md และ V94_NOTIFICATION_ACCEPTANCE_TH.md

ผลจริง 412 unit + regression engine 10 scripts + Browser settings/API/embedded SQL/fake provider + retry/physical embedded restore ผ่าน. Live credentials/บัญชีจริงไม่มี; native Docker/local หยุดก่อน cluster (ไม่มี Docker/root-only runtime). ยังไม่พร้อม production. หยุด Worker เก่าทุกตัวก่อนอัปเดต รัน npm ci และคง encryption key เดิม

---

# AILE POS Cloud v9.3 — สุขภาพและคิวแจ้งเตือน

ต่อจาก v9.2 เฉพาะแจ้งเตือน เพิ่ม health/filter/keyset pages/detail/attempt history และ lease fencing. เปิด /notifications.html#health-section หรือ main sidebar → ตั้งค่าแจ้งเตือนแพลตฟอร์ม → สุขภาพและคิว

หยุด Worker รุ่นเก่าทั้งหมดแล้ว npm ci / npm run db:init ก่อนเปิด v9.3. อ่าน NOTIFICATION_OPERATIONS_TH.md. 407 unit tests และ API/Browser/process crash/embedded restore ผ่าน แต่ native PostgreSQL และ live provider ยังไม่ได้ยืนยันเพราะไม่มี runtime/credentials จริง

---

# AILE POS Cloud v9.2 — แจ้งเตือนแพลตฟอร์ม

ต่อจาก v9.1 เฉพาะงานแจ้งเตือน; เพิ่มเมนู main sidebar → ตั้งค่าแจ้งเตือนแพลตฟอร์ม (/notifications.html) สำหรับ Owner. เลือก POS/QR/ออนไลน์, ออเดอร์ใหม่/สรุปช่วงเวลา/รายเดือน และ Discord/LINE/Telegram/Instagram ได้

อ่าน NOTIFICATIONS_TH.md และ V92_RELEASE_NOTES_TH.md. รัน npm ci / npm run db:init ก่อน npm start และตั้ง NOTIFICATION_ENCRYPTION_KEY เป็น random hex 64 ตัวที่เก็บอย่างปลอดภัย. Worker เริ่มตาม npm start; NOTIFICATIONS_WORKER_ENABLED=0 ใช้ปิดส่งชั่วคราว

399 unit tests และ API/Browser/restore บน embedded SQL ผ่าน โดย provider transport เป็นตัวจำลอง ไม่มี live delivery. Native PostgreSQL/Docker/provider credentials ยังไม่ได้ทดสอบจริง; Instagram มีเงื่อนไขบทสนทนา ไม่รับประกันการส่งสรุปทุกเดือน

---

# AILE POS Cloud v9.1 — ควบคุมฟังก์ชันตามแพ็กเกจและสิทธิ์พนักงาน

ต่อจาก v9.0; มี migration เพิ่ม 7 ตาราง ต้อง npm ci / npm run db:init ก่อน npm start. อ่าน FUNCTION_CONTROL_TH.md และ V91_RELEASE_NOTES_TH.md. ผู้ดูแล AILE ใช้ /platform-functions.html และ Owner ร้านใช้ /staff-functions.html

ตั้ง PLATFORM_JWT_SECRET แยกจาก JWT_SECRET แล้ว grant บัญชีผ่าน npm run platform:admin -- --email existing@example.com --enable ด้วยผู้ดูแลเครื่องที่เชื่อถือได้; tenant Owner ไม่ได้เป็น platform admin อัตโนมัติ

381 unit tests และ API/Browser/restore บน embedded SQL ผ่าน; native PostgreSQL ยังไม่ผ่านการยืนยันเพราะไม่มี Docker. ไม่ใช้ผลนี้รับรองพร้อมขายจริง

---

# AILE POS Cloud v9.0 — เริ่มจากฐานเดิม v8.0

v9.0 ปรับรายงานเป็นเวลาไทยและรองรับ branchIds หลายสาขาตามสิทธิ์ ทั้ง JSON/Excel/PDF; เพิ่ม backup business manifest, restore comparison และทดสอบ SIGKILL/restart API หลัง commit. อ่าน V90_RELEASE_NOTES_TH.md และ REPORT_RECOVERY_TH.md ก่อนใช้งาน ผล native PostgreSQL ยังไม่ยืนยันเพราะไม่มี Docker

ติดตั้ง dependencies ด้วย `npm ci` (Node.js 20+) ตั้งค่า `.env` ตามตัวอย่างสำหรับฐานทดลอง จากนั้น `npm run db:init` และ `npm start` เว็บปัจจุบันอยู่ใน `web/` ให้เปิดผ่าน backend; HTML preview ที่มีเลขรุ่นเก่าเป็น historical demo

ทดสอบพื้นฐาน: `npm test` และ `npm run check` ส่วน `npm run test:refund-db` ต้องใช้ API+PostgreSQL disposable และ confirmation ตาม NEXT_STEPS_TH.md

---

# AILE POS Cloud v2.8 — เริ่มต้นที่นี่

**ยังไม่ใช่ระบบรับรองพร้อมใช้ขายจริง 100%** แต่มีโค้ด Backend, POS, KDS, QR และ Customer App สำหรับการติดตั้งและทดสอบบนเครื่องจริง

- [คู่มือติดตั้ง/Release Notes v2.8](V28_RELEASE_NOTES_TH.md)
- [Checklist ก่อนเปิดร้าน](PRODUCTION_CHECKLIST_TH.md)
- รัน `node scripts/setup-local.mjs` แล้ว `docker compose up -d --build` เพื่อเปิด Backend + PostgreSQL ในเครื่อง
- เปิด `http://127.0.0.1:4000` บนเครื่องเดียวกัน
- รัน `node tests/v28_api_integration.mjs` **เฉพาะฐานข้อมูลทดสอบ** เพื่อยืนยันการขายซ้ำ/หักสต็อกครั้งเดียวหลังติดตั้ง

---

# AILE POS Cloud v1.8 — Responsive & App-Ready Foundation

**Development Preview เท่านั้น ไม่ใช่ระบบขายจริงที่ผ่านการทดสอบครบวงจร**

## เพิ่มใน v1.8

- ปรับหน้าจอ POS/KDS/โต๊ะ/แดชบอร์ด/สต็อก/บุฟเฟ่/รายงาน/ตั้งค่า/QR Ordering/Customer App รองรับ desktop, tablet, phone ทั้งแนวตั้งและแนวนอน
- แถบเมนูล่างบนจอมือถือ และเมนูด้านบน 4 ระบบหลักที่ยังมองเห็นได้
- หน้า **อุปกรณ์ / เตรียมแอป** ใน Main Sidebar พร้อมตัวเลือกความกระชับและปุ่มใหญ่
- PWA manifests แยก 3 หน้าพร้อมไอคอนต้นฉบับ 180/192/512 พิกเซล
- ทบทวน Service Worker ให้ Cache เฉพาะไฟล์สาธารณะ ไม่ Cache API, QR tokens หรือข้อมูลการเงิน
- Capacitor 8 starter แยก Staff POS และ Customer App พร้อมสคริปต์เตรียม `www` สองชุด
- Browser Responsive Smoke 8 ขนาดหน้าจอ × 3 หน้า + 25 หน้า POS × 4 ขนาดหน้าจอ

## ใช้งาน

- เปิด `web/index.html` ผ่าน Node server ตาม QUICK_START_TH.md หรือเปิด HTML Standalone สำหรับทดลอง
- เข้าเมนู Sidebar **อุปกรณ์ / เตรียมแอป** เพื่อปรับการแสดงผล
- รัน `npm run check`, `npm test` และ `npm run test:responsive` เพื่อตรวจระบบ
- รัน `npm run mobile:prepare` เพื่อสร้าง `apps/mobile-shell/www` และ `apps/customer-shell/www`
- ดู `APP_MOBILE_ROADMAP_TH.md` สำหรับข้อจำกัด/แผนสร้างแอปจริง

## ความปลอดภัยและข้อจำกัด

การปรับ Responsive / เพิ่ม PWA **ไม่ได้แก้ความเสี่ยงด้านธุรกรรมฐานข้อมูล** จากรุ่นก่อน ระบบ Live QR ข้ามเครื่อง, ระบบจ่ายเงินจริง, การพิมพ์ผ่าน Native Printer, Push Notification, การตรวจ PDPA/เอกสารภาษี และการเผยแพร่ผ่าน Google Play/App Store ยังต้องทำและทดสอบเพิ่มเติม ผู้ใช้ควรทดลองในโหมด Demo เท่านั้น

---

## รายละเอียดเวอร์ชันก่อนหน้า

# อัปเดต AILE POS Cloud v1.7 — Guest QR ที่แสดงเมนูได้

**อ่านคู่มือ** [`GUEST_QR_FIX_TH.md`](./GUEST_QR_FIX_TH.md) สำหรับวิธีทดลองหน้าลูกค้าภายใน POS และวิธีใช้ QR บนมือถือผ่าน Backend จริง

- หน้า **QR Ordering** มีปุ่มทดลองสั่งอาหารกับโต๊ะที่เปิดอยู่ใน POS เดียวกัน โดยส่งคิวไปจอครัวและปรับบิล/สต็อกใน Demo
- `AILE_POS_Cloud_v1.7_Guest.html` เปิดตรง ๆ มีโต๊ะ T01 และเมนูตัวอย่างให้สั่งได้ทันที แม้ไม่ได้เปิด POS
- โหมดคาเฟ่/ร้านอาหารไม่แสดงแพ็กเกจบุฟเฟ่โดยไม่จำเป็น
- Unit Tests 26 กรณี และ Chromium Browser Smoke Test ใหม่
- โหมด Demo **ไม่แชร์ข้อมูลระหว่างโดเมน** และ QR พรีวิวในแชต **ไม่ใช่ QR ใช้งานข้ามมือถือ**

---

> **v1.6:** แยก `guest.html` (สั่งที่โต๊ะ) และ `customer-app.html` / `customerApp.html` (สั่งล่วงหน้ารับหน้าร้าน) พร้อมหน้าตาแอปใหม่จากโค้ด TORTILLA ดูรายละเอียดที่ [V16_RELEASE_NOTES_TH.md](V16_RELEASE_NOTES_TH.md)

# AILE POS Cloud v1.5 — Menu Modifiers / Ingredient Recipes / Customer Storefront

> **Development Preview**: หน้าเว็บลูกค้าและการตั้งค่า Add-on ยังทำงานแบบ Demo ด้วย Browser Storage; ไม่ใช่ Production payment/inventory solution.

**เริ่มที่** [คู่มือ v1.5](QUICK_START_TH.md) และ [รายละเอียด v1.5](V15_RELEASE_NOTES_TH.md).

**ไฟล์ HTML รุ่นใหม่**: `dist/AILE_POS_Cloud_v1.5_Standalone.html`, `dist/AILE_POS_Cloud_v1.5_Guest.html`, `dist/AILE_POS_Cloud_v1.5_CustomerApp.html`.

---

# AILE POS Cloud v1.4 — Offline & Printing

**ใหม่:** ระบบคิวขายเงินสดออฟไลน์ใน IndexedDB, ซิงก์ด้วย Idempotency Key, เมนูจัดการเครื่องพิมพ์ใบเสร็จ/ครัว/ร่างใบกำกับภาษี, ขนาด 58/80 มม. A4/A5, USB/LAN/Wi-Fi ผ่านไดรเวอร์หรือ Local Print Bridge.

**คู่มือใหม่:** อ่าน [OFFLINE_PRINT_TH.md](OFFLINE_PRINT_TH.md) และ [V14_RELEASE_NOTES_TH.md](V14_RELEASE_NOTES_TH.md) ก่อนทดลอง. ระบบยังเป็น Development Preview และไม่ควรใช้เก็บยอดขายจริงก่อนทดสอบฐานข้อมูลและฮาร์ดแวร์.

---

# AILE POS Cloud v1.3 — SaaS Tenant Entitlements

**Development Preview; ยังไม่เหมาะสำหรับเก็บยอดขายจริงโดยไม่มีการทดสอบและปรับความปลอดภัยเพิ่มเติม**

ดูรายละเอียดรุ่นใหม่ใน [V13_RELEASE_NOTES_TH.md](V13_RELEASE_NOTES_TH.md) และ [QUICK_START_TH.md](QUICK_START_TH.md)

เริ่มพัฒนา:

```bash
npm install
npm run check
npm test
npm run db:init
npm start
```

เปิด `http://localhost:4000` และเลือก **SaaS / แพ็กเกจ** จาก Sidebar

หน้า HTML ทดลอง: `dist/AILE_POS_Cloud_v1.3_Standalone.html` · หน้า QR ลูกค้า: `dist/AILE_POS_Cloud_v1.3_Guest.html`

# AILE POS Cloud v1.2 — Operations Control Center

> **Development Preview — ไม่ใช่ระบบ POS พร้อมใช้งานจริงทุกช่องทาง**

พัฒนาต่อจาก **v1.1** โดยรักษา POS, จอครัว KDS, โต๊ะและผังร้าน, บุฟเฟ่, QR Ordering, คำขอพนักงาน, แยก/รวมบิล, คืนเงิน, กะเงินสด, สิทธิ์พนักงาน และ Audit Log ที่เคยทำไว้ พร้อมเพิ่ม **ศูนย์ควบคุมระบบและการรายงาน**

## ทดลองหน้าตาเร็วที่สุด

เปิด `AILE_POS_Cloud_v1.2_Standalone.html` ใน Chrome/Edge แล้วไปที่เมนูด้านซ้าย **ศูนย์ควบคุมระบบ**; หรือเปิด `dist/AILE_POS_Cloud_v1.2_Standalone.html` ภายในโปรเจกต์

หน้า `AILE_POS_Cloud_v1.2_Guest.html` เป็น QR Ordering ฝั่งลูกค้า

> โหมด HTML ตัวเดียวทำงานด้วย Browser Storage ไม่ได้เชื่อมข้อมูลข้ามเครื่องและไม่รับเงินจริง

## เปิดเว็บพร้อม PostgreSQL (โหมดนักพัฒนา)

ติดตั้ง Node.js **20+**, Docker Desktop และ PostgreSQL Client tools (`pg_dump` สำหรับ Backup) จากนั้นใน Windows PowerShell:

```powershell
Copy-Item .env.example .env
# แก้ DATABASE_URL และ JWT_SECRET (อย่างน้อย 32 ตัวอักษรสุ่มจริง)
docker compose up -d
npm install
npm run db:init
npm run check
npm test
npm start
```

เปิด `http://localhost:4000` และตรวจฐานข้อมูลด้วย `http://localhost:4000/api/health/ready`

**อย่าใช้ Docker Compose รหัสผ่านตัวอย่างในระบบ Production**; ต้องกำหนด credential จริงและจำกัดการเชื่อมต่อจากภายนอก

## รุ่น v1.2 เพิ่มอะไรบ้าง

- เมนูศูนย์ควบคุมระบบ: สรุปสต็อก, กะ, บิลเปิด, KDS, คำขอลูกค้าและออเดอร์ออนไลน์
- รายงานรายวันตาม `Asia/Bangkok`, เลือกวันที่และส่งออก CSV
- Health probes: `GET /api/health/live` และ `/api/health/ready`
- API `GET /api/operations/overview?branchId=...`
- API `GET /api/operations/daily-reconciliation?branchId=...&date=YYYY-MM-DD`
- Backup ด้วย `npm run backup` (ต้องติดตั้ง pg_dump)
- Basic Login/Register rate limiting แบบ per-process และ Unit Tests

รายละเอียดและข้อจำกัด: `V12_RELEASE_NOTES_TH.md` และ `BACKUP_RESTORE_TH.md`

## วิธีทดสอบ

```bash
npm run check
npm test
python tests/v12_browser_smoke.py
# เฉพาะ API บนฐานข้อมูลทดสอบที่ล้างได้และอยู่ใน localhost
node tests/v12_api_integration.mjs
```

`v12_api_integration.mjs` สร้างร้าน ผู้ใช้ บิล และรายการทดสอบจริง **ห้ามรันกับฐานข้อมูลที่มีลูกค้าใช้งานจริง**

## ยังไม่พร้อม Production

ต้องทดสอบ PostgreSQL แบบเต็มระบบ, หลายเครื่องพร้อมกัน, การสำรองและกู้คืนจริง, การเชื่อม Payment Gateway ที่ตรวจสอบ Webhook, MFA, ระบบสิทธิ์ละเอียด, การกู้รหัสผ่าน, การจัดการภาษี/ใบกำกับภาษีและอุปกรณ์ POS จริง รวมถึงดำเนินมาตรการคุ้มครองข้อมูลส่วนบุคคล
