## 1) กดครั้งเดียวติดทั้งระบบ (tap responsiveness)

**ปัญหา**: บนมือถือ/แท็บเล็ต บางปุ่มต้องกด 2–3 ครั้งถึงจะติด สาเหตุหลักคือ tap delay, `hover:` state ค้างบน touch, และการที่ Radix/shadcn ส่ง event เป็น `pointerdown` แต่ overlay/ripple ค้างชั่วคราว

**แก้ที่ระดับ CSS ครั้งเดียว (src/index.css)** ให้ครอบทั้งระบบ ไม่ต้องแก้รายไฟล์:
- ขยาย `touch-action: manipulation` ให้ครอบ `[role="tab"]`, `[role="menuitem"]`, `[role="option"]`, `.cursor-pointer`, `[data-radix-collection-item]` และ card ที่ทำเป็นปุ่ม
- เพิ่ม `-webkit-tap-highlight-color: transparent` และ `user-select: none` บน interactive elements เพื่อไม่ให้เกิด selection แทน click
- เพิ่ม `@media (hover: none)` ลบ `:hover` state ที่ทำให้ต้องแตะสองครั้ง (แตะแรก = hover, แตะสอง = click บน touch device):
  ```css
  @media (hover: none) {
    *:hover { all: revert; }
  }
  ```
  (จริง ๆ จะทำแบบ targeted: unset hover bg/scale บน button, [role="button"])
- ตั้ง `cursor: pointer` + `touch-action: manipulation` บนทุก `<button>` เพื่อกัน Safari iOS ที่บาง element ไม่ fire click

## 2) หน้าชำระเงิน (PaymentModal) — ปุ่มยืนยันต้องเห็นตลอด

**ปัญหา**: `DialogContent` เป็น flex-col สูง 95vh แต่ปุ่ม "ยืนยันชำระเงิน" อยู่ปลาย content ที่ scroll ได้ ทำให้ต้องเลื่อนลงไปกด

**แก้ที่ `src/components/PaymentModal.tsx`**:
- โครง Dialog เป็น 3 ชั้นแบบ sticky header/footer:
  ```
  DialogContent (flex flex-col h-[95vh] p-0 overflow-hidden)
    ├─ Header  (shrink-0, sticky บนสุด)
    ├─ Body    (flex-1 overflow-y-auto) ← ส่วนเลือก method / QR / ที่อยู่ ฯลฯ
    └─ Footer  (shrink-0, border-t, bg-background) ← ปุ่ม "ยืนยันชำระเงิน" + ยอดรวม
  ```
- ย้ายปุ่ม "ยืนยันชำระเงิน / ยกเลิก" และแถบสรุปยอดออกจาก scroll area ไปไว้ใน footer ที่ตรึงล่าง
- ทำเช่นเดียวกันกับ `OptimizedPaymentModal.tsx` เผื่อบางจุดเรียกใช้

## 3) หน้า Addon Modal — header/footer ฟิก, กลาง scroll

**แก้ที่ `src/components/AddonModal.tsx`**:
- เปลี่ยน `DialogContent` จาก `max-h-[80vh] overflow-y-auto` เป็น layout 3 ส่วน:
  ```
  DialogContent (max-h-[90vh] h-[90vh] p-0 flex flex-col overflow-hidden)
    ├─ DialogHeader (shrink-0 border-b px-4 py-3) — ชื่อเมนู
    ├─ div.flex-1.overflow-y-auto.px-4.py-3   — กลุ่ม addon ทั้งหมด
    └─ div.shrink-0.border-t.bg-background.px-4.py-3 — ยอดรวม + ปุ่ม "ยกเลิก / เพิ่มลงตะกร้า"
  ```
- ปุ่ม "เพิ่มลงตะกร้า" จะเห็นตลอด ไม่ต้อง scroll
- เพิ่ม `pb-[env(safe-area-inset-bottom)]` ที่ footer เพื่อกัน iOS home indicator บัง

## ไฟล์ที่แก้
- `src/index.css` — global tap/hover fix
- `src/components/PaymentModal.tsx` — sticky footer
- `src/components/OptimizedPaymentModal.tsx` — sticky footer (สอดคล้องกัน)
- `src/components/AddonModal.tsx` — header ฟิก / body scroll / footer ฟิก

## รายละเอียดเทคนิค (สำหรับตรวจสอบ)
- ไม่แตะ business logic (ราคา, addon, payment flow) — เฉพาะ layout + CSS
- ไม่แก้ Radix Dialog primitive; ใช้ flex-col + overflow-hidden ที่ DialogContent เพื่อให้ header/footer ตรึง
- Global CSS ใช้ `@media (hover: none) and (pointer: coarse)` เพื่อไม่กระทบเดสก์ท็อป
