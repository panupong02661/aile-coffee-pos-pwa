# แผนปรับปรุงความปลอดภัยที่เหลือ (หลายข้อ)

สรุปสิ่งที่ยืนยันแล้วจากการตรวจสอบฐานข้อมูลจริง:
- `expenses`, `expense_categories`, `shifts` มีคอลัมน์ `shop_id` ทั้งหมด แต่ policy ปัจจุบันใช้ `true` (เปิดให้ทุก staff ดู/แก้ข้ามร้าน) → ต้องขอบเขตตาม `shop_id`
- `current_shop_id_from_header()` ถูกใช้ใน RLS policy ของ `customer_gifts`, `customer_mobile_sessions`, `customer_prize_claims` → ต้องเก็บ EXECUTE ไว้ให้ anon/authenticated (ห้าม revoke)
- ฟังก์ชันที่ frontend เรียกผ่าน `.rpc()` (ยืนยันจากโค้ด): `authenticate_user`, `claim_limited_reward`, `restore_stock_for_cancelled_order`, `toggle_menu_availability`, `calculate_menu_cost`
- `generate_order_number` ถูกเรียกภายในฟังก์ชันอื่น (SECURITY DEFINER) ไม่ใช่จาก frontend rpc
- `receipts` bucket เป็น public และมีโค้ด `getPublicUrl` ใน `OnlineShopSection.tsx`

## Phase 1 — ขอบเขต RLS ตามร้าน (Database migration)

ปรับ policy ของ 3 ตารางให้กรองด้วย `shop_id = current_shop_id_from_header()` แทน `true`:
- `expenses` (ดู/เพิ่ม/แก้/ลบ เฉพาะร้านตัวเอง)
- `expense_categories` (ปัจจุบันเปิด public ทั้งหมด → ปิด anon, ขอบเขต authenticated + shop_id)
- `shifts` (ดู/เพิ่ม/แก้/ลบ เฉพาะร้านตัวเอง)

เพิ่ม trigger auto-inject `shop_id` จาก header ให้ `shifts` (และ `expense_categories` ถ้ายังไม่มี) เพื่อกันกรณีแอปส่ง insert โดยไม่ใส่ shop_id จะได้ไม่ถูก policy ปฏิเสธ ใช้ฟังก์ชัน `set_shop_id_from_request_header()` ที่มีอยู่แล้ว

## Phase 2 — ล็อค SECURITY DEFINER functions (Database migration)

**2.1 แก้ search_path** — เพิ่ม `SET search_path TO 'public'` ให้ 4 ฟังก์ชันที่ยังไม่มี (ป้องกัน search-path hijacking):
- `check_rate_limit`
- `claim_limited_promotion`
- `claim_limited_reward`
- `validate_input`

**2.2 ปิด EXECUTE จาก anon/authenticated** สำหรับฟังก์ชันภายใน/trigger ที่ frontend ไม่ได้เรียก (service_role ยังใช้ได้เพราะ bypass):
- Trigger-only: `apply_member_points_redeem`, `apply_member_updates_after_order`, `check_member_tier_upgrade`, `create_points_from_order`, `set_shop_id_from_request_header`, `update_updated_at_column`, `validate_ingredient_data`, `generate_order_number`
- Helper/debug: `check_rate_limit`, `validate_input`, `validate_input_secure`, `hash_password`, `get_user_shop_id`, `get_and_mark_wifi_voucher`, `test_order_number_generation`

**2.3 ปิด EXECUTE จาก anon เท่านั้น** (เก็บ authenticated) สำหรับฟังก์ชันที่ staff/admin เรียก แต่ anon ไม่ควร:
- `restore_stock_for_cancelled_order`, `toggle_menu_availability`, `calculate_menu_cost`, `get_active_promotions`, `get_low_stock_ingredients`

**2.4 เก็บไว้** (ห้ามแตะ):
- `current_shop_id_from_header` — ใช้ใน RLS policy ต้องเก็บ anon+authenticated
- `authenticate_user`, `claim_limited_reward`, `claim_limited_promotion` — customer/login ต้องเก็บ anon

## Phase 3 — Storage hardening (migration + code)

- ทำ bucket `receipts` เป็น private (public=false) และตั้ง policy ให้ authenticated/service_role อ่าน/เขียนได้ ส่วนการแสดงผลใช้ signed URL
- แก้ `src/components/customer/OnlineShopSection.tsx`: เปลี่ยน `getPublicUrl` เป็น `createSignedUrl` (อายุ เช่น 1 ชม.) สำหรับใบเสร็จ
- `menu-images` และ `shop-logos` เก็บ public ไว้ (เป็นข้อมูลโฆษณาที่ต้องแสดงลูกค้าจริง)

## Phase 4 — ระดับแพลตฟอร์ม (ผู้ใช้ทำเองใน Dashboard, ไม่ใช่ migration)

- อัปเกรดเวอร์ชัน Postgres ของโปรเจกต์ Supabase (Infrastructure → กด upgrade) — ปิดช่องโหว่ CVE ของเวอร์ชันเก่า
- ลดอายุ OTP/Auth ในหน้า Auth settings ให้สั้นลง (ตามความเหมาะสม)

## หมายเหตุทางเทคนิค
- ทั้งหมดเป็น migration SQL ยกเว้น Phase 3 มีแก้โค้ด 1 ไฟล์ และ Phase 4 ทำใน Dashboard
- ไม่กระทบ logic การขาย/ตะกร้า/ส่วนลด
- หลังรัน migration จะ run linter ตรวจซ้ำและ mark_as_fixed รายการที่แก้แล้ว

## วิธีตรวจสอบ
- หลัง Phase 1: login staff ร้าน A แล้วยืนยันว่าไม่เห็นรายการ expense/shift ของร้าน B
- หลัง Phase 2: run Supabase linter ยืนยันว่า flag "function executable by anon" ลดลง
- หลัง Phase 3: ทดสอบ upload ใบเสร็จใน customer app แล้วยืนยันว่า URL ยังเปิดได้ (signed)
