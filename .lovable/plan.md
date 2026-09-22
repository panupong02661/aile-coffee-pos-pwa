# เชื่อมบัญชี LINE OA ใหม่ (@259uondw) เป็นบอทแจ้งเตือน

## ภาพรวม

บัญชีใหม่ "Aile Coffee Grop" เป็น LINE Official Account แบบ "บัญชีทั่วไป" (ใช้เป็นบอทได้ปกติ) แต่ยังไม่ได้เปิด Messaging API และยังไม่ได้ผูก webhook กับระบบ จึงตอบได้แค่ข้อความเริ่มต้นของ LINE ไม่ได้ส่ง Group ID กลับมา ต้องตั้งค่า 3 จุด: ฝั่ง LINE, ฝั่ง secret ในระบบ, แล้วทดสอบ

## ขั้นตอนที่ผู้ใช้ทำใน LINE (ทำเองตามคำแนะนำ)

1. **เปิด Messaging API** — เข้า LINE Official Account Manager (manager.line.biz) → เลือกบัญชี @259uondw → การตั้งค่า (Settings) → Messaging API → กด "เปิดใช้ Messaging API" → สร้าง/เลือก Provider และ Channel ใน LINE Developers
2. **อนุญาตให้เข้ากลุ่ม** — ใน LINE Developers Console → Channel → Messaging API → เปิด "Allow bot to join group chats"
3. **ตั้ง Webhook URL** — ใส่ `https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/line-messaging` และเปิด "Use webhook" (กด Verify ควรผ่าน)
4. **ออก Token** — ในหน้า Messaging API เดียวกัน กด "Issue" ใต้ Channel Access Token (long-lived) และจด Channel Secret (หน้า Basic settings)

## ขั้นตอนที่ทำในระบบนี้

5. **อัปเดต secret** — เปิดฟอร์มให้ผู้ใช้ใส่ค่าใหม่แทนค่าเดิม:
   - `LINE_CHANNEL_ACCESS_TOKEN` (token ใหม่จากข้อ 4)
   - `LINE_CHANNEL_SECRET` (จากหน้า Basic settings)
   - ใช้ update_secret เพราะทั้งสองชื่อมีอยู่แล้ว
   - หมายเหตุ: การแทนที่ token จะทำให้แจ้งเตือนทุกชนิด (ออเดอร์ POS, ลูกค้าออนไลน์, รายงานประจำวัน/เดือน) ย้ายไปส่งผ่านบัญชีใหม่นี้ทั้งหมด
6. **ทดสอบ end-to-end**
   - เรียก `verifyTarget` ผ่าน Edge Function เพื่อยืนยัน token ใหม่ใช้งานได้ (คาดหวัง 401 หายไป)
   - ให้ผู้ใช้พิมพ์ข้อความอะไรก็ได้ในกลุ่ม → บอทต้องตอบ Group ID กลับมา
   - นำ Group ID ไปใส่ในหน้าตั้งค่าแจ้งเตือน → กดทดสอบ → ต้องผ่านและมีข้อความเข้ากลุ่มจริง

## รายละเอียดทางเทคนิค

- ไม่ต้องแก้โค้ด — `supabase/functions/line-messaging/index.ts` มี webhook handler (ตอบ Group ID เมื่อมีข้อความ/ตอนบอทถูกเชิญเข้ากลุ่ม), action `verifyTarget` และ error ภาษาไทยพร้อมอยู่แล้ว
- secret เดิม: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` ถูกใช้โดย `line-messaging`, `send-order-notification`, `send-daily-report` (edge functions อ่าน env ชื่อเดียวกัน จึงไม่ต้องแก้โค้ดฝั่งอื่น)
- ข้อควรรู้: เมื่อเปลี่ยน token บอทตัวเดิมจะหยุดทำงานทันที — User ID/Group ID ที่เคยบันทึกไว้กับบอทเดิมจะใช้กับบอทใหม่ไม่ได้ ต้องเอา ID ใหม่จากบอทใหม่เท่านั้น

## หมายเหตุ

ขั้นตอนที่ 1–4 ผู้ใช้ต้องทำเองใน LINE เพราะต้องล็อกอินบัญชีเจ้าของ OA ระบบทำแทนไม่ได้
