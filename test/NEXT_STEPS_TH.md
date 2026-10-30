# งานถัดไปหลัง AILE POS Cloud v9.7

## ปิดแล้วในรอบรวมฟังก์ชัน

รวมv8.6ที่แนบกับv9.6โดยคืน12ไฟล์/4scripts, เก็บ24legacyviewsและnotifications, sidebarกลาง/versionedassets/atomiccache, buildersครบmodules, feature/options parity และcustomDemo data regression. ไม่downgradebackend/API/schemaล่าสุด ไม่ลบไฟล์เดิม. รายละเอียด FEATURE_PARITY_TH.md

## งานที่ยังค้าง

1. Native disposable PostgreSQL/concurrency/หลายWorker/rollback/crash/BackupRestore/RPO/RTO: รอบนี้Docker/localและpreflightv8.6ยังblockedก่อนทดสอบจริง. ชุดnativeเดิมและใหม่อยู่ครบแต่ใช้guard/ชื่อฐานของแต่ละrunnerตามคู่มือ
2. Discord/LINE/Telegram: **รอบนี้ไม่มีการส่งข้อความจริงหรือโอนเงินจริง** ต้องตั้งปลายทางทดสอบที่ได้รับอนุญาตแล้วตรวจactualreceiptครบPOS/QR/online/interval/monthly. Instagramapp/permissions/windowจริงยังไม่ผ่าน
3. แยกงานยกระดับDemoเดิมเป็นBackendจริงตามสเปกก่อนทำ: v1.5หน้ารวมเมนู/Add-on/สูตร/แอปมือถือ/พรีออเดอร์และCRM/โปร/จัดซื้อบางส่วนยังจำกัดตามv8.6. รุ่นนี้คืนเมนูและตัวเลือก ไม่อ้างว่าAPIพร้อมครบทุกโมดูล
4. UI onboardingทุกหน้าบนnativeและอุปกรณ์จริง; hardwareprinting/nativeAPK/IPAยังไม่ได้ทดสอบ เครื่องพิมพ์ยังเลื่อน
5. Return-only net0/ลด100%, historicaldiscountedrefundreconciliationแบบaudit และdependencyupgradeแยกchangeยังค้าง

หากเปิดรุ่นใหม่หลังอัปเดต ให้บันทึกบิลก่อนปิดหน้าเก่าและเข้าentryv9.7/standalone9.7ให้ถูกตัว ไม่ล้างข้อมูลเว็บไซต์. PWAไม่activatecacheถ้าสคริปต์หลักไม่ครบ

---

# งานถัดไปหลัง AILE POS Cloud v9.6

## P0 — ยังต้องยืนยันจริง

1. Native disposable PostgreSQL: รัน Docker หรือ local non-root runner. เตรียม24 suites หรือ27เมื่อ AILE_NOTIFICATION_BROWSER=1. ยืนยัน writer commit ระหว่าง count/items, หลาย Worker/pause barrier/SKIP LOCKED/fencing และ crash/restart. รอบนี้ทั้งสองทางหยุดก่อน cluster
2. Native backup/checksum/restore ฐานว่าง เทียบธุรกรรม/สิทธิ์/audit/key เดิม และ restore hold ก่อนเปิด Worker. วัด RPO/RTO และ replay key เดิม. ไม่ใช้ embedded restore แทนหลักฐาน native
3. ตั้งบัญชีปลายทาง Discord/LINE/Telegram ที่ได้รับอนุญาต แล้วทดสอบ actual receipt ครบ POS/QR/online/interval/monthly พร้อมยอดเวลาไทย. รอบนี้ preflight ready=false ไม่มีการส่งจริง
4. Instagram: ตรวจ app/permissions/account/webhook/conversation จริงแยกต่างหาก ยังไม่มีบัญชีให้ตรวจ
5. Staging/native load ตามจำนวนร้านจริง พร้อม connection-pool/latency/backoff และวัด SLO. Fixture240งานของv9.5ไม่ใช่ capacity proof

## ทำเพิ่มแล้วใน v9.6

ต้นทุนใช้ไปหลังคืนสต็อกและ negative contribution แยกจาก estimate เดิม, historical price regression, snapshot เดียวภายใน Menu profitability, แก้ render3หน้า และ UI lifecycle เปิดกะ→ขาย→คืนทั้ง2แบบ→ปิดกะ→รายงาน/CSV. อ่าน COST_RECONCILIATION_TH.md

## งานระบบหลักที่ยังค้าง

- Native checkout/settle/refund/refund-KDS/stock-BOM concurrency และ fault/crash proof
- UI สมัครร้าน/สินค้า/BOM/เติมstockครบทุกหน้า: รอบนี้สร้างส่วนนี้ผ่าน API fixture; UI POS/refund/shift/report ผ่านแล้วบน embedded แต่ยังต้อง native และอุปกรณ์จริง
- Return-only สำหรับ net0/ลด100% ต้องกำหนดสเปกก่อนเปลี่ยน cash ledger
- Historical discounted-refund reconciliation แบบ diff/หลักฐาน/audit ไม่แก้ยอดย้อนหลังเงียบ ๆ
- ตรวจต้นทุนจากข้อมูลเก่าที่ snapshot ไม่ครบและ movement นอก usage; รอบนี้แสดง null ไม่ backfill
- Dependency/deprecation audit และ upgrade แยก change; เครื่องพิมพ์จริงยังเลื่อน

---

# งานถัดไปหลัง AILE POS Cloud v9.5

## P0 — ยังต้องยืนยันจริงก่อน Pilot

1. Native disposable PostgreSQL: npm run test:native-postgres หรือ test:native-postgres-local(non-root). เตรียม22suites/24เมื่อAILE_NOTIFICATION_BROWSER=1; ยืนยัน shared gate/หลายWorker, pauseระหว่างI/O, SKIP LOCKED/fencing/SIGKILL และ nativepg_dump/restore. รอบนี้ไม่เริ่มcluster
2. Backup/Restore nativeเดิม: checksum/manifest/ฐานใหม่ว่าง/เทียบก่อนmigration, เรียกrestorehold, ตรวจquarantineและreviewใหม่, keyเดิม/branch/audit/idempotency และวัดRPO/RTO. Manualrestoreต้องเรียกnotifications:restore-holdก่อนเปิดWorker; ไม่มีการdetectrawpg_restoreอัตโนมัติ
3. บัญชีDiscord/LINE/Telegramที่ได้รับอนุญาต: ตั้งค่าในserver/Owner, livepreflight, POS/QR/online→interval/monthly, เทียบยอดBangkokและผู้รับยืนยัน. รอบนี้ยังไม่มีcredentialsและไม่ส่งจริง
4. Instagram: แอป/permissions/access/account/HTTPSsignedwebhook/conversationจริงแยก ไม่รับรองส่งsummaryได้ทุกเวลา
5. Loadบนnative/stagingตามจำนวนร้านจริง: connectionpool, backlog/latency/429/timeout, pause/resumeหลายinstance และกำหนดSLOจากผลจริง. 240embeddedfixtureไม่ใช่capacityproof

## ปิดแล้วใน v9.5

Persistentpause/resume+gate, Restorequarantine/invalidateผลตรวจเดิม, humanreviewก่อนretryพร้อมactor/time/reason/audit, receivedปิดงานไม่fakeaccepted, migrationv9.4regression, POS/QRUIE2Eและloadfixture. อ่าน V95_RESTORE_QUEUE_TH.md

## งานระบบหลักหลังแจ้งเตือนที่ยังคงค้าง

- Nativecheckout/settle/refund/refund-KDS/stock-BOM/rollback/crashหลังcommit
- BrowserE2Eเต็มสมัครร้าน→สินค้า/BOM→stock→กะ→ขาย→คืน→ปิดกะ→Backoffice (รอบนี้ครอบคลุมเฉพาะUIขายPOS/QRถึงแจ้งเตือน)
- Return-onlynet0/ลด100%ต้องกำหนดสเปกก่อนแตะcashledger
- Historicaldiscountedrefundreconciliationแบบdiff/หลักฐาน/audit
- no-restock/historicalcost/reportssnapshot-countconsistency
- Dependency/deprecationauditและupgradeแยกchange; เครื่องพิมพ์จริงยังเลื่อน

---

# งานถัดไปหลัง AILE POS Cloud v9.4

## P0 — ยังต้องยืนยันก่อน pilot

1. ผู้ดูแลตั้งบัญชีทดสอบ Discord/LINE/Telegram และ secrets ใน server ที่ได้รับอนุญาต; live preflight รอบนี้ exit2 ready=false. ตรวจ provider acceptance แยกจากผู้รับยืนยัน ไม่ใช้ screenshots ตัวอย่างเป็น credentials
2. Staging จริง POS/QR/online → สรุปช่วงเวลา/รายเดือน: ยอด/เวลาไทย/เปิดปิด/type/source/ผู้รับและ replay. ใช้ตารางใน V94_NOTIFICATION_ACCEPTANCE_TH.md; browser รอบนี้ใช้ UI settings + browser HTTP order API และ fake provider ไม่ใช่ live/full POS UI
3. รัน native 20 suites หรือ 21 เมื่อ AILE_NOTIFICATION_BROWSER=1: Docker runner เดิมหรือ test:native-postgres-local ด้วย non-root + server/client binaries. รอบนี้ทั้งสองทางหยุดก่อน cluster. ยืนยันหลาย Worker, SIGKILL/restart, SKIP LOCKED/fencing และ pg_dump/restore
4. Backup เดิม: checksum/restore ฐานว่าง/เทียบธุรกรรม-stock-BOM-branch grants-audit-attempts/keyเดิม, วัด RPO/RTO, replay key เดิม และตรวจคิวที่ backup ย้อนก่อนเปิด Worker. ยังไม่ยืนยัน native
5. Instagram app/permissions/account linkage/HTTPS signed webhook/verified conversation จริงแยก; ไม่รับรองสรุปรายเดือนส่งได้เสมอ. รอบนี้อ่าน official Meta guide ไม่ได้และไม่มีแอปจริงให้ตรวจ

## งานระบบหลักที่คงค้างหลังแจ้งเตือน

- Native transaction concurrency checkout/settle/refund/refund-KDS และ rollback/crash after commit
- Browser E2E เต็ม สมัครร้าน→สินค้า/BOM→stock→กะ→ขาย→คืน→ปิดกะ→Backoffice บน PostgreSQL จริง
- Return-only สำหรับ net0/discount100% ต้องกำหนดสเปกก่อนแตะ ledger เงินสด
- Historical discounted refund reconciliation แสดง diff/หลักฐาน/audit ไม่แก้ย้อนหลังเงียบ ๆ
- ต้นทุน no-restock/historical cost และ reports snapshot/count consistency
- Dependency/deprecation audit และ upgrade แบบแยก change; v9.4 npm ci มี warnings แต่ไม่ได้ upgrade
- เครื่องพิมพ์จริงยังเลื่อนตามคำสั่งผู้ใช้

## ปิดแล้วใน v9.4

LINE stale pending auto retry หยุดก่อน I/O, safe accepted-retry correlation, browser source/provider/type/unknown confirm-cancel regression, embedded restore expired/unknown regression และ local native runner guarded. ไม่มี schema ใหม่ อ่าน Release Notes และ logs ก่อนประเมิน readiness

---

# งานถัดไปหลัง AILE POS Cloud v9.3

## P0 — ยังต้องยืนยันจริง

1. ให้ผู้ดูแลตั้งบัญชี/ปลายทางทดสอบที่อนุญาตผ่านหน้า Owner และ secrets ฝั่ง server; live-check preflight ขณะนี้ ready=false ไม่ส่งข้อความใด ๆ
2. รัน live check เฉพาะ connection IDs ที่ตั้งใจ ตรวจ acceptance และปลายทาง Discord/LINE/Telegram จากนั้น staging POS/QR/online→สรุปช่วงเวลา/รายเดือนจริง ไม่ใช้ 3 sample messages รับรอง lifecycle
3. Instagram live app/permissions/account linkage และ verified webhook/window แยก; ไม่รับรองสรุปส่งได้ทุกเวลา
4. Native disposable PostgreSQL/Docker: npm ci / npm run test:native-postgres (19 scripts) ยืนยัน 4 workers/barrier/SKIP LOCKED/fencing/SIGKILL และ pg_dump/restore ที่ว่าง พร้อม logs/exit codes
5. วัด queue load/heartbeat ตอน batch ยาว, provider rate limits/unknown review, backup key/RPO/RTO และคิวที่ restore ย้อนเวลาก่อนเปิด worker

## ขอบเขตและเกณฑ์

- หน้า health/filter/pagination/detail และ worker recovery มีหลักฐาน embedded แล้ว; native/concurrency และบัญชีจริงยัง blocked ตาม environment ไม่ใช้ unit รับรองพร้อมขายจริง
- หยุด Worker รุ่นเก่าทั้งหมดก่อน migration v9.3 ห้าม mixed v9.2/v9.3 ที่ยังไม่มี fencing
- ตรวจข่าว/ราคา/แพ็กเกจ/โมดูลอื่นไม่อยู่ในงานรอบนี้ เครื่องพิมพ์จริงยังเลื่อน

---

## ประวัติงานค้างก่อน v9.3

# งานถัดไปหลัง AILE POS Cloud v9.2

## P0 — ยืนยันการแจ้งเตือนก่อนเปิดส่งจริง

1. Native PostgreSQL disposable: npm ci / npm run test:native-postgres (17 scripts) โดย worker=0 ระหว่างทดสอบ fake transport; ตรวจ outbox rollback, unique jobs, SKIP LOCKED/lease recovery และ concurrent config editors จริง
2. ใช้บัญชีทดสอบของเจ้าของร้านที่อนุญาตแล้ว ตรวจ Discord/LINE/Telegram acceptance, recipient/โควตา/429/timeout โดยไม่ใช้บัญชีลูกค้าผู้อื่น
3. Instagram live app/permissions/account linkage และ signed webhooks; ยืนยันข้อจำกัด window จริงก่อนรับรองการส่งอัตโนมัติ ห้ามใช้ token อย่างเดียวอ้างว่าพร้อม
4. Backup/restore native รวม 7 notification tables + encryption key; ปิด worker, เทียบ state ก่อน schema/new writes แล้วทบทวนคิวก่อนเปิดส่ง วัด RPO/RTO และ duplicate exposure
5. ตรวจ server clock/Asia-Bangkok และ missed schedules รวมช่วงเดือน/ปีบน native, วัดคิวภายใต้จำนวนร้าน/ปลายทางจริง

## ขอบเขตที่ต้องทราบ

- รอบนี้ทำเฉพาะแจ้งเตือนตามคำสั่ง; งาน P0 เดิมเรื่อง POS full E2E/native concurrency ยังค้าง ไม่ใช้ผล unit รับรองพร้อมขายจริง
- Online ingress เป็น backend เดิม; customer-app/demo ที่ไม่ส่งเข้า backend ยังไม่สร้าง notification และไม่อยู่ในงานเปลี่ยนระบบสั่งซื้อรอบนี้
- จำนวนออเดอร์แยกแหล่งเริ่มเก็บเมื่อ v9.2; ห้ามเติมย้อนหลังโดยไม่มีหลักฐานหรืออ้างยอดรับชำระแยกแหล่งสำหรับบิลผสม
- หากต้องการ quota อุปกรณ์/weekly cron/ประวัติส่งแบบเก็บถาวรหลังลบบัญชี ให้กำหนดสเปกแยกรอบก่อนเพิ่ม ไม่เปลี่ยน feature อื่นโดยพลการ
- เครื่องพิมพ์จริงยังเลื่อนตามคำสั่งผู้ใช้

---

## ประวัติงานค้างก่อน v9.2

# งานถัดไปหลัง AILE POS Cloud v9.1

## P0 — ยืนยันก่อน pilot

1. รัน npm ci / npm run test:native-postgres บน Docker daemon จริง: 16 scripts รวม v9.1 permission controls และ concurrent config editors; เก็บ stdout/exit code ห้ามใช้ embedded แทน native race proof
2. ตรวจ migration จากสำเนา v9.0, trusted CLI grant/revoke, secret แยก, 3 package defaults, ข้อยกเว้นที่หมดอายุ และหลาย API instances
3. รัน backup/restore native พร้อมข้อมูล override/expiry/quota/audit ที่ไม่ว่าง เทียบ hashes ก่อน db:init/รับงานใหม่ และ replay key เดิมหลัง restore; วัด RPO/RTO
4. Browser E2E เต็ม สมัครร้าน→สินค้า/BOM→เติม stock→กะ→ขาย→คืน→ปิดกะ→รายงาน บน native PostgreSQL พร้อมสิทธิ์ต่างกัน
5. Native concurrent checkout/settle/refund และ refund แข่ง KDS รวม failure injection, kill/restart after commit และ lock order ของ stock/BOM

## P1 — การใช้งานและแพ็กเกจ

- ผู้ดูแลธุรกิจกำหนด feature matrix ของทั้ง 3 แพ็กเกจผ่าน platform console; ค่าปัจจุบันคงฟังก์ชันเดิมไว้ ไม่สุ่มตัดบริการ
- ตรวจ UX หน้าต่างเก่าทุกหน้า/หน้ารองที่อาจยังแสดงปุ่มก่อน API ปฏิเสธ รวม offline replay หลังถอนสิทธิ์; API เป็นแหล่งจริง
- ทบทวน monetary approval semantics หากต้องการให้ Cashier อนุมัติผู้อื่นนอกกฎบทบาทเดิม ต้องมีสเปกและ regression แยก ไม่เพิ่มวงเงินโดยแค่เปิด function
- วัด latency จากการตรวจสิทธิ์ DB สดและ shared rate limiter/event bus เมื่อหลาย instances; อย่า cache สิทธิ์จนถอนแล้วไม่ทัน
- ทำชุดสิทธิ์สำเร็จรูป/เลือกหลายฟังก์ชันในครั้งเดียว และ pagination audit ตามข้อมูลใช้งานจริง
- หากต้องจำกัดอุปกรณ์ ให้เพิ่ม device registry และกฎนับโควตาอย่างชัดเจนก่อน ไม่ใช้จำนวนพนักงานแทนอุปกรณ์

เครื่องพิมพ์จริงยังเลื่อนตามคำสั่งผู้ใช้. Pilot เริ่มเมื่อ P0 ผ่านพร้อมหลักฐาน

---

## ประวัติงานค้างก่อน v9.1

# งานถัดไปหลัง AILE POS Cloud v9.0

## P0 — ยืนยันฐานข้อมูลจริงก่อนเพิ่มฟีเจอร์

1. ใช้เครื่องที่มี Docker daemon: `npm ci` แล้ว `npm run test:native-postgres` — runner สร้าง cluster/API disposable ของตนเองและเก็บผลทุกชุด ดู POSTGRES_TESTING_TH.md
2. ตั้ง TEST_BASE_URL เป็น localhost พร้อม port และ AILE_E2E_CONFIRM=I_CONFIRM_DISPOSABLE_POS_DATABASE เฉพาะฐานที่ทิ้งได้
3. รัน test:cash-lifecycle, test:discount-db, test:approval-queue-db, test:refund-db และ test:refund-concurrency-db และ test:refund-rollback-db เก็บ stdout/exit code บน native PostgreSQL; PGlite ไม่รองรับหลักฐาน concurrency รอบ v8.5
4. ทดสอบพร้อมกันทั้ง key เดียวและต่าง key: checkout, settle-cash, partial refund; ต้องมีเงิน/stock/BOM movement ครั้งเดียวและไม่เกินยอดหลังส่วนลด
5. เพิ่ม fault injection หลัง insert sale/refund, หลังแก้ product stock, หลังแก้ ingredient balance และก่อน commit; ยืนยัน rollback ด้วย SQL จริงและทดสอบ restart process หลัง commit ก่อน response
6. ยืนยันยอด reports/shift/ledger/stock บนบิลหลายรายการ, ส่วนลดหารไม่ลงตัว, คืนบางส่วนหลายครั้ง, no-restock และ historical cost

## P0 — สิทธิ์และสต็อก

- v8.9 เพิ่ม branch membership/permission แล้ว; ยืนยัน grants, deny cases และ migration บน native PostgreSQL พร้อมตรวจ Owner legacy review
- ตรวจแข่ง refund กับ KDS preparing และ lock order ของ stock/BOM; เพิ่ม PostgreSQL concurrency test ก่อนแก้
- ออกแบบ return-only ที่ไม่คืนเงินสำหรับสินค้า net 0 และบิลลด 100% ไม่ดัดแปลง ledger เงินสดโดยไม่มีสเปก
- เครื่องมือ reconciliation สำหรับ discounted refund ประวัติเดิม: แสดง diff, ตรวจหลักฐาน, เก็บ audit; ห้ามแก้ยอดย้อนหลังเงียบ ๆ

## P1 — E2E และรายงาน

- Browser E2E เชื่อม API+PostgreSQL จริง: สมัครร้าน → สินค้า/BOM → เติมสต็อก → เปิดกะ → ขาย → คืน → ปิดกะ → Backoffice
- แยก legacy browser tests ที่ขาด fixture ออกจาก current-source tests แต่เก็บประวัติไว้; แก้ v06 guest order assertion และภาพ fixture ที่ขาด
- เพิ่ม regression บน native PostgreSQL สำหรับ buffet cover ที่ product_id null และตรวจ snapshot/count consistency ของรายงาน
- ตรวจต้นทุนคงเหลือเมื่อไม่ restock; แยก gross margin estimate ออกจากบัญชีที่ยืนยันแล้ว
- ตรวจ package dependencies/deprecations และทดสอบ upgrade แบบแยก change

## P1 — Backup / restore

- ใช้สคริปต์ backup เดิมสร้าง dump, verify checksum และ restore:drill ลงฐาน aile_restore_drill_* ที่ว่าง
- เปรียบเทียบจำนวนและยอดเงิน sales/refunds, stock, ingredient usage, approvals, tenants หลัง restore
- วัด RPO/RTO และทดสอบ key เดิมหลัง restore ไม่มีการขายหรือคืนซ้ำ

## ขอบเขต pilot

ใช้ checklist ที่แนบ; เริ่มได้เมื่อรายการ P0 ผ่านพร้อมหลักฐาน ไม่ใช้ผล unit test รับรองพร้อมขายจริง เครื่องพิมพ์จริงยังเลื่อนตามคำสั่งผู้ใช้

ทุก release ให้ต่อยอด v9.0 นี้ เก็บ source ZIP เต็ม, Release Notes ไทย, changed files, logs และอัปเดตสถานะผลที่ยังไม่ได้ทดสอบ

## งานเฉพาะหลัง v8.7

- รัน npm run test:native-postgres บน Docker จริง: ตอนนี้รวม 15 integration scripts และ concurrent refund/KDS ใน v87_transactions_db.mjs
- จำลอง kill/restart process หลัง commit ก่อน HTTP response; v8.7 ทดสอบ socket response loss แล้ว แต่ยังไม่ใช่ process crash
- ยืนยัน flow reconcile/cancel ของ v8.8 บน native PostgreSQL และ Browser ที่ต่อ API+DB จริง
- Native PostgreSQL locking, branch membership, Browser E2E และ backup/restore ยังต้องทำต่อ

## งานเฉพาะหลัง v8.8

- รัน test:kds-returns-db บน native PostgreSQL pool >=2; รวม simultaneous manager-confirm/refund และ preparing/refund
- ทดสอบ rollout migration กับข้อมูลสำเนาจริงและ backup/restore; embedded engine re-run ผ่านแล้ว แต่ยังไม่มี native dump/restore
- Browser UI ของ v8.8 ทดสอบ mock API; ต้องเพิ่ม Browser E2E DB จริงและ native mobile build
- ยืนยัน branch membership v8.9 บน native DB และทำ process crash/restart หลัง commit ตาม P0 ต่อ

## งานเฉพาะหลัง v8.9

- รัน npm run test:native-postgres (15 scripts) บน Docker จริง; native runner เริ่ม API ใหม่แต่ละ suite เพื่อคง auth throttle จริงโดยไม่สะสมจากคนละชุดทดสอบ
- ทดสอบ grant/revoke พร้อมคำขอเขียนที่กำลังทำงาน และ SSE หลาย API instance; รุ่นนี้รับรองเฉพาะสิทธิ์ในคำขอถัดไป ไม่ยกเลิกธุรกรรมที่อนุญาตไปแล้ว
- Owner review legacy grants, rollout migration บนสำเนา DB จริง พร้อม backup/restore
- Browser E2E ต่อ DB จริงและ offline-device policy เมื่อถอนสิทธิ์; UI regression ปัจจุบันเป็น mock API
- หากต้องการ Manager รวมเฉพาะ subset ของสาขาที่อนุญาตใน report เดียว ต้องเพิ่ม report scope-array อย่างชัดเจน; รุ่นนี้เลือกสาขาเดียวหรือ all-tenant เมื่อมีครบทุกสาขา

- ทำ report timezone consistency: รายงาน Backoffice รุ่นเดิมบางชุดใช้ UTC date ขณะที่ชุดใหม่ใช้ Asia/Bangkok; เพิ่ม boundary regression ก่อนปรับ semantics
- Backup/restore audit ต้องเปรียบเทียบ grants, initialized marker และ before/after permission audit เพิ่มด้วย

## สถานะและงานหลัง v9.0

- Timezone และ subset reports ที่ค้างจาก v8.9 แก้แล้ว; native proof และ load/performance tests ยังต้องทำ
- API SIGKILL/restart และ embedded dump/load ผ่านแล้ว; ต้องรัน pg_dump/pg_restore + process restart บน native PostgreSQL จริง
- Browser report E2E ต่อ SQL จริงผ่าน; ยังต้องทำ Browser ขาย→ชำระ→คืน→ปิดกะ ทั้งระบบบน native DB และ migration/restore บนสำเนาฐานจริง
- รัน npm run test:native-postgres (15 scripts) บน Docker ที่ใช้งานได้; ไม่มี Docker ไม่ถือว่าผ่าน
- ทดลอง backup command ใหม่กับฐาน native, ตรวจ .sha256.json และ .business.json, ไม่อนุมัติ legacy schema-only audit เป็น business proof
- วัด RPO/RTO และทรัพยากร full-table hashing บนปริมาณข้อมูลจริง; ทดสอบการเขียนระหว่าง pg_dump exported snapshot
- ตรวจ report count/snapshot consistency เมื่อมี concurrent writes; รุ่นนี้รักษา filter scope แต่ไม่ได้ตรึง report state ข้าม HTTP requests
