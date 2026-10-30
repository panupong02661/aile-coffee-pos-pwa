# Function Control — เพิ่มเติม v9.5

Catalogue137controls เพิ่มGET/PUTnotifications/queue-controlและPOSTdeliveries/:id/reviews สงวนOwner/ไม่ให้Manager-Cashierเปิดเอง. สิทธิ์แพ็กเกจ/tenant/branch/authเดิมยังตรวจ; CLIrestoreholdเป็นtrustedoperatorไม่ใช่การปลอมOwneractor. ไม่มีการเพิ่มสิทธิ์การเงิน/stockจากงานแจ้งเตือน

---

# Function Control — เพิ่มเติม v9.3

Catalogue รวม 134 controls เพิ่ม health/detail ที่สงวน Owner เช่นเดียวกับข้อมูลแจ้งเตือนอื่น. Lease/attempt changes ไม่เพิ่มสิทธิ์ Manager/Cashier และยังตรวจ tenant/branch ตามเดิม. Live checker เป็น trusted operator command ไม่ใช่ HTTP endpoint สำหรับให้พนักงานเพิ่มสิทธิ์

---

# Function Control — เพิ่มเติม v9.2

Catalogue เพิ่ม controls สำหรับแจ้งเตือนรวมเป็น 132 จาก 121 เดิม. ผู้ดูแล AILE เปิด/ปิดตามแพ็กเกจหรือรายร้านได้ รวม ACTION /notifications/send ที่ worker ตรวจอีกครั้งก่อน I/O

การตั้งค่า credentials/ปลายทางและประวัติแจ้งเตือนสงวน Owner ร้าน ไม่เปิดให้ Manager/Cashier ผ่าน staff switch เพื่อป้องกันส่งข้อมูลร้านไปปลายทางอื่น. Controls เหล่านี้มี staffConfigurable=false และไม่แสดงในรายการมอบสิทธิ์พนักงาน ส่วน controls เดิมคงกฎเดิม

อ่าน NOTIFICATIONS_TH.md สำหรับ 3 ประเภท/3 แหล่ง/4 ช่องทาง, encryption key และข้อจำกัด provider

---

# AILE POS Cloud v9.1 — คู่มือควบคุมแพ็กเกจและฟังก์ชัน

วันที่ 29 ตุลาคม 2026 · ต่อจาก v9.0 · อ่านผลทดสอบใน TEST_RESULTS_TH.md ก่อน pilot

## สิทธิ์ 2 ระดับ

| ผู้จัดการสิทธิ์ | สิ่งที่ทำได้ |
|---|---|
| ผู้ดูแลแพลตฟอร์ม AILE | กำหนดฟังก์ชันตั้งต้นของ Starter/Pro/Business; เปลี่ยนแพ็กเกจรายร้าน; เปิดพิเศษ/ปิดรายร้าน; วันหมดอายุ; โควตาสาขา/ผู้ใช้/สินค้า |
| Owner เจ้าของร้าน | เปิด/ปิด/กลับตามบทบาทสำหรับ Manager/Cashier ภายในฟังก์ชันที่ร้านได้รับ และกำหนดสาขาผ่านหน้าเดิม |
| Manager/Cashier | ใช้ฟังก์ชันตามแพ็กเกจ+ข้อยกเว้น+สิทธิ์พนักงาน+สาขา; เปลี่ยนสิทธิ์เองไม่ได้ |

Owner ร้านไม่ใช่ผู้ดูแล AILE และไม่มีสิทธิ์เปิดฟังก์ชันนอกแพ็กเกจให้ตนเอง การสมัครร้านไม่ให้ platform admin โดยอัตโนมัติ

## ใช้งานหน้าจอ

ผู้ดูแล AILE: เปิด `/platform-functions.html` และเข้าสู่ระบบแพลตฟอร์มแยกต่างหาก เลือก “ฟังก์ชันตั้งต้นของแพ็กเกจ” เพื่อกำหนดแต่ละแพ็กเกจ หรือค้นหาร้านแล้วเลือก “ข้อยกเว้นรายร้าน” จากนั้นเลือกฟังก์ชันเป็น ตามแพ็กเกจ / เปิดพิเศษ / ปิด ตั้งวันหมดอายุถ้าต้องการ ระบุเหตุผลและบันทึก

- โปรหมดอายุจะกลับไปตามแพ็กเกจของร้านในขณะนั้น ไม่ต้องรัน scheduler; ตรวจใหม่ทุก request
- ช่องวันหมดอายุใช้เวลาเครื่องที่เปิดหน้าเว็บ ส่ง API เป็น timestamp พร้อม timezone
- โควตาว่าง = ตามแพ็กเกจ, 0 = ห้ามเพิ่ม resource นั้น; ลดโควตาไม่ลบข้อมูลเดิม
- เปลี่ยนแพ็กเกจเป็นการจัด entitlement เท่านั้น ไม่เรียกเก็บเงินจริง ไม่เปิด subscription ที่หมดอายุโดยอัตโนมัติ
- ประวัติบันทึกผู้แก้ไข เหตุผล เวลา และ before/after; การแก้แพ็กเกจบันทึกใน scope ของแพ็กเกจ ส่วนรายร้านแยก tenant scope

Owner ร้าน: เปิด `/staff-functions.html` หรือเมนูพนักงาน/ลิงก์หลังบ้าน เลือกพนักงานแล้วโหลด เลือก ตามบทบาท / เปิด / ปิด แยกดู–ดำเนินการ–แก้ไข–ยกเลิก–ส่งออกตามฟังก์ชัน ระบุเหตุผลแล้วบันทึก ใช้ร่วมกับ `/branch-access.html` โดยสิทธิ์ฟังก์ชันชุดเดียวใช้กับทุกสาขาที่พนักงานได้รับ

หน้าจอมีตัวกรองภาษาไทยและชื่อฟังก์ชัน บันทึกการเปลี่ยนจากแท็บเก่าหลังมีคนแก้แล้วจะได้ 409 ให้โหลดใหม่ ไม่ทับข้อมูลคนอื่นเงียบ ๆ

## การรักษาสิทธิ์เดิม

แพ็กเกจเดิมมีโควตา แต่ยังไม่มีตารางฟังก์ชันที่ตกลงแยกทั้งสามแพ็กเกจ จึงตั้ง default ฟังก์ชันเดิมเป็นเปิดทั้งหมดเพื่อไม่ตัดบริการลูกค้าเดิมโดยพลการ ผู้ดูแล AILE ปรับความต่างของแต่ละแพ็กเกจได้จริงในหน้าจอใหม่ ไม่ได้สมมติการขาย/ราคา/รายการแถมแทนเจ้าของกิจการ

Catalogue v9.1 มี 121 controls: 116 staff-authenticated API actions, 4 public QR/storefront actions และการให้ส่วนลด 1 action; สิทธิ์พนักงานมี 117 controls. นับ controls ไม่ใช่จำนวนโมดูลธุรกิจหรือการรับรองว่าฟีเจอร์ demo รับเงินจริงได้

ช่องทางที่ยังเป็น demo เช่น CRM/สมาชิก/คูปองหรือ payment draft ไม่ถูกทำให้เป็น production backend ด้วยสวิตช์นี้ และยังไม่มีโควตาอุปกรณ์เพราะ schema เดิมไม่มี resource ดังกล่าว

## กฎที่ API บังคับ

1. ค่าตั้งต้นแพ็กเกจ → ข้อยกเว้นรายร้านที่ยังไม่หมดอายุ → สิทธิ์พนักงาน → สิทธิ์สาขา → กฎธุรกรรมเดิม
2. Staff allow ไม่สามารถฝ่าการปิดฟังก์ชันระดับร้าน; Owner ร้านก็ถูกปิด business function ได้จากแพ็กเกจ/ข้อยกเว้น
3. ไม่เปลี่ยน role ใน JWT หรือ actor ให้เป็น Owner/Manager เพื่อผ่านสิทธิ์; อ่าน membership และ rules จาก DB ใหม่
4. เปิดแก้ข้อมูลกลางทั้งร้านให้พนักงานได้ แต่ต้องมี grant ทุกสาขาปัจจุบัน; สินค้า/สูตร/แผนบุฟเฟ่ที่แชร์ทั้งร้านจะไม่เปิดให้พนักงานบางสาขาแก้ข้ามขอบเขต
5. Export ต้องผ่านทั้งสิทธิ์ export และ view ที่เกี่ยวข้อง รวม alternate export ของสต็อก/สินค้าขายดี
6. ส่วนลดต้องผ่าน action switch เพิ่มจาก checkout; วงเงินตามบทบาทและการอนุมัติตัวเอง/วงเงินผู้อนุมัติยังใช้กฎเดิม การเปิดฟังก์ชันไม่เพิ่มวงเงินทางการเงิน
7. การอนุมัติด้วยรหัสผู้จัดการตรวจสิทธิ์ฟังก์ชันอนุมัติและสาขาของผู้อนุมัติด้วย ไม่ใช่ตรวจแค่รหัสผ่าน
8. QR guest/public storefront ตรวจ entitlement หลังระบุ tenant จาก capability ที่ถูกต้อง; ปิดการสั่ง/เรียกบริการไม่สร้าง bill/stock เพิ่ม
9. POS โหลดเฉพาะข้อมูลที่ได้รับสิทธิ์ การปิด KDS ไม่ทำให้ส่วนอื่นของ POS โหลดล้มทั้งหมด
10. ปิด/ถอนสิทธิ์มีผลกับ request ถัดไป แม้ token เดิม; request ที่ผ่าน authorization และกำลังทำงานไม่ถูกย้อนยกเลิก

บัญชี/บทบาท/สิทธิ์สาขา/สิทธิ์ฟังก์ชัน/แพ็กเกจและนโยบายวงเงินส่วนลดเป็น control plane สงวน Owner หรือ platform admin ตามระดับ ไม่ใช่สิทธิ์ที่มอบให้พนักงานเพิ่มสิทธิ์ตนเองได้; auth/health/รายการสาขาตาม grants/ข้อมูลบัญชีพื้นฐานคงใช้ได้เพื่อแก้การตั้งค่าไม่ให้ล็อกตัวเองออก

SSE ตรวจ entitlement สดใน heartbeat ไม่เกินรอบ 20 วินาที; การปิดฟังก์ชันไม่ใช่ remote wipe ของข้อมูลที่เคยดาวน์โหลด/เก็บ offline. API เป็นตัวตัดสินสิทธิ์ ข้อมูลออฟไลน์ต้องผ่าน API ใหม่เมื่อ sync

## ติดตั้ง/ย้ายจาก v9.0

สำรองฐานและตรวจ restore ก่อน หยุด API เดิม รัน `npm ci`, `npm run db:init` แล้วเปิด API ใหม่ รุ่นนี้เพิ่ม 7 ตารางโดยไม่ลบข้อมูลหรือแจก platform admin ให้ใคร:

`platform_admins`, `plan_function_rules`, `tenant_function_rules`, `staff_function_rules`, `tenant_limit_overrides`, `function_control_versions`, `function_control_audit`

สคริปต์ setup:local สำหรับ environment ใหม่สร้าง PLATFORM_JWT_SECRET แยกจาก JWT_SECRET แล้ว; environment เก่าต้องเพิ่มค่าสุ่มอย่างน้อย 32 ตัวอักษรที่ต่างกัน ตั้งฝั่ง server เท่านั้น ห้ามส่งค่า secret ไป frontend. ถ้าไม่ตั้ง ระบบ POS เดิมยังทำงาน แต่ platform login ได้ 503

ให้ผู้ดูแลเครื่องอนุญาตบัญชีที่สร้างไว้แล้ว ผ่าน trusted CLI เท่านั้น:

```sh
npm run platform:admin -- --email admin@example.com --enable
# ถอนสิทธิ์ รวม token แพลตฟอร์มที่ยังไม่หมดอายุ
npm run platform:admin -- --email admin@example.com --disable
```

ต้องใช้ DATABASE_URL ของ environment ที่ตั้งใจจัดการ ไม่ใช่คำสั่งให้พนักงานร้านเรียกได้ผ่าน HTTP. CLI audit ระบุ trusted operator และ actor_id เป็นบัญชีเป้าหมาย bootstrap ไม่ได้อ้างว่าเป็นผู้ใช้ HTTP ที่ login แล้ว

Docker Compose ส่ง PLATFORM_JWT_SECRET เข้า app แล้ว; ใช้ `docker compose exec app npm run platform:admin -- --email ... --enable` ได้เมื่อ build ใหม่ แต่ Docker build/CLI against native DB ยังไม่ได้ทดสอบใน runtime นี้

Token แพลตฟอร์มใช้ secret แยก, audience/issuer aile-platform, อายุ 30 นาที และตรวจ platform_admins.active ทุก request; tenant token ใช้แทนไม่ได้. ใช้ HTTPS ในระบบจริง ห้ามใส่ token ใน URL

## Backup / Restore และข้อจำกัด

Business snapshot ตรวจตารางสิทธิ์ใหม่ทั้งหมดด้วย จึงตรวจการเปลี่ยน grants/rules/expiry/quotas/audit ได้หลัง restore. Embedded physical dump/load และตรวจสิทธิ์จากข้อมูลคืนกลับผ่าน แต่ native pg_dump/pg_restore ยังไม่ได้รัน

เทียบ business manifest ทันทีหลัง restore ก่อนรัน db:init หรือเปิดรับงาน: schema เดิมมีการเติมพิกัดให้โต๊ะที่ยังไม่มีพิกัด ซึ่งเป็นการเปลี่ยนข้อมูลที่ถูกต้องตาม migration เดิมและทำให้ hash ทั้งฐานเปลี่ยนได้. Regression v9.1 ตรวจว่า rules/สิทธิ์ไม่ฟื้นเมื่อรัน schema ซ้ำ แยกจากการเทียบทุกตารางก่อน/หลัง physical restore

Native PostgreSQL concurrency/หลาย API instance, RPO/RTO, full POS Browser E2E, production load/latency และ native mobile builds ยังต้องยืนยันก่อน pilot. ไม่ใช้ผล embedded ทดแทนหลักฐาน native
