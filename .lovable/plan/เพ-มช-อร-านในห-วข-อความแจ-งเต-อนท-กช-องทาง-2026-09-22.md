# เพิ่มชื่อร้านในหัวข้อความแจ้งเตือนทุกช่องทาง

## เป้าหมาย
ทุกข้อความแจ้งเตือนที่ส่งออก (ออเดอร์หน้าร้าน, ออเดอร์ออนไลน์, รายงานประจำวัน/ประจำเดือน) ต้องขึ้นต้นด้วยชื่อร้านที่ส่ง เช่น "🏪 Aile Coffee" หรือ "🏪 โกปี้ สยาม บางแวก" เพื่อให้เห็นทันทีว่ามาจากสาขาไหน

## ครอบคลุม 4 ช่องทาง
- Discord — ชื่อร้านอยู่บรรทัดแรกของหัวข้อการ์ด (title) และเพิ่มในส่วนท้าย (footer)
- LINE — ชื่อร้านอยู่บรรทัดแรกของข้อความ (ทั้งแบบข้อความและ Flex)
- Telegram — ชื่อร้านอยู่บรรทัดแรกแบบตัวหนา
- Instagram — ชื่อร้านอยู่บรรทัดแรกของข้อความ

## วิธีหาชื่อร้าน
- ดึงชื่อร้านจากข้อมูลร้านตาม shop ของออเดอร์/รายงานนั้น โดยใช้ชื่อจากการตั้งค่าร้านเป็นหลัก ถ้าไม่มีจึงใช้ชื่อในทะเบียนร้าน
- ถ้าหาไม่เจอจริง ๆ ให้ข้ามหัวข้อชื่อร้านไปเฉย ๆ ไม่ให้แจ้งเตือนล้มเหลว
- ไม่มีการดึงชื่อข้ามสาขา

## รายละเอียดทางเทคนิค
- ไฟล์ที่แก้: `supabase/functions/send-order-notification/index.ts`, `supabase/functions/send-daily-report/index.ts`
- เพิ่ม helper ใน `supabase/functions/_shared/` เช่น `shopName.ts` ที่รับ `shopId` แล้วคืนชื่อร้าน โดย query `shop_settings.shop_name` ก่อน แล้ว fallback เป็น `shops.name` (ใช้ service role client, `.maybeSingle()`, ครอบ try/catch คืน `null` เมื่อล้มเหลว)
- ใน `send-order-notification`: resolve ชื่อร้านจาก `orderData.shop_id` หนึ่งครั้ง แล้วส่งต่อให้ `sendDiscordNotification` / `sendLineNotification` / `sendTelegramNotification` / Instagram เพื่อ prefix ข้อความและตั้ง Discord embed title/footer
- ใน `send-daily-report`: resolve จาก `shopId` ที่ใช้อยู่แล้ว แล้วใส่ใน `reportData.shopName` ส่งต่อไปยัง `sendDiscordReport` / `sendLineReport` / `sendTelegramReport` / `sendInstagramReport`
- ไม่แตะ logic การเลือก credential, การกันส่งซ้ำ (outbox) หรือการกรองข้อมูลตาม shop

## ทดสอบ
ยิงทดสอบ edge function ทั้งสองแบบ (payload ออเดอร์ POS/ออนไลน์ และรายงานประจำวัน) แล้วตรวจว่าข้อความที่ส่งขึ้นชื่อร้านถูกต้องตามสาขา
