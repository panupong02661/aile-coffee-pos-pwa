# Star Printer iOS Setup Guide

## สำหรับ iPad Lightning และ USB-C

### ขั้นตอนการตั้งค่า iOS App

1. **Export โปรเจคไป GitHub**
   ```bash
   # ในหน้า Lovable Editor
   คลิก "Export to GitHub" และ clone โปรเจค
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   npx cap add ios
   npx cap update ios
   ```

3. **Build และ Sync**
   ```bash
   npm run build
   npx cap sync ios
   ```

4. **เปิด Xcode**
   ```bash
   npx cap open ios
   ```

### การตั้งค่าใน Xcode

1. **เพิ่ม Star SDK**
   - ใน Xcode ไปที่ File → Add Package Dependencies
   - เพิ่ม URL: `https://github.com/star-micronics/StarXpand-SDK-iOS`
   - เลือก version ล่าสุด

2. **ตั้งค่า Capabilities**
   - เลือก Target "App"
   - ไปที่ "Signing & Capabilities"
   - เพิ่ม "External Accessory Communication"

3. **ตรวจสอบ Info.plist**
   - ตรวจสอบว่ามี `UISupportedExternalAccessoryProtocols` แล้ว
   - ตรวจสอบว่ามี `UIBackgroundModes` แล้ว

### อุปกรณ์ที่ต้องใช้

#### สำหรับ iPad Lightning:
- **Lightning to USB Camera Adapter** (Apple รุ่น MD821)
- หรือ **Lightning to USB 3 Camera Adapter** (Apple รุ่น MK0W2)
- สาย USB A to USB B (มากับเครื่องพิมพ์)

#### สำหรับ iPad USB-C:
- **USB-C to USB Adapter** (Apple รุ่น MJ1M2)
- หรือ **USB-C Digital AV Multiport Adapter** (Apple รุ่น MUF82)
- สาย USB A to USB B (มากับเครื่องพิมพ์)

### วิธีการเชื่อมต่อ

1. **เชื่อมต่อฮาร์ดแวร์**
   ```
   iPad → Adapter → USB Cable → Star TSP143IIIU
   ```

2. **เปิดแอปพิเคชัน**
   - เข้า Mobile Settings → Printer → Star SDK
   - กดปุ่ม "ค้นหา" เพื่อหาเครื่องพิมพ์
   - เลือกเครื่องพิมพ์และกด "เชื่อมต่อ"

3. **ทดสอบการพิมพ์**
   - กดปุ่ม "ทดสอบการพิมพ์"
   - ตรวจสอบว่าใบเสร็จออกมาถูกต้อง

### การแก้ไขปัญหา

#### ไม่พบเครื่องพิมพ์:
1. ตรวจสอบการเชื่อมต่อ USB
2. ลองถอดและเสียบใหม่
3. รีสตาร์ทแอป
4. ตรวจสอบว่าเครื่องพิมพ์เปิดอยู่

#### ไม่สามารถพิมพ์ได้:
1. ตรวจสอบกระดาษในเครื่องพิมพ์
2. ตรวจสอบว่าฝาเครื่องพิมพ์ปิดแล้ว
3. ลองตัดการเชื่อมต่อและเชื่อมต่อใหม่

### ข้อมูลเทคนิค

- **SDK ที่ใช้**: StarIO10 Framework
- **รองรับเครื่องพิมพ์**: TSP100III, TSP143III, TSP650II
- **ประเภทการเชื่อมต่อ**: USB Direct
- **ขนาดกระดาษ**: 80mm
- **การตัดกระดาษ**: Auto-cut
- **Cash Drawer**: รองรับ

### เอกสารอ้างอิง

- [Star Micronics SDK Documentation](https://www.star-m.jp/products/s_print/sdk/StarXpand/manual/en/index.html)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple External Accessory Framework](https://developer.apple.com/documentation/externalaccessory)