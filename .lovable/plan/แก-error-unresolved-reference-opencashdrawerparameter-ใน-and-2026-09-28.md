# แก้ error "Unresolved reference: OpenCashDrawerParameter" ใน Android Studio

## สาเหตุ
ตัวเชื่อมเครื่องพิมพ์ Star สั่งเปิดลิ้นชักเงินด้วยคำสั่งเก่าที่ SDK ของ Star รุ่นปัจจุบันไม่มีแล้ว Android Studio จึงสร้างแอปไม่ผ่าน

## สิ่งที่จะแก้
- เปลี่ยนคำสั่งเปิดลิ้นชักเงินไปใช้รูปแบบใหม่ของ Star SDK ส่วนการพิมพ์ใบเสร็จเหมือนเดิม
- ไฟล์ชุดติดตั้ง (PowerShell) คัดลอกไฟล์ที่แก้แล้วเข้าไปในแอปเองอัตโนมัติ

## สิ่งที่คุณต้องทำหลังแก้
```
git checkout -- package.json package-lock.json
git pull
powershell -ExecutionPolicy Bypass -File scripts/setup-star-printer.ps1
npx cap open android
```
จากนั้นกด Sync (รีเฟรช) แล้วกด Build APK(s) อีกครั้ง

## รายละเอียดทางเทคนิค
`android-plugin/StarPrinterPlugin.kt`:
- ลบ import `printer.OpenCashDrawerParameter`
- เพิ่ม import `starxpandcommand.DrawerBuilder`, `starxpandcommand.drawer.OpenParameter`, `starxpandcommand.drawer.Channel`
- openCashDrawer: `DocumentBuilder().addDrawer(DrawerBuilder().actionOpen(OpenParameter().setChannel(Channel.No1)))`
