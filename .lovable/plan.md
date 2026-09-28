# ขั้นต่อไป: Git ติดตั้งแล้ว (2.55.0) — ดึงโค้ดล่าสุดและทำแอป 1.2.0

## ขั้นที่ 1: ดึงโค้ดล่าสุด (PowerShell)
```
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```
- ถ้าขึ้น `not a git repository` → Lovable: เมนูโปรเจกต์ → Export/Download code (ZIP) → แตกไฟล์ → คัดลอกทุกอย่าง **ยกเว้นโฟลเดอร์ android** ไปวางทับในโฟลเดอร์เดิม (Replace)
- ถ้าขึ้น error อื่น ถ่ายรูปส่งมา

## ขั้นที่ 2: สร้างและเปิด Android Studio
```
npm install
npm run build
npx cap sync android
npx cap open android
```

## ขั้นที่ 3: Android Studio
1. app → build.gradle: `versionCode` +1, `versionName "1.2.0"` → Sync Now
2. Build → Build Bundle(s) / APK(s) → Build APK(s) (ใช้ debug.keystore เดิมอัตโนมัติ)
3. กด locate → ไฟล์ `app-debug.apk`

## ขั้นที่ 4: ติดตั้งทับบนเครื่อง แล้วดูเลข 1.2.0 ที่หน้าล็อกอิน
- ถ้าติดตั้งทับไม่ได้: เปิดแอปเก่า ต่อเน็ต รอ "รอซิงก์" = 0 ก่อนลบแอปเก่าแล้วติดตั้งใหม่
