# เพิ่มเติม v9.5 — พักคิว/Restore/ผลตรวจปลายทาง

Ownerพักหรือเปิดคิวรายสาขาได้. Restoreกักnonfinaljobsและinvalidateผลตรวจเดิม; unknown/restorejobsต้องบันทึกผู้ตรวจ/เวลา/เหตุผลก่อนretryพร้อมยืนยันเสี่ยงซ้ำ. ยืนยันพบข้อความแล้วปิดเป็นcancelledไม่ปลอมprovideraccepted. อ่าน V95_RESTORE_QUEUE_TH.md ก่อนmigration/restore. Built-inrestoreมีguard; manualpg_restoreต้องรันnotifications:restore-holdก่อนเปิดWorkerเอง

เพิ่ม2ตาราง/2columnsต้องหยุดWorkerเก่าทั้งหมดแล้วdb:init. BrowserPOS/QRจริง+embeddedSQL/fakeproviderและload240fixtureผ่าน; live/nativeยังไม่ยืนยัน

---

# เพิ่มเติม v9.4 — Retry safety และ acceptance checklist

LINE ที่เคยพยายามและอายุงานอย่างน้อย 23 ชั่วโมงจะเป็น unknown/RETRY_WINDOW_EXPIRED ก่อน provider I/O; manual retry ต้องตรวจปลายทางและยืนยันความเสี่ยงซ้ำ. อ่าน V94_NOTIFICATION_ACCEPTANCE_TH.md สำหรับการตั้งบัญชีจริง ดูแลคิวและ native restore. Browser/UI settings/API/embedded SQL ผ่าน แต่ provider fake ทั้งหมด. Live accounts/native PostgreSQL/Instagram permissions ยังไม่ยืนยัน

---

# เพิ่มเติม v9.3 — สุขภาพและการดูแลคิว

เพิ่มหน้าสุขภาพ ตัวกรอง แบ่งหน้า และ detail/attempt history ที่ /notifications.html#health-section. อ่าน NOTIFICATION_OPERATIONS_TH.md ก่อน migration/live test. ต้องหยุด Worker v9.2 ทุกตัวก่อน db:init; เพิ่ม fencing และ 2 ตาราง ไม่รันปนรุ่น

รอบ v9.3 ยังไม่มี live credentials/native PostgreSQL. มี operator acceptance-only checker และ native test harness ที่เตรียมไว้ แต่ไม่ใช่หลักฐานผ่านจริง

---

# AILE POS Cloud v9.2 — คู่มือตั้งค่าแจ้งเตือนแพลตฟอร์ม

วันที่ 29 ตุลาคม 2026 · พัฒนาต่อจาก v9.1 เฉพาะงานแจ้งเตือน

## เปิดหน้าตั้งค่า

เข้าสู่ระบบร้านด้วย Owner แล้วเลือก **ตั้งค่าแจ้งเตือนแพลตฟอร์ม** ใน main sidebar หรือ `/notifications.html` เลือกสาขาก่อนตั้งค่า แต่ละสาขามีการตั้งค่าของตนเอง และตั้งปลายทางได้สูงสุด 12 บัญชี

Manager/Cashier ไม่สามารถอ่านหรือแก้ credentials. ผู้ดูแล AILE ยังเปิด–ปิดฟังก์ชันแจ้งเตือนตามแพ็กเกจ/ข้อยกเว้นได้ โดยเฉพาะ control “ส่งแจ้งเตือนออกแพลตฟอร์ม”; worker ตรวจสิทธิ์นี้ก่อนส่งจริงทุกครั้ง

## ประเภทข้อความและแหล่งออเดอร์

| ประเภท | การตั้งค่า |
|---|---|
| ออเดอร์ใหม่ | เปิด/ปิด และเลือกหน้าร้าน/POS, QR ในร้าน, แอปลูกค้าออนไลน์ |
| สรุปช่วงเวลา | เปิด/ปิด เลือกแหล่ง ตั้งเวลาเริ่ม–สิ้นสุดและเวลาส่งได้ 1–8 ช่วงต่อวัน |
| สรุปรายเดือน | เปิด/ปิด เลือกแหล่ง กำหนดวันส่ง 1–28 และเวลา ส่งสรุปเดือนปฏิทินก่อนหน้า |

ทุกประเภทเริ่มต้นปิดเพื่อไม่ส่งข้อความโดยไม่ได้ตั้งใจ ต้องกดบันทึกประเภทและเวลา และบันทึกช่องทางแยกกัน

เวลาทั้งหมดเป็น Asia/Bangkok ไม่อิง timezone เครื่องผู้ใช้. ช่วงข้อมูลรวมเวลาเริ่ม แต่ไม่รวมเวลาสิ้นสุด. ตัวอย่าง 09:00–18:00 ส่ง 18:05; ข้ามเที่ยงคืน 22:00–02:00 ส่ง 08:00; เริ่มเท่ากับสิ้นสุดหมายถึง 24 ชั่วโมง. ถ้าเวลาส่งอยู่ก่อนเวลาสิ้นสุด จะส่งในวันถัดไป

รายเดือนวันที่ 1 พฤศจิกายนสรุป 1–31 ตุลาคมทั้งเดือน ไม่ใช่ย้อนหลัง 30 วัน. Scheduler ไม่ส่งช่วงที่ถึงกำหนดก่อนการตั้งค่าล่าสุด; เมื่อหยุดชั่วคราวจะไล่ช่วงรายวันย้อนหลังไม่เกิน 48 ชั่วโมง และรายเดือนไม่เกิน 35 วัน. แต่ละช่วงมี key กันการสร้างข้อความซ้ำ

แต่ละบัญชีปลายทางมีสวิตช์เปิด/ปิด และเลือกว่าจะรับออเดอร์ใหม่/สรุปช่วงเวลา/รายเดือนได้เอง เพิ่มหลายบัญชีของแพลตฟอร์มเดียวกันได้ เช่น LINE กลุ่มครัวรับออเดอร์ และ LINE เจ้าของรับสรุป

## ออเดอร์ที่เชื่อมแล้ว

- หน้าร้าน: cash-checkout และรายการโต๊ะที่พนักงานส่งเข้าครัว
- QR: การสั่งผ่าน guest link ของโต๊ะจริง
- ออนไลน์: ออเดอร์ที่เข้าระบบผ่าน authenticated online-order ingestion API เดิม

ไม่สร้างแจ้งเตือนออเดอร์ใหม่ซ้ำตอนชำระบิลโต๊ะ เพราะแจ้งตอนส่งรายการแล้ว. ข้อความแสดงร้าน/สาขา เลขอ้างอิง จำนวนสินค้า ยอดออเดอร์และสถานะชำระ; สินค้าเยอะจะย่อข้อความตามข้อจำกัดช่องทาง

หน้าลูกค้า/CRM ที่ยังเป็น demo เดิมไม่กลายเป็นระบบรับออเดอร์จริงด้วยงานรอบนี้ การแจ้งเตือนออนไลน์จะเกิดเมื่อออเดอร์ถูกบันทึกเข้า backend จริงเท่านั้น ไม่เปิด public ingestion ใหม่หรือเปลี่ยนระบบสั่งซื้อ

## ความหมายของยอดสรุป

จำนวนออเดอร์แยกตามแหล่งที่เลือกเริ่มบันทึกตั้งแต่อัปเดต v9.2; ไม่สร้างประวัติย้อนหลังที่ไม่มีหลักฐาน

ยอดรับชำระอ่านจาก sales ที่มีอยู่จริงทั้งหมดของสาขาในช่วงนั้น คืนเงินอ่านตามเวลาที่คืนเงินจริง และแสดงส่วนต่างรับ–คืน แยกจากจำนวนออเดอร์อย่างชัดเจน. เงินส่วนนี้รวมทุกแหล่งของสาขา ไม่อ้างว่าสามารถแยกเงินของบิลโต๊ะที่ผสม QR/พนักงานได้. ออเดอร์ที่ยังไม่ชำระไม่ใช่รายรับ และส่วนต่างรับ–คืนไม่ใช่กำไร

## Discord

สร้าง webhook ของช่อง Discord ที่ต้องการ แล้วใส่ URL รูปแบบทางการ `https://discord.com/api/webhooks/.../...` ระบบรับเฉพาะ host นี้และไม่ตาม redirect เพื่อป้องกันส่งไป URL ภายในระบบ. กดบันทึกแล้วทดสอบส่ง. ปิด mention เพื่อไม่ให้ข้อความออเดอร์ ping ทุกคนหรือ role

## LINE

ใช้ **LINE Messaging API** ไม่ใช่ LINE Notify. ใส่ Channel Access Token และ User ID / Group ID / Room ID ซึ่งขึ้นต้น U/C/R. บอทต้องเข้าถึงปลายทางได้ และบัญชีต้องมีโควตาข้อความ/สิทธิ์ที่เพียงพอ

Channel Secret เป็นทางเลือกสำหรับรับ webhook และค้นหา ID: บันทึกค่า จากนั้นนำ Webhook URL ของการเชื่อมต่อนี้ไปตั้งใน LINE Developers, เปิดใช้งาน webhook และอนุญาตบอทเข้ากลุ่มตามบัญชีที่ใช้ เมื่อมีข้อความเข้าที่ลายเซ็นถูกต้อง ให้โหลดหน้าตั้งค่าใหม่เพื่อดู ID ที่พบ แล้วนำ ID ที่ตั้งใจใช้ใส่ช่องปลายทาง. ระบบไม่ตอบ Group ID กลับแชตเองและไม่ตั้งปลายทางให้โดยเงียบ ๆ

ใช้ X-Line-Retry-Key เดิมสำหรับ request เดิม และถือว่ายอมรับแล้วเมื่อได้ 2xx หรือ 409 พร้อม accepted-request-id. ไม่แปลว่าเจ้าของแชตอ่านหรือได้รับจริงทุกคน

## Telegram

สร้างบอทผ่าน @BotFather ใส่ Bot Token และ Chat ID / @ชื่อช่อง. ผู้รับต้องเริ่มคุยกับบอทหรือให้บอทเข้าถึงกลุ่ม/ช่อง และให้สิทธิ์ที่แพลตฟอร์มกำหนด. ไม่ใช้ token อย่างเดียวแทนปลายทาง

## Instagram — มีเงื่อนไข ไม่ใช่ช่องแจ้งเตือนแบบส่งหาใครก็ได้

ต้องใช้ Professional Account, app/token ที่มีสิทธิ์ messaging, account ID, Instagram-scoped recipient ID, App Secret, webhook verify token และ Graph API version ที่แอปใช้งานจริง. ตัวเลข version ใน tests เป็น fixture ไม่ใช่การรับรองว่า app ลูกค้าได้รับสิทธิ์ version นั้น

ตั้ง webhook ตาม URL ที่แสดงบนหน้าจอ และ subscribe messaging ของบัญชีผ่านการตั้งค่า Meta ของคุณ. ระบบตรวจ verify token ตอน handshake และ HMAC ลายเซ็น raw body ตอนรับข้อความ; ต้องเป็นข้อความขาเข้าจาก recipient ที่กำหนดถึง account ที่กำหนด ไม่รับ echo/เวลาในอนาคต

รุ่นนี้ใช้หน้าต่างส่งแบบอนุรักษ์นิยม 24 ชั่วโมงนับจากข้อความขาเข้าที่ตรวจสอบแล้ว. ถ้าไม่มี/หมดช่วงจะขึ้น “รอเงื่อนไข” โดยไม่เรียก send API ไม่ปลอม timestamp และไม่ใช้ human-agent tag เพื่อเลี่ยงเงื่อนไข. มีข้อความใหม่เข้าที่ถูกต้องแล้วจะนำคิวที่ถูกบล็อกไม่เกิน 24 ชั่วโมงกลับมาพิจารณาได้

ดังนั้นสรุปรายเดือนเข้า Instagram **ไม่รับประกันว่าจะส่งได้อัตโนมัติทุกเดือน** หากผู้รับไม่ได้เริ่มบทสนทนาตามเงื่อนไข. ถ้าต้องการช่องแจ้งเตือนประจำที่ไม่ขึ้นกับหน้าต่างสนทนานี้ ให้ตั้ง Discord/LINE/Telegram ที่เข้าถึงปลายทางได้ไว้ด้วย

การอนุมัติ app/permissions และการส่งจริงต้องตรวจด้วยบัญชี Meta ของลูกค้า ยังไม่ได้ยืนยัน live account ในรอบนี้

## ปุ่มทดสอบและสถานะ

ปุ่มทดสอบสร้างข้อความทดสอบหนึ่งรายการให้ worker ไม่ถือว่าส่งสำเร็จทันที. โหลดประวัติเพื่อตรวจผล. ทดสอบได้แม้สวิตช์ช่องทางปิด เพราะเป็นการกดส่งด้วยตนเอง แต่ยังต้องผ่านสิทธิ์แพ็กเกจ/เงื่อนไข Instagram

- รอส่ง / กำลังส่ง: ยังไม่ยืนยันผล
- ผู้ให้บริการรับข้อความแล้ว: ได้รับ API acceptance ไม่ใช่ read receipt
- ส่งไม่สำเร็จ: provider ปฏิเสธ ให้ตรวจการตั้งค่า/โควตา
- ไม่ทราบผล: timeout/5xx ของช่องทางที่ไม่มี retry key หรือ worker หยุดระหว่างส่ง อาจถึงผู้รับแล้ว ห้ามกดซ้ำโดยไม่ตรวจ
- รอเงื่อนไข: เช่น Instagram window ปิด หรือกุญแจเข้ารหัสไม่พร้อม
- ยกเลิกตามการตั้งค่า: ปิดประเภท/ช่องทาง เปลี่ยน revision หรือแพ็กเกจปิดสิทธิ์ก่อนส่ง

LINE retry อัตโนมัติใช้ key เดิมในกรอบเวลาจำกัด. Discord/Telegram/Instagram ที่ไม่ทราบผลไม่ส่งซ้ำอัตโนมัติ; ลองใหม่ด้วยมือได้เมื่อยอมรับความเสี่ยงข้อความซ้ำ. Rate limit ที่ provider ระบุชัดเจนจะรอตามเวลาที่กำหนด. Worker ตรวจคิวทุก 15 วินาที สูงสุด 20 งานต่อรอบต่อ instance ตามค่าเริ่มต้น

การเปลี่ยนปลายทาง/revision ไม่ส่งคิวเก่าไปบัญชีใหม่โดยอัตโนมัติ; งานเก่าจะถูกยกเลิกเมื่อ worker ตรวจ. การปิดสวิตช์ไม่ย้อนเรียกคืน HTTP request ที่เริ่มส่งไปแล้ว

## ติดตั้ง/ย้ายจาก v9.1

สำรองฐาน หยุด API เก่า แล้ว `npm ci` / `npm run db:init` / `npm start`. เพิ่ม 7 ตาราง notification และ policy_revision ภายในตาราง delivery ใหม่ ไม่มีการย้ายยอดขาย/คืนเงินหรือปรับสต็อกย้อนหลัง

ตั้ง `NOTIFICATION_ENCRYPTION_KEY` เป็น random 32 bytes แบบ hex 64 ตัวอักษรบน server เท่านั้น. `setup:local` สร้างให้เมื่อเป็น environment ใหม่ ส่วนไฟล์ .env เดิมต้องเพิ่มด้วยผู้ดูแลโดยไม่เขียนทับ secrets เดิม. ถ้าไม่ตั้ง ระบบขายเดิมยังทำงาน แต่บันทึก credentials ใหม่ไม่ได้

`NOTIFICATIONS_WORKER_ENABLED=1` เปิด worker ใน npm start (ค่าเริ่มต้นเปิด); ค่า 0 ปิดการส่งและ scheduling ใช้กับการทดสอบ/maintenance. `createApp(pool)` ที่ tests ใช้ไม่เปิด worker อัตโนมัติ. Docker Compose ส่ง env สองค่านี้แล้ว แต่ Docker build ยังไม่ได้รันใน environment นี้

Credentials เก็บ AES-256-GCM ผูกกับ tenant/branch/provider/connection และไม่ส่งคืนทาง GET. ช่องว่างในการแก้ไขคงค่าเดิม; ลบบัญชีเพื่อถอดการเชื่อมต่อทั้งชุด. การลบลบประวัติ delivery ของบัญชีนั้น แต่ audit การตั้งค่ายังคงอยู่

สำรอง encryption key อย่างปลอดภัยแยกจาก dump และเก็บให้ตรงกับฐานที่ restore. เปลี่ยน/ทำ key หายจะอ่าน credentials เดิมไม่ได้; อย่าสุ่ม key ใหม่ทุกครั้งที่ restart. Business snapshot รวมตาราง notification และ state ของคิวด้วย

เมื่อต้องกู้ archive รุ่นเก่า ให้ใช้เครื่องมือรุ่นที่สร้าง archive เทียบ business manifest ให้ผ่านก่อน แล้วจึงทำ migration ตามรุ่น; เครื่องมือตรวจ schema ปัจจุบันต้องการตารางรุ่นปัจจุบัน จึงไม่ควรอ้างว่ากู้ archive เก่าพร้อม migration แล้วได้ hash เดิม

ก่อนเปิด worker หลัง restore ให้ตรวจคิวและส่งไปปลายทางที่ตั้งใจ. งาน sending เดิมจะใช้ LINE retry key หรือเป็น unknown สำหรับช่องทางอื่น ไม่รับรอง exactly-once ภายนอก; การกู้คืนย้อนเวลาก่อนสถานะ sent อาจทำให้ provider อื่นรับซ้ำได้ จึงต้อง drill และทบทวนคิวก่อนเปิดส่งจริง

## หลักฐานทดสอบและสิ่งที่ยังไม่ยืนยัน

- Unit tests, API/SQL บน PGlite embedded, rollback/outbox, source switches, schedules, webhook HMAC, encrypted physical restore และ Browser ต่อ API/SQL จริงผ่าน
- Provider transport ใน tests เป็นตัวจำลอง ตรวจ URL/headers/payload/status ไม่ส่งข้อความเข้าบัญชี Discord/LINE/Telegram/Instagram จริง
- Native PostgreSQL/Docker ไม่มีใน runtime; concurrency ของหลาย worker ด้วย native locks, live credentials/app review, provider quotas, การส่งจริง และ restore drill native ยังไม่ได้ยืนยัน
- เครื่องพิมพ์และฟีเจอร์อื่นนอกแจ้งเตือนไม่อยู่ในขอบเขต v9.2

เอกสาร provider ที่ใช้อ้างอิง:

- https://docs.discord.com/developers/resources/webhook
- https://developers.line.biz/en/docs/messaging-api/sending-messages/
- https://developers.line.biz/en/docs/messaging-api/retrying-api-request/
- https://core.telegram.org/bots/api#sendmessage
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/
- https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api

Meta direct documentation ถูก rate-limit 429 ระหว่างตรวจบางหน้าในรอบนี้; ไม่ใช้ผลค้นหาแทน live app validation และไม่อ้างว่าส่ง Instagram จริงแล้ว
