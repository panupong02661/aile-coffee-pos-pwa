# เพิ่มเติม v9.5 — เริ่มอ่านคู่มือกู้คืนคิวใหม่

อ่าน V95_RESTORE_QUEUE_TH.md. Persistentpauseและrestorequarantineมีจริง; ผลตรวจเก่าจากbackupใช้อนุมัติretryไม่ได้ ต้องตรวจใหม่. Ownerบันทึกfinding/note/actor/time/audit แล้วจึงretryแยกพร้อมเสี่ยงซ้ำ; receivedปิดงานไม่เปลี่ยนเป็นprovideraccepted

หยุดWorkerเก่าทุกตัวก่อนmigration2ตาราง/2columns. Built-inrestoreตรวจsnapshotก่อนguard; manualrestoreต้องรันnotifications:restore-holdเองก่อนWorker. Native/liveยังblockedตามlogs ไม่รับรองreadyforPilot

---

# เพิ่มเติม v9.4 — เริ่มอ่านส่วนนี้ก่อน

อ่าน V94_NOTIFICATION_ACCEPTANCE_TH.md สำหรับคู่มือตั้งบัญชีจริง ตารางรับรอง การดูแล unknown/expired LINE และ native local runner. หยุด Worker รุ่นเก่าทุกตัวก่อนเปลี่ยนเป็น v9.4 ไม่มี migration เพิ่มจาก v9.3

แก้ automatic LINE retry ที่เกินอายุก่อน I/O; Owner manual retry ยังมีความเสี่ยงซ้ำต้องยืนยัน. Browser lifecycle ผ่าน fake provider 24 acceptance + real settings/API/embedded SQL; live/native ยัง blocked. Health/accepted/heartbeat ไม่รับรองผู้รับได้รับจริง ไม่ติ๊ก checklist pilot จากผล unit

---

# AILE POS Cloud v9.3 — ดูแลสุขภาพ คิว และตรวจการส่งจริง

29 ตุลาคม 2026 · ขอบเขตเฉพาะระบบแจ้งเตือน ต่อจาก v9.2

## สถานะส่งมอบ

ทำแล้ว: หน้าสุขภาพ/คิวพร้อมตัวกรองและแบ่งหน้า, รายละเอียด/attempt history, lease fencing, provider message ID, heartbeat และชุดทดสอบ process crash/restart/embedded restore

ยังยืนยันไม่ได้: live provider และ native PostgreSQL หลาย Worker/pg_dump/restore เพราะไม่มี credentials/ปลายทางที่อนุญาต, DATABASE_URL หรือ binaries PostgreSQL/Docker ใน runtime. ไม่ใช้ผล embedded เป็น concurrency proof และยังไม่รับรองพร้อม production

## หน้าสุขภาพและคิว

เลือก main sidebar → ตั้งค่าแจ้งเตือนแพลตฟอร์ม → ลิงก์ **สุขภาพและคิวแจ้งเตือน** หรือ `/notifications.html#health-section` แล้วเลือกสาขา

- แสดงรอส่ง กำลังส่ง failed unknown blocked accepted, เวลา accepted ล่าสุด และงาน pending เก่าสุดของทั้งสาขา
- กดการ์ดสถานะเพื่อกรองงานสถานะนั้น โดยล้างตัวกรองช่องทาง/ประเภท/แหล่งให้ตรงกับยอดการ์ด
- heartbeat สดภายใน 90 วินาทีและ state running/idle นับเป็น Worker ที่พบ; Worker ยังอัปเดต heartbeat เมื่อ batch เดิมกำลังทำงาน
- heartbeat เป็นข้อมูลระดับบริการรวม ไม่ใช่หลักฐานว่า provider หรือคิวสาขานี้ส่งผ่าน ต้องดู backlog/attempt/result ควบคู่กัน
- คำแนะนำภาษาไทยแยก IG window, token/permission, rate limit, package disabled และผลที่อาจส่งถึงแล้ว

ตัวกรองรองรับช่องทาง ประเภท สถานะ และแหล่งออเดอร์ เลือก 25/50/100 รายการต่อหน้าได้ (API 1–100). ใช้ keyset cursor ผูก tenant/branch/filter/page size พร้อม HMAC และคง microseconds ของ PostgreSQL ไม่ใช้ offset ตัดรายการที่ timestamp ตรงกัน

ปุ่มค้นหาใช้ค่าตัวกรองที่เลือกไว้ ส่วนก่อนหน้า/ถัดไปใช้ตัวกรองที่ใช้งานแล้ว. API จำกัด created_at ไม่เกินจุดเริ่มค้นหา แต่สถานะ การลบ หรือ transaction ที่ commit ภายหลังยังเปลี่ยนได้ระหว่าง HTTP requests จึงไม่ใช่ immutable report snapshot. โหลดใหม่เพื่อดูสถานะล่าสุด

API เดิม `GET /api/notifications/deliveries` ที่ไม่ส่ง paged=1 ยังคืน array สูงสุด 100 เพื่อรองรับ source/tests เดิม. แบบใหม่ส่ง paged=1 ได้ rows/total/nextCursor/snapshotAt; ใช้ cursor กับ filter อื่นจะถูก 400 ให้เริ่มหน้าแรก

รายละเอียดงานแสดงข้อความที่เตรียมส่ง สถานะ คำแนะนำ หมายเลขอ้างอิงที่ provider คืน และประวัติการพยายามส่ง แต่ไม่คืน token, webhook secret หรือ encrypted credentials. Owner เท่านั้นที่เปิดดู; tenant/สาขาอื่นไม่สามารถเดา ID มาเปิดได้

## Lease fencing และประวัติการส่ง

แต่ละการ claim ใช้ claim_token ใหม่และเขียน attempt ใน transaction เดียวกัน. การบันทึกผลต้องตรงทั้ง status sending และ claim_token ของรอบนั้น Worker เก่าจึงไม่ทับผลของ Worker ที่รับงานต่อแล้ว

เมื่อ lease หมด: attempt เดิมเป็น unknown; LINE ที่ยังอยู่ในกรอบ retry ปลอดภัยกลับ pending ด้วย delivery UUID เดิม ส่วน provider ที่ไม่มี retry key เป็น unknown ให้ตรวจปลายทางก่อน. การลองใหม่ด้วยมือไม่ลดเลข attempts และผลจากรอบเก่าไม่สามารถทับรอบใหม่

Provider message ID ใช้จับคู่กับปลายทางเท่าที่ API คืนและผ่านรูปแบบที่รับได้ ไม่ใช่หลักฐานอ่าน. v9.2 attempts เก่าไม่ถูกสร้างย้อนหลัง หากไม่มีข้อมูลจะบอกว่าไม่มี attempt ที่บันทึกใน v9.3

## การติดตั้ง/ย้ายจาก v9.2

1. สำรองฐานและ key เดิม แล้วหยุด **ทุก API/Worker v9.2** ก่อน migration ห้ามรันปนรุ่น เพราะ Worker เก่ายังไม่มี fencing
2. npm ci / npm run db:init เพิ่ม claim_token, provider_message_id, indexes และ 2 ตาราง notification_delivery_attempts / notification_worker_heartbeats
3. ใช้ NOTIFICATION_ENCRYPTION_KEY และ JWT_SECRET ที่ถูกต้องตาม environment เดิม ไม่มีการย้ายหรือสุ่ม key ใหม่สำหรับข้อมูลเดิม
4. เปิด API/Worker v9.3 แล้วดู heartbeat/คิว ไม่อนุมัติ pilot เพียงเพราะเห็น heartbeat
5. สำรองก่อนสร้าง index บนข้อมูลขนาดใหญ่และทดสอบเวลาหยุดระบบบน native; runtime นี้ยังไม่ได้วัด

## Live check ที่เตรียมไว้ — ยังไม่ได้รันส่งจริง

`npm run notifications:live-check -- --preflight` ตรวจเฉพาะว่ามี config หรือไม่ ไม่เชื่อม DB/ไม่ส่งข้อความ ไม่พิมพ์ค่าลับ. ผลรอบนี้ exit 2 และ ready=false เพราะยังไม่มีค่าตั้งจริง

เมื่อผู้ดูแลมีบัญชี/ปลายทางทดสอบที่ได้รับอนุญาตแล้ว ให้ตั้ง env ผ่านเครื่อง/secret manager ไม่ส่ง token ในแชต:

- DATABASE_URL, NOTIFICATION_ENCRYPTION_KEY, JWT_SECRET
- NOTIFICATION_LIVE_TENANT_ID, NOTIFICATION_LIVE_BRANCH_ID
- NOTIFICATION_LIVE_CONNECTION_IDS เป็น UUID ของบัญชีที่บันทึกไว้ แยก comma (สูงสุด 12)
- NOTIFICATION_LIVE_CONFIRM=SEND_TO_MY_AUTHORIZED_TEST_DESTINATIONS

จากนั้นรัน:

```sh
npm run notifications:live-check -- --send --out /secure/new-live-check-report.json
```

คำสั่งตรวจ tenant/branch/connection IDs ก่อนสร้างงาน ส่งข้อความตัวอย่าง 3 แบบที่ติดป้าย LIVE TEST ORDER/INTERVAL/MONTHLY โดย event kind=test ไม่สร้างยอดขายหรือสรุปบัญชีปลอม ใช้ dispatcher/attempt/fencing จริง แต่ claim/recover เฉพาะ delivery IDs ที่คำสั่งนี้สร้าง ไม่หยิบคิวลูกค้าอื่นมาส่ง

รายงานแสดง providerAcceptedAll, message IDs และ recipientReceiptConfirmed=false / fullOrderLifecycleVerified=false อย่างชัดเจน. ต้องตรวจปลายทางและทำ staging flow ขาย/QR/ออนไลน์→สรุปจริงเพิ่มเติม จึงจะรับรอง end-to-end ได้

ไฟล์ --out ต้องเป็นไฟล์ใหม่และเขียนได้ก่อนส่ง; หากเกิดข้อผิดพลาด ให้ตรวจ runId/jobIds และประวัติก่อนรันซ้ำ เพราะข้อความอาจถึงแล้ว. Service Worker ปกติที่เปิดอยู่สามารถรับงานทดสอบเหล่านี้เช่นงานอื่นได้ จึงอย่าสรุปว่า pending เป็นความล้มเหลวถาวร ให้ตรวจประวัติ

Instagram ต้องเพิ่ม --instagram และมี verified inbound window/app permissions ตาม NOTIFICATIONS_TH.md. ห้ามใช้ human-agent tag เพื่อเลี่ยงข้อจำกัด บัญชีเปิดสวิตช์ได้ไม่เท่ากับ app ได้รับสิทธิ์แล้ว

## Native PostgreSQL หลาย Worker — เตรียมแล้วแต่ยังไม่ได้รัน

`npm run test:native-postgres` มี 19 scripts รวม v93_queue_db.mjs และ v93_workers_db.mjs. ใช้ฐาน disposable ที่ runner สร้างเอง พร้อม worker ปกติ=0 และ fake provider transport ผ่าน IPC เท่านั้น

ชุด v93_workers_db เตรียม:

- 4 Node worker processes ใช้ start barrier และ PostgreSQL connections แยก ต้องมีอย่างน้อย 2 processes ได้ claim จริง
- ตรวจ healthy jobs รับครั้งเดียว/attempt=1 ด้วย SKIP LOCKED
- SIGKILL หลัง fake provider ยอมรับ ก่อนบันทึกผล แล้ว restart: LINE retry key เดิม, Discord unknown
- pg_dump exported snapshot, pg_restore ลง aile_restore_drill_* ที่ว่าง เทียบ state แล้วพิสูจน์ sent ไม่ส่งซ้ำ/pending ทำต่อ/ambiguous sending ทบทวน

รอบนี้ Docker ENOENT ก่อนเริ่ม cluster จึงยังไม่มีหลักฐาน native locking หรือ pg_dump/restore. ชุด engine ใช้ PGlite parent SQL ผ่าน test IPC และ **Worker process จริงหนึ่ง process ต่อรอบ** มี SIGKILL จริงและ physical embedded dump/load แต่ไม่ใช้พิสูจน์หลาย connection แข่งกัน

ก่อนเปิดส่งหลัง production restore ให้ตรวจคิวและปลายทางตามคู่มือ v9.2 การ restore ย้อนก่อนสถานะ accepted อาจทำให้ provider ที่ไม่มี retry key รับซ้ำได้ ไม่อ้าง exactly-once ภายนอก

## เกณฑ์ผ่านก่อนใช้งานจริง

- Native 19 scripts และ concurrent-worker/restore drill ผ่านพร้อม stdout/exit code
- Discord/LINE/Telegram live acceptance + ตรวจปลายทาง และ staging lifecycle 3 แหล่ง/สรุปช่วงเวลา/รายเดือนผ่าน
- Instagram app/permissions/webhook/window ผ่านแยก ไม่ใช้ผลแพลตฟอร์มอื่นแทน
- ตรวจ token/โควตา/rate limit/unknown review, heartbeat ตอนโหลดสูง และ RPO/RTO กับข้อมูลขนาดจริง

เครื่องพิมพ์และโมดูลอื่นไม่อยู่ในขอบเขต v9.3
