# 🖨️ ติดตั้ง Star TSP143III USB บน Android APK

โปรเจกต์นี้เตรียม Kotlin Plugin ให้พร้อมใช้กับ **StarXpand SDK v2** — รองรับพิมพ์และเปิดลิ้นชักผ่าน USB (รวมถึง LAN/Bluetooth)

---

## ✅ ก่อนเริ่ม — เช็คลิสต์

- [ ] แท็บเล็ต Android รองรับ **USB Host (OTG)** ✅ (คุณยืนยันแล้ว)
- [ ] Node.js 18+ และ Android Studio ติดตั้งบนเครื่องคอมพิวเตอร์
- [ ] เสียบ **สายไฟ TSP143III + สาย USB + สายลิ้นชัก RJ11** เข้าช่อง DK ด้านหลัง

---

## 📥 ขั้นที่ 1 — Clone โปรเจกต์และเพิ่ม Android

```bash
git clone <your-github-repo>
cd <project>
npm install
npx cap add android
npx cap update android
```

## 📚 ขั้นที่ 2 — เพิ่ม StarXpand SDK

แก้ไฟล์ **`android/app/build.gradle`** — เพิ่มใน `dependencies { }`:

```gradle
dependencies {
    // ... ของเดิม
    implementation "com.starmicronics:stario10:1.5.0"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
}
```

เพิ่มใน `android/build.gradle` (project-level) → `allprojects { repositories { } }`:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url "https://www21.star-m.jp/repo/android" }
    }
}
```

## 📁 ขั้นที่ 3 — คัดลอกไฟล์ Plugin เข้าโปรเจกต์ Android

1. **สร้างโฟลเดอร์:**
   ```bash
   mkdir -p android/app/src/main/java/app/lovable/aile/starprinter
   ```

2. **คัดลอกไฟล์ Kotlin:**
   ```bash
   cp android-plugin/StarPrinterPlugin.kt \
      android/app/src/main/java/app/lovable/aile/starprinter/
   ```

3. **คัดลอก USB filter:**
   ```bash
   mkdir -p android/app/src/main/res/xml
   cp android-plugin/device_filter.xml android/app/src/main/res/xml/
   ```

## 🔧 ขั้นที่ 4 — Register Plugin

แก้ **`android/app/src/main/java/app/lovable/.../MainActivity.java`** (path ตาม appId):

```java
package app.lovable.aile.starprinter;   // ← หรือ package ของคุณ

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import app.lovable.aile.starprinter.StarPrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StarPrinterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

## 🔐 ขั้นที่ 5 — แก้ AndroidManifest.xml

เปิด **`android/app/src/main/AndroidManifest.xml`** เพิ่มใน `<manifest>`:

```xml
<uses-feature android:name="android.hardware.usb.host" />
<uses-permission android:name="android.permission.INTERNET" />
```

เพิ่มใน `<activity android:name=".MainActivity" ...>`:

```xml
<intent-filter>
    <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
</intent-filter>
<meta-data
    android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
    android:resource="@xml/device_filter" />
```

## ⚙️ ขั้นที่ 6 — ปิด hot-reload ก่อน build APK จริง

แก้ **`capacitor.config.ts`** — comment `server.url` ออก:

```ts
const config: CapacitorConfig = {
  appId: 'app.lovable.89c4e9b6c5b7487c8cd23c82705bcd7b',
  appName: 'aile-coffee-pos-pwa',
  webDir: 'dist',
  // server: {
  //   url: '...',
  //   cleartext: true
  // },
  ...
};
```

## 🏗️ ขั้นที่ 7 — Build APK

```bash
npm run build
npx cap sync android
npx cap open android
```

ใน Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- รอ ~2-5 นาที → กด **locate** เพื่อเปิดโฟลเดอร์ที่มีไฟล์ `app-debug.apk`
- คัดลอกไฟล์ไปติดตั้งบนแท็บเล็ต

---

## 🧪 ทดสอบใช้งาน

1. เปิดแอปบนแท็บเล็ต → เสียบ USB เครื่องพิมพ์
2. Android จะถามว่า *"เปิดแอปเมื่อเชื่อมต่อ USB นี้?"* → กด **ตกลง**
3. เข้าเมนู **ตั้งค่าเครื่องพิมพ์ → ค้นหาเครื่องพิมพ์**
4. เลือกเครื่องที่เจอ → กด **ทดสอบพิมพ์** และ **เปิดลิ้นชัก**

---

## 🔍 Troubleshooting

| ปัญหา | สาเหตุ/แก้ไข |
|---|---|
| หาเครื่องพิมพ์ไม่เจอ | เช็คสาย USB, สายไฟ, รีสตาร์ทเครื่องพิมพ์ |
| กดพิมพ์ไม่ออก | เช็คว่ากระดาษไม่หมด, ฝาปิดสนิท |
| ลิ้นชักไม่เปิด | เช็คสาย RJ11 เสียบเข้าช่อง DK (ไม่ใช่ LAN) |
| Build error `Duplicate class` | อัพเดต Android Studio + Gradle เป็นเวอร์ชันล่าสุด |
| แอปเปิดมาแล้ว crash | ดู Logcat ใน Android Studio → filter คำว่า `StarPrinter` |

---

## 📞 ต้องการช่วยเหลือเพิ่ม

ถ้าติดปัญหาระหว่าง build ให้ copy error log ส่งมาให้ผมช่วยดูครับ
