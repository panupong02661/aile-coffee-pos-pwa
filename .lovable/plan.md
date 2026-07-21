## เป้าหมาย
ออกแบบหน้าหลัก POS (หน้าเมนูสินค้า) ใหม่ **10 รูปแบบ** ที่แตกต่างกันชัดเจน เพื่อให้ดูก่อน — ยังไม่แตะโค้ด POS จริง

## ขั้นตอน

1. **แคปภาพหน้า POS ปัจจุบัน** ผ่าน Playwright ที่ `localhost:8080/` เพื่อใช้เป็น visual reference (layout, เมนู, สี, ตะกร้า)

2. **สร้าง 10 design directions** โดยเรียก `design--create_directions` **4 รอบ** (รอบละ 3 ทิศทาง = 12, เลือกใช้ 10 ที่ดีที่สุด และ dedupe) แต่ละทิศทางมี metaphor / energy / layout ที่ต่างกันชัด เช่น:

   - **D1 – Fullscreen Grid Immersive**: เมนูเต็มจอไร้ header, ภาพใหญ่ edge-to-edge
   - **D2 – Bento Asymmetric**: กล่องขนาดไม่เท่ากันแบบ bento box
   - **D3 – Magazine Editorial**: hero item ใหญ่ + grid เล็กด้านข้าง, typography เด่น
   - **D4 – Dark Café Lounge**: พื้นดำ, gold accent, การ์ดลอย, มู้ดร้านกาแฟหรู
   - **D5 – Horizontal Scroll Carousel**: เลื่อนแนวนอนเป็นแถวตามหมวด (Netflix-style)
   - **D6 – Split Screen**: ครึ่งซ้ายภาพเมนูใหญ่ (focus), ครึ่งขวา grid เลือก
   - **D7 – Minimal Swiss List**: ไม่มีรูป, ใช้ typography + เส้น + spacing (list view หรูๆ)
   - **D8 – Neo-Brutalist Pop**: สีจัด, ขอบหนา, เงาแข็ง, ปุ่มใหญ่จิ้มง่าย
   - **D9 – Category Tabs Vertical + Big Cards**: sidebar หมวด + การ์ดใหญ่พร้อม description
   - **D10 – Glassmorphism Cafe**: ภาพพื้นหลังเบลอ, การ์ดกระจกโปร่ง, สีอบอุ่น

3. **นำเสนอผ่าน `ask_questions` type=prototype** ให้ผู้ใช้เลือก (แต่เพราะ prototype question จำกัดแค่ 3 ตัวเลือกต่อคำถาม จึงต้อง**ถามหลายคำถาม / หลายรอบ** หรือรวมทุก direction แสดงเป็น preview ให้ดูก่อน แล้วให้ผู้ใช้บอกหมายเลขที่ชอบ)

## ข้อจำกัดที่อยากให้ผู้ใช้ทราบก่อน
- ระบบ prototype picker ของ Lovable แสดงได้สูงสุด **3 ตัวเลือกต่อคำถาม** ผมจะแบ่งเป็น 4 คำถาม (D1–D3, D4–D6, D7–D9, D10) หรือแสดงเป็นชุด แล้วให้บอกเลขที่ชอบ
- ยังไม่แก้ไฟล์ POS ใดๆ จนกว่าจะเลือกได้แล้ว

## หลังผู้ใช้เลือก
จะสร้างหน้าตัวอย่างจริงในโปรเจกต์ (route ใหม่ เช่น `/pos-preview`) หรือ implement ทับ POS ตามที่ต้องการ
