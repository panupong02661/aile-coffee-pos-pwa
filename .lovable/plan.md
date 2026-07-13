## ✅ ใช่ครับ ถูกต้องแล้ว! คุณอยู่ในโฟลเดอร์โปรเจกต์แล้ว (`C:\Users\panup\aile-coffee-pos-pwa`)

แต่ก่อนรันคำสั่งได้ ผมต้องสร้างไฟล์สคริปต์และแก้ไฟล์ปลั๊กอินให้ครบก่อน เพราะตอนนี้ยังไม่มี `scripts/setup-star-printer.sh`

---

## 📋 แผนที่จะทำใน Lovable (กด Approve เพื่อเริ่ม)

### 1. แก้ package ของ Kotlin Plugin ให้ตรงกับ appId
- แก้ `android-plugin/StarPrinterPlugin.kt` → package เป็น `app.lovable.ailecoffeepos.starprinter`
- (appId จริงของโปรเจกต์คือ `app.lovable.89c4e9b6c5b7487c8cd23c82705bcd7b` → จะใช้ path นี้แทน)

### 2. สร้างสคริปต์ auto-setup (Windows ใช้ได้ผ่าน Git Bash)
สร้าง `scripts/setup-star-printer.sh` — สคริปต์เดียวทำทุกอย่างให้อัตโนมัติ:
- คัดลอก `StarPrinterPlugin.kt` → `android/app/src/main/java/.../starprinter/`
- คัดลอก `device_filter.xml` → `android/app/src/main/res/xml/`
- เพิ่ม dependency `com.starmicronics:stario10:1.5.0` + coroutines ใน `android/app/build.gradle`
- เพิ่ม Star Maven repo (`https://www21.star-m.jp/repo/android`) ใน `android/build.gradle`
- เพิ่ม `<uses-feature usb.host>`, USB intent filter, meta-data ใน `AndroidManifest.xml`
- แก้ `MainActivity.java` → `registerPlugin(StarPrinterPlugin.class)`
- ปิด `server.url` ใน `capacitor.config.ts` (comment ออกก่อน build APK จริง — สำคัญ ไม่งั้น APK จะโหลด preview URL แทนไฟล์ local)
- Idempotent — รันซ้ำได้ปลอดภัย ไม่ทำซ้ำ

### 3. สร้าง `scripts/setup-star-printer.ps1` (สำรอง สำหรับ PowerShell ตรงๆ)

### 4. สร้าง `SETUP-STAR-PRINTER.md` ที่ root — คู่มือ 6 คำสั่งจบ

---

## 🚀 หลัง Approve แล้ว → ทำบนเครื่องคุณตามลำดับนี้:

```bash
# 1. Export → GitHub → git pull ให้ได้ไฟล์ใหม่ก่อน

# 2. รันในโฟลเดอร์โปรเจกต์
npm install
npx cap add android
bash scripts/setup-star-printer.sh
npm run build
npx cap sync android
npx cap open android
```

จากนั้นใน Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- รอ 2-5 นาที → กด **locate** → ได้ไฟล์ `app-debug.apk`
- โอนไฟล์ไปติดตั้งบนแท็บเล็ต → เสียบ USB เครื่องพิมพ์ → เข้าเมนูตั้งค่าเครื่องพิมพ์ → ค้นหา → ทดสอบพิมพ์

---

## ⚠️ ข้อควรรู้

- **`npx cap add android`** ต้องรันบนเครื่องคุณเท่านั้น (Lovable sandbox ไม่มี Android SDK)
- **Windows:** `bash scripts/setup-star-printer.sh` ต้องใช้ **Git Bash** (มากับ Git for Windows) หรือใช้ `.ps1` แทน
- **ถ้าไม่ปิด `server.url`** APK จะโหลดหน้าเว็บจาก Lovable preview แทน — พิมพ์ USB จะไม่ทำงาน สคริปต์จัดการให้อัตโนมัติ

กด **Approve plan** เพื่อให้ผมสร้างไฟล์ทั้งหมดครับ
