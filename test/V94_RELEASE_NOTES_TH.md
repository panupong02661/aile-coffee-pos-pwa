# AILE POS Cloud v9.4 — Notification Validation & Retry Safety

29 ตุลาคม 2026 (Asia/Bangkok) · ต่อจาก ZIP v9.3 เต็ม · package/lockfile 9.4.0

## เปลี่ยนจริง

- แก้ LINE automatic retry ที่เดิมตรวจอายุหลังเรียก provider: งานที่เคยพยายามแล้วและอายุอย่างน้อย 23 ชั่วโมงหยุดก่อน I/O เป็น unknown / RETRY_WINDOW_EXPIRED. นับจากเวลาสร้างงานอย่างระมัดระวัง จึงอาจหยุดก่อน 23 ชั่วโมงจากการส่งครั้งแรก; ไม่เพิ่ม schema และไม่แก้ยอดเงิน
- Owner ที่ตรวจปลายทางแล้วและยืนยันความเสี่ยงผ่าน manual retry ยังสั่งลองใหม่ได้ตามสิทธิ์เดิม. LINE 409 ที่มี accepted-request header เก็บ safe sentMessages.id เพื่ออ้างอิงเดิมได้
- เพิ่ม Browser lifecycle ผ่าน UI ตั้งค่าจริง + browser HTTP order APIs + Express/JWT/SQL: POS/QR/ออนไลน์, replay, source/provider/type switches, summaries ตัวเลขตรงกัน, unknown confirm/cancel, history และ role/tenant isolation. Provider เป็น fake transport ทั้งหมด
- เพิ่ม native runner แบบ local binaries ไม่ต้อง Docker สร้าง cluster แยกเองและต้องรัน non-root; backup helpers ตรวจ marker/token/UID/port/ชื่อฐานก่อนเรียก pg_dump/pg_restore. Docker runner เดิมยังอยู่
- Native list ร่วม 20 suites; AILE_NOTIFICATION_BROWSER=1 เพิ่มชุด browser เป็น 21 suitesเมื่อเตรียม Playwright/Chromium แล้ว. Native execution ยังไม่ผ่าน preflight ในเครื่องนี้
- เพิ่ม restore regression: สถานะ/hash ฐาน embedded กลับมาครบ และ LINE pending เกินอายุ/unknown ไม่ถูกส่งอัตโนมัติ
- cache v94 และ sync shell assets; ไม่ build APK/IPA. ไม่มี dependency upgrade หรือ schema migration เพิ่มจาก v9.3

## รันจริง

- npm ci exit 0 (มี transitive deprecation warnings เก็บ log; ไม่ได้อ้างว่า audit/upgrade แล้ว)
- npm test 412/412, npm run check และ syntax JS/MJS 240 ไฟล์/Python ผ่าน
- Regression engine เดิม 10 scripts ครอบคลุม refund rollback, transaction, KDS, branch, reports, recovery, functions, notifications, health, worker process ผ่าน
- Browser lifecycle 1 test ผ่าน: fake-provider acceptance 24 ครั้ง สรุปยอดจริงใน fixture ฿3.75 และ scheduler ไม่สร้างซ้ำ. การสร้างออเดอร์ใช้ browser HTTP API ไม่ใช่คลิกขายผ่านหน้าจอ POS/QR/customer app เต็มเส้นทาง
- Retry/physical embedded restore 2 tests ผ่าน; worker subprocess SIGKILL/restart และ restore เดิมผ่านซ้ำ
- Live preflight exit 2 ready=false; ไม่ส่งข้อความจริงเลย
- Native Docker exit 1: docker ENOENT; local exit 1: เป็น root, UID map มีเพียง root และสร้าง user namespace เพิ่มไม่ได้. ไม่มี native cluster เริ่ม ไม่ใช้ PGlite แทนหลักฐาน concurrency

## งานที่ยังไม่สำเร็จ

Discord/LINE/Telegram actual receipt + lifecycle/schedule, Instagram app/permissions/live conversation, native multi-worker/pg_dump/restore/RPO/RTO และ native browser ยังไม่ได้ทดสอบ. จึงยังไม่รับรองพร้อม production/pilot

อ่าน V94_NOTIFICATION_ACCEPTANCE_TH.md, PROJECT_STATUS_TH.md, NEXT_STEPS_TH.md, TEST_RESULTS_TH.md และ CHANGED_FILES_TH.md. Logs/exit codes อยู่ validation/v94-*.json/log. เก็บ failure ระหว่างตั้งค่า harness ไว้และแยกจากผลสุดท้ายที่ผ่าน
