# Star Printer iOS Plugin Setup Guide
# คู่มือการติดตั้ง Star Printer Plugin สำหรับ iOS

## ภาพรวม (Overview)

Plugin นี้เชื่อมต่อ Capacitor (JavaScript) กับ Star Micronics SDK (Swift)
เพื่อให้สามารถสั่งพิมพ์ผ่าน USB, Bluetooth, หรือ LAN บน iPad/iPhone ได้

## ขั้นตอนการติดตั้ง (Installation Steps)

### 1. ติดตั้ง Star SDK ผ่าน CocoaPods

เพิ่มใน `ios/App/Podfile`:

```ruby
target 'App' do
  # ... existing pods ...
  
  # Star Micronics SDK
  pod 'StarIO', '~> 2.10'
  pod 'StarIO_Extension', '~> 1.16'
end
```

จากนั้นรัน:
```bash
cd ios/App
pod install
```

### 2. คัดลอกไฟล์ Plugin

คัดลอกไฟล์ทั้ง 3 ไฟล์ไปยัง Xcode project:

```
ios/Plugin/StarPrinterPlugin.swift   → ios/App/App/Plugins/StarPrinter/
ios/Plugin/StarPrinterPlugin.m       → ios/App/App/Plugins/StarPrinter/
ios/Plugin/StarPrinterManager.swift  → ios/App/App/Plugins/StarPrinter/
```

**สำคัญ:** ต้องเพิ่มไฟล์เข้า Xcode project ด้วย (ลาก drop ใน Xcode หรือ File > Add Files)

### 3. ตั้งค่า Info.plist

เปิดไฟล์ `ios/App/App/Info.plist` แล้วเพิ่ม:

```xml
<!-- MFi Protocol สำหรับ Star Printers (USB & Bluetooth) -->
<key>UISupportedExternalAccessoryProtocols</key>
<array>
    <string>jp.star-m.starpro</string>
</array>

<!-- Bluetooth permissions -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>ใช้ Bluetooth เพื่อเชื่อมต่อเครื่องพิมพ์ Star Micronics</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>ใช้ Bluetooth เพื่อเชื่อมต่อเครื่องพิมพ์ Star Micronics</string>

<!-- Local Network permissions (สำหรับ LAN printing) -->
<key>NSLocalNetworkUsageDescription</key>
<string>ใช้เครือข่ายท้องถิ่นเพื่อค้นหาและเชื่อมต่อเครื่องพิมพ์</string>

<key>NSBonjourServices</key>
<array>
    <string>_pdl-datastream._tcp</string>
    <string>_ipp._tcp</string>
</array>
```

### 4. Uncomment โค้ด StarIO SDK

หลังติดตั้ง SDK แล้ว ให้ทำดังนี้:

**ใน `StarPrinterManager.swift`:**
1. Uncomment บรรทัด `import StarIO` และ `import StarIO_Extension`
2. Uncomment โค้ดในแต่ละ method (ที่มี comment ว่า "uncomment หลังติดตั้ง StarIO SDK")
3. ลบ placeholder response ที่อยู่ด้านล่าง

### 5. Build & Test

```bash
npx cap sync ios
npx cap open ios
```

จากนั้น Build & Run ใน Xcode

## รุ่นเครื่องพิมพ์ที่รองรับ (Supported Models)

| Series | USB | Bluetooth | LAN |
|--------|-----|-----------|-----|
| TSP100III | ✅ | ✅ | ✅ |
| TSP100IV | ✅ | ✅ | ✅ |
| TSP650II | ✅ | ✅ | ✅ |
| mPOP | ✅ | ✅ | - |
| SM-S210i | - | ✅ | - |
| SM-T300i | - | ✅ | - |
| SM-L200 | - | ✅ | - |

## การเชื่อมต่อ USB บน iPad

1. ใช้สาย USB-A to USB-B (หรือ USB-C to USB-B สำหรับ iPad ใหม่)
2. ต่อผ่าน Apple Lightning Digital AV Adapter หรือ USB-C Hub
3. เครื่องพิมพ์ต้องรองรับ MFi (Made for iPhone/iPad)
4. Info.plist ต้องมี `UISupportedExternalAccessoryProtocols`

## Troubleshooting

### เครื่องพิมพ์ไม่พบ
- ตรวจสอบว่าเครื่องพิมพ์เปิดอยู่
- ตรวจสอบสาย USB / Bluetooth pairing
- ตรวจสอบว่า Info.plist มี protocol ที่ถูกต้อง

### พิมพ์ภาษาไทยไม่ได้
- ตรวจสอบว่าตั้งค่า encoding เป็น UTF-8
- ตรวจสอบว่าเครื่องพิมพ์รองรับ UTF-8 (รุ่นใหม่รองรับ)
- ลองเปลี่ยน code page ใน configure()

### Build Error: Module 'StarIO' not found
- รัน `pod install` ใหม่ใน `ios/App/`
- ตรวจสอบว่า Podfile มี StarIO pod
- Clean Build Folder ใน Xcode (Shift+Cmd+K)
