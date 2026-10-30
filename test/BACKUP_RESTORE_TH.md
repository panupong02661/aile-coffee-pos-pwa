# v9.5 — Notification Restore Hold

หลังหยุดAPIwrites/Workerทั้งหมด built-inrestore:drillตรวจexactธุรกรรมก่อนmigrationแล้วเรียกquarantineทุกสาขา/กักnonfinaljobs/invalidateผลตรวจเดิม. Manualpg_restoreให้รันnotifications:restore-holdพร้อมDATABASE_URLและAILE_RESTORE_HOLD_CONFIRM=ชื่อฐานจริงก่อนเปิดWorker. ถ้าguardหรือauditfailคงWorkerปิดไว้. อ่าน V95_RESTORE_QUEUE_TH.md; nativepg_dump/restore/RPO/RTOยังไม่ได้ยืนยันจริง

---

# สำรองและกู้คืนฐานข้อมูล — AILE POS Cloud v1.2

> **สำคัญ:** ทำงานเฉพาะกับฐานข้อมูลที่คุณมีสิทธิ์ดูแล สำรองข้อมูลก่อนรัน Migration ทุกครั้ง การสำรองสำเร็จไม่ได้ยืนยันว่ากู้คืนได้ ต้องซ้อมกู้คืนจริงเป็นประจำ

## สำรองข้อมูล (Backup)

1. ติดตั้ง PostgreSQL client tools (`pg_dump`, `pg_restore`) รุ่นที่รองรับเซิร์ฟเวอร์ PostgreSQL 16
2. ตั้งค่า `.env` ให้ `DATABASE_URL` ชี้ไปยังฐานข้อมูลเป้าหมายที่ถูกต้อง (หลีกเลี่ยงการเปิดเผยรหัสผ่าน)
3. เปิด Terminal จากโฟลเดอร์โปรเจกต์แล้วรัน:

```bash
npm run backup
# หรือเก็บไว้ในไดเรกทอรีเฉพาะ
node scripts/backup.mjs --dir ./backups
```

ไฟล์ `.dump` ที่ได้ **ไม่ได้เข้ารหัสอัตโนมัติ** ต้องเข้ารหัสก่อนส่งขึ้นคลาวด์และจำกัดสิทธิ์เข้าถึง อย่า Commit ไฟล์เหล่านี้ลง Git

## ตรวจสอบไฟล์

```bash
pg_restore --list backups/<filename>.dump
```

## ทดลองกู้คืนกับฐานข้อมูลแยก (ไม่ใช่ระบบใช้งานจริง)

1. สร้างฐานข้อมูล **ใหม่** ชื่อเช่น `pos_restore_test`
2. ปิดการเชื่อมต่อจากแอปที่ใช้ฐานข้อมูลทดสอบนั้น
3. กู้คืนผ่านคำสั่งด้านล่าง โดยตรวจชื่อฐานข้อมูลปลายทางให้แน่ใจ:

```bash
createdb -h localhost -U pos pos_restore_test
pg_restore -h localhost -U pos -d pos_restore_test --no-owner --no-privileges backups/<filename>.dump
```

4. ตรวจจำนวนร้านค้า/สาขา/ยอดขาย, foreign keys และทดสอบ API บนฐานข้อมูลทดสอบ
5. วางแผน RPO/RTO, ทดสอบกู้คืนแบบมีเวลา และแยกสำเนาไว้คนละสถานที่

**เครื่องมือ v1.2 มีสคริปต์สำรอง แต่ยังไม่มีระบบสำรองตามเวลา/สำรองขึ้นคลาวด์/กู้คืนอัตโนมัติ**


## v9.0 Business audit

Backup script ใหม่สร้าง .business.json ที่ผูกกับ dump checksum และ snapshot เดียวกัน. Restore drill ตรวจทุก public table และยอดรวม รวม grants/marker/audit. Legacy archive ที่ไม่มี sidecar ยัง restore ได้แต่ business unverified/CLI exit 3; ดู REPORT_RECOVERY_TH.md. pg_dump/pg_restore จริงยังไม่ผ่านการทดสอบใน runtime ที่ไม่มี Docker/PostgreSQL tools


## v9.1 — สิทธิ์และแพ็กเกจ

Business snapshot เพิ่ม required tables ของ platform admin, package rules, tenant/staff overrides, quota expiry, versions และ audit อีก 7 ตาราง. Physical embedded restore พร้อมข้อมูลเหล่านี้ผ่าน; native pg_dump/restore ยังไม่รัน. เทียบ manifest ก่อน db:init เพราะ legacy layout initialization สามารถเปลี่ยนพิกัดโต๊ะที่เป็น null ได้โดยตั้งใจ. ดู FUNCTION_CONTROL_TH.md และ TEST_RESULTS_TH.md


## v9.2 — Notification outbox และ encryption key

Snapshot รวม notification_policies/connections/events/deliveries/instagram_windows/audit/line_sources. เก็บ NOTIFICATION_ENCRYPTION_KEY เดิมอย่างปลอดภัยแยก dump; กู้ DB อย่างเดียวไม่ทำให้ decrypt ได้หาก key หาย

ปิด worker ก่อน restore และตรวจคิว/ปลายทางก่อนเปิดส่ง. สถานะ sent ที่ย้อนเวลากลับไปก่อนบันทึกอาจส่งซ้ำภายนอกสำหรับ provider ที่ไม่มี retry key; ไม่รับรอง exactly-once จาก business hash อย่างเดียว. Physical embedded restore ผ่าน แต่ native drill/live provider ยังไม่รัน ดู NOTIFICATIONS_TH.md


## v9.3 — Attempt/Heartbeat และ queue restore

เพิ่ม required snapshot ของ notification_delivery_attempts / notification_worker_heartbeats. หยุด Worker ก่อนเปรียบเทียบ hash เพราะ heartbeat เปลี่ยนตามเวลา. Engine physical restore และ restart queue ผ่าน แต่ native pg_dump/restore ยังไม่ได้รัน

ไม่เปิด Worker v9.2 ปน v9.3. LINE retry ใช้ UUID เดิม ส่วน provider อื่นที่ผลกำกวมต้องตรวจปลายทาง. อ่าน NOTIFICATION_OPERATIONS_TH.md สำหรับความเสี่ยง restore ย้อน accepted state และการตรวจคิวก่อนเปิดส่ง
