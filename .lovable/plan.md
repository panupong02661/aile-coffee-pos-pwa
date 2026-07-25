# แผนปรับปรุงระบบ Aile Coffee POS

ครอบคลุม 4 ด้านตามที่เลือก แบ่งเป็น Phase ทำทีละส่วน ตัดสินใจได้ว่าจะทำ Phase ไหนก่อน

---

## Phase 1 — Security (ปิด findings ที่ยังค้าง)

1. **Users plaintext password** — เปลี่ยน login flow ให้เรียก `authenticate_user()` RPC (มีอยู่แล้ว) แทนการ query `password_hash` ตรง ๆ ใน `useAuth.tsx` + migrate password เก่าเป็น hash+salt อัตโนมัติเมื่อ login ครั้งแรก
2. **wifi_vouchers** — จำกัดสิทธิ์ read/write ให้ authenticated + shop-scoped เท่านั้น (ปัจจุบัน public)
3. **user_shop_assignments** — ปิด public read, ให้เห็นเฉพาะ record ของตัวเองหรือ admin ของ shop
4. เพิ่ม **audit log** อัตโนมัติเมื่อมีการ login/logout/เปลี่ยนสิทธิ์ (trigger)
5. รัน security scan อีกครั้ง ปิด findings + อัพเดต @security-memory

## Phase 2 — Performance

1. **Slow queries** — เรียก `supabase--slow_queries` ดู top 10 → เพิ่ม index เฉพาะจุด (คาดว่า `orders(shop_id, created_at)`, `order_items(order_id)`, `point_transactions(member_id)`)
2. **React re-render** — ตรวจหน้า POS (Index.tsx) ที่ effect log ทุก render → เพิ่ม `useMemo`/`useCallback` ให้ `convertedMenuItems`, `filteredMenuItems`, handler ต่าง ๆ
3. **Bundle size** — audit `src/App.tsx` route lazy-load ให้ครบทุกหน้า (ปัจจุบันบางหน้ายัง import ตรง)
4. **Realtime subscription** — ตรวจว่ามี channel ไหนไม่ cleanup ทำให้ reconnect loop (ตาม guidance)
5. **React Query cache** — ตั้ง `staleTime` มาตรฐาน 5-10 นาทีทั่ว app (ตาม memory เดิม แต่ยังไม่ครบทุก hook)

## Phase 3 — UX/UI

1. **Loading states** — แทน spinner ที่เหลือด้วย Skeleton (POS, Reports, Members)
2. **Error boundary** — เพิ่ม global `<ErrorBoundary>` ใน `App.tsx` + toast แจ้ง user แทนหน้าจอขาว
3. **Empty states** — ออกแบบภาพ + ข้อความให้ตารางว่าง (Reports, Members, Coupons ที่ยังไม่มีข้อมูล)
4. **Mobile responsiveness** — ตรวจหน้า Reports, StaffManagement, Inventory ที่ตารางล้นจอมือถือ → wrap ด้วย horizontal scroll + sticky column
5. **Consistency** — แทน hardcoded color (`#2B1D14`, `#8A7563` ใน PreviewHeader) ด้วย semantic tokens
6. **Accessibility** — เพิ่ม `aria-label` ให้ icon-only buttons, focus ring ที่มองเห็นได้

## Phase 4 — ฟีเจอร์ใหม่ (เลือกได้ 1-2 ตัวก่อน)

**Option A — รายงานเชิงลึก**
- Dashboard "เปรียบเทียบ" ยอดขายเดือนนี้ vs เดือนก่อน + %growth ต่อสินค้า
- แจ้งเตือน low stock/สินค้าขายดี-ขายช้า อัตโนมัติเข้า Discord/LINE

**Option B — AI ช่วยงาน** (ใช้ Lovable AI Gateway ฟรี Sep 29-Oct 6)
- แนะนำเมนูให้ลูกค้าจากประวัติสั่งซื้อ
- สรุปยอดขายรายวันเป็นภาษาธรรมชาติส่ง Discord
- ตอบคำถามลูกค้าผ่าน Chatbot ในหน้า customer app

**Option C — ระบบแจ้งเตือนขั้นสูง**
- Push notification (Web Push + Capacitor) เมื่อมีออเดอร์ใหม่/สต็อกหมด
- LINE Notify ยิงเข้ากลุ่มพนักงานตาม role

**Option D — Table Management เต็มรูปแบบ**
- Drag & drop โต๊ะบน floor plan (มีบางส่วนแล้ว)
- Timer แสดงเวลาลูกค้านั่งโต๊ะ + auto-hold bill

---

## ลำดับที่แนะนำ

1. **Phase 1 (Security)** — ทำก่อน เพราะเป็น production risk
2. **Phase 2 (Performance)** — วัดผลชัด, กระทบทุกหน้า
3. **Phase 3 (UX/UI)** — polish
4. **Phase 4 (Feature)** — ค่อยเลือก option หลังฐานแน่น

## ต้องการคำตอบเพิ่ม
- เริ่ม Phase ไหนก่อน?
- Phase 4 อยากได้ option ไหน (A/B/C/D หรือหลายตัว)?
