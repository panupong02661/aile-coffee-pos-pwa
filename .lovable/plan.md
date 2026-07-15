## ✅ ฝั่ง Lovable เสร็จหมดแล้ว — ที่เหลือทำบนเครื่องคุณอย่างเดียว

ไฟล์ที่ผมสร้างให้เมื่อกี้พร้อมใช้งานแล้ว:
- `android-plugin/StarPrinterPlugin.kt` (Kotlin plugin — คุยกับ Star SDK)
- `android-plugin/device_filter.xml` (USB filter จับ Star Vendor ID)
- `scripts/setup-star-printer.sh` (auto-patch ทุกไฟล์ Android)
- `SETUP-STAR-PRINTER.md` (คู่มือ 6 คำสั่งจบ)
- `capacitor.config.ts` ปิด `server.url` แล้ว (APK จะโหลด local ไม่ใช่ preview)

---

## 🚀 ขั้นตอนบนเครื่อง Windows ของคุณ (ทำครั้งเดียว)

### เตรียมของก่อน (ถ้ายังไม่มี)
1. **Node.js 18+** → https://nodejs.org
2. **Android Studio** → https://developer.android.com/studio (ตอนติดตั้งเลือก "Android SDK" + "Android Virtual Device")
3. **Git for Windows** (มี **Git Bash** มาด้วย) → https://git-scm.com/download/win
4. **Java JDK 17** (Android Studio รุ่นใหม่มักมีให้แล้ว)

### Sync โค้ดล่าสุดจาก Lovable
กดปุ่ม **GitHub → Push to GitHub** ใน Lovable (ถ้ายังไม่ได้เชื่อม → กด Connect ก่อน)
แล้วบนเครื่อง:

```cmd
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```

### รัน 6 คำสั่ง (ใน **Git Bash** ไม่ใช่ CMD เพราะมีบรรทัด bash)

เปิด Git Bash → คลิกขวาในโฟลเดอร์โปรเจกต์ → **Git Bash Here** → พิมพ์:

```bash
npm install
npx cap add android
bash scripts/setup-star-printer.sh
npm run build
npx cap sync android
npx cap open android
```

### Build APK ใน Android Studio (เปิดอัตโนมัติ)
1. รอ Gradle sync เสร็จ (ครั้งแรก 5-10 นาที โหลด SDK)
2. เมนู **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. รอ 2-5 นาที → มี popup มุมล่างขวา → กด **locate**
4. เจอไฟล์ `app-debug.apk` → คัดลอกไปแท็บเล็ต

### ติดตั้งบนแท็บเล็ต
1. โอน APK (USB / Google Drive / LINE Keep)
2. เปิดไฟล์ → อนุญาต "ติดตั้งจากแหล่งที่ไม่รู้จัก" → ติดตั้ง
3. เสียบ **USB เครื่องพิมพ์ Star TSP143III** เข้าแท็บเล็ต (ผ่าน OTG adapter ถ้าจำเป็น)
4. Android popup → **"เปิดแอปเมื่อเชื่อมต่อ USB นี้?"** → กด **ตกลง** (ต้องกด ไม่งั้นเครื่องไม่เห็น)
5. ในแอป → **ตั้งค่าเครื่องพิมพ์ → Star SDK → ค้นหาเครื่องพิมพ์**
6. เลือกเครื่อง → **ทดสอบพิมพ์** / **เปิดลิ้นชัก**

---

## 📋 เช็คลิสต์ hardware

- [ ] แท็บเล็ต Android รองรับ **USB Host / OTG** (เช็คด้วยแอป "USB OTG Checker")
- [ ] สาย **USB-A to USB-B** (สายเครื่องพิมพ์)
- [ ] **OTG adapter** ถ้าแท็บเล็ตเป็น USB-C หรือ Micro-USB
- [ ] สายไฟเครื่องพิมพ์เสียบครบ + กระดาษพร้อม
- [ ] ลิ้นชักเงินต่อสาย **RJ11 → ช่อง DK** ของเครื่องพิมพ์ (ไม่ใช่ช่อง LAN)

---

## ❓ ปัญหาที่พบบ่อย

| อาการ | แก้ |
|---|---|
| `bash: command not found` | ต้องเปิดใน **Git Bash** ไม่ใช่ CMD/PowerShell |
| `npx cap add android` error | Node.js ยังไม่ 18+, หรือยังไม่ได้ `npm install` |
| Android Studio หา SDK ไม่เจอ | เปิด Android Studio → **SDK Manager** → ติดตั้ง API 33+ |
| Build error `Duplicate class` | Android Studio → **File → Invalidate Caches → Restart** |
| แอปเปิดมาเป็นหน้าเว็บ Lovable | Rebuild ใหม่ — ผมปิด `server.url` แล้ว |
| หาเครื่องพิมพ์ไม่เจอ | ถอด USB เสียบใหม่ / กด "ตกลง" ตอน Android ถาม |
| ลิ้นชักไม่เปิด | RJ11 ต้องเข้าช่อง **DK** (จอสี่เหลี่ยม) ไม่ใช่ LAN |

---

## 🔄 ถ้าอนาคตอัปเดตแอปจาก Lovable

```bash
git pull
npm install         # ถ้ามี dependency ใหม่
npm run build
npx cap sync android
npx cap open android   # → Build APK ใหม่
```

**ไม่ต้อง** รัน `npx cap add android` หรือ `setup-star-printer.sh` ซ้ำ (รันครั้งเดียวจบ)

---

**สรุป:** ไม่ต้องแก้อะไรใน Lovable แล้วครับ — ไปเปิด Git Bash บนเครื่องคุณแล้วรัน 6 คำสั่งข้างบนได้เลย ถ้าติดตรงไหน copy error มาให้ดูได้เลยครับ
