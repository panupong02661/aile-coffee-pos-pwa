# v9.6 — อ่านต้นทุนและกระทบยอดหลังคืนสินค้า

29 ตุลาคม 2026 (Asia/Bangkok) · ยังไม่ใช่การรับรองงบกำไรหรือพร้อมขายจริง

## ปัญหาที่แก้

ค่าประมาณเดิมลดต้นทุนตามจำนวนสินค้าที่คืนเงิน แม้ไม่ได้รับสินค้าหรือวัตถุดิบกลับเข้าสต็อก โดยมี warning บอกข้อจำกัดไว้แล้ว. v9.6 คงค่าประมาณเดิมเพื่อไม่ทำให้ผู้ใช้ API เดิมเสีย และเพิ่มตัวเลขจาก BOM usage snapshot ที่หักเฉพาะ returned_units ที่บันทึกการคืนจริง

| รายงาน / field | ความหมาย |
|---|---|
| menu-profitability: costCents / marginCents | ค่าประมาณเดิม จัดสรรต้นทุนตามจำนวนสินค้าที่คืนเงิน |
| menu-profitability: consumedCostCents | ต้นทุน BOM ที่ยังใช้ไป ตามราคา ณ วันขาย หลังหักวัตถุดิบที่คืนจริง |
| menu-profitability: marginAfterRestockCents | รายได้หลังส่วนลดและคืนเงิน ลบ consumedCostCents ก่อนค่าใช้จ่ายอื่น |
| refund-cost: cost / margin | ค่าประมาณเดิม หน่วยบาท ยังไม่หักส่วนลดระดับบิล |
| refund-cost: consumedCost / marginAfterRestock | ต้นทุนใช้ไป/ส่วนต่างตามการคืนวัตถุดิบ หน่วยบาท **ยังไม่หักส่วนลดระดับบิล** |
| historical-cost | ต้นทุน ณ วันขายก่อนการคืน คงความหมายเดิม |

หน้ากำไรรายเมนูใช้ตัวเลขต้นทุนใช้ไปชุดใหม่. CSV เก็บ columns เดิมเพื่อความเข้ากันได้ และต่อท้าย Consumed BOM cost satang / Margin after stock restore satang. ตัวเลขเก่าชื่อ Cost satang / Gross margin satang ใน CSV ยังเป็นค่าประมาณตามจำนวนคืน ไม่ควรสลับกับตัวเลขใหม่

ต้นทุนหรือ snapshot ไม่ครบแสดง null/“ไม่ครบ” ไม่สมมติศูนย์. ข้อมูลเดิมไม่ได้ถูก backfill หรือแก้ไขเงียบ ๆ. ไม่รวมภาษี ค่าแรง ค่าเช่า และการปรับต้นทุนอื่นนอก usage ที่บันทึก จึงไม่ใช่งบกำไรทางบัญชี

## ตัวอย่างที่ทดสอบจริง

ขายสินค้า 3 หน่วย หน่วยละ 1,000 สตางค์ ต้นทุน BOM 200 สตางค์/หน่วย. ลดท้ายบิล 1 สตางค์ จึงรับ 2,999 สตางค์

- คืน 1 หน่วย ไม่คืนสต็อก: คืนเงิน 999 สตางค์
- คืน 1 หน่วย พร้อมคืนสต็อก/BOM: คืนเงินเพิ่ม 1,000 สตางค์
- เหลือรายได้หลังลดและคืน 1,000 สตางค์ ต้นทุนใช้ไปยังคง 400 สตางค์ ส่วนต่างก่อนค่าใช้จ่าย 600 สตางค์. ค่าประมาณเดิมคือต้นทุน 200/ส่วนต่าง 800 สตางค์
- Refund-cost ซึ่งยังไม่หักส่วนลดระดับบิลแสดงส่วนต่าง 601 สตางค์อย่างมีป้ายกำกับ ไม่ใช้ตัวเลขนี้แทน Menu profitability
- คืนหน่วยสุดท้ายอีก 1,000 สตางค์โดยไม่ restock: รายได้สุทธิเป็น 0 แต่ต้นทุนใช้ไปยังมี 400 สตางค์ ส่วนต่างเป็น -400 สตางค์
- Product stock เริ่ม10 → ขาย3 → คืนสต็อก1 = 8. Ingredient เริ่ม100 ใช้2/หน่วย → ขายใช้6 คืนกลับ2 = 96. การคืนเงินที่ไม่ restock ไม่เพิ่ม balance
- เปลี่ยนราคาวัตถุดิบปัจจุบันจาก100เป็น999สตางค์หลังขายแล้ว ตัวเลข historical/consumed ของบิลเดิมยังใช้ snapshot100

Replay key เดิมไม่ขายหรือคืนซ้ำ; คืนเกินจำนวนถูกปฏิเสธ. ปิดกะหลังคืนครบยอดนับ0ตรงรายงาน. Fixture ทดสอบเป็นฐาน disposable ไม่มีเงินโอนออกจริง

## รายงานที่อ่านหลาย query

Menu profitability ใช้ connection เดียวและ BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY สำหรับ count, รายการ, audit และการคำนวณ. ตอบ JSON หลัง COMMIT สำเร็จ และ rollback/release เมื่อเกิดข้อผิดพลาด. snapshotAt คือเวลาเริ่ม transaction ไม่ใช่รหัส snapshot หรือหลักฐานว่าข้อมูลใหม่ที่สุด

แต่ละ HTTP request มี snapshot ของตัวเอง; ข้อมูลอาจเปลี่ยนระหว่าง JSON และ export คนละครั้ง. CSV หน้ากำไรรายเมนูใช้ข้อมูลที่โหลดล่าสุด. ไม่อ้างว่ารายงานทุกหน้าทั้งระบบอ่านพร้อมกันจุดเดียว

Native regression v96_snapshot_db.mjs เตรียม writer อีก connection ให้ commit ระหว่าง count กับ items แล้วตรวจว่ารายงานแรกยังเห็น1บิล รายงานถัดไปเห็น2บิล. **ยังไม่ได้รันบน native** เพราะสภาพแวดล้อมไม่มี runtime ที่พร้อม จึงไม่ใช้ผล PGlite รับรอง native concurrency

## E2E และ Backoffice

Browser ทดสอบคลิกเปิดกะ ขายผ่าน POS คืนผ่านหน้าหลังการขายทั้งสองแบบ ปิดกะ แล้วอ่าน Backoffice/กำไรรายเมนูและดาวน์โหลด CSV. การสร้างบัญชี สินค้า BOM และรับสต็อกเป็น fixture ผ่าน API จึงยังไม่ใช่ UI onboarding ทุกหน้าตั้งแต่สมัครร้าน

พบและแก้ฟังก์ชัน render ของ refund-cost/reconciliation/discount-approvals ที่อยู่นอก closure จนใช้ตัวช่วยไม่ได้และค้างตารางเดิม. Browser กดเข้าทั้ง3รายงานหลังแก้แล้ว

## ติดตั้งและงานที่ยังค้าง

ต่อจาก v9.5 เต็ม หยุด API/Worker ก่อนอัปเดตและ npm ci. ไม่มี schema เพิ่มใน v9.6; หากยังไม่ migrate v9.5 ต้อง db:init ก่อน และเก็บ encryption key เดิม. กฎ restore hold/review ของ v9.5 ยังต้องใช้ตาม V95_RESTORE_QUEUE_TH.md

Native list24 suites, optional browser3ชุดรวม27. ยังต้องยืนยัน native multi-worker/crash/restart/pg_dump/restore/RPO/RTO และ live provider/app permissions จริงก่อน Pilot. เครื่องพิมพ์จริงยังเลื่อน. Return-only net0/discount100%, historical discounted-refund reconciliation และ dependency upgrade ยังเป็นงานถัดไป ไม่ได้พัฒนาใน release นี้
