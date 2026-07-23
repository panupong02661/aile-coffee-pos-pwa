## เป้าหมาย
ออกแบบหน้า **Home** (ตามรูปที่ 2) และหน้า **POS** (ตามรูปที่ 1) ใหม่ให้เหมือนต้นแบบ ~100% โดย**แยกไฟล์ preview** ไม่แตะโค้ด POS/Sidebar เดิมที่ใช้งานอยู่

## Route สำหรับดูตัวอย่าง
- `/preview-home` → หน้าหลักใหม่ (ตามรูป 2)
- `/preview-pos` → หน้า POS ใหม่ (ตามรูป 1)
- ปุ่ม POS ในหน้า `/preview-home` ลิงก์ไป `/preview-pos` เพื่อทดสอบ flow

## ไฟล์ที่จะสร้างใหม่ (ไม่ทับของเดิม)
```
src/pages/preview/PreviewHome.tsx       # หน้าหลักใหม่
src/pages/preview/PreviewPOS.tsx        # หน้า POS ใหม่
src/components/preview/PreviewSidebar.tsx   # sidebar ซ้ายสไตล์ใหม่ (Aile Coffee logo, เมนู pill สีชมพู)
src/components/preview/PreviewHeader.tsx    # header (สวัสดี / เวลา / กระดิ่ง / avatar)
src/components/preview/PreviewMenuCard.tsx  # การ์ดเมนูใหญ่พร้อมไอคอน pastel (POS, รายการสั่งซื้อ, ลูกค้า ...)
src/components/preview/PreviewStatCard.tsx  # การ์ดสถิติล่าง (ยอดขายวันนี้ / ออเดอร์ / ลูกค้าใหม่ / สินค้าใกล้หมด)
src/components/preview/PreviewPOSGrid.tsx   # กริดสินค้ารูปกลม + ราคา
src/components/preview/PreviewCart.tsx      # ตะกร้าขวา สไตล์ card ขาว + ปุ่มชมพู "ชำระเงิน"
src/components/preview/PreviewQuickActions.tsx  # แถบ "การทำงานด่วน" (ยกเลิก/พัก/ค้นหา/คูปอง/พิมพ์)
```
ไม่แก้ `src/pages/Index.tsx`, `MainSidebar.tsx`, `Header.tsx`, `Cart.tsx`, `MenuGrid.tsx` เดิม

## การเชื่อม route
เพิ่ม 2 routes ใน `src/App.tsx` (แค่บรรทัด `<Route>`) — ไม่แตะ route `/` เดิม

## ดีไซน์สเปคจากรูปต้นแบบ
**สีหลัก**
- BG: `#FAF7F2` (ครีมอ่อน)
- Sidebar: ขาว, active pill สีชมพู `#F8D7DA` + text `#E85A6B`
- ปุ่ม primary (ชำระเงิน, ทั้งหมด): ชมพูโคเรล `#F27381`
- ปุ่ม secondary (บันทึกรายการ): ฟ้าอ่อน `#EAF2FF` + text ฟ้า
- การ์ดสถิติ: pastel gradient (เขียว/ส้ม/ม่วง/แดง)
- Accent illustration: ต้นไม้/ใบไม้มุมล่างซ้าย-ขวา

**Typography**: ฟอนต์ไทยเดิมของโปรเจกต์ (Sarabun/Noto), หัวข้อหนา, ตัวเลขใหญ่

**หน้า Home (รูป 2)**
- Sidebar ซ้าย 220px: โลโก้ Aile Coffee + 10 เมนู (หน้าหลัก active)
- Header: "สวัสดี, ผู้ดูแลระบบ" + เวลา + 🔔 + avatar
- Grid 4×2 การ์ดเมนูใหญ่: POS / รายการสั่งซื้อ / ลูกค้า / สินค้า / สต็อก / โปรโมชั่น / รายงาน / ตั้งค่า (แต่ละใบ pastel + icon 3D)
- Bottom row 4 stat cards: ยอดขายวันนี้ / ออเดอร์วันนี้ / ลูกค้าใหม่ / สินค้าใกล้หมด
- Illustration ต้นไม้มุมล่าง

**หน้า POS (รูป 1)**
- Sidebar เดียวกับ Home (POS active)
- Top: "POS / จุดขาย / สร้างรายการสั่งซื้อ" + ปุ่ม "โต๊ะ 3" + dropdown "ลูกค้าทั่วไป" + 🔔 + เวลา + avatar
- Search bar + barcode icon
- Category pills แนวนอน (ทั้งหมด/กาแฟ/นม/ชา/ปั่น/เบเกอรี่/ของว่าง/+เพิ่มหมวด)
- Grid สินค้า 5 คอลัมน์: การ์ดขาว รูปกลม + ชื่อ + ราคา
- Panel ขวา 340px: "รายการสั่งซื้อ" + list พร้อม +/- + "เพิ่มหมายเหตุ" + สรุปยอด + ปุ่ม "บันทึกรายการ" (ฟ้า) / "ชำระเงิน" (ชมพู)
- แถบล่าง "การทำงานด่วน": 5 ปุ่มไอคอนสี (ยกเลิก/พัก/ค้นหา/คูปอง/พิมพ์)

## ข้อมูลที่ใช้
- Preview ใช้ **mock data** ในไฟล์ preview เอง (ไม่ยิง Supabase) เพื่อให้เร็ว โฟกัสหน้าตา
- ไม่มี logic จริง (add to cart, ชำระเงิน) — เป็นภาพนิ่งที่ดูเลย์เอาต์

## สิ่งที่ไม่ทำในรอบนี้
- ไม่แตะ `/` (POS จริง), MainSidebar, Cart, PaymentModal
- ไม่เชื่อม data จริง / auth / shop context
- ไม่ทำ mobile responsive ละเอียด (โฟกัส desktop/tablet ตามรูป)

## หลังผู้ใช้ดูแล้ว
ถ้าโอเค → รอบถัดไปค่อยย้ายมาแทน POS/Home จริง พร้อมต่อ data
