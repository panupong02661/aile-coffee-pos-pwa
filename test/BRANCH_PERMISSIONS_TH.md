# คู่มือสิทธิ์รายสาขา AILE POS Cloud v9.1

v9.1 เพิ่ม function control อีกชั้น ดู FUNCTION_CONTROL_TH.md; การเปิด function ไม่ข้าม branch grants. Owner ให้พนักงานแก้ข้อมูลกลางทั้งร้านได้เมื่อกำหนด allow และพนักงานมีทุกสาขาปัจจุบัน ส่วนบัญชี/สิทธิ์/control plane ยังคงสงวน Owner

# คู่มือสิทธิ์รายสาขา AILE POS Cloud v9.0

## Migration

1. สำรองฐานและหยุด API รุ่นเก่าก่อนรัน npm ci / npm run db:init
2. Schema เพิ่ม tenant_branch_access, staff_branch_access_audit และ tenant_users.branch_access_initialized
3. ครั้งแรก migration คัดลอกสิทธิ์ Manager/Cashier เดิมไปทุกสาขาปัจจุบัน (สิทธิ์เดิมเป็นทั้ง tenant) พร้อม audit reason legacy_current_branches, actor_id เป็น null เพราะเป็น migration ระบบ
4. Marker ของสมาชิกที่ย้ายแล้วเป็น true; default ของสมาชิกใหม่เป็น true แต่ไม่มี grants. การรัน schema ซ้ำไม่คืนสิทธิ์ที่ถอน ไม่เพิ่มสาขาใหม่ให้ staff เดิม และไม่แจกสิทธิ์ให้สมาชิกใหม่
5. เปิด API ใหม่ แล้ว Owner ตรวจ /branch-access.html เพื่อจำกัดสิทธิ์ที่คงมาจากรุ่นเดิม

## กฎสิทธิ์

| ส่วน | Owner | Manager/Cashier |
|---|---|---|
| สาขา | ทุกสาขาเสมอ แก้ scope Owner ไม่ได้ | เฉพาะรายการ grants จาก DB |
| POS / stock / register / table / KDS / refund | คง role rules เดิม | ต้องมีสิทธิ์ทุกสาขาที่ body/query/resource อ้างถึง และยังต้องผ่าน role rule เดิม |
| รายการขายและ discount queue | ทั้งร้าน | filter เฉพาะ grants |
| รายงาน | ทั้งร้านหรือรายสาขา | Manager เลือก subset หลายสาขาที่มีสิทธิ์ผ่าน branchIds ได้; aggregate ทั้ง tenant ได้เมื่อมีครบทุกสาขาปัจจุบัน; Cashier ยังใช้ report ที่จำกัด role ไม่ได้ |
| Catalogue อ่าน | ทั้ง tenant | shared read เมื่อมี grant อย่างน้อยหนึ่งสาขา |
| Catalogue/settings เขียน, staff list, audit รวม | Owner | ปฏิเสธ เพราะกระทบข้อมูลร่วมทั้ง tenant |
| Grants | จัดการ non-owner ได้ | แก้สิทธิ์เองไม่ได้ |

SaaS account metadata/usage เป็นข้อมูลร่วมของ tenant; /access/me และ /branches เปิดได้แม้ยังไม่มี grant เพื่อให้แสดงสถานะผู้ใช้ได้. Public storefront และ guest-token routes เป็น public/capability policy เดิมแยกจาก staff JWT

## หน้าจัดการ

ล็อกอิน Owner ใน POS แล้วเปิด “สิทธิ์รายสาขา” ในหน้าพนักงาน หรือ /branch-access.html ใช้ session token เดิม เลือก checkbox แล้วบันทึก. ไม่เลือกเลยเท่ากับถอนทั้งหมด. ปุ่มประวัติแสดง before/after พร้อมเวลาและเหตุผล. หน้าจอส่ง expectedBranchIds เพื่อกันบันทึกทับเมื่อสิทธิ์ถูกแก้จากหน้าจออื่นแล้ว

API PUT /api/operations/staff/:id/branches รับ branchIds และ optional expectedBranchIds; ตรวจ tenant/สมาชิก/สาขาทั้งหมดใน transaction ก่อนแก้. API POST /operations/staff รองรับ branchIds, default []. UI สร้างพนักงานจาก POS จะส่งสาขาปัจจุบันอย่างชัดเจน. ข้อมูล owner ไม่ใช้ grants เพราะเข้าถึงทุกสาขาเสมอ

## ถอนสิทธิ์และขอบเขต

ใช้สิทธิ์ใหม่กับ HTTP request ถัดไปแม้ใช้ token เดิม. SSE ใน instance เดียวกันถูกปิดทันที; instance อื่นตรวจสิทธิ์ทุก heartbeat 20 วินาที. Transaction ที่ผ่าน authorization ไปก่อนแล้วอาจทำงานจนจบ; ไม่ใช่กลไกยกเลิก in-flight transaction หรือ remote wipe ข้อมูลที่เคยดาวน์โหลด/เก็บ offline

ระบบตรวจที่ API ไม่ใช่ PostgreSQL RLS; ห้ามแจก DB credentials ให้ staff. Migration/กรณีพร้อมกันและหลาย API instance ยังต้องยืนยันบน native PostgreSQL ก่อน pilot

## ทดสอบและตรวจ policy

npm test / npm run check / npm run test:branch-access-engine

Native disposable: npm run test:native-postgres หรือ test:branch-access-db ตาม POSTGRES_TESTING_TH.md. Runner รวม 13 integration scripts และเริ่ม API ใหม่แต่ละ suite โดยยังเปิด rate limiter ตามจริง

Browser owner editor: Python Playwright + python tests/v89_branch_browser.py (ตั้ง CHROMIUM_PATH ได้); ใช้ mock API. Branch engine suite ใช้ auth/API/SQL จริงบน embedded engine แต่ไม่แทน native concurrent proof

API_BRANCH_ROUTE_INVENTORY.json เป็น inventory ของ route ที่ใช้ staff auth จาก source สำหรับ review; endpoint ใหม่ต้องกำหนด policy ใน api/src/branch-access.js ก่อนเปิดใช้กับ staff. ห้ามอนุญาตเพียงเพราะ request ส่ง branchId มา เพราะ route อาจไม่ได้ใช้ค่านั้นกรองข้อมูล

## v9.0 Report scope

branchIds รองรับ comma-separated หรือ repeated array; ทุกรายการต้องอยู่ใน grants ปัจจุบัน. ไม่ระบุ scope = all-tenant ตาม policy เดิม, ระบุ empty = 400. JSON/XLSX/PDF ใช้ scope เดียวกัน; UI export ยึด applied filters. ดู REPORT_RECOVERY_TH.md
