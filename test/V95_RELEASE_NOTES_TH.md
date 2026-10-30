# AILE POS Cloud v9.5 — Restore Hold & Destination Review

29 ตุลาคม 2026 (Asia/Bangkok) · ต่อจาก ZIP v9.4 เต็ม · package/lockfile 9.5.0

## เปลี่ยนจริง

- Persistent pause/resume รายสาขา พร้อม Owner reason/revision/audit; Worker ตรวจ gate ก่อน I/O และถือ shared lock จนบันทึกผล
- Restore drill ตรวจ snapshot ก่อน migration แล้วพักทุกสาขา/กัก nonfinal jobs; เพิ่ม trusted manual-restore hold CLI. เพิ่ม review_revision หลัง Restore เพื่อบังคับตรวจใหม่ ผลตรวจจาก backup ใช้ปล่อยส่งซ้ำไม่ได้
- ผลตรวจปลายทางระบุผู้ตรวจ เวลา เหตุผล finding และ audit ใน transaction เดียว; unknown/restore jobs ต้องตรวจแล้วจึง retry พร้อมยืนยันความเสี่ยง. พบข้อความแล้วปิดเป็น cancelled ไม่ปลอมสถานะ provider accepted
- หน้าสุขภาพมีพัก/เปิดคิว จำนวนกักหลัง Restore และฟอร์ม/ประวัติตรวจปลายทาง; ซ่อนรายละเอียดเก่าระหว่างโหลดป้องกันแก้ฟอร์มผิดรายการ
- เพิ่มจริง 2 ตารางและ2columns; function catalog เพิ่ม3 Owner-only รวม137controls. ต้องหยุด Worker เก่าทุกตัวก่อน db:init ห้าม mixed versions
- Browser regression ผ่านหน้าจอขาย POS/หน้า QR จริงถึง notification outbox/fake receipts และ pause/review UI
- Load regression 240 backlog +6 rate-limit jobs + delayed503/unknown และตรวจขาย/stockยังถูกต้อง
- Native runners เตรียม22 suites, optional2 browser =24. ไม่มี dependency upgrade; sync static shells/cache v95 แต่ไม่ได้ build APK/IPA

## รันแล้ว

npm ci exit0; npm test412/412; npm check; regressionเดิม10 scripts; v9.4 retry2tests/Browser1test; v9.5 operations2tests/load1/UI1ผ่าน. Actual worker subprocess SIGKILL/restartผ่านซ้ำบน embedded SQL. Logs/exit codes: validation/v95-run-results.json, v95-final-results.json และ v95-current-results.json

## ยังไม่ผ่านจริง

Live preflight exit2 ready=false ไม่มี credentialsหรือปลายทางที่อนุญาต. Native Docker/local exit1 ก่อนcluster (ไม่มีDocker/ต้องnon-root). ไม่มี native concurrency/pg_dump/restore/RPO/RTO หรือ live Discord/LINE/Telegram/Instagram app checks. ไม่ใช้ unit/embedded/fake transport รับรองพร้อมPilot

อ่าน V95_RESTORE_QUEUE_TH.md, PROJECT_STATUS_TH.md, NEXT_STEPS_TH.md, TEST_RESULTS_TH.md และ CHANGED_FILES_TH.md. มีไฟล์เดิมครบ ไม่ลบฟีเจอร์เดิม
