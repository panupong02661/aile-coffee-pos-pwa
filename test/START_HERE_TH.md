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

# เริ่มต้น AILE POS Cloud v2.8

## ถ้าต้องการแค่ดูหน้าตาระบบ
เปิดไฟล์ `dist/AILE_POS_Cloud_v2.8_Standalone.html` ได้ทันที (Demo เท่านั้น ไม่มีฐานข้อมูลกลาง)

## ถ้าต้องการเปิดระบบ Backend + PostgreSQL บนเครื่องตัวเอง

ต้องมี Docker Desktop, Node.js 20+ และอินเทอร์เน็ตสำหรับ Docker build ครั้งแรก

```sh
node scripts/setup-local.mjs
docker compose up -d --build
docker compose ps
```

เปิด `http://127.0.0.1:4000` บนเครื่องเดียวกัน จากนั้นสมัครร้าน สร้างสินค้า เติมสต็อก และเปิดกะก่อนทดลองขาย

ทดสอบออเดอร์ซ้ำ (ฐานข้อมูลทดลองเท่านั้น):

```sh
node tests/v28_api_integration.mjs
```

ยังไม่ได้ผ่านการทดสอบฐานข้อมูลและเครื่องพิมพ์จริงในสภาพแวดล้อมสร้างไฟล์ โปรดอ่าน `V28_RELEASE_NOTES_TH.md` และ `PRODUCTION_CHECKLIST_TH.md` ก่อนใช้รับเงินจริง

## v2.9 ตรวจความพร้อมเครื่องก่อนทดสอบ
รัน `node scripts/preflight.mjs` แล้วแก้รายการ FAIL ให้หมด การผ่าน preflight ยังไม่เท่ากับการผ่านการทดสอบธุรกรรมเงินจริง
