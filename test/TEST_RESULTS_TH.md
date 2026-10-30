# ผลทดสอบ v9.7 — 29 ตุลาคม 2026 (Asia/Bangkok)

- npm ci/checkผ่าน; npm test437/437 (418เดิม+13guardที่คืนจากแนบ+6sidebar/cachetestsใหม่)
- build_standalone_v28.py/build_v18.py/mobile:prepareผ่าน บันเดิลครบ21scripts/16styles รวมcanonicalsidebarและthemes
- Browserfeatureparityผ่าน24legacyviews/54controls/62actionkeysเทียบfixtureที่จับจากv8.6จริง: HTTP Demo, Standalone9.7, legacyStandalone1.8, OwnerAPI25views, notifications, mobile390px, customDemo product/price/stock/Add-on/preorderยังอยู่หลังreload, poisonedoldcache/offlinefullsidebarผ่าน. ไม่มีpageerrorsในกลุ่มที่ตรวจ ไม่ได้กดทุกbusinessmutation/ปุ่มพิมพ์จริง
- API/schemaฝั่งbackendเทียบกับv9.6byteเดิมเพื่อเก็บsafety/permissions/financials. StaticnamedJSfunctionsและ130literalAPIroutesจากv8.6ไม่มีตกหล่น. ไม่ใช้staticcomparisonรับรองทุกAPIscenario
- Selectedregressionsผ่าน: refund/transactions/KDS/branches/reports/recovery/functions/notifications/health/workers, v9.5operations/UI, v9.6cost/UI (v97-results.json). ไม่อ้างว่าlegacybrowserที่fixtureไม่ครบทุกชุดได้รันแล้ว
- Nativev8.6preflight exit1ไม่มีdisposableconfirmation/env; Docker/localใหม่exit1ก่อนcluster. Livepreflight exit2ready=false. ไม่ส่งproviderจริง ไม่ทดสอบnative/hardware/production
- หลักฐาน: v97-browser-before.jsonl, v97-merge-verification.json, v97-feature-final.log/v97-final-results.json, v97-results.json, v97-syntax.json, buildlogs. v97-feature-data.logเป็นรอบเพิ่มcustomdataก่อนfinal ไม่ใช่ข้อมูลลูกค้าจริง

---

# ผลทดสอบ v9.6 — 29 ตุลาคม 2026 (Asia/Bangkok)

- npm ci exit0, npm check exit0, npm test418/418 exit0 (เพิ่ม6cases: mixed/no restock, negative contribution, unknown, legacy estimate, invalid cost, snapshot failure). ไม่มี dependency upgrade
- Regression engine เดิม10scriptsผ่าน และ v9.4retry2tests/v9.5operations2tests/load1/UI1ผ่านซ้ำ (validation/v96-results.json)
- v9.6 cost2testsผ่าน: actual API/SQL discounted2999cents, mixedrefund999/1000/1000, replay/over-refund, stock8/BOM96, snapshotราคาทุนเดิม, fullrefundmargin -400, Excel header/ตัวเลข และปิดกะ0. Read-only isolation/forbidden write rollback ผ่านบนembedded SQL
- v9.6 Browser1testผ่าน: UIเปิดกะ ขาย3 คืน2แบบ ปิดกะนับ10บาท Backoffice/refund-cost/reconciliation/discount-approvals/menu profit และ CSV actual cost400/margin600. Account/product/BOM/รับstockเป็นAPIfixture ไม่ใช่ UI ทุกขั้นตอน ไม่มีroute mocksหรือเงินจริง
- UI initial failureในv96-ui-initial.logพบ helper3รายงานอยู่นอกclosure; แก้และกดทดสอบผ่านแล้ว ใช้v96-ui-final.log/v96-final-results.jsonเป็นผลล่าสุด. v96-ui-result.jsonเป็นรอบก่อนเพิ่มassertCSV
- Native Docker/local exit1 ก่อนcluster, live preflight exit2 ready=false ไม่มีprovider sends. Native24/27suites และ writer-race/pg_dump/restore/RPO/RTO/app permissions ยังไม่ได้ยืนยัน
- หลักฐาน stdout/exitCode: validation/v96-results.json, v96-final-results.json, v96-syntax.json, v96-environment.json. ไม่ใช้embeddedเป็นnative concurrency proof

---

# ผลทดสอบ v9.5 — 29 ตุลาคม 2026 (Asia/Bangkok)

- npm ci exit0; package/lock9.5.0 dependencyเดิม ไม่มีupgrade/auditclaim
- npm test412/412 exit0 และnpm checkผ่าน; ผลสุดท้ายในv95-final-results.json
- Regressionengineเดิม10scriptsผ่าน: refund/transactions/KDS/branches/reports/recovery/functions/notifications/health/workers. WorkerจริงsubprocessSIGKILL/restartมีSQLRPCrollbackเมื่อchildตายเพื่อจำลองconnectioncloseของembeddedให้ถูกต้อง ไม่ใช่nativeconcurrency
- v9.4retry2testsและBrowser1testผ่านซ้ำ; ปรับregressionunknownให้บันทึกผลตรวจตามกฎใหม่ก่อนretry ไม่ลบtestsเดิม
- v9.5operations2testsผ่าน: persistentpause, pausebarrier, physicalembeddedrestore/hashก่อนquarantine, v9.4schemamigration, ผลตรวจbackupใช้retryไม่ได้, Owner/Manager/Cashier/foreigntenant/stalerevision และauditfailure rollback
- v9.5load1testผ่าน: backlog240งานacceptครั้งเดียว, batch17/80, HTTP4296งาน/backoff/resume, unknownไม่autoส่ง, slow503LINEพร้อมsale201/ยอด100cents/stock9. ไม่ใช่capacity/SLO/parallelPGproof
- v9.5Browser1testผ่าน: คลิกหน้าPOSขายเงินสดจริง→API201฿25.00 และguestQRเพิ่ม/ตรวจ/ส่งจริง→API201; pausedsaleยังบันทึก, fakeproviderreceipts, review/retryUI, restoreguardUIและmobile390px. Fixtureบัญชี/สินค้า/stock/sessionสร้างผ่านAPI; ไม่มีroute mocksหรือliveprovider. Physicalrestoreแยกทดสอบengineไม่ใช่pg_restoreผ่านbrowser
- Livepreflightexit2ready=false ไม่มีsecrets/ปลายทางอนุญาต ไม่ส่งจริง. NativeDocker/localexit1ก่อนclusterเพราะไม่มีDocker/non-rootไม่พร้อม. Native22/24suites, pg_dump/restore/RPO/RTO, livechannelsและInstagramappchecksยังblocked
- เก็บinitialfailures: operations-initial(PGlitemulti-statementquery), ui-initial(importpath), ui-assertion-initial(APIcamelCaseassertion), ui-stale-detail(ใช้ฟอร์มเก่าระหว่างโหลด แก้UIhide+waitแล้ว). ใช้v95-current-results.jsonเป็นผลtargetedล่าสุด ไม่ถือinitialfailureเป็นpass
- หลักฐาน: validation/v95-run-results.json, v95-final-results.json, v95-current-results.json, v95-operations-current.log, v95-load.log, v95-ui-current.log, v95-syntax.json และv95-environment.json. ExpectedfaultSQLerrorในlogsเป็นfaultinjectionที่assertrollbackแล้ว

---

# ผลทดสอบ v9.4 — 29 ตุลาคม 2026 (Asia/Bangkok)

- npm ci exit0; deprecation warnings เก็บใน validation/v94-npm-ci.log ไม่มี dependency upgrade/audit claim
- npm test 412/412 exit0; npm check exit0. JS/MJS syntax240ไฟล์ + Python compile ผ่าน
- Regression engine10 scripts exit0 ทั้งหมด: refund-rollback/transactions/KDS/branch/reports/recovery/functions/notifications/health/workers (v94-run-results.json)
- Browser lifecycle1test exit0 (v94-browser.log / v94-additional-results.json): actual settings UI + browser HTTP order APIs + real Express/JWT/embedded SQL ไม่มี route mocks; POS/QR/online replay, source/provider/type on-off, unknown dismiss/confirm, fake provider24acceptance, exact ฿3.75 interval/monthly/dedup, Manager/tenant denial และ mobile width. ไม่ใช่ UI checkout ทั้งระบบ/native/live receipt
- Retry/restore2tests exit0 (v94-retry-engine.log): LINE23/25/48hไม่เรียก provider, unknownไม่ส่งซ้ำ, fresh retry ID, old never-attempted firstsend; physical embedded restore hashesเท่ากันและstale pending/unknownไม่มี I/O
- Worker subprocessจริง SIGKILL/restart + embedded physicalrestore เดิมผ่านซ้ำ (v94-workers.log). ไม่ใช่ native concurrency
- Livepreflight exit2 ready=false ไม่ส่งจริง. Docker exit1 ENOENT; local native exit1 non-root required ไม่มี clusterเริ่ม. Native backup/restore/RPO/RTO/browser และInstagram apppermissionsจริงไม่ยืนยัน
- Initial browser harness attempts เก็บแยก: v94-browser-initial.log (Python path ENOENT), v94-browser-dependency-overlap.log (unsupported charset ระหว่างรัน npm ci), v94-browser-catchup-fixture.log (fixtureเปิด catchupหลายช่วง), base-passก่อนเพิ่มunknown scenarios. ใช้ผลสุดท้าย v94-browser.log exit0 เป็นหลัก ไม่ถือinitial failuresเป็นpass
- v94-native-local.log เก็บข้อความจากrunnerก่อนปรับคำอธิบาย; v94-native-local-final.log เป็นรอบล่าสุด ข้อจำกัดเหมือนเดิม. v94-syntax.json, v94-environment.json, v94-run-results.json, v94-additional-results.json เก็บหลักฐาน

---

# ผลการทดสอบ AILE POS Cloud v8.1

วันที่ 28 ตุลาคม 2026 — Node 24.22.1, npm 11.9.0, Python 3.12, Playwright 1.64.1

## ทดสอบที่ผ่าน

- Baseline ก่อนแก้: npm test 350/350; หลังแก้: 365/365, exit code 0 ใน validation/v81-unit.log
- 9 allocation tests รวมลูปตรวจหลายจำนวน/ส่วนลด และ 6 HTTP tests ใช้ Express จริง + SQL double (ไม่ใช่ PostgreSQL)
- npm run check ผ่าน และตรวจ syntax เพิ่ม 174 JS/MJS files ไม่มี failure
- Browser ใช้ Chromium จาก @sparticuz/chromium ที่ติดตั้งแยกจาก product dependencies เพราะดาวน์โหลด browser ทาง Playwright ได้ archive ไม่สมบูรณ์
- แทน path /usr/bin/chromium เฉพาะตอนเรียก tests ในสำเนาชั่วคราว; screenshots ไม่รวมใน deliverable
- v18 responsive และ route smoke ผ่าน แต่เป็น historical standalone v1.8 ไม่ใช่ live E2E
- v28 offline E2E ผ่านจริงใน Chromium/IndexedDB ทั้ง Web Locks และ lease; การตอบจาก server เป็น callback จำลอง
- v81 UI test ใช้ web source ปัจจุบันผ่าน HTTP static server ไม่เชื่อมฐานข้อมูล

## Browser รายชุด (31 scripts)

ผลล่าสุด 17 ผ่าน / 14 ไม่ผ่าน ไม่รวม capture_v05.py ซึ่งเป็นสคริปต์ถ่ายภาพ ไม่ใช่ assertion suite

| Script | ผลล่าสุด | หมายเหตุ |
|---|---|---|
| browser_mock_api.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| browser_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| restaurant_v04.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v05_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v06_buffet_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v06_smoke.py | FAIL | แก้ Playwright viewport signature แล้ว แต่ guest .gorder assertion ยังไม่ผ่าน ดู v06-browser-rerun.log |
| v06_smoke_inline.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v07_buffet_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v07_order_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v07_service_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v08_bill_split_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v09_payment_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v10_previous_payment_regression.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v10_previous_split_regression.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v10_refund_edge_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v10_refund_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v11_cash_shift_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v11_register_flow_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v11_v10_previous_payment_regression.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v11_v10_previous_split_regression.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v11_v10_refund_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v12_browser_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v13_browser_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v14_browser_smoke.py | PASS | รันซ้ำพร้อม static server ปัจจุบัน ดู v14-browser-rerun.log |
| v15_browser_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v16_customer_guest_smoke.py | FAIL | ขาด preview/ภาพ fixture ที่ script อ้าง |
| v17_browser_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v18_browser_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v18_routes_smoke.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |
| v28_browser_offline_e2e.py | PASS | แก้ fixture เพิ่ม branchId; รัน Chromium/IndexedDB จริง ดู v28-browser-rerun.log |
| v81_refund_browser.py | PASS | ผ่าน; หลายชุดใช้ historical preview/demo ไม่ใช่ live backend |

เก็บผลรอบแรกใน validation/browser/results.json และผลหลังแก้ fixture/เตรียม server ใน latest-results.json ไม่มีการนับบาง assertion ของชุดที่ fail ว่าผ่านทั้งชุด

## ฐานข้อมูลและระบบภายนอก

- ไม่มี PostgreSQL/Docker พร้อมใช้งาน; apt พบข้อจำกัด setuid/setgroups และสิทธิ์เขียน archive ติดตั้งไม่สำเร็จ
- npm run db:init เรียกฐาน disposable localhost แล้ว ECONNREFUSED (validation/db-init.log)
- เริ่มรัน API integration ทั้ง 7 scripts (v11/v12/v13/v28/v61/v62/v81) แต่หยุดก่อน business assertions เนื่องจากไม่มี API/DB ที่เชื่อมได้; ผลใน validation/integration/
- v81_refund_db_integration.mjs เป็นชุดทดสอบเตรียมไว้สำหรับ sale → discounted refund → product/BOM restock → report → shift รวม simultaneous key replay ยังไม่ยืนยันว่าผ่าน PostgreSQL
- ไม่ได้รัน backup/restore DB จริง, fault injection บน DB จริง, native mobile build, payment gateway หรือเครื่องพิมพ์จริง
- npm install สำเร็จโดยไม่รัน dependency install scripts และไม่ได้รัน npm audit; lockfile ช่วยให้ติดตั้งชุด dependency เดิมได้ ไม่ใช่ใบรับรองความปลอดภัย

## คำสั่งทดสอบซ้ำ

```sh
npm ci
npm test
npm run check
python -m pip install playwright
python -m playwright install chromium
python tests/v81_refund_browser.py
# สคริปต์ v28 default ใช้ /usr/bin/chromium; override ด้วย CHROMIUM_PATH
python tests/v28_browser_offline_e2e.py
```

สำหรับ test:refund-db ต้องเปิด PostgreSQL/API ทดสอบก่อน และตั้ง TEST_BASE_URL / AILE_E2E_CONFIRM ตาม NEXT_STEPS_TH.md ห้ามเรียกกับฐาน production

## เพิ่มเติมในรอบ v8.2 — PostgreSQL engine ผ่าน wire protocol

- ใช้ PGlite (embedded PostgreSQL engine) ผ่าน PGlite Socket Server ให้ Node pg และ API ต่อด้วย PostgreSQL wire protocol; ไม่ใช่ native PostgreSQL server
- npm run db:init ผ่าน
- v11, v12, v13, v28, v61 และ v81 API integration ผ่าน โดยใช้ DB_POOL_MAX=1
- v62 discount approval DB integration ไม่ผ่าน: socket ปิด connection ใน test ที่ใช้หลาย connection
- pool ขนาด 1 serialize คำขอที่ต้องใช้ connection จึงไม่ใช้ยืนยันการแข่ง transaction/lock หลาย connection
- หลัง integration, npm test และ npm run check ผ่าน; logs อยู่ใน validation/postgres-wire/ และ validation/v82-unit.log
- ต้องรันซ้ำบน native PostgreSQL ก่อนสรุปว่าผ่านการทดสอบ DB สำหรับ pilot

## เพิ่มเติมในรอบ v8.3 — คืนสต็อกขณะ KDS ทำงาน

- Integration v81 รันผ่านบน PGlite หลังเพิ่มการทดสอบ KDS preparing; refund ที่ขอ restock ได้ HTTP 409 และไม่เพิ่ม stock/BOM, refund แบบ no-restock ได้ HTTP 201
- v11/v12/v13/v28/v61/v81 ผ่านในชุดรันซ้ำ; v62 ยังไม่ผ่านเพราะ PGlite socket ปิด connection ในกรณี client หลาย connection
- `npm test` 365/365 ผ่าน; `npm run check` ผ่าน
- ไม่ได้ยืนยัน lock race จริงบน native PostgreSQL; row lock behavior ต้องผ่าน multi-connection test ก่อน pilot

## เพิ่มเติมในรอบ v8.4 — รายงานรายการที่ไม่มี product link

- Unit tests ใหม่ครอบคลุม menu profitability, estimated profit, historical cost, refund cost และ SQL tenant-scoped LEFT JOIN
- PostgreSQL API integration สร้าง buffet cover ผ่าน API จริงและ settle cash; ตรวจว่ารายการ `product_id = NULL` อยู่ในทั้งสี่รายงาน พร้อม coverage = 1, ยอด 123 สตางค์ และต้นทุน null
- Integration ผ่านบน PGlite; ไม่มีการใช้ direct SQL เพื่อสร้าง orphan transaction


## เพิ่มเติมในรอบ v8.5 — แข่งคืนเงินด้วยคนละ idempotency key

- เพิ่ม `tests/v85_refund_concurrency_db.mjs` และ `npm run test:refund-concurrency-db`; เตรียมรันกับ disposable database และต้องตั้ง `DB_POOL_MAX>=2`
- ทดสอบซ้ำคืนสินค้าจำนวนเดียวกันด้วยคนละ key พร้อมกัน คาดหวัง 201/409, refund หนึ่งรายการ, restock ครั้งเดียว และยอดกะถูกต้อง
- `node --check tests/v85_refund_concurrency_db.mjs`: ผ่าน
- ลอง API integration บน PGlite pool 2: **ไม่ผ่าน**; หนึ่งคำขอได้ 201 แต่อีกคำขอเป็น 500 เพราะ PGlite socket ปิด connection (`Connection terminated unexpectedly`) ก่อนตอบผล conflict
- ผลนี้ไม่ยืนยันว่าธุรกรรม refund บน PostgreSQL จริงผิด; ยังไม่มี native PostgreSQL server ใน environment จึงต้องรันซ้ำบน disposable native PostgreSQL ที่มี connection pool อย่างน้อย 2
- `npm test`: 370/370 ผ่าน; `npm run check`: ผ่าน; ไม่มีการเปลี่ยน schema หรือ business API ใน v8.5


## เพิ่มเติมในรอบ v8.6 — SQL rollback และ native runner

- npm ci --ignore-scripts --no-audit --no-fund ผ่าน; เพิ่ม devDependency @electric-sql/pglite 0.5.12 แบบ pin
- npm test: 370/370 ผ่าน; npm run check และ syntax scripts ใหม่ผ่าน
- ใช้ SQL engine PGlite โดยตรงกับ Express routes จริง ผ่าน fault injection 5 จุด (refund header/detail, stocks, ingredient balances, audit ก่อน commit)
- ทุกจุดตรวจว่า ledger, stock, BOM balance, returned_units, movement counts และสถานะ sale กลับค่าก่อน refund
- Retry ด้วย key เดิมหลัง rollback ผ่าน; replay คืน refund เดิม, คืน product/BOM ครั้งเดียว, ยอดกะเป็น 0
- API+pg-wire fault test ลองรันแล้วไม่ผ่าน (Connection terminated unexpectedly); ตัดสินเป็นข้อจำกัด pg-wire รอบนี้ ไม่ยืนยัน native PostgreSQL
- npm run test:native-postgres: exit 1 ที่ Docker preflight (spawnSync docker ENOENT), ยังไม่ได้สร้าง native cluster หรือรัน business assertions
- ยังไม่รัน crash/restart หลัง commit, native multi-connection race, live Browser E2E และ backup/restore


## v8.7 — 29 ตุลาคม 2026

- npm test 370/370 ผ่าน; npm run check และ syntax native wrapper ผ่าน
- npm run test:transactions-engine ผ่าน 1 scenario suite ใช้ createApp จริง, auth/JWT จริง และ PGlite schema เต็ม
- SQL trigger faults checkout: sales, stocks, ingredient balances, audit (4 จุด)
- SQL trigger faults ส่งโต๊ะ: session items, ingredient balances, stocks, audit (4 จุด)
- SQL trigger faults settle-cash: sales, sale items, qty remaining, payments, idempotency, audit (6 จุด)
- ทุก fault snapshot 15 tables เท่าเดิม; retry หลัง rollback ใช้ key เดิมสำเร็จ
- ปิด socket หลัง commit checkout และ settle-cash แล้ว retry: sale ID ตรง ledger และ snapshot ไม่เปลี่ยน
- ส่งครัวตัด stock/BOM ครั้งเดียว; settle-cash ไม่ตัดซ้ำ; cash shift กระทบยอดผ่าน
- Refund-first: restock แล้ว KDS preparing ถูก 409. Kitchen-first: preparing แล้ว refund restock ถูก 409 และ stock/BOM ไม่เพิ่ม
- ชุด refund rollback engine v8.6 ผ่านซ้ำ
- Native runner exit 1 ที่ preflight เพราะ spawnSync docker ENOENT; native race script ยังไม่ได้รัน ไม่อ้างผล engine เป็น multi-connection proof
- ยังไม่ได้ทำ process kill/restart, live Browser E2E, native PostgreSQL และ backup/restore


## v8.8 — KDS หลังคืนสินค้า (29 ตุลาคม 2026)

- npm test 370/370 ผ่าน; npm run check และ syntax kitchen-returns/native integration ผ่าน
- test:kds-returns-engine ผ่าน: partial return จำนวน 3→2→1, manager confirm, cashier 403, cross-tenant 404, stale revision 409, replay audit ไม่ซ้ำ, คืนเพิ่มบล็อก preparing จนยืนยันใหม่
- full restock: cancel ticket, financial tables ไม่เปลี่ยน, table ว่างและ checkout ใหม่โต๊ะเดิมสำเร็จ, cancelled history ยังอยู่
- no-restock refund: returnedQty แสดงยอดคืน แต่จำนวนปรุงไม่ลด เพราะยังไม่มีการคืน stock/BOM
- schema.sql รันซ้ำกับ cancelled history ผ่านบน PGlite engine
- regression test:transactions-engine v8.7 และ test:refund-rollback-engine v8.6 ผ่านซ้ำ
- Chromium current-source UI ผ่าน: ตัวเลขขาย/คืนสต็อก/เหลือ, manager button, ส่ง revision/branch, cashier restriction, cancel label และ queue filtering; response API เป็น mock ไม่ใช่ DB-backed E2E
- native runner exit 1 ที่ preflight (Docker ENOENT); native test v88_kds_db.mjs พร้อม concurrency scenarios แต่ยังไม่รันจริง
- mobile/customer shells sync app.js/sw.js; ไม่ได้ build หรือทดสอบ APK/IPA และเครื่องพิมพ์จริง


## v8.9 — สิทธิ์รายสาขา (29 ตุลาคม 2026)

- npm test 370/370 ผ่าน; npm run check และ syntax branch-access / native runner / owner UI ผ่าน
- test:branch-access-engine ใช้ schema เต็ม, JWT/auth และ Express routes จริงบน PGlite ผ่าน
- ตรวจ 11 กลุ่ม operational read endpoints และรายงาน 18 ชุด: อนุญาตสาขา A, ปฏิเสธ B และปฏิเสธ aggregate ที่ไม่มีสิทธิ์ครบ
- ตรวจ direct sale/refund/receipt, kitchen ticket, cash shift IDs, table spoofing, idempotency lookup/replay, allowed checkout/stock/refund และ forbidden writes
- XLSX export สาขาที่อนุญาตได้; export สาขาอื่น/ทั้งร้านถูกปฏิเสธก่อนสร้างไฟล์
- เพิ่ม/ถอน grants โดยใช้ token เดิมได้ทันทีใน request ถัดไป; owner scope เปลี่ยนไม่ได้; cross-tenant grants และ guessed IDs ถูกปฏิเสธ
- stale editor expectedBranchIds ถูก 409; PUT ซ้ำไม่เพิ่ม audit; before/after audit ตรวจได้
- SSE ที่เปิดอยู่ใน API instance เดียวกันปิดเมื่อถอน branch; schema re-run ไม่คืน grants ของ legacy ที่ถอนหรือ new staff ที่ไม่มี grants
- Regression v8.6/v8.7/v8.8 embedded SQL suites ผ่านซ้ำ; ปรับ fixtures ให้ระบุ branch grants สำหรับการทดสอบ role เดิม
- Chromium branch editor ผ่านเพิ่ม/ถอนทั้งหมด, expected IDs, audit history และ non-owner gate (mock API)
- Native runner exit 1 ที่ Docker preflight (ENOENT); ไม่มี native PG, DB-backed browser E2E หรือ multi-instance race proof

- เพิ่ม semantic assertions: sale IDs ของรายงานพื้นฐาน, branch rows และ menu report coverage มีเฉพาะสาขาที่อนุญาต. Fixture เลือกช่วงสองวันเพื่อครอบคลุม UTC/Bangkok date boundary ของรายงานเดิม ไม่ใช่การยืนยัน timezone semantics


## v9.0 — Report correctness / Recovery (29 ตุลาคม 2026)

- npm test 374/374 ผ่าน: เดิม 370 + 4 timezone/scope/invalid calendar regression
- Report API engine suite ผ่านวันก่อน/หลังเที่ยงคืนไทย, เดือน และปี; DB session/browser timezone New York ไม่ทำให้ Bangkok boundaries เปลี่ยน
- Scope A+C: JSON 18 report families, XLSX cell values และ PDF text ไม่มี B; invalid/mixed/empty scopes ถูกปฏิเสธ
- ยอดขาย 8 บาท คืน 1 บาท สุทธิ 7 บาท ตรงกับยอดปิดกะของ A+C; คืนเงินยังอิงวันขายของบิลตาม contract เดิม
- Browser E2E ผ่านแบบไม่มี mock API: หน้า Backoffice → เลือก A+C → ดูรายงาน → แก้ pending selection เป็น A → ส่งออก XLSX ยังเป็น A+C ตามข้อมูลที่แสดง
- ฆ่า child API ด้วย SIGKILL หลัง COMMIT และก่อน HTTP response ทั้ง cash-checkout/refund แล้วเริ่ม process ใหม่: replay key เดิมได้ sale/refund ID เดิมและ business snapshot ไม่เปลี่ยน
- Physical PGlite dump/load ผ่าน; SHA-256/counts ของทุก public table และ totals ตรงกัน รวม grants/marker/audit. ทดสอบแก้ marker ให้ผิดแล้ว audit ตรวจพบ ก่อนคืนค่าและตรวจ replay
- v8.6/v8.7/v8.8/v8.9 embedded regressions ผ่านซ้ำ; npm run check และ syntax scripts ใหม่ผ่าน
- Native runner exit 1 ที่ Docker preflight (ENOENT): ยังไม่รัน native PostgreSQL, host pg_dump/pg_restore CLI, Docker build หรือ native Browser E2E
- ไม่อ้าง embedded RPC adapter ว่าเป็น native pg-wire/connection pool test. Recovery harness อยู่ใน tests เท่านั้น ไม่มี production crash endpoint/header hook


## v9.1 — Package / Tenant / Staff Functions (29 ตุลาคม 2026)

- npm test 381/381 ผ่าน: เพิ่ม 7 unit tests จาก 374 ของ v9.0; check และ syntax ทั้ง 210 JS/MJS ผ่าน
- Express/JWT/PGlite integration ผ่าน: plan default → tenant override/expiry → staff override → branch scope; Owner ไม่ได้ platform privilege อัตโนมัติ, token ข้าม audience ใช้ไม่ได้, platform revocation ใช้ token เดิมไม่ได้
- Manual Cashier refund และ KDS reconciliation ผ่าน; refund replay ไม่เพิ่ม ledger/restock, grant stock เฉพาะสาขา, shared catalogue ต้องครบทุกสาขา
- การถอนด้วย token เดิม, self/cross-tenant/branch escalation, stale revisions, unknown functions, expired promo input, quota override/expiry/plan change ผ่าน
- SQL trigger ทำ audit insert ล้ม: API 500 ตามคาด แล้ว configuration/revision ไม่เปลี่ยน; error ใน log ชุดนี้เป็น fault injection ที่ตั้งใจ
- Public QR view/order/service request และ storefront entitlement ถูกปิดจริง; export alias ไม่ข้าม view permission; discount action ปิดได้โดยไม่ปิด checkout ทั้งหมด
- JSON และ Excel bulk imports เกินจำนวนสินค้าใหม่ถูก 409 และไม่มีสินค้าหลุดเข้า DB
- Schema re-run ไม่ฟื้น rules/grants; ตรวจเฉพาะ permission tables เนื่องจาก legacy schema เติมตำแหน่งโต๊ะที่ยังว่าง. Physical dump/load แยกตรวจทุก public table ตรงกันและตรวจพบการแก้ staff_function_rules หลัง restore
- Chromium ต่อ API/SQL จริงไม่ mock: staff toggle/reset/reason/audit, platform deny/promo/reset, POS เมื่อ KDS ปิด, package editor, context reset และ viewport 390px ผ่าน
- Regression engine ทั้ง 6 scripts ของ v8.6–v9.0 ผ่าน ดู validation/v91-regressions.json
- Native runner 16 scripts exit 1 ที่ Docker ENOENT ก่อนสร้าง cluster; native concurrent editors, pg_dump/restore, native Browser POS ครบวงจร และ Docker build ยังไม่ได้รัน
- CLI grant/revoke ผ่าน syntax แต่ยังไม่ได้เรียกกับ native DB. ไม่มีการทดสอบ hardware/เครื่องพิมพ์หรือ APK/IPA
- Browser ครั้งแรกเลือก executable ผิดและรอ option แบบ visible ทำให้ fixture timeout; แก้ path/รอ attached แล้วรันจริงผ่าน ไม่ผ่อน API assertions


## v9.2 — Platform Notifications (29 ตุลาคม 2026)

- npm test 399/399 ผ่าน (เพิ่ม 18 notification cases จากฐาน v9.1 381); npm run check และ node syntax เพิ่มเติมผ่าน
- Unit: default-off, invalid settings, tenant-bound AES-GCM, official-host allowlist, raw HMAC, Bangkok day/month/year/leap boundaries, LINE retry, ambiguous network, provider acceptance และ IG UTF-8/window guard ผ่าน
- API/Express/JWT/PGlite: four order paths (POS checkout / staff table / QR / online), source/provider toggles, idempotent events/jobs, sale+stock+ledger+outbox rollback และ audit failure rollback ผ่าน
- Cross-tenant/Manager credentials denied, stale revision/delete denied, connection delete, secrets masked/encrypted, package action denial ก่อน I/O ผ่าน
- Verified IG/LINE callbacks ผ่านและ spoof signature ถูกปฏิเสธ; IG ไม่มี window ไม่ส่งจริง; provider HTTP ผ่าน fake fetch ทั้งหมด
- Worker interrupted: non-idempotent provider กลาย unknown, LINE retry key เดิม; manual unknown ต้องยืนยันก่อนส่งซ้ำ; accepted/429/failed status ไม่ปลอมเป็น delivered/read
- SQL monthly summary ใช้ half-open Bangkok boundary, ข้อมูลยังไม่ชำระไม่รวมรับเงิน; scheduler หลาย tick ไม่สร้างช่วงซ้ำ
- Physical embedded dump/load เก็บ encrypted credentials/policy/events/delivery/audit ครบ โดย master key เดิมยังอยู่ใน environment
- Chromium ต่อ API/SQL จริง: main sidebar → notifications, 3 types/4 providers, schedule persistence เมื่อ browser timezone New York, toggle/test queue/history/audit, สองแท็บแก้ชนกัน และ mobile width ผ่าน. ตรวจภาพภายในแล้วเพิ่ม bundled Thai font เพื่อแก้ runtime ที่ไม่มีฟอนต์ไทย
- v8.6–v9.1 engine regressions 7 scripts ผ่าน (validation/v92-regressions.json)
- Native runner 17 scripts exit 1 ที่ Docker ENOENT ก่อนสร้าง cluster (validation/v92-native.log). ไม่รัน native locks/multi-worker, pg_dump/restore, Docker build หรือ native APK/IPA
- ไม่มี live Discord/LINE/Telegram/Instagram messages หรือ app review/permission proof. ไม่ได้ทดสอบเครื่องพิมพ์จริง


## v9.3 — Notification Health / Queue (29 ตุลาคม 2026)

- npm test 407/407 ผ่าน: เพิ่ม 8 queue/cursor/advice/provider-correlation/HTTP-timeout unit cases จากฐาน 399
- API/Express/JWT/PGlite: 63 jobs ที่ created_at เท่ากันถึง microseconds แบ่งหน้า 7 ต่อครั้งครบ ไม่หาย/ซ้ำ; filters รวมกัน, cursor tamper/เปลี่ยน scope ได้ 400; legacy array ยังใช้ได้
- Health counts ครบทุกสถานะ, heartbeat fresh/stopped, Thai advice, owner/tenant isolation, detail ไม่คืน credentials ผ่าน
- Lease หมดแล้ว claim ใหม่: finish จาก token เก่าถูกปฏิเสธ ผล token ใหม่/attempt history ถูกต้อง
- Process จริง 1 ตัวต่อรอบบน embedded: healthy claims, SIGKILL หลัง fake acceptance, restart LINE key เดิม/Discord unknown, physical dump/load และไม่ส่ง sent ซ้ำผ่าน ไม่ใช่ native multi-connection proof
- Chromium ต่อ API/SQL: health/filter/pages/previous/detail/status-card search/no-worker warning/mobile width ผ่าน และตรวจภาพภายในภาษาไทย
- Regression v8.6–v9.2 engine 8 scripts ผ่าน; serial-engine-pool ใช้จัดคิว connection เดียวให้ transaction tests ตรงกับ embedded ไม่ใช่แอบจำลอง native pooling
- Native runner 19 scripts exit 1 ก่อน cluster เพราะ Docker ENOENT. 4-process barrier และ pg_dump/restore test เตรียมแล้ว ยังไม่รัน
- Live-check --preflight exit 2 ready=false เพราะไม่มี config จริง; ไม่มี live messages. Checker ตัวอย่างทดสอบ acceptance เท่านั้น ไม่อ้าง full order lifecycle/recipient receipt
- Docker build/native mobile/เครื่องพิมพ์จริงยังไม่ได้ทดสอบ

- รอบ unit ที่รันคู่หลายชุดมี log ไม่ครบจึงไม่ใช้รับรองผล; รัน npm test แยกใหม่ได้ 407/407 และ exit 0 เก็บผลใน validation/v93-core-checks.json
