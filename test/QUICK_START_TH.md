# อัปเดต AILE POS Cloud v1.7 — Guest QR ที่แสดงเมนูได้

**อ่านคู่มือ** [`GUEST_QR_FIX_TH.md`](./GUEST_QR_FIX_TH.md) สำหรับวิธีทดลองหน้าลูกค้าภายใน POS และวิธีใช้ QR บนมือถือผ่าน Backend จริง

- หน้า **QR Ordering** มีปุ่มทดลองสั่งอาหารกับโต๊ะที่เปิดอยู่ใน POS เดียวกัน โดยส่งคิวไปจอครัวและปรับบิล/สต็อกใน Demo
- `AILE_POS_Cloud_v1.7_Guest.html` เปิดตรง ๆ มีโต๊ะ T01 และเมนูตัวอย่างให้สั่งได้ทันที แม้ไม่ได้เปิด POS
- โหมดคาเฟ่/ร้านอาหารไม่แสดงแพ็กเกจบุฟเฟ่โดยไม่จำเป็น
- Unit Tests 26 กรณี และ Chromium Browser Smoke Test ใหม่
- โหมด Demo **ไม่แชร์ข้อมูลระหว่างโดเมน** และ QR พรีวิวในแชต **ไม่ใช่ QR ใช้งานข้ามมือถือ**

---

> **v1.6:** แยก `guest.html` (สั่งที่โต๊ะ) และ `customer-app.html` / `customerApp.html` (สั่งล่วงหน้ารับหน้าร้าน) พร้อมหน้าตาแอปใหม่จากโค้ด TORTILLA ดูรายละเอียดที่ [V16_RELEASE_NOTES_TH.md](V16_RELEASE_NOTES_TH.md)

# เริ่ม AILE POS Cloud v1.5 — เมนู Add-on / สูตร / ร้านออนไลน์มือถือ

**ทดลองจากไฟล์ HTML (ไม่ต้องติดตั้ง):**

- `dist/AILE_POS_Cloud_v1.5_Standalone.html` — หน้าพนักงาน POS
- `dist/AILE_POS_Cloud_v1.5_Guest.html` — หน้าลูกค้าสแกน QR โต๊ะ (Demo ต้นทางเดียวกันเท่านั้น)
- `dist/AILE_POS_Cloud_v1.5_CustomerApp.html` — แอปหน้าเว็บร้านออนไลน์สำหรับลูกค้าสั่งล่วงหน้า

**โหมด API สำหรับทดสอบบนเครื่อง:**

```powershell
Copy-Item .env.example .env
# เปลี่ยน JWT_SECRET ให้เป็นค่าสุ่มจริง และกำหนด DATABASE_URL ของฐานข้อมูลทดสอบ
docker compose up -d
npm install
npm run db:init
npm run check
npm test
npm start
```

เปิด `http://localhost:4000` (POS), `/guest.html` (QR ลูกค้า), `/customer-app.html` (ร้านออนไลน์ลูกค้า). **ระวัง:** ใน v1.5 ส่วน Add-on และ storefront designer ยังเป็น Demo-only; Backend database API ของวัตถุดิบเป็นโครงสร้างที่ยังไม่ได้ผ่านการทดสอบ integration จริง.

**ลิงก์ QR ไม่ทำงานบนมือถือจาก ChatGPT preview:** ต้องเปิด POS จาก IP LAN ที่มือถือเข้าถึงได้ หรือใช้เว็บ HTTPS ที่ Deploy จริง แล้วใช้ QR ที่สร้างจากเซิร์ฟเวอร์ในโหมด API เท่านั้น; อธิบายครบใน `V15_RELEASE_NOTES_TH.md`.

**แนบสลิป ≠ เงินเข้าจริง:** พนักงานต้องตรวจสอบยอดเงินจากผู้รับชำระก่อนยืนยันและส่งครัว.

---

# AILE POS Cloud v1.4 — Offline & Printing

**ใหม่:** ระบบคิวขายเงินสดออฟไลน์ใน IndexedDB, ซิงก์ด้วย Idempotency Key, เมนูจัดการเครื่องพิมพ์ใบเสร็จ/ครัว/ร่างใบกำกับภาษี, ขนาด 58/80 มม. A4/A5, USB/LAN/Wi-Fi ผ่านไดรเวอร์หรือ Local Print Bridge.

**คู่มือใหม่:** อ่าน [OFFLINE_PRINT_TH.md](OFFLINE_PRINT_TH.md) และ [V14_RELEASE_NOTES_TH.md](V14_RELEASE_NOTES_TH.md) ก่อนทดลอง. ระบบยังเป็น Development Preview และไม่ควรใช้เก็บยอดขายจริงก่อนทดสอบฐานข้อมูลและฮาร์ดแวร์.

---

## อัปเดต v1.3: SaaS / แพ็กเกจ

1. สำรอง PostgreSQL เดิมก่อนอัปเกรด และทำกับฐานข้อมูลทดสอบก่อน
2. ใช้ `docker compose up -d` และ `npm install`
3. รัน `npm run db:init` เพื่อสร้างตาราง v1.3 และให้ Tenant เก่ามี `business/legacy`
4. รัน `npm run check && npm test`
5. รัน `npm start` และเปิด `http://localhost:4000`
6. ไปที่ Sidebar ซ้าย > SaaS / แพ็กเกจ
7. ทดสอบ API จริงในฐานข้อมูลทดสอบด้วย `npm run test:integration`

**หมายเหตุ:** ข้อมูล Standalone เป็น Demo ไม่เรียกเก็บเงินจริง และระบบ SaaS Billing ยังไม่เชื่อม

# เริ่มต้น AILE POS Cloud v1.2 ใน VS Code

## A. ดูหน้าเว็บเลย (ไม่ต้องติดตั้งโปรแกรมเพิ่ม)

ดับเบิลคลิก `AILE_POS_Cloud_v1.2_Standalone.html` แล้วเลือกเมนูด้านซ้าย **ศูนย์ควบคุมระบบ** หรือเมนู POS/จอครัว/โต๊ะด้านบน ข้อมูล Demo จะอยู่ในเบราว์เซอร์เครื่องเดียว ไม่ใช่ฐานข้อมูลจริง

## B. เปิดโหมด API + PostgreSQL

1. ติดตั้ง Node.js >= 20 และ Docker Desktop
2. เปิดโฟลเดอร์นี้ใน VS Code
3. แก้ `.env` โดยคัดลอกจาก `.env.example`; เปลี่ยน `JWT_SECRET` ให้เป็นค่าสุ่มที่ปลอดภัย
4. สำรองฐานข้อมูลเดิมก่อนอัปเกรด schema ทุกครั้ง
5. รันใน PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up -d
npm install
npm run db:init
npm run check
npm test
npm start
```

6. เปิด `http://localhost:4000`, สมัครร้าน หรือ Login แล้วเปิดกะเพื่อทดลองขายเงินสด
7. เปิด `http://localhost:4000/api/health/ready` ต้องตอบ `status: ready` เมื่อ PostgreSQL พร้อม
8. คลิก **ศูนย์ควบคุมระบบ** ในแถบซ้ายเพื่อดูสถานะและรายงาน

### ทดสอบ API (เฉพาะฐานข้อมูลทดสอบ)

```powershell
node tests/v12_api_integration.mjs
```

### สำรองข้อมูล

```powershell
npm run backup
```

ต้องมี `pg_dump` ใน PATH และ `DATABASE_URL` ที่เชื่อมถึง PostgreSQL ได้ ดู `BACKUP_RESTORE_TH.md` สำหรับการตรวจไฟล์และซ้อมกู้คืน

**ข้อควรระวัง:** ยังไม่มี PromptPay/บัตรที่ตรวจผลจริง, MFA และการทดสอบ Production ครบถ้วน ไม่ควรเปิดให้ร้านค้ารับเงินจริงโดยอาศัย Demo
