# คู่มือ KDS หลังคืนสินค้า v8.8

## ติดตั้ง

สำรองฐานก่อน rollout และรัน npm ci / npm run db:init ก่อน npm start. Schema เพิ่ม return_revision และ status cancelled พร้อมปรับ active-table unique index. Migration ทดสอบ re-run บน embedded engine; ยังต้องทดสอบกับ native PostgreSQL ก่อน pilot

## คืนบางส่วน

หน้า KDS แสดงจำนวนขาย / คืนสต็อก / เหลือปรุง. เมื่อมี restocked return ปุ่มเริ่มทำอาหารจะถูกปิดจน owner หรือ manager ตรวจตัวเลขและกดยืนยันจำนวนที่เหลือ. Cashier เห็นข้อความให้ผู้จัดการตรวจ แต่ยืนยันไม่ได้

API ยืนยันต้องใช้ revision ของจำนวนล่าสุด; ถ้ามี refund คืนสต็อกเพิ่มหลังเปิดหน้าจอ ให้รีเฟรชแล้วยืนยันใหม่. การกดซ้ำ revision เดิมคืนผลเดิมและไม่เพิ่ม audit ซ้ำ ไม่สร้างยอดขายหรือเปลี่ยน stock/BOM

## คืนครบ

เมื่อเหลือปรุง 0 ผู้จัดการกดยืนยันยกเลิกงานครัว Ticket เปลี่ยนเป็น cancelled, ไม่อยู่ใน active queue และโต๊ะใช้รับออเดอร์ใหม่ได้. ประวัติแสดงในส่วนงานครัวที่ยกเลิก และยังเก็บ ticket/refund/audit ใน DB

## ขอบเขต

จำนวนปรุงหักเฉพาะ restockedQty; คืนเงินแบบ no-restock ไม่ลดจำนวนปรุง เพราะวัตถุดิบยังใช้กับงานเดิม. กรณีครัวเริ่มแล้ว refund แบบ restock ยังถูกปฏิเสธตามเดิม. ใช้กับ paid-first kitchen_tickets เท่านั้น ไม่เปลี่ยน restaurant_kitchen_batches/dine-in flow

## ทดสอบซ้ำ

npm test / npm run check / npm run test:kds-returns-engine

เครื่องที่มี Docker ใช้ npm run test:native-postgres (รวม 12 scripts) หรือ npm run test:kds-returns-db กับ disposable localhost DB/API ที่เตรียมตาม POSTGRES_TESTING_TH.md

Browser: ติดตั้ง Python playwright แล้ว python tests/v88_kds_browser.py; ตั้ง CHROMIUM_PATH ได้. ชุดนี้ใช้ mock API ส่วน SQL engine suite ใช้ Express/auth/SQL จริง. ทั้งสองชุดยังไม่แทน native DB-backed Browser E2E
