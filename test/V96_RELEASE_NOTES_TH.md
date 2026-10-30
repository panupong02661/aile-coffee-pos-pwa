# AILE POS Cloud v9.6 — ต้นทุนหลังคืนสต็อกและรายงานที่สอดคล้องกัน

29 ตุลาคม 2026 (Asia/Bangkok) · ต่อจาก ZIP v9.5 เต็ม · package/lockfile 9.6.0

## งานที่แก้และพัฒนาจริง

- เพิ่มต้นทุนที่ยังใช้ไปหลังคืนสต็อก จาก BOM usage ณ วันขายและ returned_units ที่บันทึกจริง รายการคืนเงินแต่ไม่คืนสต็อกไม่ทำให้ต้นทุนส่วนนี้หายไป รองรับส่วนต่างติดลบหลังคืนเงินครบ
- Menu profitability เพิ่ม consumedCostCents / marginAfterRestockCents พร้อม coverage ของต้นทุนนี้ และใช้แสดงผลในหน้าจอ ส่วน costCents / marginCents เดิมยังเป็นค่าประมาณตามจำนวนคืนและยังคงไว้สำหรับผู้ใช้ API เดิม
- Refund-cost เพิ่ม consumedCost / marginAfterRestock และ summary แยก พร้อมคอลัมน์ในหน้าจอ/Excel/PDF; ส่วนต่างชุดนี้ยังไม่หักส่วนลดระดับบิล จึงระบุฐานให้ชัด ไม่ใช้เป็นกำไรบัญชี
- รายงานกำไรรายเมนูอ่าน count/items/audit ใน transaction เดียวแบบ REPEATABLE READ READ ONLY และตอบหลัง commit สำเร็จ มี snapshotAt/consistency; ไม่รับรอง snapshot เดียวกันข้ามหลาย requests
- แก้ render helper ของ Backoffice 3 หน้าที่อยู่นอก closure จนเข้าถึงตัวช่วยไม่ได้: ต้นทุนหลังคืนสินค้า, กระทบยอด และประวัติอนุมัติส่วนลด
- Browser E2E จริง: เปิดกะ → POS ขาย 3 → คืน 1 แบบไม่คืนสต็อก → คืน 1 พร้อมคืนสต็อก → ปิดกะนับ 10 บาท → Backoffice/รายงานกำไร/CSV พร้อมทดสอบเข้ารายงาน 3 หน้าที่แก้
- เพิ่ม native cost และ two-connection snapshot regression ที่เตรียมให้รันเมื่อมี native PostgreSQL (ยังไม่ได้รันจริง)

## ขอบเขตและความเข้ากันได้

ไม่มี schema migration เพิ่มจาก v9.5, ไม่มี dependency upgrade และไม่เปลี่ยนยอด/กฎ checkout/refund/stock/BOM. เก็บ API estimate เดิมและ CSV columns เดิม พร้อมเพิ่มคอลัมน์ต้นทุนใช้ไป/ส่วนต่างหลังคืนสต็อก. ไม่แก้ยอดประวัติย้อนหลัง ฟีเจอร์แจ้งเตือน v9.5 ยังอยู่ครบ

## ผลรันจริง

- npm ci / npm check ผ่าน; npm test 418/418 (เพิ่ม 6 regression cases)
- Regression engine เดิม 10 scripts ผ่าน รวมธุรกรรม/KDS/สิทธิ์สาขา/รายงาน/Recovery/แจ้งเตือน; v9.4 retry และ v9.5 operations/load/UI ผ่านซ้ำ
- v9.6 cost engine 2 tests ผ่าน: ส่วนลดหารไม่ลงตัว, คืนหลายครั้งทั้งสองแบบ, เปลี่ยนราคาทุนหลังขาย, SQL stock/BOM/shift, Excel และ read-only rollback
- Browser v9.6 ผ่านบน API/JWT/embedded SQL จริง ไม่มี route mocks; fixture บัญชี/สินค้า/BOM/รับสต็อกสร้างผ่าน API ไม่ใช่ UI ทุกขั้นตอน และไม่มีการโอนเงินจริง
- Native Docker/local exit1 ก่อน cluster, live preflight exit2 ready=false. Native concurrency/pg_dump/restore/RPO/RTO และบัญชี Discord/LINE/Telegram/Instagram จริงยังไม่ผ่าน ไม่รับรองพร้อม Pilot

อ่าน COST_RECONCILIATION_TH.md, TEST_RESULTS_TH.md, PROJECT_STATUS_TH.md, NEXT_STEPS_TH.md และ CHANGED_FILES_TH.md. stdout/exit codes อยู่ validation/v96-*.json/log
