# v9.5 — พักส่งหลัง Restore และตรวจข้อความปลายทาง

29 ตุลาคม 2026 (Asia/Bangkok) · ต่อจาก ZIP v9.4 ที่ตรวจ SHA256 แล้ว · ยังไม่อนุมัติ Production/Pilot

## อัปเดตจาก v9.4

หยุด API writes และ Worker เก่าทุกตัวก่อนสำรอง/อัปเดต. รัน npm ci แล้ว npm run db:init ก่อนเปิด v9.5. เพิ่ม notification_queue_controls, notification_destination_reviews และ columns requires_restore_review/review_revision ใน delivery. Worker v9.4 ไม่รู้จัก gate จึงห้ามรันปน. สำรองและคง NOTIFICATION_ENCRYPTION_KEY เดิม ไม่ส่ง secrets ในแชตหรือบันทึกลงรายงาน

Main sidebar → ตั้งค่าแจ้งเตือนแพลตฟอร์ม → สุขภาพและคิว. Owner เลือกสาขา ระบุเหตุผลอย่างน้อย 10 ตัวอักษร แล้วพักหรือเปิดส่ง. Manager/Cashier ใช้ control/review ไม่ได้ และ tenant/branch scope เดิมยังตรวจตาม API

## พักส่งทำงานอย่างไร

Worker ข้ามงานในสาขาที่พักและงานที่ requires_restore_review=true. ก่อน provider I/O จะถือ shared row lock ของ control ภายใน transaction จนบันทึกผลเสร็จ. คำสั่งพักรอ send transaction ที่กำลังทำงานจบก่อนตอบรับ. จึงไม่สามารถถอนข้อความที่ส่งออกไปแล้วหรืออยู่ระหว่างการส่งได้

Pause ไม่ปิดการขายหรือการสร้างออเดอร์/outbox. Scheduler ยังสร้างงานตาม policy; งานที่เกิดใหม่ระหว่างพักเริ่มส่งเมื่อเปิดคิวตามสิทธิ์/เงื่อนไขเดิม. ไม่แก้เงิน สต็อก BOM หรือ idempotency ของการขาย

## Restore ที่มี guard

1. หยุด API writes/Worker ทุก instance รวมรุ่นเก่า และสำรอง key แยกอย่างปลอดภัย
2. ใช้ backup เดิมสร้าง dump + checksum + business manifest; restore ลงฐานใหม่ที่ว่างด้วย npm run restore:drill ตาม BACKUP_RESTORE_TH.md
3. v9.5 drill ตรวจ exact business snapshot ก่อนเปลี่ยน schema/control จากนั้นเรียก quarantine แม้ audit ไม่ผ่าน (หาก restore สำเร็จแล้ว). บัญชีสาขาที่ restore มาถูกพักทั้งหมด งานที่ยังไม่ final ถูก requires_restore_review=true และ review_revision เพิ่มเพื่อไม่ให้ใช้ผลตรวจจาก backup อนุมัติส่งซ้ำ. Heartbeat เก่าถูกทำเป็น stopped
4. Manifest v9.4 ที่ไม่มีสองตารางใหม่ตรวจด้วยชุดตารางเดิมก่อน migration; snapshot หลัง migration/gate ย่อมเปลี่ยนโดยตั้งใจ. สำหรับรุ่นเก่ากว่านั้นให้ใช้ tool ที่ตรง schema/manifest แล้วทำ migration และ hold ตามคู่มือ ห้ามอ้างว่า audit ข้ามรุ่นผ่าน
5. ถ้าใช้ pg_restore หรือเครื่องมืออื่นเอง จะไม่ตรวจพบการ restore โดยอัตโนมัติ ต้องรัน `npm run notifications:restore-hold` บนฐานที่กู้คืน **ก่อนเปิด Worker** โดยตั้ง DATABASE_URL และ AILE_RESTORE_HOLD_CONFIRM ให้ตรงชื่อฐานนั้นทุกตัวอักษร. CLI เป็น trusted operator action ไม่ปลอมชื่อ Owner ใน audit; เก็บ runId/ผลลัพธ์และ log ผู้ปฏิบัติการของระบบ
6. หาก guard/migration/audit คำสั่งใดล้มเหลว ให้คง Worker ปิดไว้และแก้ปัญหาก่อนเปิด. การทดสอบ native drill ยังไม่ได้รันใน environment นี้
7. Owner เปิดคิวได้หลังตรวจสภาพแวดล้อม งานที่ยังถูกกักไว้จะไม่ส่งแม้เปิด Worker แล้ว งานใหม่ที่ไม่ถูกกักไว้ทำงานได้ตามปกติ

ไม่อ้าง exactly-once สำหรับผลภายนอกหลัง restore ย้อนเวลา. งานที่ backup ระบุ pending อาจถึงผู้รับไปแล้วในเวลาภายหลัง จึงต้องตรวจปลายทางก่อนปล่อยส่งใหม่

## บันทึกผลตรวจทีละรายการ

เปิดรายละเอียดรายการ unknown หรือรายการที่รอตรวจหลัง Restore แล้วเลือก:

| ผลตรวจ | ผลต่อคิว |
|---|---|
| ยังยืนยันไม่ได้ | เก็บหลักฐาน ยังไม่ส่งใหม่ |
| ตรวจแล้วไม่พบข้อความ | เก็บหลักฐาน ยังไม่ส่งใหม่ |
| ยืนยันพบข้อความแล้ว | ปิดงานเป็น cancelled / HUMAN_CONFIRMED_RECEIVED โดยไม่ส่งซ้ำ ไม่เปลี่ยนเป็น provider accepted และไม่เพิ่ม sent_at |

กรอกเหตุผล/หลักฐาน 10–1000 ตัวอักษร เช่น ช่องทางและเวลาที่ตรวจ โดยไม่กรอก token. เก็บ actor UUID/email, เวลา DB, note, finding, attempt และ revision; มี notification audit ใน transaction เดียวกัน. หาก audit ล้มเหลว ผลตรวจและการเปลี่ยนสถานะ rollback ด้วย

หากยังต้องลองใหม่ ให้กดลองส่งอีกครั้งแล้วอ่าน/ยืนยันความเสี่ยงได้รับซ้ำ. Unknown และงานจาก Restore ต้องมีผลตรวจปัจจุบันก่อน retry; ผลตรวจเก่าจาก backup ใช้ไม่ได้. บันทึกผลตรวจไม่ได้อนุมัติการคืนเงินและไม่เปลี่ยนธุรกรรม POS

เมื่อหน้าจอหรือ attempt/revision เปลี่ยน API ปฏิเสธ stale write ให้โหลดรายละเอียดใหม่. ส่งคำขอเดิมซ้ำไม่สร้างผลตรวจซ้ำ เพราะ revision ถูกใช้ไปแล้ว. ประวัติ detail แสดง 50 ผลตรวจล่าสุด; audit เดิมยังอยู่ หากลบ connection ตัว delivery/review จะถูกลบตาม FK แต่ audit ผลตรวจและการลบบัญชียังคงอยู่

## ผลทดสอบรอบนี้และข้อจำกัด

- Unit 412/412 และ regression engine เดิม 10 scripts ผ่าน รวม worker subprocess SIGKILL/restart/embedded restore. ชุด retry และ Browser v9.4 ผ่านซ้ำ
- v9.5 operations: physical embedded restore + hash ก่อน quarantine, migration จาก v9.4, pause barrier, งานใหม่/งานกัก, ผลตรวจเก่าจาก backup ใช้ไม่ได้, สิทธิ์ Owner/Manager/Cashier/tenant, stale revision และ audit rollback
- Browser ใช้หน้า POS ซื้อ/รับเงิน/ยืนยันจริง และหน้า guest QR เพิ่มสินค้า/ส่งจริง เข้า Express/JWT/embedded SQL/outbox ไม่มี route mocks. ทดสอบ pause/resume, human review/retry และ guard UI ด้วย SQL function เดียวกับ Restore. Physical restore แยกอยู่ใน engine scenario ไม่ได้รัน pg_restore ผ่าน Browser
- Load fixture 240 งาน แบ่ง batch 17/80, accepted ครั้งเดียวทุกงาน, 6 งาน HTTP429/backoff/กลับมาส่ง, Discord unknown ไม่ auto retry, LINE ตอบ503ช้า และขายได้201/ยอด100cents/stockเหลือ9. เป็น fixture/smoke ไม่ใช่ capacity/SLO หรือ native parallel proof
- Provider ทุกตัวเป็น fake transport ไม่มีข้อความส่งเข้าบัญชีจริง. ข้อความ accepted ไม่ใช่หลักฐานผู้รับได้รับจริง
- Native PostgreSQL/Docker และ native backup/restore/RPO/RTO ยังไม่ยืนยัน. Docker ENOENT; local runner หยุดก่อน cluster เพราะ root-only runtime. รายการ native เตรียม 22 suites หรือ24เมื่อ AILE_NOTIFICATION_BROWSER=1 พร้อม Playwright/Chromium
- Discord/LINE/Telegram บัญชีจริง และ Instagram app permission/conversation ยังไม่มี credentials/ปลายทางที่อนุญาต จึงไม่ได้ทดสอบ. ใช้ V94_NOTIFICATION_ACCEPTANCE_TH.md เป็น checklist รอ staging จริง

เครื่องพิมพ์จริงยังเลื่อน. ไม่มี dependency upgrade และไม่เพิ่มโมดูล POS ใหม่ในรอบนี้
