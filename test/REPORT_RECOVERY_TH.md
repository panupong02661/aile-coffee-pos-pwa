# คู่มือ Report / Recovery v9.0

## เวลาและสาขา

รายงานธุรกิจใช้ Asia/Bangkok. API report date เป็น YYYY-MM-DD แบบรวม from/to ทั้งวัน; timestamp ที่แสดง/ส่งออกระบุเวลาไทย. Expense date เป็น calendar date เดิม, stock report เป็นยอดคงเหลือปัจจุบัน ไม่ใช่ historical stock as-of-date

เลือกหลายสาขาในตัวเลือก Backoffice แล้วกดค้นหา. API: `branchIds=UUID_A,UUID_C` หรือ repeated branchIds; branchId เดิมรองรับหนึ่งสาขา. ส่งทั้งสองรูปแบบพร้อมกันหรือส่ง empty branchIds ได้ 400. ทุก UUID ต้องอยู่ tenant และเป็น grant ปัจจุบันของ Manager; all-tenant โดยไม่ระบุ scope ยังคงต้องมีสิทธิ์ครบ

ไฟล์ส่งออกใช้ applied filters ของรายงานที่แสดง แม้ผู้ใช้แก้ช่องกรองแต่ยังไม่กดค้นหา. การ query export เป็นครั้งใหม่ ไม่ได้ freeze ชุดข้อมูลข้าม HTTP request; ข้อมูลใหม่อาจเพิ่มได้. เมนู profitability/ingredient analytics รองรับเลือกหลายสาขาและ CSV ตามข้อมูลที่โหลด

Refund totals ในรายงานยอดขายยังผูกวันขายบิลต้นทาง, daily cash reconciliation ใช้วันทำรายการจริง และ shift report เลือกตามวันเปิดกะ/shift_id. ต้องเทียบฐานธุรกรรมเดียวกันก่อนกระทบยอด ไม่รวมค่าคืนเงินที่คนละวันอย่างเงียบ ๆ

## Backup v9.0

ต้องมี native PostgreSQL และ pg_dump/pg_restore client tools. จากโฟลเดอร์โปรเจกต์ตั้ง DATABASE_URL แล้วรัน `npm run backup -- --dir /secure/backups`

ได้ 3 ไฟล์: `.dump`, `.dump.sha256.json`, `.dump.business.json`. เก็บทั้งชุดอย่างปลอดภัย. Business sidecar มี hashes/counts และยอดรวม ไม่ส่งออกรายละเอียดแถว แต่ dump มีข้อมูลจริงและต้องเข้ารหัสเมื่อเก็บนอกเครื่อง

Backup เปิด read-only repeatable-read transaction, export snapshot ให้ pg_dump และสร้าง business manifest จาก snapshot เดียวกัน. ใช้ SHA-256 ของ canonical row hashes ทุก public table พร้อมจำนวนแถวและ totals. Archive SHA-256 ถูกผูกใน business sidecar. Full hashing ใช้ทรัพยากรตามขนาดฐานและอาจถือ snapshot นาน ต้องวัดบนข้อมูลจริง

## Restore drill

สร้างฐานเปล่าชื่อ `aile_restore_drill_*` แยกจาก source และตั้ง RESTORE_DRILL_DATABASE_URL / RESTORE_DRILL_CONFIRM ให้ตรงชื่อ จากนั้น `npm run restore:drill -- /secure/backups/file.dump`

สคริปต์เดิมยังห้าม restore ทับ source/ฐานไม่ว่าง. ตรวจ dump checksum/archive, sidecar binding, restore เป็น transaction แล้วตรวจ required tables และ business hashes/totals รวม transaction, stock/BOM, tenant users marker, branch grants, permission audit และทุก public table เพิ่มเติม

เปรียบเทียบก่อนเปิด API หรือทำ migration/รับธุรกรรมใหม่บน target เพราะการเขียนที่ถูกต้องภายหลัง restore ก็จะทำให้ hash เปลี่ยน. เก็บฐาน target ที่ audit ไม่ผ่านไว้ตรวจ ห้ามถือว่า restore พร้อมใช้

Legacy dump ที่ไม่มี business sidecar ยัง restore ได้เพื่อความต่อเนื่อง แต่ตรวจได้เพียง schema และ CLI exit 3 พร้อม business.passed=false. ไม่ถือเป็น business proof; archive/sidecar ที่มีแต่ format/checksum ไม่ตรงถูกปฏิเสธ

## ทดสอบซ้ำ

- npm test / npm run check
- npm run test:reports-scope-engine (PDF text assertion ต้องมี Poppler/pdftotext)
- npm run test:recovery-engine
- AILE_REPORT_BROWSER=1 npm run test:reports-scope-engine (ต้องมี Python Playwright/Chromium; ตั้ง CHROMIUM_PATH ได้)
- npm run test:native-postgres สำหรับ Docker/native disposable (15 scripts)

Report browser ใช้ real API/JWT/SQL ไม่ mock; ใน runtime นี้ DB เป็น PGlite embedded. Recovery test ฆ่า API process จริง โดย DB engine อยู่ parent process ผ่าน test-only RPC adapter. Physical dump/load เป็นของ PGlite ไม่ใช่ pg_dump

Native tests v90_reports_db.mjs และ v90_recovery_db.mjs เตรียมแล้ว; recovery ใช้ PostgreSQL container ของ runner สร้าง dedicated restore database, exported snapshot pg_dump/pg_restore และ restart child API. Runtime นี้ไม่มี Docker จึงยังไม่ได้รัน native path หรือคำสั่ง backup/restore CLI จริง

## ยังต้องทำ

Native locking/concurrency, writing during backup, DB-backed Browser POS ขาย→ชำระ→คืน→ปิดกะทั้งระบบ, RPO/RTO, restore ภายใต้ข้อมูลจริง, Docker build และ native deployment verification ยังไม่ผ่านการยืนยัน
