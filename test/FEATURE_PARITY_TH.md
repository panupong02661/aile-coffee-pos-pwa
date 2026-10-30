# v9.7 — รายการรวมฟังก์ชันจากไฟล์แนบ v8.6 กับฐาน v9.6

29 ตุลาคม 2026 (Asia/Bangkok)

## ผลตรวจไฟล์จริง

- แนบ v8.6:603ไฟล์, SHA256 `58a0490a206ae5cb1be631cd49100a036aadbb8ce38b2630dbc916b01e05f127`
- v9.6:966ไฟล์, SHA256 `08fb9ed7d07ee600b6870e93f5521c9951230169b9a77f8964be3ee384385f01`
- พบ12ไฟล์ขาดจริงและคืนครบ; pathเดิมของv8.6/v9.6อยู่ครบ ไม่มีไฟล์เดิมถูกลบ
- ไม่พบชื่อfunction declarationเก่าหายจากไฟล์JSชื่อเดียวกัน และไม่พบ literal API route130รายการของv8.6หาย. เป็นstatic comparison ไม่ใช่หลักฐานว่าทุกscenarioของAPIผ่านจริง
- sourceเว็บเดิมส่วนใหญ่เหมือนกัน เมนูที่ผู้ใช้ระบุยังมีrenderer/handlerอยู่. ทดสอบเปิดfresh sourceพบครบ แต่ไม่ยืนยันสาเหตุบนเครื่องผู้ใช้. v9.7จึงรวมsidebarกลางและแก้build/cacheเพื่อป้องกันไฟล์โหลดไม่ครบ/ปนรุ่น
- API/schemaของv9.6เก็บ byteเดิม ไม่แทนด้วย8.6. สิทธิ์และความปลอดภัยรุ่นใหม่ยังตรวจเหมือนเดิม

ดู validation/v97-baseline-comparison.json, v97-merge-verification.json และ v97-browser-before.jsonl. ต้นฉบับแนบครบ byteเดิมอยู่ legacy/v86-attached/ORIGINAL_INPUT_V86.zip ไม่ใช่โค้ดที่serverโหลด. เอกสาร/logsเก่าที่ชื่อชนเก็บในแฟ้มเดียวกัน ไม่ทับสถานะปัจจุบัน

## เมนูหลักที่รวมและทดสอบ

| กลุ่ม | เมนู / view | ผลเทียบกับแนบ |
|---|---|---|
| แอป/อุปกรณ์ | อุปกรณ์ / เตรียมแอป `device-center` | คงไว้ |
| QR | QR Ordering `qr` | คงไว้ |
| ธุรกิจออนไลน์ | ออเดอร์ออนไลน์ `online` | คงไว้ |
| ธุรกิจออนไลน์ | จัดการบุฟเฟ่ `buffet` | คงไว้ |
| ธุรกิจออนไลน์ | ประเภทธุรกิจ `business` | คงไว้ |
| ร้านค้า | เมนู / สินค้า `products` | คงไว้ |
| ร้านค้า | หมวดหมู่ Add-on `addons` | คงไว้ |
| ร้านค้า | วัตถุดิบ / สูตร `ingredients` | คงไว้ |
| ร้านค้า | คลังสินค้า / สต็อก `stock` | คงไว้ |
| ร้านค้า | จัดซื้อ / รับสินค้า `purchases` | คงไว้ |
| ร้านค้า | แอปมือถือ / ร้านออนไลน์ `mobile` | คงไว้ |
| ร้านค้า | ตรวจสลิป / พรีออเดอร์ `preorders` | คงไว้ |
| ลูกค้า | สมาชิกและคะแนน `customers` | คงไว้ |
| ลูกค้า | โปรโมชั่น / คูปอง `promos` | คงไว้ |
| ระบบ | รายงานทั้งหมด `reports` | คงไว้ |
| ระบบ | คืนเงิน / หลังการขาย `after-sales` | คงไว้ |
| ระบบ | กะงาน / กระทบยอด `register` | คงไว้ |
| ระบบ | ออฟไลน์ / ซิงก์ `offline` | คงไว้ |
| ระบบ | เครื่องพิมพ์ / เอกสาร `printers` | คงไว้ |
| ระบบ | SaaS / แพ็กเกจ `saas` | คงไว้ |
| ระบบ | ศูนย์ควบคุมระบบ `ops-center` | คงไว้ |
| ระบบ | บันทึกกิจกรรม `audit` | คงไว้ |
| ระบบ | พนักงาน / กะงาน `employees` | คงไว้ |
| ระบบ | ตั้งค่า / SaaS `settings` | คงไว้ |
| ระบบ | ตั้งค่าแจ้งเตือนแพลตฟอร์ม `notifications` | เก็บเพิ่มจากv9.2–v9.6 |

รวม25เมนู ไม่รวมtop tabs POS/KDS/โต๊ะ/Dashboardซึ่งยังคงอยู่. ปุ่ม/ตัวเลือก/fieldsใน24หน้าเดิมเทียบผ่านfixtureจากv8.6:54controls/62action keys. ไม่ใช่การกดทุกปุ่มที่สร้างธุรกรรมหรือพิมพ์จริง

## ขอบเขต Demo และ Backend เดิม

ยกฟังก์ชัน/ตัวเลือกเดิมกลับมาครบไม่ได้เท่ากับแปลงDemoทุกตัวเป็นBackendใหม่. sourcev8.6เองปิดการแก้โมดูลv1.5เมื่อisLiveเพื่อไม่ให้ข้อมูลDemoปะปนกับการขายจริง; v9.7เก็บguardนี้ไว้ เช่นหน้ารวมเมนู/Add-on/สูตร/แอปมือถือ/พรีออเดอร์. สินค้าจริงยังจัดการผ่านBackofficeและAPIเดิมได้ ส่วนBOM/stockBackendและธุรกรรมทดสอบตามชุดintegrationเดิม

CRM/โปรโมชั่น/จัดซื้อบางส่วนยังเป็นDemoตามรุ่นเดิม. ตรวจสลิปเป็นการตรวจโดยพนักงาน ไม่ใช่ยืนยันธนาคารอัตโนมัติ. ไม่เพิ่มการชำระเงินจริงหรือเปิดสิทธิ์ข้ามtenant/branch. Owner/Manager/Cashierยังถูกตรวจที่API ไม่ใช้การเห็นเมนูเป็นสิทธิ์อนุญาต

ข้อมูลcustomที่ทดสอบ: productชื่อ/ราคา7777/stock37, Add-onราคา234, preorder pending และmarkerจากv8.6ยังอยู่หลังreloadv9.7. เป็นfixtureจากv8.6ไม่ใช่ฐานลูกค้าจริง. รุ่นนี้ไม่ล้างlocalStorage/IndexedDB และไม่mergeข้อมูลธุรกรรมจากDemoเข้าPostgreSQL

## วิธีเปิดรุ่นที่รวมครบ

- Backend: ใช้rootโปรเจกต์v9.7ทั้งชุด `npm ci`, ตั้งenv/key/ฐานตามคู่มือเดิม, `npm start` แล้วเข้าindexผ่านserver. mainfooterต้องแสดงv9.7
- Demoดูเมนูโดยไม่ต้องserver: เปิด `dist/AILE_POS_Cloud_v9.7_Standalone.html`. ไม่ใช่POSproduction และหน้าที่ต้องBackendยังต้องserver/บัญชีที่ถูกต้อง
- legacy `dist/AILE_POS_Cloud_v1.8_Standalone.html` และ `web/preview-v18.html` สร้างใหม่จากsourceปัจจุบันเพื่อไม่ให้ขาดextension. previewรุ่นเก่าอื่นเก็บเป็นประวัติ อย่าใช้แทนentryv9.7
- หลังอัปเดต ให้บันทึก/พักบิลที่ค้างก่อนปิดหน้าเก่า แล้วเปิดรุ่นใหม่หรือhard reloadเพื่อโหลดไฟล์ครบ. ไม่ต้องล้างข้อมูลเว็บไซต์หรือฐานข้อมูล. อย่าคัดลอกเฉพาะapp.jsโดยไม่เอาextension/index/SWมาด้วย
- PWA9.7pinbootJS/CSSตามรุ่นและcacheติดตั้งครบก่อนactivate. failedcriticalscriptไม่ทำให้activateแคชครึ่งชุด. Guest/customer orderingยังต้องออนไลน์ ไม่สร้างผลชำระปลอมเมื่อoffline
- `npm run build:standalone`, `npm run build` และ `npm run mobile:prepare` รองรับindexใหม่. Shellเป็นwebassets ไม่ใช่APK/IPAที่buildแล้ว

## ไฟล์และคำสั่ง v8.6 ที่คืน

คืน docker-compose.v86.test.yml, scripts/v86-native-db-guard.mjs, v86-native-evidence.mjs, v86-native-preflight.mjs, tests/v86_cash_concurrency_db.mjs, v86_native_db_guard.test.mjs และvalidationเดิมอีก6ไฟล์

คำสั่งเดิมกลับมา: test:native-preflight, test:cash-concurrency-db, test:v86-guard, test:native-evidence. Guardเดิมต้องใช้disposableชื่อaile_test_*และexplicitlocalhostport/confirmation. Runnerใหม่test:native-postgresใช้ฐานชื่อaile_v86_test_*ของตัวเอง จึงไม่แอบเปลี่ยนguardเดิมหรือชี้ฐานลูกค้าเพื่อให้testผ่าน

## ผลและงานค้าง

Unit437/437, builds, featureparity HTTP/Standalone/Owner API/mobile/cache/offline/customDemo data และselectedregressionsผ่าน. ดูTEST_RESULTS_TH.md/logs. Nativepreflightยังblockedและไม่มีliveprovider/hardware sends. ต้องยืนยันnative concurrency/restore/RPO/RTO, livechannels, apppermissions และเครื่องจริงก่อนPilot ไม่ใช้การเมนูครบรับรองพร้อมขายจริง
