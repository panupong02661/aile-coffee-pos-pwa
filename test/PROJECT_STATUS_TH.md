# สถานะ AILE POS Cloud v9.7

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก ZIP v9.6 เต็มและรวมกับ v8.6 Native Concurrency Readiness ที่ผู้ใช้แนบจริง. คืน12ไฟล์ที่ขาดและ4npm scriptsเดิม. API/schema v9.6 ไม่ downgrade; เก็บต้นฉบับZIP v8.6/เอกสารที่ชื่อชนใน legacy/v86-attached

เพิ่มsidebarกลาง25เมนู (24เดิม+notifications) ไม่พึ่งการแทรกด้วยregex; pinbootassets/atomicPWA cache และแก้buildersให้HTTP/Standalone/legacybuild/shellไม่ขาดmodules. ไม่พบfunctionชื่อเดิมหรือliteralAPI130routesจากv8.6ถูกตัดออกในsourceที่รวม. ไม่ล้างlocalStorage/IndexedDB

ผลจริง: Unit437/437/check/buildsผ่าน. Browserเทียบ24หน้า/54controls/62action keysกับv8.6ผ่าน HTTP Demo/Standalone9.7/legacy1.8; OwnerAPIเห็น25เมนู; customDemo fieldsคงอยู่, mobile390px/stale-cache/offlineผ่าน. Selectedtransaction/KDS/permissions/report/recovery/notification/restorehold/cost/UIregressionsผ่าน

ยังไม่ยืนยันสาเหตุบนเครื่องผู้ใช้: freshsourcev9.6แสดงเมนูครบในการทดสอบ ไม่ใช่ลบไฟล์เว็บ แต่แก้การประกอบsidebar/build/cacheเพื่อป้องกันตกหล่น. ข้อจำกัดDemo/Backendของv8.6ยังคงเดิม ไม่ปลดAPIguardให้Demoปะปนธุรกรรมจริง

Nativeold/newpreflightยังblocked, liveprovider/Instagram/hardwareยังไม่ทดสอบ. ไม่รับรองproduction. อ่าน V97_RELEASE_NOTES_TH.md, FEATURE_PARITY_TH.md, TEST_RESULTS_TH.md และ NEXT_STEPS_TH.md

---

# สถานะ AILE POS Cloud v9.6

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก ZIP v9.5 เต็มที่ตรวจ SHA256 ตรงกัน package/lockfile 9.6.0 ไม่มี schema หรือ dependency upgrade. เพิ่มรายงานต้นทุนใช้ไปหลังคืนสต็อกจาก BOM snapshot โดยเก็บ estimate เดิมไว้ และให้ Menu profitability อ่าน count/items/audit ใน read-only repeatable-read snapshot เดียว

แก้ Backoffice render helper 3 หน้าที่อยู่นอก closure: ต้นทุนหลังคืน/กระทบยอด/ประวัติอนุมัติส่วนลด. Browser ผ่านการเปิดกะ→ขาย POS→คืนแบบไม่ restock/พร้อม restock→ปิดกะ→Backoffice/CSV. บัญชี/สินค้า/BOM/รับ stock ยังใช้ API fixture ไม่ใช่ UI onboarding ครบทุกหน้า

ผลจริง: npm ci/check ผ่าน, Unit 418/418, regression engine เดิม10 scripts + v9.4 retry + v9.5 operations/load/UI ผ่าน. Cost engine v9.6 2 tests และ Browser1testผ่านบน embedded SQL จริง ไม่ใช่ native concurrency/live provider. ตัวอย่างส่วนลด2999/คืน999+1000+1000ตรง ledger/stock8/BOM96/ต้นทุนใช้ไป400 และ marginหลังคืนครบ -400สตางค์

ยัง blocked: native Docker/local exit1 ก่อน cluster; live preflight exit2 ไม่มี credentials/ปลายทางที่อนุญาต. Native writer-race regression เตรียมแล้วแต่ยังไม่รัน. pg_dump/restore/RPO/RTO/live channels/Instagram จริงยังไม่ผ่าน ไม่รับรองพร้อม Pilot

อ่าน V96_RELEASE_NOTES_TH.md / COST_RECONCILIATION_TH.md / TEST_RESULTS_TH.md / NEXT_STEPS_TH.md. งานแจ้งเตือนและ restore hold v9.5 ยังคงอยู่ครบ

---

# สถานะ AILE POS Cloud v9.5

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก ZIP v9.4 ที่ตรวจSHA256ตรงต้นฉบับ เก็บ sourceครบ package/lockfile9.5.0 ไม่มี dependency upgrade. เพิ่ม persistent pause/restore quarantine, human destination review/actor/time/reason/audit และ mandatory reviewก่อนretry. ผลตรวจจากbackupถูกinvalidateเพื่อให้ตรวจใหม่หลังrestore

เพิ่ม2ตาราง/2columns และ3Owner-onlycontrols รวม137. ต้องหยุดAPI/Workerรุ่นเก่าทุกตัวแล้วnpm ci/db:initก่อนเปิด9.5. Built-in restore drillตรวจsnapshotก่อนmigrationแล้วกักงาน; manual pg_restoreต้องรัน notifications:restore-hold เองก่อนเปิดWorker ไม่ใช่ระบบตรวจจับrestoreทุกแบบอัตโนมัติ

ผลจริง: 412unit/checkผ่าน; regressionเดิม10scripts + retry2tests/v9.4Browserผ่าน. v9.5operations2tests (physicalembeddedrestore/v9.4migration/pausebarrier/review/audit/สิทธิ์), load1test240backlog/6rate-limit, Browser1testผ่านหน้าจอPOS/QRจริงถึงคิว/fakeproviderพร้อมpause/reviewUIผ่าน. ไม่มีlive messageและไม่ใช้embeddedเป็นnativeconcurrency proof

ยังblocked: native Docker/local exit1ก่อนclusterเพราะไม่มีDockerและnon-rootไม่พร้อม; live preflight exit2ไม่มีcredentials/ปลายทางที่อนุญาต. Nativepg_dump/restore/RPO/RTOและInstagramapppermissionsจริงไม่ยืนยัน. งานระบบหลักหลังแจ้งเตือนคงไว้ในNEXT_STEPS_TH.md

อ่าน V95_RELEASE_NOTES_TH.md / V95_RESTORE_QUEUE_TH.md / TEST_RESULTS_TH.md และ validation/v95-*.json/log

---

# สถานะ AILE POS Cloud v9.4

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ฐาน ZIP v9.3 เก็บฟีเจอร์และไฟล์เดิมครบ package/lockfile 9.4.0 ไม่มี schema/dependency upgrade. แก้ LINE automatic retry เกินอายุก่อน provider I/O (23h conservative created_at), เก็บ safe message ID จาก LINE accepted retry, เพิ่ม Browser lifecycle และ local native runner ที่สร้างฐาน disposable เองโดยไม่ต้อง Docker

ผลจริง: npm ci, 412/412 unit, npm check, syntax 240 JS/MJS + Python; regression engine เดิม 10 scripts ผ่าน. Browser 1 test ผ่าน UI settings + browser HTTP order APIs + real API/embedded SQL + fake-provider acceptance 24 ครั้งและสรุป ฿3.75; retry/physical embedded restore 2 tests ผ่าน. ไม่มี live message และไม่ใช้ embedded เป็น native concurrency proof

ยัง blocked: live preflight exit2 ready=false ไม่มี credentials/ปลายทางทดสอบที่อนุญาต; Docker runner exit1 ENOENT; local native exit1 non-root required (runtime root-only UID map, unshare ไม่อนุญาต). Native multi-worker/pg_dump/restore/browser และ Instagram app permission/conversation จริงยังไม่ผ่าน ไม่รับรองพร้อม pilot

อ่าน V94_RELEASE_NOTES_TH.md, V94_NOTIFICATION_ACCEPTANCE_TH.md, TEST_RESULTS_TH.md และ validation/v94-run-results.json / v94-additional-results.json. งานระบบหลักหลังแจ้งเตือนเก็บไว้ใน NEXT_STEPS_TH.md ไม่เปลี่ยนกฎเงิน/stock/BOM รอบนี้

---

# สถานะ AILE POS Cloud v9.3

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก v9.2 เก็บ source เดิมครบ ขอบเขตเฉพาะแจ้งเตือน package/lockfile 9.3.0. เพิ่ม 2 ตาราง attempt/heartbeat และ columns/indexes สำหรับ fencing ต้องหยุด API/Worker v9.2 ทุกตัวก่อน db:init ไม่รันปนรุ่น

## ทำแล้วในรอบนี้

- หน้าสุขภาพ/คิวผ่านลิงก์บนหน้าตั้งค่า แสดง pending/failed/unknown/last accepted/oldest pending, heartbeat และคำแนะนำไทย
- ตัวกรอง provider/kind/status/source, keyset pagination ที่เก็บ microseconds/HMAC scope และ detail/attempt history
- Lease fencing กันผล Worker เก่าทับรอบใหม่; provider correlation ID และ heartbeat ระหว่าง batch
- Scoped operator live-check เตรียมตัวอย่าง 3 แบบ ไม่มีการสร้างเงิน/ออเดอร์จริง ไม่หยิบคิวอื่น; preflight ไม่ส่ง
- Test harness ใช้ process จริง SIGKILL หลัง fake acceptance และ restart/embedded physical restore; native 4-process/pg_dump-restore เตรียมแล้ว

## ผลที่รันจริง

407/407 unit, npm check, API/Browser บน PGlite, actual worker process crash/restart และ embedded restore ผ่าน. Regression v8.6–v9.2 ทั้ง 8 scripts ผ่าน ไม่มี live provider sends

Native runner 19 scripts exit 1 ก่อน cluster เพราะ Docker ENOENT; ไม่มี postgres/pg_ctl/pg_dump/psql. Live-check preflight exit 2 / ready=false ไม่มี credentials/DATABASE_URL/tenant/branch/connection จริงให้ใช้. จึงยังทำข้อ live account และ native multi-worker verification ไม่สำเร็จ ไม่รับรองพร้อม production

## ข้อจำกัดสำคัญ

สุขภาพ/heartbeat ไม่ใช่หลักฐานผู้รับได้รับข้อความ. Keyset จำกัด creation cutoff แต่สถานะ/การลบ/commit ภายหลังเปลี่ยนข้าม requests ได้. Legacy deliveries array ยังรองรับ; attempts ก่อน v9.3 ไม่ backfill. ไม่รับรอง exactly-once ภายนอกหรือหลัง restore ย้อนเวลา

อ่าน NOTIFICATION_OPERATIONS_TH.md, V93_RELEASE_NOTES_TH.md และ NEXT_STEPS_TH.md ก่อนรอบถัดไป

---

# สถานะ AILE POS Cloud v9.2

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก v9.1 เต็ม เก็บไฟล์เดิมครบ; ขอบเขตตามผู้ใช้รอบนี้เฉพาะแจ้งเตือน. package/lockfile 9.2.0, เพิ่ม notification schema 7 ตารางและ policy_revision ใน delivery ใหม่ ต้อง db:init ก่อนเปิด API ใหม่

## ผลงานล่าสุด

- main sidebar มีตั้งค่าแจ้งเตือนแพลตฟอร์ม; Owner เลือกสาขา ตั้ง 3 ประเภทและแหล่ง POS/QR/online แยกเปิดปิด
- Discord/LINE/Telegram/Instagram มีหน้าตั้งบัญชีหลายปลายทาง เลือกประเภทข้อความ ปุ่มทดสอบ/ประวัติ/แก้ไข/ลบ และ stale revision
- เก็บ credentials AES-GCM ฝั่ง server ไม่คืน plaintext; แยก tenant/branch, Owner-only และเชื่อม package send control ของ v9.1
- transactional outbox เชื่อม cash sale, staff table batch, QR batch และ online ingress; replay เดิมไม่เพิ่ม event/delivery
- worker/scheduler เวลาไทย, summary เดือนปฏิทิน, retry key ของ LINE, unknown review สำหรับผลส่งกำกวม, verified webhook ของ LINE/Instagram
- summaries แยกออเดอร์ที่เลือกจากรับชำระ/คืนเงินจริงของสาขาทุกแหล่ง; unpaid ไม่เป็นรายรับ. สถิติออเดอร์แยกแหล่งเริ่มเก็บตั้งแต่ v9.2
- UI ภาษาไทยมี font ในโปรเจกต์; sync shells แล้ว แต่ยังไม่ build native

## หลักฐานและข้อจำกัด

399/399 unit tests, check, API/JWT/SQL บน PGlite, Browser ต่อ API จริง, physical embedded restore และ regressions เดิม 7 scripts ผ่าน. Tests ส่ง provider ผ่าน fake transport เท่านั้น ไม่มี live message ไปบัญชีจริง

Native runner 17 scripts exit 1 ก่อนเริ่ม cluster เพราะ Docker ENOENT. Native PostgreSQL concurrency/multi-worker, pg_dump/restore, Docker build และ provider account/app permission/quotas จริงยังไม่ได้ยืนยัน

Instagram มี verified-inbound 24 ชั่วโมง guard จึงไม่รับรองสรุปรายเดือนส่งได้ตลอดเวลา. Online notification ผูก backend ingestion ที่มีจริง ไม่ได้เปลี่ยนหน้าลูกค้า demo ให้รับออเดอร์จริง. เปิด worker ค่าเริ่มต้นเมื่อ npm start; tests ใช้ createApp ไม่เปิด worker และ native runner ตั้ง worker=0 เพื่อไม่ส่งจริง

ต้องตั้งและสำรอง NOTIFICATION_ENCRYPTION_KEY; การ restore ย้อนสถานะอาจทำให้ข้อความภายนอกที่ไม่มี idempotency รับซ้ำ จึงต้องตรวจคิวก่อนเปิด worker ไม่อ้าง exactly-once ภายนอก

ดู NOTIFICATIONS_TH.md, V92_RELEASE_NOTES_TH.md, TEST_RESULTS_TH.md และ NEXT_STEPS_TH.md

---

# สถานะ AILE POS Cloud v9.1

อัปเดต 29 ตุลาคม 2026 (Asia/Bangkok) · Development / ยังไม่อนุมัติ Production

ต่อจาก ZIP v9.0 เต็ม ไม่มีไฟล์เดิมถูกลบ; package/lockfile 9.1.0. รุ่นนี้มี schema migration เพิ่ม 7 ตาราง ต้อง db:init ก่อนเปิด API ใหม่

## ผลงานล่าสุด

- ผู้ดูแล AILE กำหนดฟังก์ชัน 3 แพ็กเกจและข้อยกเว้นรายร้าน พร้อมวันหมดอายุ/โควตาพิเศษ/เปลี่ยนแพ็กเกจได้จริง
- Owner ร้านเปิด/ปิด/คืนตามบทบาทของ Manager/Cashier ได้ ภายใน entitlement และ branch grants ของร้าน
- แยก platform admin ออกจาก tenant Owner ด้วย trusted CLI, secret แยก, token อายุ 30 นาที และตรวจ revocation DB
- ตรวจ 121 controls ที่ API รวม public QR/storefront, ส่วนลดและ export aliases; คงกฎการเงิน/stock/BOM/idempotency เดิม
- optimistic revision, เหตุผลและ before/after audit; จำลอง audit ล้มแล้ว policy/revision rollback ผ่าน
- แก้ bulk import เช็กจำนวนสินค้าใหม่ทั้งชุดกับโควตาจริง และ subscription check ของ expense resource
- POS ไม่โหลดข้อมูลที่ถูกปิดสิทธิ์; KDS/กะเงินสดใช้สิทธิ์กำหนดได้; shell sources sync แต่ยังไม่ build native

## ผลทดสอบรอบ v9.1

npm test 381/381, check, SQL permission integration, DB-backed Chromium และ physical embedded restore ผ่าน. Embedded regression v8.6–v9.0 ทั้ง 6 scripts ผ่าน. Native runner (16 scripts) exit 1 ก่อนสร้าง cluster เพราะไม่มี Docker; ยังไม่รับรอง native PostgreSQL, pg_dump/restore, Docker build, CLI grant บน native หรือ full POS Browser E2E

## ข้อจำกัดที่ต้องทราบ

แพ็กเกจเดิมยังไม่มี feature matrix ที่ตกลง จึง default เปิดฟังก์ชันเดิมไว้ทุกแพ็กเกจเพื่อไม่ตัดบริการเดิม; ผู้ดูแลกำหนดแยกจริงได้ใน console. Control plane จัดการบัญชี/สิทธิ์/แพ็กเกจและ monetary limits สงวน Owner/admin เพื่อป้องกันการเพิ่มสิทธิ์ตนเอง. ไม่มี quota อุปกรณ์ใน schema เดิม และฟีเจอร์ demo ไม่กลายเป็นระบบจริงจากการเปิดสวิตช์

สิทธิ์เปลี่ยนกับ request ถัดไป ไม่ย้อนยกเลิกงานที่ผ่าน authorization แล้ว; SSE รอตรวจ heartbeat ไม่เกินรอบ 20 วินาที และไม่ remote wipe offline data. Native concurrency, full end-to-end POS และ RPO/RTO ยัง P0. โค้ด schema เดิมเติมพิกัดโต๊ะว่างเมื่อ db:init จึงต้องเทียบ restore hash ก่อน migration/เขียนข้อมูลใหม่

อ่าน FUNCTION_CONTROL_TH.md, V91_RELEASE_NOTES_TH.md, TEST_RESULTS_TH.md และ NEXT_STEPS_TH.md

---

# สถานะ AILE POS Cloud v9.0

ตรวจวันที่ 29 ตุลาคม 2026 (Asia/Bangkok) — Development / ยังไม่อนุมัติ Production

## ฐานหลักและความต่อเนื่อง
v9.0 ต่อจากโค้ด v8.9 โดยเก็บไฟล์เดิมครบ; package/lockfile 9.0.0. รุ่นนี้ไม่มี schema migration เพิ่มจาก v8.9; ขยาย report scope, timezone และ recovery tools. ต้องมี schema/grants ของ v8.9 ก่อนใช้. พัฒนาโค้ดเดิมต่อ ไม่สร้าง POS ใหม่

คำว่า “ฐานล่าสุด” จำกัดเฉพาะไฟล์ที่ได้รับ ไม่มี source archive v7.7/v7.8/v7.9 หรือ Git history แยก จึงยืนยันไม่ได้ว่าไฟล์แนบรวมทุกการเปลี่ยนแปลงของบทสนทนาเก่า และไม่สามารถทำ source diff ระหว่างรุ่นเหล่านั้นได้

| รุ่น | สิ่งที่ตรวจพบในฐาน v8.0 |
|---|---|
| v7.7 | Reconciliation Dashboard และ CSV, tests v77 |
| v7.8 | auditDiscountedRefunds, refundIntegrity, tests v78 |
| v7.9 | validation snapshot กำไร, HTTP 422, tests v79 |
| v8.0 | reportCoverage และ UI แจ้งรายการเกิน 3,000 บิล, tests v80 |
| v8.1 | ป้องกันการคืนเงินเกินมูลค่าหลังส่วนลดใน write API และปรับ UI ให้คำนวณตรงกัน |
| v8.2 | เปิดทางเลือกกำหนด DB_POOL_MAX และเพิ่มหลักฐาน integration บน PostgreSQL engine ผ่าน wire protocol |
| v8.3 | ล็อกแถว KDS ก่อนตัดสินคืนสต็อก; regression test ครัวเริ่มทำงานแล้ว |
| v8.4 | รวมรายการขาย product_id NULL ในรายงานกำไรและต้นทุน พร้อม integration ผ่าน buffet settlement |
| v8.6 | SQL rollback 5 จุดผ่าน embedded engine; native Docker runner พร้อมใช้ แต่ runtime ไม่มี Docker |
| v8.5 | เพิ่ม API integration แข่ง refund รายการเดียวด้วย idempotency key ต่างกัน; PGlite pool 2 ตัด connection จึงยังสรุป race ไม่ได้ |

## ฟีเจอร์ที่มีอยู่จริงในโค้ด

| ส่วน | สถานะและขอบเขต |
|---|---|
| POS / cash checkout | API มี idempotency, hash request, stock locks, cash shift, ส่วนลดและ approval; ไม่ได้ยืนยัน concurrent PostgreSQL รอบนี้ |
| โต๊ะ / split-merge / บุฟเฟ่ / KDS / QR | มี routes และหน้าเว็บเดิมครบ มี HTML preview หลายยุค; ไม่ใช่ทุก flow ที่ผ่าน live E2E |
| การชำระเงิน | มีบันทึกขายเงินสด; payment-plans เป็น draft พร้อม paymentEnabled:false ไม่ใช่รับบัตร/PromptPay จริง |
| คืนเงิน | บันทึกการส่งมอบเงินสดโดยพนักงาน มี ledger, replay, sale lock; v8.1 ใช้ยอดหลังส่วนลด |
| สินค้า / BOM / วัตถุดิบ | มี stock movements, recipe usage snapshot, คืนวัตถุดิบตาม snapshot, transfer, stocktake, waste |
| Backoffice / รายงาน | มี exports, historical cost, refund cost, reconciliation, menu profitability, transaction audit; ข้อมูลไม่ครบมีข้อจำกัด |
| SaaS | tenant membership, roles owner/manager/cashier, subscriptions/entitlements; v8.9 เพิ่ม tenant_branch_access และ Owner editor แล้ว; native verification ยังรอ |
| Offline / PWA / mobile shells | มี IndexedDB outbox, replay/reconcile และ Capacitor scaffolds; ไม่ใช่ APK/IPA ที่ทดสอบจริง |
| Backup / restore | embedded physical dump/load + business hashes ผ่าน; native pg_dump/restore ยังไม่รัน |

## งานที่เพิ่มใน v9.0

- Report date/default/grouping ใช้ Asia/Bangkok; root Backoffice เลิกใช้ UTC calendar filter, datetime ส่งออกระบุ +07:00; finance date picker ไม่ขึ้นกับ timezone ของเครื่อง
- Manager เลือก branchIds หลายสาขาได้เมื่อมีทุก grant ที่เลือก; ตรวจ tenant/grants ทั้งชุด, empty/ambiguous scope ถูก 400, all-tenant ยังคงต้องมีสิทธิ์ครบ
- ใช้ scope เดียวกันใน 18 report families / expenses / stocks และ JSON/XLSX/PDF; UI export ใช้ applied filters ที่แสดง ไม่ใช้ค่าที่แก้แต่ยังไม่กดค้นหา
- Bundled Thai PDF font พร้อม OFL license; Dockerfile copy assets และใช้ npm ci ตาม lockfile
- Backup ใช้ repeatable-read exported snapshot เดียวกับ pg_dump และ business manifest (SHA-256 row/table hashes + counts/totals ของทุก public table)
- Restore drill ตรวจ state รวม transactions, stock/BOM, grants/marker/audit; legacy archive ยัง restore ได้แต่ business unverified และ CLI exit 3
- ฆ่า API process จริงด้วย SIGKILL หลัง commit ก่อนตอบกลับ แล้ว restart/replay ทั้งขายและคืนเงิน ผ่านบน embedded SQL engine ใน parent process
- Dump/load physical embedded DB ผ่าน และ old keys replay โดยไม่เปลี่ยนข้อมูล; native pg_dump/restore scripts เตรียมแล้วแต่ยังไม่รัน
- Browser report E2E ต่อ API/JWT/SQL จริงและดาวน์โหลด XLSX ผ่าน; ไม่ใช่ mock API แต่ฐานยังเป็น embedded engine

## งานที่เพิ่มใน v8.9

- auth เรียก branch authorization กลางแบบ explicit method+route allowlist; endpoint ใหม่ที่ยังไม่กำหนด policy ถูกปฏิเสธสำหรับ staff
- ตรวจ branch body/query, branch ของ resource IDs และต้นทาง/ปลายทาง transfer; sale list, branch list และ discount queue จำกัดด้วย grants
- รายงาน Manager ที่มีเพียงบางสาขาต้องระบุ branchId เดียว; all-tenant report ได้เมื่อมีครบทุกสาขาปัจจุบันเท่านั้น. v9.0 ขยายให้เลือก subset หลายสาขาได้แล้ว
- Owner จัดการ grants ผ่านหน้า branch-access.html, before/after audit และป้องกัน stale editor overwrite ด้วย expectedBranchIds
- New API staff ไม่มี grants เว้นแต่ระบุ branchIds; UI เพิ่มพนักงานระบุสาขาที่เลือกใน POS. Legacy staff backfill ทุกสาขาปัจจุบันครั้งเดียวและไม่ฟื้นสิทธิ์ที่ถอนเมื่อ db:init ซ้ำ
- ถอนสิทธิ์ใช้กับ token เดิมในคำขอถัดไป; SSE ของ user/branch ถูกปิดทันทีใน API instance เดียวกัน และ heartbeat ตรวจ DB ทุก 20 วินาที
- Shared catalogue อ่านได้เมื่อมีอย่างน้อยหนึ่งสาขา; การแก้ global catalogue/settings, staff list และ audit รวมทั้งร้านสงวน Owner

## งานที่เพิ่มใน v8.8

- API อ่าน KDS ส่ง soldQty/returnedQty/restockedQty/remainingQty โดย qty ที่ใช้ปรุง = ขาย - คืนสต็อก
- owner/manager ยืนยัน revision ของรายการคืนล่าสุด ภายใต้ ticket row lock เดียวกับ refund และ preparing
- คืนเพิ่มทำให้ revision เดิมใช้ไม่ได้; กดซ้ำ revision เดิมไม่เพิ่ม audit/ธุรกรรมซ้ำ
- คืนสต็อกครบและผู้จัดการยืนยัน: ticket เป็น cancelled, เก็บประวัติและปล่อยโต๊ะผ่าน partial unique index ใหม่
- หน้า KDS มีปุ่มยืนยัน/ยกเลิก ปิดปุ่มเริ่มปรุงจนยืนยัน และดูประวัติงานที่ยกเลิก; sync app.js/sw.js ไป mobile/customer shells
- API list โหลดจำนวนคืนเป็น batch query; ไม่มีการสร้าง sale/stock/BOM movements จาก confirmation

## งานที่เพิ่มใน v8.7

- แยก createApp(pool) จากขั้นเริ่มฟัง port เพื่อใช้แอปจริงกับ SQL engine ทดสอบ; npm start ยังเริ่ม API ตามเดิม
- Fault injection checkout 4 จุด, ส่งรายการโต๊ะ 4 จุด, settle-cash 6 จุด; snapshot ทั้งบิล/ledger/idempotency/ครัว/stock/BOM/session กลับค่าเดิม
- ตัด HTTP response หลัง commit และ retry checkout/settle-cash: ได้ sale ID เดิมและไม่มีการเขียนซ้ำ
- แก้ KDS หลัง refund คืน stock สำเร็จ ให้ตรวจ returned items หลังล็อก ticket แล้วตอบ 409 แทนเริ่มปรุงสินค้าที่คืนแล้ว
- แก้ restaurant transaction wrapper ไม่ rollback/แจ้ง missing response เมื่อ commit เสร็จแต่ socket ปิด
- เพิ่ม native integration พร้อม proxy ทำคำตอบหายและ concurrent refund/KDS; ยังไม่ได้รันเพราะไม่มี Docker

## งานที่เพิ่มใน v8.6

- เพิ่ม SQL trigger fault injection 5 จุด: refund header/detail, product stock, ingredient stock และ audit ก่อน commit
- ใช้ Express refund/operations routes จริงกับ PGlite แบบ direct engine ตรวจ rollback, same-key retry, product/BOM restock และ cash shift; ไม่จำลองผล SQL
- เพิ่ม native Docker runner ที่สร้างฐานทดสอบและ API แยก รัน integration 10 scripts เก็บ logs/exit code และลบ container ที่สร้างเอง
- PGlite direct engine เป็น devDependency แบบ pin; ไม่มีการเปลี่ยน schema หรือ business API

## งานที่เพิ่มใน v8.5

- เพิ่ม `test:refund-concurrency-db` สำหรับยิง refund สองคำขอพร้อมกัน ใช้คนละ idempotency key และอ้างจำนวนสินค้าคืนซ้ำกัน
- Regression คาดหวังผล 201/409, refund ledger หนึ่งรายการ, restock ครั้งเดียว และยอดกะเงินสดตรงกัน
- API เดิมล็อกแถว sale ด้วย `FOR UPDATE` ก่อนคำนวณจำนวนที่คืน; รอบนี้ไม่แก้ business API หรือ schema

## สิ่งที่แก้จริงใน v8.1–v8.3

- พบว่า refund API เดิมใช้ราคาก่อนส่วนลด: บิล 2 ชิ้น ชิ้นละ 50 บาท ลดทั้งบิล 12.50 บาท จ่าย 87.50 บาท แต่คืน 1 ชิ้นได้ 50 บาทแทน 43.75 บาท จึงกินสิทธิ์ยอดคืนของชิ้นที่เหลือ
- จัดสรรส่วนลดจากสินค้าทั้งบิลด้วยฟังก์ชันเดียวกับรายงาน แล้วคำนวณคืนสะสมเป็นจำนวนสตางค์เต็มด้วย BigInt
- การคืนบางส่วนใช้ floor(ยอดที่จ่ายของรายการ × จำนวนคืนสะสม / จำนวนขาย) ลบยอดคืนเดิม เศษสตางค์จึงคืนครบเมื่อคืนครบจำนวน
- คง schema เดิม: รายการคืนที่แบ่งราคาเป็นจำนวนสตางค์ต่อหน่วยไม่ได้จะมีรายละเอียดไม่เกิน 2 แถว ผลรวม qty × unit_price_cents ตรงยอดเงิน หัก/คืน stock และ BOM เพียงครั้งเดียวต่อจำนวนที่ร้องขอ
- บิลเก่าที่ ledger ไม่ตรงกับยอดจัดสรร หรือ header ไม่ตรงผลรวม detail ถูกปฏิเสธเพื่อให้ตรวจสอบ ไม่เขียนประวัติทับอัตโนมัติ
- UI live แสดงยอดหลังส่วนลดและคิดยอดคืนด้วยกฎเดียวกับ API; คง demo fallback เดิม
- เปลี่ยน PWA cache version และ sync เฉพาะไฟล์ UI/cache ที่แก้ไปยัง mobile shells ทั้งสอง
- เพิ่ม unit/property-loop tests, HTTP route tests ด้วย SQL double, browser test UI ปัจจุบัน และเตรียม PostgreSQL integration regression
- แก้ fixture ของ offline browser test ให้มี branchId ตรงตาม contract ที่มีอยู่แล้ว; ไม่ผ่อนคลายกฎตรวจสาขา

## ผลทดสอบที่รันจริง

อัปเดต v9.0: npm test 374/374 ผ่าน, check ผ่าน; report scope/timezone suite + Browser E2E ผ่าน, recovery SIGKILL/restart + physical dump/load ผ่านบน embedded SQL; v8.6–v8.9 regressions ผ่านซ้ำ. Native runner (15 scripts) หยุดที่ Docker preflight จึงยังไม่ยืนยัน native PostgreSQL/pg_dump/pg_restore จริง


| ชุด | ผล | ความหมาย |
|---|---|---|
| npm install --ignore-scripts --no-audit --no-fund | สำเร็จ 290 packages | เพิ่ม package-lock.json; มี deprecated transitive dependencies ยังไม่ใช่ security audit |
| npm test ก่อนแก้ | 350/350 ผ่าน | baseline จาก ZIP |
| npm test หลังแก้ | 365/365 ผ่าน | รวม 9 allocation tests และ 6 HTTP tests; HTTP ใช้ SQL double |
| npm run check | ผ่าน | syntax ตาม script เดิม |
| node --check ครอบคลุม api/lib/scripts/web/tests | 174 ไฟล์ผ่าน | ไม่รวมความถูกต้อง runtime/SQL |
| Browser legacy 31 scripts รอบ v8.1 | ผลรอบ v8.1: 17 ผ่าน / 14 ไม่ผ่าน | ดู TEST_RESULTS_TH.md; บางชุดขาดไฟล์/ภาพหรืออ้าง legacy fixture |
| Chromium offline E2E | ผ่านหลังแก้ fixture | IndexedDB จริง, 2 tabs, Web Locks/lease, timeout/reconcile และ key collision; callback server เป็นตัวจำลอง |
| Chromium UI คืนเงิน v8.1 | ผ่าน | หน้า web ปัจจุบัน: คืนเต็ม และบางส่วน 33/33/34 สตางค์; ไม่ใช่ DB-backed E2E |
| PostgreSQL schema / API | schema apply ผ่าน PGlite + pg wire protocol | เป็น PostgreSQL engine แบบ embedded ไม่ใช่ PostgreSQL server/native cluster |
| DB API integration | v11, v12, v13, v28, v61, v81 และ v84 ผ่านบน PGlite | pool max 1 ทำให้ query ถูก serialize; ยังไม่ยืนยัน locking/races หลาย connection |
| Refund concurrency v85 | ไม่ผ่านบน PGlite pool 2 | connection/socket ถูกตัดระหว่างคำขอคู่แข่ง; ต้องรันบน native PostgreSQL ก่อนสรุปพฤติกรรม race |
| Discount approval DB v62 | ไม่ผ่าน | PGlite socket ปิด connection ระหว่าง test ใช้ pool/connection เพิ่ม; ต้องยืนยันบน PostgreSQL server จริง |
| db:init | ผ่านบน PGlite; native server ไม่มี | ติดตั้ง PostgreSQL server ผ่าน apt ติดข้อจำกัดสิทธิ์ของ runtime |
| Backup / restore / crash recovery DB จริง | native ยังไม่ได้ทดสอบ; embedded v9.0 ผ่าน | ไม่มี server/pg_dump/pg_restore พร้อมใช้งาน |
| เครื่องพิมพ์ / payment gateway จริง | ยังไม่ได้ทดสอบ | เลื่อน hardware ตามคำสั่งผู้ใช้; gateway ยังไม่ได้เชื่อม |

## ความเสี่ยงและข้อจำกัดที่ยังค้าง

1. PGlite ผ่าน schema/API tests หลัก แต่ยังไม่ใช่ native PostgreSQL server; v85 pool 2 ตัด connection ขณะยิง concurrent refund จึงยังไม่ยืนยัน connection pooling, locking, deadlocks หรือ simultaneous transactions หลาย connection
2. Tenant filter มีในเส้นทางที่ตรวจ แต่ยังไม่ได้พิสูจน์ isolation ทุก endpoint; v8.9 เพิ่ม grants รายสาขาและ fail-closed API policy แล้ว; ต้องยืนยันบน native PostgreSQL และ live Browser E2E ก่อน pilot
3. รายงานกำไรจำกัด 3,000 บิล และ count/snapshot เป็นคนละ query; v8.4 เปลี่ยนรายงานสี่ชุดให้เก็บ cover item ด้วย LEFT JOIN และแสดง SKU UNLINKED พร้อมต้นทุน null
4. ต้นทุนหลังคืนยังเป็นประมาณตามจำนวนสินค้า ไม่ใช่หลักฐานคืนวัตถุดิบจริง; refund-cost report เดิมไม่รวมส่วนลดตามคำเตือนของ API
5. v8.3 ล็อก kitchen ticket ก่อนตัดสินใจคืนสต็อกแล้ว; ต้องยืนยัน race ระหว่าง refund กับ KDS preparing ด้วย native PostgreSQL หลาย connection และตรวจ lock order ของ stock/BOM
6. การคืนที่ยอดรวมเป็นศูนย์ เช่นลด 100% หรือเศษการคืนรอบแรกเป็น 0 สตางค์ ยังไม่รองรับใน cash refund endpoint เดิม ต้องออกแบบ return-only flow แยก
7. ประวัติคืนเงินบางส่วนก่อน v8.1 ที่ไม่ตรงสูตรจะถูก block เพื่อ reconciliation; ไม่มี migration ปรับเงินย้อนหลัง
8. Mobile native builds, demo/preview HTML เก่า และ online/guest flows ไม่ได้ถูกอัปเกรดให้เป็นระบบรับเงินจริงโดยการแก้รอบนี้
9. README/START_HERE เดิมนำด้วย v2.8; รอบนี้เพิ่มคำแนะนำ v8.1 ไว้ด้านบนโดยเก็บประวัติเดิม

ใน v8.3 ล็อกแถว kitchen_tickets ด้วย FOR UPDATE ก่อนตัดสินใจคืนสต็อก ให้ refund serialize กับ KDS status update; integration ยืนยันว่า KDS preparing ปฏิเสธ restock แต่คืนเงินแบบไม่ restock ได้ ใน v8.4 report queries ใช้ LEFT JOIN products และเก็บ cover item; ทดสอบ buffet settlement ผ่าน PGlite. ใน v8.5 เพิ่ม regression refund ต่าง key แต่ PGlite pool 2 ปิด connection จึงค้างยืนยันบน native PostgreSQL

ดู NEXT_STEPS_TH.md, PILOT_TESTING_CHECKLIST_TH.md และ CHANGED_FILES_TH.md ก่อนรอบถัดไป

ข้อจำกัด v8.7 เรื่องบล็อกทั้ง ticket ได้เพิ่ม flow ผู้จัดการแก้ใน v8.8 แล้ว; คืนเพิ่มต้องยืนยัน revision ใหม่ก่อนเริ่มปรุง. ทดสอบ response loss เป็นการปิด socket หลัง commit ไม่ใช่ kill/restart API process

ขอบเขต v8.9: การถอนสิทธิ์ไม่ย้อนยกเลิก HTTP transaction ที่ผ่าน authorization และกำลังทำงานอยู่ และไม่ใช่ remote wipe ของข้อมูลที่เคยดาวน์โหลด/เก็บ offline. การแยกสิทธิ์เป็นระดับ API ไม่ใช่ PostgreSQL RLS. Guest links/public storefront ใช้ capability/public policy เดิมแยกจาก staff JWT. SSE ข้าม API instance อาจรอ heartbeat ไม่เกินรอบ 20 วินาที; multi-instance deployment ยังต้องทดสอบจริง

ข้อจำกัด UTC/Bangkok ของ Backoffice ที่พบใน v8.9 แก้ใน v9.0 แล้ว; boundary tests วัน/เดือน/ปีและ Browser ที่ timezone New York ผ่านบน embedded SQL. Native verification ยังรอ

ขอบเขต v9.0: report refunds ยังคงอิงวันที่ขายบิลต้นทางตาม contract เดิม ส่วนกะอิง shift_id และวันที่เปิดกะ. ไม่ใช่การเปลี่ยนเป็นบัญชีเงินสดตามวันที่คืนทุกชุด. Export ใช้ filter scope เดียวกับหน้าจอ แต่เป็น query ใหม่ จึงอาจเห็นรายการที่ commit เพิ่มหลังเปิดหน้าจอ. Crash/restart ทดสอบ API process จริง โดย embedded SQL อยู่ใน process แยกผ่าน test RPC adapter ไม่ใช่ pg-wire/pooling/native PostgreSQL proof
