# Pilot Testing Checklist — v8.1

สถานะ: ยังไม่เริ่ม pilot / ทุกข้อด้านล่างยังต้องมีหลักฐานระบบจริง

- [ ] ติดตั้งจาก ZIP และ lockfile บนฐานทดลองที่แยกจากข้อมูลจริง
- [ ] apply schema สำเร็จและ rerun schema ได้โดยข้อมูลเดิมไม่หาย
- [ ] ขาย concurrent key เดียวสร้างบิล/stock/BOM movement ครั้งเดียว
- [ ] key เดิม payload ต่างถูกปฏิเสธ และต่าง key ไม่คืนเงินเกินสิทธิ์
- [ ] คืนเงินหลังส่วนลด: หลายรายการ, partial, rounding, restock/no-restock
- [ ] ปิดกะตรง ledger เงินสดและ Backoffice
- [ ] tenant/branch/role isolation ทุก endpoint สำคัญ
- [ ] Browser live E2E บน desktop/tablet/mobile ผ่าน
- [ ] Offline timeout หลัง server commit แล้ว reconcile ไม่ขายซ้ำ
- [ ] restart/crash กลาง transaction แล้วไม่มีข้อมูลบางส่วน
- [ ] backup/restore จริงและตรวจยอดทุกตารางหลัง restore
- [ ] เจ้าของร้านตรวจ UAT, แผน rollback, monitoring และแนวทางช่วยเหลือ

Hardware printer: เลื่อนออกไปก่อน ไม่ถือว่าผ่าน
Payment gateway จริง: ยังไม่เปิดใช้งาน ไม่ถือว่าผ่าน
