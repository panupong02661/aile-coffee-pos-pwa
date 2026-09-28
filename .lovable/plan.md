# แก้แอป Android พิมพ์ใบเสร็จผ่าน USB (Star TSP143III) ไม่ออก

## สาเหตุที่น่าจะเป็น
- ตัวเชื่อมเครื่องพิมพ์ Star ต้องติดตั้งเข้าแอปด้วยสคริปต์ `setup-star-printer` หลังสร้างโฟลเดอร์ android — ยังไม่เคยรัน แอปจึงไม่มีตัวสั่งพิมพ์ USB อยู่เลย
- เมื่อสั่งพิมพ์แล้วล้มเหลว แอปเงียบไม่แจ้งอะไร ทำให้ดูเหมือน "ไม่ขึ้นอะไรเลย"
- ปุ่มพิมพ์/พิมพ์อัตโนมัติบางจุดใช้ช่องทาง USB แบบเว็บ ซึ่งใช้ในแอป Android ไม่ได้

## สิ่งที่จะทำ
1. แสดงข้อความชัดเจนเมื่อพิมพ์ไม่ได้ เช่น "แอปนี้ยังไม่ได้ติดตั้งตัวเชื่อมเครื่องพิมพ์ Star" หรือ "ไม่พบเครื่องพิมพ์ — ตรวจสาย USB/OTG"
2. ในแอป Android ให้การพิมพ์ใบเสร็จ (ปุ่มพิมพ์และพิมพ์อัตโนมัติหลังชำระเงิน) ส่งไปที่เครื่องพิมพ์ Star ผ่าน USB โดยตรง เมื่อเลือกเครื่องไว้แล้ว
3. หน้า "Star Printer" เพิ่มปุ่ม "ทดสอบพิมพ์" และสถานะว่าตัวเชื่อมถูกติดตั้งในแอปหรือยัง
4. เพิ่มขั้นตอนในหน้า "สร้างแอปมือถือ" (ขั้นตอนที่ 6): รัน `bash scripts/setup-star-printer.sh` หลัง `npx cap sync android` ก่อนเปิด Android Studio และวิธีกด "อนุญาต" เมื่อแอปขอใช้ USB
5. ตรวจสคริปต์ติดตั้งให้ตรงกับชื่อแอป (`app.lovable.ailecoffeepos`) และรันซ้ำได้โดยไม่พัง

## สิ่งที่คุณต้องทำหลังจากนี้ (ในคอม)
```text
cd C:\Users\panup\aile-coffee-pos-pwa
git checkout -- package.json package-lock.json
git pull
npm install --legacy-peer-deps
npm run build
npx cap sync android
bash scripts/setup-star-printer.sh
npx cap open android
```
จากนั้น Build APK ติดตั้งทับ → เสียบเครื่องพิมพ์ผ่าน OTG → กด "อนุญาต" → ตั้งค่า > Star Printer > ค้นหา > เลือกเครื่อง > ทดสอบพิมพ์

## รายละเอียดทางเทคนิค
- ตรวจ `Capacitor.isPluginAvailable('StarPrinter')` บน native; ถ้าไม่มีให้ toast แจ้ง แทนการ catch เงียบ
- `useAutoPrint` / เส้นทางพิมพ์จาก PaymentModal: บน native + ตั้งค่า Star ไว้ → เรียก `useStarPrinter.printReceipt` แทน WebUSB ใน `useUniversalPrinter`
- บันทึกเครื่องที่เลือกใน localStorage แยกตาม shop เพื่อเชื่อมต่ออัตโนมัติเมื่อเปิดแอป
- สคริปต์ `.sh` ต้องมี Git Bash บน Windows (มากับ git 2.55 แล้ว) — ถ้าไม่มี ใช้ `scripts/setup-star-printer.ps1`
