# v9.7 — รวมฟังก์ชัน ไม่ใช่การรับรอง Production

- [x] Legacy24views/controls/actionsและnotificationsอยู่ครบในHTTP/Standalone/Ownernavigation
- [x] Versionedbootassets/atomiccacheและcustomDemo-data preservation regression
- [ ] Nativeconcurrency/backuprestore/RPO/RTOและliveproviderผ่านจริง
- [ ] โมดูลDemoที่ต้องการใช้จริงมีBackend/สิทธิ์/stock/ledger/testsครบตามสเปก ไม่ปลดguardเพื่อให้กดได้อย่างเดียว
- [ ] อุปกรณ์จริง/nativeapp/printingและร้านทดลองผ่านตามchecklistเดิม

อ่าน FEATURE_PARITY_TH.md และเก็บkey/ฐานเดิม ไม่ล้างlocalStorage/IndexedDBเพื่ออัปเดต

---

# v9.6 — เกณฑ์เพิ่มเติมก่อน Pilot

- [ ] Native snapshot writer race และ financial/stock/BOM concurrency ผ่านพร้อม logs
- [ ] Native backup/restore/restore hold/key เดิม/RPO/RTO และ live notification receipts ผ่าน
- [ ] ตรวจจากข้อมูลร้านทดลองว่าต้นทุนใช้ไป/estimateเดิม/ส่วนลดบิลมีความหมายตรงที่รายงานระบุ
- [ ] UI onboarding สินค้า/BOM/stock ครบทุกหน้าและทดสอบอุปกรณ์จริงเพิ่มเติม

ผล418unit/embedded/Browserในรอบนี้ไม่ใช้ติ๊ก native/live ด้านบน. ไม่มีการโอนเงินจริงหรือทดสอบเครื่องพิมพ์จริง

---

# v9.5 — เกณฑ์เพิ่มเติมก่อน Pilot (ยังไม่ผ่าน native/live)

- [ ] หยุดWorkerเก่าทั้งหมดและmigration2ตาราง/2columnsสำเร็จ
- [ ] Nativepausebarrier/หลายWorker/restart/restoreholdและauditผ่านพร้อมหลักฐาน
- [ ] Manualrestoreเรียกholdก่อนWorker และผลตรวจจากbackupใช้retryไม่ได้
- [ ] ผู้รับDiscord/LINE/TelegramจริงยืนยันPOS/QR/online/interval/monthly พร้อมยอด
- [ ] Instagrampermissionsจริงหรือปิดไว้ชัดเจน; nativeRPO/RTO/fullPOSlifecycleยังต้องทดสอบ

Embedded240fixture/412unit/UIregressionไม่ใช้ติ๊กnative/liveด้านบน เครื่องพิมพ์จริงยังเลื่อน

---

# v9.4 — เกณฑ์แจ้งเตือนก่อน pilot (ยังไม่ผ่านจริง)

- [ ] Discord/LINE/Telegram actual receipt ครบ POS/QR/online/interval/monthly พร้อมเทียบยอด
- [ ] Native20/21suites multi-worker/restart/backup-restore ผ่านพร้อม logs; รอบนี้ยังไม่เริ่มcluster
- [ ] Instagram app/permissions/account/conversationจริง หรือปิดไว้และระบุขอบเขตที่ไม่รองรับ
- [ ] Full UI lifecycle staging/native และ restoreย้อนหลัง reviewคิวก่อนเปิดWorker วัดRPO/RTO
- [ ] หยุด Workerเก่าทุกตัวก่อนอัปเดต9.4 และสำรองkeyเดิม

412unit/fakeprovider/embedded/browser regressionไม่ใช้ติ๊กเกณฑ์live/nativeด้านบน. เครื่องพิมพ์จริงยังเลื่อนตามคำสั่งผู้ใช้

---

# AILE POS Cloud — Checklist ก่อนใช้ขายจริง

รายการนี้ต้องทดสอบด้วยข้อมูลจำลองหรือร้านทดลองและให้ผู้รับผิดชอบลงนามรับรอง

- [ ] **ติดตั้ง**: Docker/PostgreSQL/Node เวอร์ชันถูกต้อง; สำรอง `.env` อย่างปลอดภัย; ไม่เปิดฐานข้อมูลให้สาธารณะ
- [ ] **HTTPS**: เดสก์ท็อป/แท็บเล็ต/มือถือใช้งานผ่านโดเมน HTTPS และตรวจ certificate จริง
- [ ] **ธุรกรรม**: สินค้า/ราคา/สต็อก/ภาษี/ส่วนลด/คืนเงิน ตรงตามกฎของกิจการ
- [ ] **กะเงินสด**: เปิดกะ, รับเงิน, เงินทอน, ปิดกะ, กระทบยอดตรงกับเงินจริง
- [ ] **Idempotency**: ส่งออเดอร์เดียวพร้อมกัน 2 เครื่องต้องได้บิลเดียว; สต็อกลดครั้งเดียว
- [ ] **Offline**: ลองตัดเน็ตก่อนส่ง/ระหว่างส่ง/หลังเซิร์ฟเวอร์ commit; เปิดใหม่แล้วกระทบยอดไม่เกิดบิลซ้ำ
- [ ] **หลายสาขา**: สาขา A ไม่เห็นธุรกรรม/ข้อมูลจำกัดสิทธิ์ของ B; tenant อื่นมองไม่เห็นข้อมูล
- [ ] **POS+KDS+QR**: คำสั่งจากมือถือจริงเข้าสู่จอครัวจริง; สถานะต่างกันถูกต้อง
- [ ] **เครื่องพิมพ์**: ทดสอบใบเสร็จ 58/80 mm/ใบครัว/ภาษาไทย/รีพริ้นบนรุ่นเครื่องที่ใช้จริง
- [ ] **ชำระเงินจริง**: ทดสอบช่องทางชำระที่ใช้จริง, คืนเงิน, ป้องกันรับเงินซ้ำ, ตรวจ callback/webhook จากผู้ให้บริการ
- [ ] **ภาษี**: ผู้เชี่ยวชาญตรวจเอกสาร/เลขภาษี/เลขที่เอกสาร/ข้อกำหนด e-Tax ของไทย
- [ ] **สำรอง/กู้คืน**: สร้าง backup แล้ว restore ลงฐานข้อมูลแยก สำรวจความครบถ้วนและกำหนด RPO/RTO
- [ ] **ความปลอดภัย**: audit log, rate limit, session handling, รหัสผ่าน, HTTPS, secret rotation, pen test
- [ ] **เสถียรภาพ**: load test, restart ระหว่าง transaction, ล่ม/กู้คืน, time synchronization, error monitoring
- [ ] **PDPA**: นโยบายข้อมูลส่วนบุคคล, สิทธิ์เข้าถึง, retention, privacy notice
- [ ] **เจ้าของกิจการ**: เซ็นรับรอง UAT และเก็บแผน rollback ก่อน Go Live

> สถานะ v2.8: **ยังไม่ได้ติ๊กข้อ Hardware/DB live/Compliance/Production** จากสภาพแวดล้อมนี้ ไม่ควรโฆษณา 100% จนทดสอบผ่านจริง


## v9.1 — ก่อนเปิด Function Control

- [ ] สำรอง/restore สำเนา v9.0 แล้ว migration 7 ตารางบน native โดยไม่เสีย grants เดิม
- [ ] ตั้ง PLATFORM_JWT_SECRET แยกจาก JWT_SECRET และ grant เฉพาะบัญชีผู้ดูแล AILE ผ่าน trusted CLI
- [ ] ตรวจ feature matrix 3 แพ็กเกจและสิทธิ์ legacy ก่อนเปลี่ยนค่าแพ็กเกจที่กระทบทุกร้าน
- [ ] ตรวจหมดอายุโปร/โควตา, tenant token ไม่เข้า platform, ถอนสิทธิ์ token เดิมและหลาย instances
- [ ] Native concurrency และ audit rollback ผ่านพร้อม logs; Browser และ restore ครบวงจรผ่าน


## v9.2 — ก่อนเปิดส่งแจ้งเตือนจริง

- [ ] migration 7 tables บน native และ key เก็บปลอดภัย/restore แล้ว decrypt ได้
- [ ] ตั้งประเภท/สาขา/ปลายทางด้วย Owner ตรวจ package send control และไม่ใช้บัญชีผู้อื่นทดสอบ
- [ ] Discord/LINE/Telegram live receipt และ IG app/verified webhook/window ยืนยันกับบัญชีทดสอบที่อนุญาต
- [ ] หลาย worker/lease/retry/429/unknown review และตรวจคิวก่อนเปิด worker หลัง restore
- [ ] ตรวจหมายเลขการนับออเดอร์เทียบรับเงินจริง ไม่รับ unpaid เป็นรายรับ และตรวจ schedule เวลาไทย


## v9.3 — ก่อนรับรอง notification production readiness

- [ ] หยุด Worker รุ่นเก่า migration/indexes บน native และตรวจ heartbeat/fencing
- [ ] Native 19 scripts และ 4-process/restore drill ผ่านพร้อมหลักฐาน
- [ ] บัญชี/ปลายทาง live ที่อนุญาต ตรวจ acceptance/receipt/lifecycle จริง แยก Instagram permissions/window
- [ ] ตรวจ unknown review/late results/provider quotas และ load/heartbeat ขณะ batch ยาว
