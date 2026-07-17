# 🔄 Auto-Sync: Lovable → เครื่อง Windows → Capacitor

ไม่ต้องรัน `git pull`, `npm run build`, `npx cap sync` เองอีกต่อไป
เหลืองานที่ทำเองแค่: **เปิด Android Studio → Build APK → ติดตั้งลงแท็บเล็ต**

---

## 🚀 วิธีใช้ (Windows CMD)

### ครั้งแรก — ดึงไฟล์สคริปต์ลงเครื่อง
```cmd
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```

### ใช้งานทุกวัน
```cmd
cd C:\Users\panup\aile-coffee-pos-pwa
scripts\auto-sync.bat
```

เปิด CMD หน้าต่างนี้ **ค้างไว้** ทำงานอื่นได้ตามปกติ

---

## 🎯 พอเห็นข้อความ "✅ พร้อม Build APK"

1. เปิด **Android Studio** (โปรเจกต์ `android/` เปิดค้างไว้ได้)
2. เมนู **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. รอ 2-5 นาที → กด **locate** ที่ popup มุมขวาล่าง
4. ลากไฟล์ `app-debug.apk` ลงแท็บเล็ต → ติดตั้งทับ

---

## ⚙️ สคริปต์ทำอะไรบ้าง (ทุก 60 วิ)

1. `git fetch` เช็คว่ามี commit ใหม่จาก Lovable ไหม
2. ถ้ามี:
   - `git pull`
   - `npm install` (เฉพาะเมื่อ `package.json` เปลี่ยน — ประหยัดเวลา)
   - `npm run build`
   - `npx cap sync android`
3. เสียง beep + popup แจ้ง "พร้อม Build APK"
4. ถ้าไม่มี → รอ 60 วิ แล้วเช็คใหม่

---

## 🔧 ให้รันเองตอนเปิดคอม (optional)

1. กด `Win + R` → พิมพ์ `shell:startup` → Enter
2. สร้าง shortcut ของ `C:\Users\panup\aile-coffee-pos-pwa\scripts\auto-sync.bat` วางในโฟลเดอร์นี้
3. เสร็จ — เปิดคอมเมื่อไหร่ auto-sync รันเอง

---

## 🐧 Git Bash / Mac / Linux

```bash
bash scripts/auto-sync.sh
```

---

## ❓ ปัญหาที่พบบ่อย

| อาการ | แก้ |
|---|---|
| `git fetch ล้มเหลว` | เช็คอินเทอร์เน็ต / เปิด GitHub Desktop login ก่อน |
| `git pull` เจอ conflict | คุณแก้ไฟล์ในเครื่องเอง → commit หรือ `git stash` ก่อน |
| `build ล้มเหลว` | ดู error ใน CMD → ส่วนใหญ่คือ syntax ผิดใน Lovable ให้แก้ที่ Lovable แล้วรอ sync รอบใหม่ |
| ไม่ได้ยินเสียง beep | Windows บางเวอร์ชันปิดเสียง PC speaker — ดู popup แทน |

---

## 🚫 สิ่งที่ยัง auto ไม่ได้

- **Build + Sign APK** — Android bytecode compile ต้องผ่าน Android Studio หรือ `./gradlew assembleRelease` (ถ้ามี keystore config)
- **ติดตั้งลงแท็บเล็ต** — ถ้าอยาก auto ตรงนี้ด้วย บอกได้ จะเพิ่ม `adb install -r` เข้าสคริปต์ให้ (ต้องเสียบ USB debug)

---

**สรุป: รัน `scripts\auto-sync.bat` ครั้งเดียว ปล่อยทิ้งไว้ → พอ Lovable เสร็จ เครื่องพร้อม Build ให้เอง**
