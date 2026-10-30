# v9.4 — คู่มือยืนยันแจ้งเตือนและกู้คืนคิว

29 ตุลาคม 2026 (Asia/Bangkok) · ผลปัจจุบันยังไม่พร้อม production

## ก่อนอัปเดต

ใช้ v9.3 เป็นฐาน ไม่มี schema ใหม่ใน v9.4. หยุด Worker เก่าทั้งหมดก่อนอัปเดตทุก instance; ไม่ปล่อย v9.3 worker ที่ยังมี retry bug ทำงานคู่ v9.4. สำรองฐานและ NOTIFICATION_ENCRYPTION_KEY/JWT secrets แบบปลอดภัย รัน npm ci แล้ว db:init เมื่อติดตั้งฐานใหม่/ยังไม่ผ่าน migration v9.3. เก็บ secrets นอก ZIP และห้ามกรอกในรายงานหรือแชต

## ติดตั้งบัญชีทดสอบจริง

Owner เลือกสาขาทดสอบใน main sidebar → ตั้งค่าแจ้งเตือนแพลตฟอร์ม. ใช้ Discord webhook/LINE OA/Telegram bot และผู้รับที่ได้รับอนุญาตเท่านั้น บัญชีในภาพตัวอย่างไม่ใช่ credentials ของโปรเจกต์. เปิด connection และประเภทที่ต้องการ แล้วเลือกแหล่ง POS/QR/ออนไลน์ใน policy

- Discord: webhook ของ channel ทดสอบที่ผู้ดูแลควบคุม; ดูทั้ง provider message ID และข้อความใน channel
- LINE: Channel Access Token + User/Group/Room ID ที่ถูกต้อง; OA ต้องเข้าถึงผู้รับได้. Channel Secret ใช้ตรวจ signed webhook และรับ Group ID ไม่ใช่ token ส่ง. ตรวจโควตาใน OA และการรับจริงแยกจาก HTTP acceptance
- Telegram: Bot Token + chat ID; ผู้รับเริ่มคุย/เพิ่มบอทและให้สิทธิ์ในกลุ่มหรือช่องตามการใช้งาน
- ตั้ง DATABASE_URL, JWT_SECRET, NOTIFICATION_ENCRYPTION_KEY ใน server ทดสอบ; key เดิมต้องใช้กับ backup เดิม

`npm run notifications:live-check -- --preflight` ไม่ส่ง. เมื่อ config พร้อมและมีการอนุญาตแล้ว ใช้ NOTIFICATION_LIVE_TENANT_ID / NOTIFICATION_LIVE_BRANCH_ID / NOTIFICATION_LIVE_CONNECTION_IDS เฉพาะ connection ทดสอบ, NOTIFICATION_LIVE_CONFIRM=SEND_TO_MY_AUTHORIZED_TEST_DESTINATIONS แล้ว `npm run notifications:live-check -- --send --out /absolute/new-private-result.json`. Output ต้องเป็นไฟล์ใหม่; ไม่ส่งซ้ำอัตโนมัติหากคำสั่งหยุดหรือไม่รู้ผล

เครื่องมือนี้ส่งข้อความตัวอย่าง 3 แบบ kind=test ไม่สร้างยอดขายและไม่ยืนยัน lifecycle จริง. อย่าใช้ผลสามข้อความแทนรายการต่อไปนี้

## ตารางรับรองบัญชีจริง (ยังไม่รันทุกช่อง)

| กรณี | Discord | LINE | Telegram | หลักฐานที่ต้องเก็บโดยไม่เก็บ token |
|---|---|---|---|---|
| POS สร้างออเดอร์/ส่ง key เดิมซ้ำ | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | sale/event/delivery IDs, provider ID, ผู้รับยืนยันและจำนวนข้อความ |
| QR ในร้านสร้างออเดอร์/ส่ง key เดิมซ้ำ | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | session/event IDs, ยังไม่ชำระต้องไม่เป็นรายรับ |
| Online backend ingress/ส่ง key เดิมซ้ำ | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | order/event IDs; customer-app demo ไม่ใช่ backend lifecycle |
| สรุปช่วงเวลา Bangkok | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | settings revision, from/to, SQL sales/refunds และยอดในข้อความ |
| สรุปเดือนปฏิทินก่อนหน้า | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | เดือน/สาขา/ยอด/เวลารับ; ทดสอบขอบเดือนและปี |
| ปิด source/type/provider | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ยังไม่ทดสอบจริง | ไม่มี provider I/O สำหรับงานที่ปิด; ไม่หยุดบันทึกธุรกรรม |

ยอดรับชำระ/คืนในสรุปเป็นยอดทั้งสาขาทุกแหล่ง ออเดอร์ count กรองตาม source; ไม่อ้างยอดเงินแยกแหล่งของบิลผสม. Provider accepted ไม่ใช่หลักฐานผู้รับได้รับ/อ่าน

## ดูแลคิว

1. เลือกสาขา → สุขภาพและคิว: ดู pending/sending/failed/unknown/blocked, last accepted และ heartbeat
2. กรอง provider/type/status/source แล้วเปิดรายละเอียดและ attempts. เปลี่ยนตัวกรองต้องเริ่มหน้าแรก; สถานะอาจเปลี่ยนระหว่างหน้าข้อมูล
3. failed 401/403: ตรวจ token/สิทธิ์/ผู้รับก่อนทดสอบใหม่; rate limit รอตามกำหนด อย่ากดซ้ำ
4. unknown: ตรวจข้อความจริงที่ปลายทางก่อน หากยังต้องส่งใหม่ Owner ยืนยันความเสี่ยงการได้รับซ้ำเอง ปุ่ม Cancel ไม่สร้าง retry
5. LINE RETRY_WINDOW_EXPIRED: v9.4 หยุด automatic retry ก่อน I/O เมื่อเคยส่งและอายุงานอย่างน้อย 23 ชั่วโมง. เป็น conservative cutoff จาก created_at; ไม่อ้างว่าผู้รับไม่ได้รับ. Manual retry ที่ยืนยันแล้วอาจส่งซ้ำได้
6. เปลี่ยน credentials/revision หรือ policy: งานเก่าถูกยกเลิกตามเงื่อนไขเดิม ไม่ย้ายข้อความย้อนหลังไปบัญชีใหม่เงียบ ๆ

เอกสาร LINE ระบุ retry key อายุ 24 ชั่วโมงนับจาก request แรก และการ accepted ไม่รับรอง delivery. อ่าน https://developers.line.biz/en/docs/messaging-api/retrying-api-request/ (ตรวจ 29 ตุลาคม 2026). ใช้ payload/recipient เดิมเมื่อ retry ด้วย key เดิม

## Native PostgreSQL / หลาย Worker / restore

มีสองทางที่สร้างฐาน disposable ของตัวเอง ไม่รับ DATABASE_URL ลูกค้า:

- Docker: `npm ci` แล้ว `npm run test:native-postgres` (PostgreSQL 16 image เดิม)
- Native binaries: ติดตั้ง PostgreSQL server/client ชุดเดียวกัน รันด้วย non-root; ตั้ง AILE_PG_BIN เป็น bin directory ได้ แล้ว `npm run test:native-postgres-local`. Runner bind loopback, random port/password, สร้าง/ลบเฉพาะ temp cluster ของตัวเอง. หาก DATABASE_URL ถูกตั้งให้ unset ก่อน
- เพิ่ม `AILE_NOTIFICATION_BROWSER=1` และเตรียม Python Playwright/Chromium (`CHROMIUM_PATH`, optional `AILE_BROWSER_PYTHON`) จะรัน 21 suites รวม browser; ปกติ 20 suites

worker test ใช้ 4 subprocess/barrier และบังคับอย่างน้อย 2 processes claim งานจริง, SIGKILL หลัง fake acceptance, LINE stable key/Discord unknown และ pg_dump exported snapshot → pg_restore ฐานใหม่. Provider ยัง fake แม้ DB native. Local helper ตรวจ token/UID/port/ชื่อฐานผ่าน marker ก่อนเรียก backup tool; ไม่ออกแบบสำหรับฐาน production

ก่อนเปิด worker หลัง restore ต้องปิด API writes/Worker ระหว่าง dump/verify/restore, verify checksum ของสคริปต์ backup เดิม, เทียบ business snapshot ก่อน db:init/งานใหม่, ตรวจ attempts/audit/credentials พร้อม key เดิม. หาก backup ย้อนก่อนการส่งที่เกิดภายนอกสำเร็จ งาน pending ที่ restore อาจส่งซ้ำได้; fencing ไม่ป้องกันผลภายนอกย้อนหลัง จึงต้องตรวจหลักฐานปลายทางก่อนเปิดส่ง ไม่อ้าง exactly-once

ในเครื่องนี้ยังไม่เริ่ม native cluster: Docker ไม่มี, local เป็น root-only UID mapping และ unshare ไม่อนุญาต. pg_dump/restore native, RPO/RTO จริงและ full production backup drill ยังไม่ยืนยัน. Embedded physical restore/hash + worker tests เป็นหลักฐานเฉพาะ embedded เท่านั้น

## Instagram แยกจากช่องทางทั่วไป

รายการที่ยังต้องให้ผู้ดูแลตรวจจาก Meta App Dashboard และบัญชีจริง: professional account, login/API path ตรงกับ token/host, messaging permissions/access level/app review ตามผู้ใช้งาน, บัญชีและผู้รับที่ถูกต้อง, HTTPS webhook signature, verified inbound และช่วงบทสนทนา. ไม่อ้างว่ารูปแบบ token หรือเปิดสวิตช์คือผ่าน app permission

ระบบเดิมรองรับ graph.instagram.com และ conservative verified-inbound 24 ชั่วโมง ไม่เพิ่ม Human Agent tag หรือขยายช่วงส่งอัตโนมัติ. ไม่รับรองสรุปตามเวลาหรือรายเดือนเมื่อไม่มีบทสนทนาที่เข้าเงื่อนไข. Official guide: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api — พยายามเข้าถึง 29 ตุลาคม 2026 แต่เครื่องมืออ่านเนื้อหาไม่ได้ จึงไม่ได้ยืนยันสิทธิ์ล่าสุดจากหน้าเอกสารหรือแอปจริงรอบนี้

## หลักฐานและขอบเขต Browser

validation/v94-browser.log + v94-additional-results.json: UI ตั้งค่าจริง/HTTP order API จริง/Express-JWT-SQL จริง ไม่มี route mocks, fake provider 24 acceptance, ฿3.75, source/provider/type on-off, replay, unknown confirmation/cancel, Manager/tenant denial และ mobile width. ไม่ใช่ UI checkout ทั้งระบบและไม่ใช่ live provider receipt

ทดสอบต่อบน staging/native และเก็บผลจริงก่อนติ๊ก pilot. งาน return-only/discount reconciliation/accounting/dependency upgrade/เครื่องพิมพ์ ไม่พัฒนาเพิ่มใน release นี้ตามขอบเขต
