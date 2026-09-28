# ขั้นตอนต่อ: ติดตั้ง Git แล้วทำแอปเวอร์ชัน 1.2.0

## สถานการณ์ตอนนี้
- PowerShell เข้าโฟลเดอร์ `C:\Users\panup\aile-coffee-pos-pwa` ได้แล้ว
- ข้อความสีแดง `git is not recognized` ยืนยันว่าเครื่องยังไม่มีโปรแกรม Git
- ยังไม่ต้องลบแอปเก่าบนมือถือหรือแท็บเล็ต

## ขั้นที่ 1: ติดตั้ง Git
ใน PowerShell พิมพ์คำสั่งนี้แล้วกด Enter:

```powershell
winget install --id Git.Git -e
```

- ถ้ามีคำถามให้ยอมรับเงื่อนไข ให้พิมพ์ `Y` แล้วกด Enter
- รอจนขึ้นว่าติดตั้งสำเร็จ จากนั้นปิด PowerShell ทั้งหน้าต่าง

## ขั้นที่ 2: ตรวจว่า Git ใช้งานได้
เปิด PowerShell ใหม่ แล้วพิมพ์:

```powershell
git --version
```

ถ้าเห็นเลขเวอร์ชันของ Git ให้ทำขั้นต่อไป

## ขั้นที่ 3: ดึงโค้ดล่าสุด
พิมพ์ทีละบรรทัด:

```powershell
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```

- ถ้าดึงสำเร็จ ให้ทำขั้นที่ 4
- ถ้าขึ้น `not a git repository` ให้หยุดและส่งภาพมา จะใช้วิธีดาวน์โหลด ZIP จาก Lovable โดยเก็บโฟลเดอร์ Android เดิมไว้

## ขั้นที่ 4: เตรียมและเปิดแอปใน Android Studio
พิมพ์ทีละบรรทัด:

```powershell
npm install
npm run build
npx cap sync android
npx cap open android
```

คำสั่งสุดท้ายจะเปิด Android Studio เพื่อสร้าง APK เวอร์ชัน 1.2.0 ต่อไป

## ข้อควรระวัง
- อย่าเพิ่งลบแอปเก่า จนกว่าจะยืนยันว่าออเดอร์ที่รอซิงก์เหลือ 0
- เก็บไฟล์ `C:\Users\panup\.android\debug.keystore` สำรองไว้ เพราะอาจใช้ติดตั้งทับแอปเดิมได้
