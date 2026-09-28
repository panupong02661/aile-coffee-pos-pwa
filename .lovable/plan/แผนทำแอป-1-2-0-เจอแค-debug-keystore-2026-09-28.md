# แผนทำแอป 1.2.0 — เจอแค่ debug.keystore

## ผลการค้นหา
เจอไฟล์เดียว: `C:\Users\panup\.android\debug.keystore` (Android Studio สร้างให้อัตโนมัติ)
แปลว่ารอบก่อนน่าจะสร้างแอปแบบ **debug** (ไม่ได้สร้างกุญแจเอง) — ถ้าสร้างแบบ debug อีกรอบในเครื่องเดิม จะ**ติดตั้งทับแอปเก่าได้เลย ไม่ต้องลบ ข้อมูลไม่หาย**

## ขั้นที่ 1: เตรียมโค้ด (PowerShell)
```
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
npm install
npm run build
npx cap sync android
npx cap open android
```

## ขั้นที่ 2: ตั้งเวอร์ชันใน Android Studio
- เปิด `app → build.gradle` แก้ `versionCode` ให้มากกว่าเดิม 1 และ `versionName "1.2.0"` → กด **Sync Now**

## ขั้นที่ 3: สร้างแอปแบบ debug (ใช้กุญแจที่เจอ)
- เมนู **Build → Build App Bundle(s) / APK(s) → Build APK(s)**
- รอเสร็จ กดลิงก์ **locate** มุมขวาล่าง → ไฟล์อยู่ที่ `android\app\build\outputs\apk\debug\app-debug.apk`

## ขั้นที่ 4: ติดตั้ง
- ส่งไฟล์เข้าแท็บเล็ต/มือถือ แล้วเปิดติดตั้งทับ
- ถ้าติดตั้งได้ → เสร็จ ตรวจเลข **1.2.0** ที่หน้าล็อกอิน
- ถ้าขึ้น "ไม่ได้ติดตั้งแอป / แพ็กเกจขัดแย้ง" → รอบก่อนใช้กุญแจอื่นที่หายไปแล้ว ต้อง:
  1. เปิดแอปเก่า ต่อเน็ต รอ "รอซิงก์" เป็น 0
  2. ลบแอปเก่า แล้วติดตั้งไฟล์ใหม่

## เก็บไว้เผื่อรอบหน้า
- สำเนา `C:\Users\panup\.android\debug.keystore` ไว้ใน Google Drive — ถ้าเปลี่ยนคอมแล้วไม่มีไฟล์นี้ จะติดตั้งทับไม่ได้
