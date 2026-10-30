# PostgreSQL testing v9.7 — คืนเครื่องมือ v8.6 ที่แนบ

คืน docker-compose.v86.test.yml, v86-native-* scripts และcash-concurrency-db/guardtestsเดิม รวม4npm commandsที่ตกหล่น. Guardเก่าต้องaile_test_*; runnerใหม่สร้างaile_v86_test_*เอง จึงไม่ข้ามguardหรือใช้ฐานลูกค้าให้testผ่าน. ตรวจFEATURE_PARITY_TH.mdและlegacy/v86-attached

Unit guard13casesที่คืนมาผ่าน (รวม437ทั้งหมด). Oldpreflightexit1เพราะไม่มีexplicitdisposableconfirmation/env; Docker/localrunnerใหม่exit1ก่อนcluster. ไม่มีnativeconcurrency/pg_dump/restore/RPO/RTOจริงรอบนี้ ไม่ใช้browsermenusหรือPGliteเป็นหลักฐานnative

ไม่มีschemaเปลี่ยนจากv9.6 และไม่ทับAPI/schemaด้วยv8.6. ข้อกำหนดrestorehold/keyเดิมยังใช้

---

# PostgreSQL testing v9.6

Native list24 suites เพิ่ม v96_cost_db และ v96_snapshot_db; optional browser3ชุดรวม27เมื่อ AILE_NOTIFICATION_BROWSER=1. Snapshot test ใช้คนละ connection/transaction: writer commit หลัง reader count แต่ก่อน items; รายงานแรกต้องเห็น1บิลครบชุด รายงานถัดไปเห็น2บิล. ยังไม่ได้รันจริง

Menu profitability ใช้ REPEATABLE READ READ ONLY connection เดียว. Embedded SQL ยืนยัน isolation/read-only/rollback หลัง forbidden write และ financial fixtures ได้ แต่ไม่ใช้รับรอง native writer race. Docker/local runtime รอบนี้ exit1 ก่อน cluster ดู validation/v96-results.json

ไม่มี schema migration เพิ่มจากv9.5; restore hold และ key เดิมยังต้องใช้. อ่าน COST_RECONCILIATION_TH.md และ V95_RESTORE_QUEUE_TH.md

---

# PostgreSQL testing v9.5

Native list22suites เพิ่มv95_operations_db/v95_load_db; AILE_NOTIFICATION_BROWSER=1เพิ่มv94browserและv95_ui_dbรวม24. ใช้Dockerเดิมหรือlocalbinariesnon-root; รอบนี้ทั้งสองทางexit1ก่อนcluster ไม่มีnativeevidence

WorkerSQLถือcontrolsharedlockระหว่างproviderI/Oและfinish; pauseรอtransactionก่อนตอบ. Nativeoperationsเตรียมpausebarrier/audit/review/restoreflag; workersเดิม4process/SKIPLOCKED/SIGKILL/pg_dump-restoreยังอยู่. Engineใช้serialPGliteจึงไม่ใช่nativepoolหรือlockproof

Businessauditตรวจbackupv9.4ด้วยชุดตารางเดิมก่อนเพิ่ม2ตารางในmigration. Built-inrestoredrillกักคิวหลังauditแม้auditfail; ไม่ใช้hashหลังguardเทียบกับก่อนmigrationเพราะเปลี่ยนโดยตั้งใจ. คู่มือ V95_RESTORE_QUEUE_TH.md

---

# ทดสอบ PostgreSQL สำหรับ v9.4

Docker runner เดิมและ native local runner ใหม่ใช้ native-test-list.mjs ร่วมกัน 20 suites (เพิ่ม v94_retry_db.mjs). เปิด AILE_NOTIFICATION_BROWSER=1 เพิ่ม v94_notifications_browser_db.mjs เป็น 21 suites ต้องติดตั้ง Python Playwright/Chromium และตั้ง CHROMIUM_PATH ตามเครื่อง

`npm run test:native-postgres-local` สร้าง local disposable cluster ด้วย random ports/password และ ownership marker; ต้อง non-root, PostgreSQL binaries ใน pg_config --bindir หรือ AILE_PG_BIN และ unset DATABASE_URL. Backup wrappers v90/v93 รองรับ local tools ผ่าน token/UID/port/name guard และยังรองรับ Docker เดิม. ไม่ใช้กับฐานลูกค้า

ผลจริงรอบนี้: Docker exit1 ENOENT; native local exit1 non-root required. Environment UID map มี root เท่านั้น และ unshare ล้มเหลว. ไม่มี cluster เริ่ม ดู validation/v94-native-docker.log / v94-native-local-final.log / v94-environment.json. Native race/pg_dump/restore/browser/RPO/RTO ยังไม่ได้ทดสอบ

412 unit, regression engine 10 scripts, Browser real UI settings/browser HTTP API + embedded SQL และ retry/embedded physical restore ผ่าน; ไม่ใช่ native concurrency/live-provider proof. ขั้นตอนพร้อมเกณฑ์ดู V94_NOTIFICATION_ACCEPTANCE_TH.md

---

# ทดสอบ PostgreSQL สำหรับ v9.3

Native runner มี 19 scripts เพิ่ม v93_queue_db.mjs / v93_workers_db.mjs. Worker ปกติ=0 ระหว่างทดสอบ ทุก provider เป็น IPC fake transport. ชุด workers ใช้ 4 subprocesses/barrier/อย่างน้อย 2 processes ได้ claim จริง จากนั้น SIGKILL และ pg_dump/restore ลงฐานว่างที่ runner เป็นเจ้าของ

ผลรอบนี้ exit 1 ก่อนสร้าง cluster: Docker ENOENT ไม่มี native binaries. ดู validation/v93-native.log / v93-native-result.json ไม่ใช้ผล engine/RPC เป็น native concurrency proof

npm run test:notification-health-engine และ npm run test:notification-workers-engine ใช้ PGlite. AILE_NOTIFICATION_BROWSER=1 เพิ่ม Chromium ของชุด health (ต้องมี Python Playwright/CHROMIUM_PATH). การทดสอบจริงและ operator live acceptance อยู่ใน NOTIFICATION_OPERATIONS_TH.md

# ทดสอบ PostgreSQL สำหรับ v9.2

Native runner ปัจจุบัน 17 scripts รวม v92_notifications_db.mjs. ตั้ง NOTIFICATIONS_WORKER_ENABLED=0 และ key disposable ใน runner เพื่อไม่ให้ main API ส่งข้อความจริง; scenario ใช้ fake provider transport ที่ inject เข้า dispatcher เท่านั้น

ผลรอบนี้: exit 1 ก่อนสร้าง cluster เพราะ Docker ENOENT ดู validation/v92-native.log และ validation/native-d4ab51b84d7b8b0b/results.json. ไม่ใช่ผลผ่าน native PostgreSQL

npm run test:notifications-engine ใช้ Express/JWT/SQL จริงบน PGlite และ physical embedded restore. AILE_NOTIFICATION_BROWSER=1 เพิ่ม Python Playwright/Chromium E2E; ตั้ง CHROMIUM_PATH ตาม executable ที่มี. อ่าน NOTIFICATIONS_TH.md ก่อนทดสอบ live/restore และห้ามใช้ DATABASE_URL ลูกค้าจริงกับชุด destructive tests

# ทดสอบ PostgreSQL สำหรับ v9.1

Native runner ปัจจุบันมี 16 scripts รวม v91_functions_db.mjs ท้ายชุด โดยตั้ง PLATFORM_JWT_SECRET แยกใน environment disposable. v9.1 native test เพิ่ม concurrent configuration editor คาดหวัง 200/409 พร้อม tenant/staff/package/expiry/quota และ rollback audit regression

ผลรันจริงรอบนี้: Docker ENOENT, runner exit 1 ก่อน cluster init. Native PostgreSQL ยังไม่ได้ทดสอบ; engine SQL และ DB-backed Chromium ใช้ PGlite ไม่ใช่ native pg-wire/pooling. ดู validation/v91-native.log และ validation/native-df9d1ed933e4862f/results.json

npm run test:functions-engine รัน API/JWT/SQL และ physical embedded restore. เปิด AILE_FUNCTION_BROWSER=1 เมื่อติดตั้ง Python Playwright/Chromium; CHROMIUM_PATH ระบุ executable ได้. ไม่ควรรัน test:functions-db ด้วย DATABASE_URL ลูกค้าจริง; guard ยอมเฉพาะ disposable localhost aile_v86_test_* และ confirmation ตามคู่มือเดิม

# ทดสอบ PostgreSQL สำหรับ v9.0

## Disposable native PostgreSQL

ต้องมี Node 20+, Docker CLI และ Docker daemon ที่ใช้งานได้ จากโฟลเดอร์โปรเจกต์รัน:

```sh
npm ci
npm run test:native-postgres
```

runner ใช้ postgres:16-alpine สร้าง container ชื่อสุ่มและฐาน aile_v86_test_* บน tmpfs, bind เฉพาะ loopback, สร้าง secret ใหม่, รัน db:init และ API ของตนเองด้วย pool 4 ไม่มีการใช้ DATABASE_URL เดิมเพื่อเลือกฐานเป้าหมาย

รัน integration v11/v12/v13/v28/v61/v62/v81/v84/v85/v86/v87/v88/v89 ตามลำดับ เก็บ stdout/stderr และ exit code ที่ validation/native-*/results.json และ log รายชุด จากนั้นหยุด API และลบ container ที่ runner สร้างเอง หาก process ถูก kill แบบบังคับให้ตรวจ container ที่มี label aile.disposable-test ก่อนลบเฉพาะของรอบทดสอบ

ไม่มี Docker ให้ command จบ exit 1 ที่ preflight ไม่ถือว่าผ่าน PostgreSQL tests

## Fault injection กับ API ทดสอบที่เตรียมเอง

ใช้เฉพาะฐาน localhost ที่ชื่อ aile_v86_test_* และ API ซึ่งชี้ฐานเดียวกัน ตั้ง DATABASE_URL, TEST_BASE_URL, AILE_E2E_CONFIRM=I_CONFIRM_DISPOSABLE_POS_DATABASE, NODE_ENV=test แล้วรัน npm run test:refund-rollback-db

สคริปต์สร้างข้อมูลเฉพาะ tenant ใหม่ ติดตั้ง triggers ชื่อสุ่มแบบ tenant-scoped และลบใน finally; ต้องมีสิทธิ์ CREATE FUNCTION/TRIGGER. หากหยุด process รุนแรง ให้ทิ้งฐาน disposable ทั้งฐานหลังเก็บหลักฐาน

## Embedded SQL regression

`npm run test:refund-rollback-engine` รัน tests/v86_refund_rollback_engine.mjs ซึ่งรัน schema เต็มและ Express routes จริงบน PGlite โดยตรง ตรวจ rollback SQL 5 จุดและ retry/replay; ผลนี้ไม่ยืนยัน native PostgreSQL locks หรือ connection pool

## ขอบเขตที่ยังค้าง

Fault จุดสุดท้ายอยู่ที่ audit insert ก่อน COMMIT; ยังไม่ใช่ crash หลัง commit ก่อนส่ง HTTP response. ชุด v8.6 เน้น refund rollback; sale/settle-cash fault injection เพิ่มใน v8.7 บน embedded engine แล้ว; native proof และ backup/restore ยังต้องทำต่อ


## v8.7

`npm run test:transactions-engine` รันทดสอบ API ทั้งระบบบน embedded engine. `npm run test:transactions-db` ใช้ native API localhost และ DATABASE_URL disposable เช่น v8.6, DB_POOL_MAX>=2; สร้าง proxy localhost เพื่อทำ response loss หลัง upstream ตอบครบ และรันทดสอบ race จริงสองคำขอพร้อมกัน. ใช้ native runner จัด env และ lifecycle ให้โดยอัตโนมัติ

## v8.8

npm run test:kds-returns-engine ใช้ API + schema จริงบน PGlite; npm run test:kds-returns-db ใช้ native API/DB และทดสอบ confirm/refund กับ preparing/refund พร้อมกัน โดยต้อง DB_POOL_MAX>=2. Docker runner รวมชุดนี้แล้ว

## v8.9

npm run test:branch-access-engine ใช้ full schema และ API จริงบน PGlite; test:branch-access-db ใช้ native disposable DB/API. Docker runner รวม 13 scripts และ restart API ต่อ suite เพื่อคง rate limiter จริงโดยไม่สะสม registrations ข้ามชุด

## v9.0

Native runner รวม 15 scripts โดยเพิ่ม reports/branch subsets และ actual API SIGKILL/restart + pg_dump/pg_restore ไปฐาน aile_restore_drill_* แยก. ตั้ง AILE_TEST_PG_CONTAINER ให้จาก runner เท่านั้น; native recovery ไม่ใช้ฐานอื่นนอก disposable prefixes. ใน runtime นี้หยุดที่ Docker preflight ไม่ถือว่าผ่าน native tests

Embedded: test:reports-scope-engine และ test:recovery-engine. Browser report E2E ใช้ AILE_REPORT_BROWSER=1 และ Python Playwright/Chromium; ทดสอบ real API/SQL แต่ยังเป็น embedded DB
