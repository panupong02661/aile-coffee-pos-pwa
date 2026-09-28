# แก้ปัญหา "git is not recognized" — คอมยังไม่มีโปรแกรม Git

## สาเหตุ
คำสั่ง `git pull` ใช้ไม่ได้ เพราะคอมเครื่องนี้ยังไม่ได้ติดตั้งโปรแกรม Git (รอบก่อนน่าจะดาวน์โหลดโค้ดเป็นไฟล์ ZIP) เลือกทำได้ 2 ทาง

## ทาง A (แนะนำ): ติดตั้ง Git แล้วดึงโค้ด
1. ใน PowerShell พิมพ์ `winget install --id Git.Git -e` แล้วกด Enter (ถ้าเครื่องถามให้ตอบ Y) หรือดาวน์โหลดจาก git-scm.com แล้วกด Next ไปจนเสร็จ
2. **ปิด PowerShell แล้วเปิดใหม่**
3. พิมพ์:
```
cd C:\Users\panup\aile-coffee-pos-pwa
git pull
```
4. ถ้าขึ้น `not a git repository` แปลว่าโฟลเดอร์นี้ไม่ได้เชื่อมกับ GitHub ให้ไปทำทาง B

## ทาง B: ดาวน์โหลดโค้ดใหม่เป็น ZIP แล้ววางทับ
1. ใน Lovable เปิดเมนู GitHub (มุมขวาบน) → เปิดหน้า repository → กดปุ่ม **Code → Download ZIP**
2. แตกไฟล์ ZIP
3. คัดลอก**ทุกอย่างยกเว้นโฟลเดอร์ `android`** ไปวางทับใน `C:\Users\panup\aile-coffee-pos-pwa` (เลือก Replace)
   - เก็บโฟลเดอร์ `android` เดิมไว้ เพราะมีการตั้งค่าแอปจากรอบก่อน
4. ถ้ายังไม่ได้เชื่อม GitHub ให้กด Connect ก่อน

## ทำต่อ (ทั้ง 2 ทาง)
```
npm install
npm run build
npx cap sync android
npx cap open android
```
จากนั้นทำขั้นตอนที่ 2–4 ตามเดิม (แก้เวอร์ชัน → Build APK(s) → ติดตั้งทับ → ดูเลข 1.2.0)
