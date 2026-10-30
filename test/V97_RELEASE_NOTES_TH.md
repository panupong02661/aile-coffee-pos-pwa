# AILE POS Cloud v9.7 — รวม v8.6 และ v9.6 / คืนความครบของเมนู

29 ตุลาคม 2026 (Asia/Bangkok) · package/lockfile 9.7.0

## ฐานและการตรวจสอบ

ใช้ ZIP v9.6 เป็นฐานล่าสุด และเทียบกับ v8.6 Native Concurrency Readiness ที่ผู้ใช้แนบจริง ไม่ใช้ v8.6 คนละแพ็กเกจแทน. v8.6 มี603ไฟล์/v9.6มี966ไฟล์. พบ12ไฟล์ native test/compose/logs ขาดจาก v9.6 และนำกลับครบ พร้อม4npm scriptsเดิม

ไฟล์เว็บของเมนูเดิมไม่ได้ถูกลบ: เปิด fresh source พบ24เมนูเดิมและเมนูแจ้งเตือนใหม่. แต่ sidebar เดิมอาศัยหลาย extension แทรก HTML ต่อกัน และไฟล์เก่า/แคชปนรุ่นอาจทำให้เห็นเพียงบางส่วน. ยังไม่ยืนยันสาเหตุบนเครื่องผู้ใช้ จึงแก้โครงสร้างเพื่อป้องกันกรณีนี้และทดสอบทั้ง build/แคช/ออฟไลน์

## เปลี่ยนจริง

- เพิ่ม sidebar กลาง25เมนู: ครบ24เมนู v8.6 และ notifications ใหม่ ไม่พึ่ง regex injection เพื่อให้รายการเมนูครบ. คง renderer/handler/options เดิมและ badge/active/mobile รวมทั้งเมนูเพิ่มเติมจาก extensions
- Pin script/style ของ main index ด้วย release9.7.0, PWA cacheแยกตามรุ่นและติดตั้งแบบatomicสำหรับ39boot resources. ถ้าสคริปต์หลักขาด ไม่ activateแคชชุดที่ไม่ครบ. ไม่ cache API/Authorization/ข้อมูลธุรกรรม
- แก้ builders ให้รองรับversion query และรวมสคริปต์ทุกตัวจากindexปัจจุบัน รวมSidebar/Theme. มีStandalone9.7และlegacy1.8/previewที่อัปเดตจากsourceเดียวกัน พร้อมstaff/customer shell assets
- คืน12ไฟล์จากแนบ และ4คำสั่ง native เดิม. เก็บเอกสาร/logsที่ชื่อชนใน legacy/v86-attached รวมต้นฉบับZIP byteเดิมเพื่ออ้างอิง
- ไม่มี API/backend/schema downgrade จากv9.6. KDS/refund/tenant-branch/function controls/notification restore hold/report snapshot/consumed cost ยังคงอยู่
- ทดสอบ custom product/ราคา/stock/Add-on/preorder จากfixtureที่จับด้วยv8.6ว่าคงอยู่หลังเปิดและreloadv9.7 ไม่ reset localStorage

## ผลทดสอบจริง

- npm ci/check/build standalone/build legacy/mobile assets ผ่าน; npm test437/437 (รวม13guard testsที่คืนมาและ6navigation/cache testsใหม่)
- Browser เปรียบเทียบ24หน้า/54controls/62action keys กับv8.6ที่แนบ: HTTP Demo, Standalone9.7, legacyStandalone1.8ผ่าน ไม่มีpage errors. Owner APIเห็น25เมนู/เข้าnotificationsได้. Mobile390px, customDemo data, poisoned old cacheและoffline fullsidebarผ่าน
- Regression engineเดิม10scripts และv9.5operations/UI/v9.6cost/UIผ่านซ้ำ ไม่อ้างว่าทุกbusiness mutationทุกโมดูลผ่านproduction
- Native preflight v8.6/v9.7 และ live provider ยังblocked: ไม่มีdisposable native runtime/confirmation/credentialsพร้อม ไม่มีnativeclusterหรือlive message

## ขอบเขตที่ต้องทราบ

เมนูครบไม่ได้แปลงฟีเจอร์Demoเดิมให้เป็นBackendจริงโดยอัตโนมัติ. โมดูลv1.5เดิม (Add-on/หน้ารวมสูตร/แอปมือถือ/ตรวจสลิป ฯลฯ) ยังคงข้อจำกัดโหมดAPIเหมือนv8.6 ไม่ปลดguardเพื่อเอาข้อมูลDemoปะปนกับการขายจริง. ตรวจสลิปไม่ใช่ยืนยันธนาคารอัตโนมัติ; เครื่องพิมพ์จริง/native appยังไม่ทดสอบ

อ่าน FEATURE_PARITY_TH.md, PROJECT_STATUS_TH.md, NEXT_STEPS_TH.md, TEST_RESULTS_TH.md และ CHANGED_FILES_TH.md. ไม่ต้องschema migrationเพิ่มจากv9.6 แต่หากยังไม่ผ่านv9.5ให้ใช้migration/restoreholdเดิม
