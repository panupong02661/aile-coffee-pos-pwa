# แก้ปุ่ม "ทดสอบการพิมพ์" กับ Star TSP143III แบบ USB ที่บิลไม่ออก

## ทำไมบิลไม่ออก
- แอปจับคู่กับเครื่องปริ้นได้แล้ว (เครื่องขึ้นว่า TSP100IIIU) แต่ข้อมูลที่ส่งไปพิมพ์เป็นข้อความภาษาไทยปนกับคำสั่งของเครื่องปริ้นรุ่นอื่น
- รุ่น TSP143III พิมพ์ภาษาไทยจากข้อความตรง ๆ ไม่ได้ เพราะรับได้แค่ภาพ เลยไม่มีบิลออกมา
- ฟอร์มด้านล่างในรูปที่ 2 และ 3 (Ethernet/WiFi, IP 192.168.1.170) ใช้กับเครื่องปริ้นที่ต่อสายแลนเท่านั้น ไม่เกี่ยวกับเครื่องที่ต่อ USB ข้อความ "เชื่อมต่อ 192.168.1.170 ไม่ได้" จึงไม่ได้แปลว่าระบบพัง แต่ทำให้สับสน

## สิ่งที่จะแก้
1. **พิมพ์บิลเป็นภาพ**: แอปจะวาดใบเสร็จ (ภาษาไทย กว้าง 80mm) เป็นภาพก่อน แล้วค่อยส่งภาพนั้นไปที่เครื่องปริ้น Star ใช้ทั้งปุ่มทดสอบและการพิมพ์ใบเสร็จจริง
2. **ต่อเครื่องใหม่ให้อัตโนมัติก่อนพิมพ์**: ถ้าเครื่องหลุดไป แอปจะต่อใหม่เองก่อนสั่งพิมพ์
3. **บอกสาเหตุให้ชัดเมื่อพิมพ์ไม่ได้**: เช่น "ยังไม่ได้อนุญาตให้ใช้ USB", "ฝาเครื่องเปิด", "กระดาษหมด" แทนที่จะเงียบไปเฉย ๆ
4. **แยกฟอร์มแลนให้ชัด**: เปลี่ยนชื่อฟอร์มด้านล่างเป็น "เครื่องพิมพ์แบบสายแลน / WiFi (ไม่ต้องตั้งถ้าต่อ USB)" และถ้าต่อ USB อยู่แล้ว จะพับฟอร์มนี้เก็บไว้ ปุ่มทดสอบของฟอร์มนี้จะไม่ไปเรียก IP อีก
5. ปุ่มเปิดลิ้นชักเงินก็จะต่อเครื่องใหม่เองก่อน และบอกสาเหตุเมื่อเปิดไม่ได้แบบเดียวกัน

## สิ่งที่คุณต้องทำหลังแก้
ส่วนนี้ต้องติดตั้งแอปบนแท็บเล็ตใหม่ เพราะแก้ส่วนที่คุยกับเครื่องปริ้นด้วย:
```text
git checkout -- package.json package-lock.json
git pull
npm install --legacy-peer-deps
npm run build
npx cap sync android
powershell -ExecutionPolicy Bypass -File scripts/setup-star-printer.ps1
npx cap open android
```
จากนั้น Build APK แล้วติดตั้งทับ ไปที่ ตั้งค่า > Star Printer > ค้นหา > เชื่อมต่อ > ทดสอบการพิมพ์

## รายละเอียดทางเทคนิค
- `src/utils/receiptImage.ts` (ใหม่): วาดใบเสร็จลง canvas กว้าง 576px ด้วยฟอนต์ไทย แล้วส่งออกเป็น PNG base64
- `useStarPrinter.printReceipt/testPrint`: ส่ง `{ imageBase64, width: 576 }` แทนข้อความ ESC/POS และ reconnect จาก `getSelectedPrinter()` เมื่อ `getStatus().connected` เป็น false
- `definitions.ts`, `web.ts`: เพิ่ม `printImage({ imageBase64, width, cut })`
- `android-plugin/StarPrinterPlugin.kt`: เพิ่ม `printImage` → decode Bitmap → `PrinterBuilder().actionPrintImage(ImageParameter(bitmap, 576)).actionCut(CutType.Partial)`; ถ้า print ล้ม ให้ reopen แล้วลองอีกครั้ง; ส่งต่อข้อความ error จริง (`StarIO10UnprintableException` / `CommunicationException` / `UsbPermission`) ไปที่ JS
- `ios/Plugin/StarPrinterPlugin.swift`: เพิ่ม `printImage` แบบเดียวกัน (ใช้ `ImageParameter`)
- `PrinterConfiguration.tsx`: เปลี่ยนชื่อหัวข้อเป็นเครื่องแบบแลน และพับเก็บเมื่อเชื่อม Star USB แล้ว
