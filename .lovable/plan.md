## แผนแก้ไข 2 จุด

### 1. ปฏิทินเลือกวันบันทึกออเดอร์ (Cart.tsx) — เดือน/หัวเป็นภาษาไทย
ใน `src/components/Cart.tsx` ตัว `<Calendar>` (react-day-picker) ยังไม่ได้ตั้ง locale จึงแสดง "January 2026" และ Su/Mo/Tu…

แก้โดย:
- import `th` locale จาก `date-fns/locale`
- ส่ง `locale={th}` และ `formatters={{ formatCaption: (d) => \`${thMonths[d.getMonth()]} ${d.getFullYear() + 543}\` }}` ให้ `<Calendar>` เพื่อได้หัวปฏิทินเป็น "มกราคม 2569"
- (ไม่แก้ `ui/calendar.tsx` เพื่อไม่กระทบที่อื่น — ส่ง props เฉพาะจุดใช้งาน)

ผลลัพธ์: หัว "มกราคม 2569", แถวชื่อวัน "อา จ อ พ พฤ ศ ส"

### 2. หน้า Dashboard — เพิ่มยอดขายรวมของเดือนที่เลือกใน `SalesCalendar`
ใน `src/components/SalesCalendar.tsx` เพิ่มแถบสรุปเหนือ/ใต้ตารางปฏิทิน แสดง:
- ยอดขายรวมของเดือน (`฿xxx,xxx`)
- จำนวนออเดอร์รวม
- ค่าเฉลี่ยต่อบิล

คำนวณจาก `dailySales` ที่โหลดอยู่แล้ว (ไม่ต้อง fetch เพิ่ม) แสดงเป็นการ์ดเล็ก ๆ ในส่วน header ของ Card ข้างชื่อ "ปฏิทินยอดขาย" หรือเป็นแถบใต้ตัวเลือกเดือน/ปี ให้เห็นชัดทั้ง 2 การ์ด (SalesCalendar ถูกใช้ 2 ครั้งใน Dashboard.tsx อยู่แล้ว จึงได้ครบทั้งคู่โดยแก้ไฟล์เดียว)

### ไฟล์ที่จะแก้
- `src/components/Cart.tsx` — เพิ่ม locale ไทย + formatter ให้ปฏิทินเลือกวันบันทึก
- `src/components/SalesCalendar.tsx` — เพิ่มแถบสรุปยอดขายรวมของเดือน
