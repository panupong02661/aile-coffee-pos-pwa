# StarXpand SDK auto-setup for Android (PowerShell)
# Run from project root AFTER: npm install; npx cap add android
$ErrorActionPreference = "Stop"
if (-not (Test-Path "android")) { throw "ไม่มีโฟลเดอร์ android — รัน 'npx cap add android' ก่อน" }
bash scripts/setup-star-printer.sh
