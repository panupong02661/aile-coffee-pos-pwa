# 🖨️ ติดตั้ง Star TSP143III (USB) — 6 คำสั่งจบ

## เตรียมพร้อม
- ติดตั้ง **Node.js 18+**, **Android Studio**, **Git**
- Export โปรเจกต์ไป GitHub แล้ว `git clone` / `git pull` มาที่เครื่อง
- ต่อสาย: ไฟ + USB + สายลิ้นชัก RJ11 เข้าช่อง **DK** ของเครื่องพิมพ์

## รันตามลำดับในโฟลเดอร์โปรเจกต์

```bash
npm install
npx cap add android                    # ครั้งแรกเท่านั้น
bash scripts/setup-star-printer.sh     # auto-patch ทุกไฟล์ Android
npm run build
npx cap sync android
npx cap open android                   # เปิด Android Studio
```

**Windows:** ต้องรัน `bash ...` ผ่าน **Git Bash** (ติดมากับ Git for Windows) ไม่ใช่ CMD

## ใน Android Studio
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. รอ 2-5 นาที → กด **locate** → คัดลอก `app-debug.apk` ไปติดตั้งบนแท็บเล็ต

## ทดสอบบนแท็บเล็ต
1. เสียบ USB เครื่องพิมพ์ → Android ถามยืนยัน → กด **ตกลง**
2. เปิดแอป → **ตั้งค่าเครื่องพิมพ์ → Star SDK → ค้นหาเครื่องพิมพ์**
3. เลือกเครื่อง → **ทดสอบพิมพ์** / **เปิดลิ้นชัก**

## ปัญหาที่พบบ่อย
| อาการ | แก้ |
|---|---|
| หาเครื่องพิมพ์ไม่เจอ | เช็ค USB / รีสตาร์ทเครื่องพิมพ์ / ถอดเสียบใหม่ |
| ลิ้นชักไม่เปิด | ตรวจ RJ11 เข้าช่อง **DK** ไม่ใช่ LAN |
| Build error | อัพเดต Android Studio + Gradle ล่าสุด |
| แอป crash | ดู Logcat ใน Android Studio filter `StarPrinter` |
| APK เปิดมาเป็นหน้าเว็บ Lovable | ตรวจว่า `capacitor.config.ts` ไม่มี `server.url` (ตอนนี้ปิดไว้แล้ว) |

รัน `bash scripts/setup-star-printer.sh` ซ้ำได้ปลอดภัย ไม่ทำซ้ำ
