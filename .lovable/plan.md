## เป้าหมาย
ออกแบบหน้า **App Launcher** (หน้ารวมเมนูจาก MainSidebar เช่น POS, แดชบอร์ด, จัดการเมนู, รายงาน, ตั้งค่า ฯลฯ มาแสดงกลางหน้าจอเป็นไทล์คลิกได้) **เฉพาะเป็นตัวอย่างดู UI** — ยังไม่แตะ route จริง ไม่เปลี่ยน POS

## Route ตัวอย่าง
เพิ่ม route ใหม่ `/launcher-preview` (เข้าดูได้อย่างเดียว ไม่ผูกกับ Sidebar เดิม) รวม 6 ดีไซน์ในหน้าเดียว เลื่อนดูได้ พร้อมชื่อกำกับแต่ละแบบ

## 6 ดีไซน์ที่จะสร้าง

| # | ชื่อ | สไตล์ | รายละเอียด |
|---|------|-------|------------|
| 1 | **iOS Launchpad** | iOS | ไอคอนกลม สีสด grid 4-6 คอลัมน์ ป้ายชื่อใต้ไอคอน พื้นหลัง blur gradient |
| 2 | **iOS Folder Groups** | iOS | จัดกลุ่มตาม menuGroups (หลัก / ร้านค้า / เมนู ฯลฯ) แต่ละกลุ่มเป็น "โฟลเดอร์" 2×2 |
| 3 | **Bento Asymmetric** | Bento | การ์ดขนาดไม่เท่ากัน — POS ใหญ่สุด (2×2), แดชบอร์ด/รายงาน กลาง, ที่เหลือเล็ก มีตัวเลข preview เช่นยอดขายวันนี้ |
| 4 | **Bento Glass Cards** | Bento | การ์ดกระจก backdrop-blur พื้นหลังไล่สีอบอุ่น (coffee tone) แสดง icon + label + สถิติย่อ |
| 5 | **Dark Command Center** | Dark Dashboard | พื้นดำ + accent ทอง/น้ำเงิน จัดเป็น sidebar หมวด + grid ใหญ่ตรงกลาง มู้ด control room |
| 6 | **Minimal Swiss Grid** | Minimal | พื้นครีม เส้นบาง typography Thai + serif ไม่มีสีจัด ไอคอนบางๆ จัดเป็น 5 คอลัมน์เท่ากัน |

## ขอบเขต
- อ่านโครงสร้าง `menuGroups` จาก `src/components/MainSidebar.tsx` ใช้เป็นแหล่งเมนูจริง (ทุกแบบใช้ข้อมูลชุดเดียวกัน)
- คลิกไทล์แล้ว navigate ไปหน้านั้นจริง (ใช้ react-router `Link`)
- ทุกดีไซน์ใช้ semantic tokens ใน `index.css`/tailwind — ไม่ hardcode สี
- Responsive: มือถือ 2 คอลัมน์, tablet 3-4, desktop 5-6

## ไฟล์ที่จะสร้าง
- `src/pages/LauncherPreview.tsx` — หน้ารวม 6 ดีไซน์ พร้อม section header แต่ละแบบ
- `src/components/launcher/LauncherIOS.tsx`
- `src/components/launcher/LauncherIOSFolder.tsx`
- `src/components/launcher/LauncherBento.tsx`
- `src/components/launcher/LauncherBentoGlass.tsx`
- `src/components/launcher/LauncherDark.tsx`
- `src/components/launcher/LauncherMinimal.tsx`
- `src/data/launcherMenu.ts` — สกัด menuGroups มาใช้ซ้ำ (ไม่กระทบ MainSidebar)

## ไฟล์ที่จะแก้
- `src/App.tsx` — เพิ่ม `<Route path="/launcher-preview" element={<LauncherPreview/>} />` เท่านั้น

## หลังดูตัวอย่าง
คุณเลือกเบอร์ที่ชอบ → ผมค่อยเอาไปเป็นหน้าหลักจริง (จะให้แทน `/` หรือแยก `/home` ค่อยตัดสินอีกที)

## วิธีเข้าดู
เปิด URL: `/launcher-preview`
