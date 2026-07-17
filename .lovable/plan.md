## ✅ ดีมาก! คุณข้ามขั้นตอน `npx cap add android` ได้เลย

เพราะโฟลเดอร์ `android/` ในเครื่องคุณสร้างไว้แล้วจากรอบก่อน

---

## 🚀 ทำ 5 คำสั่งบนเครื่องคุณ (Git Bash)

### ก่อนอื่น — ดึงโค้ดใหม่จาก Lovable
บน Lovable กด **GitHub → Push** (ถ้ายังไม่ auto sync)
แล้วบนเครื่อง:

```bash
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```

### รันตามลำดับใน **Git Bash**

```bash
npm install                            # เผื่อมี dependency ใหม่
bash scripts/setup-star-printer.sh     # patch ไฟล์ Android ให้เชื่อม Star SDK
npm run build
npx cap sync android
npx cap open android
```

**⚠️ ห้ามรัน `npx cap add android` ซ้ำ** — จะเตือนว่ามีอยู่แล้ว (ไม่เป็นไร ข้ามได้)

---

## 📝 สคริปต์ `setup-star-printer.sh` จะทำอะไรบ้าง (อัตโนมัติ)

1. คัดลอก `StarPrinterPlugin.kt` เข้า `android/app/src/main/java/app/lovable/ailecoffeepos/starprinter/`
2. คัดลอก `device_filter.xml` เข้า `android/app/src/main/res/xml/`
3. เพิ่ม dependency `com.starmicronics:stario10:1.5.0` + coroutines ใน `app/build.gradle`
4. เพิ่ม Star Maven repo ใน `android/build.gradle`
5. เพิ่ม `<uses-feature usb.host>` + USB intent filter ใน `AndroidManifest.xml`
6. แก้ `MainActivity.java` → `registerPlugin(StarPrinterPlugin.class)`
7. เปิด Kotlin plugin ใน gradle

รันซ้ำได้ปลอดภัย — ไม่ทำซ้ำถ้ามีอยู่แล้ว

---

## 🏗️ Build APK ใหม่ใน Android Studio

หลังจาก `npx cap open android` เปิด Android Studio แล้ว:

1. รอ **Gradle sync** เสร็จ (มุมล่างขวา — ครั้งแรกหลังเพิ่ม Star SDK อาจ 5-10 นาที)
2. ถ้ามี error แดง → **File → Sync Project with Gradle Files**
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. รอ 2-5 นาที → popup มุมล่างขวา → กด **locate** → ได้ไฟล์ `app-debug.apk` ใหม่
5. **ถอนติดตั้ง APK เก่าออกจากแท็บเล็ตก่อน** (สำคัญ! ไม่งั้นติดตั้งทับไม่ได้เพราะ signature ต่าง)
6. ติดตั้ง APK ใหม่

---

## 🖨️ ทดสอบเครื่องพิมพ์ USB

1. เสียบ **USB เครื่องพิมพ์ Star TSP143III** เข้าแท็บเล็ต (ใช้ OTG adapter ถ้าจำเป็น)
2. Android popup: **"เปิดแอปเมื่อเชื่อมต่อ USB นี้?"** → กด **ตกลง** (ถ้าไม่กด แอปจะเห็นเครื่องไม่ได้)
3. ในแอป → **ตั้งค่าเครื่องพิมพ์ → Star SDK → ค้นหาเครื่องพิมพ์**
4. เลือกเครื่อง → **ทดสอบพิมพ์** / **เปิดลิ้นชัก**

---

## 🔍 ถ้าเจอปัญหา

| อาการ | แก้ |
|---|---|
| `bash: command not found` | ต้องใช้ **Git Bash** ไม่ใช่ CMD |
| Gradle error หลังเพิ่ม Star SDK | Android Studio → **File → Invalidate Caches → Restart** |
| ติดตั้ง APK ไม่ได้ "app not installed" | ถอน APK เก่าออกก่อน |
| แอปเปิดมาเป็นหน้าเว็บ Lovable | Rebuild — `capacitor.config.ts` ปิด `server.url` แล้ว |
| หาเครื่องพิมพ์ไม่เจอในแอป | ถอด-เสียบ USB ใหม่ / กด "ตกลง" ตอน Android ถาม |
| Logcat ไม่มี `StarPrinter` | plugin ยังไม่ได้ register — เช็ค `MainActivity.java` มี `registerPlugin(StarPrinterPlugin.class)` |

---

**สรุป:** ไม่ต้อง add android ใหม่ — แค่รัน `git pull` → `bash scripts/setup-star-printer.sh` → build → sync → open → build APK ใหม่ใน Android Studio → ถอนของเก่า → ติดตั้งใหม่ → ทดสอบพิมพ์ครับ
