import PreviewSidebar from '@/components/preview/PreviewSidebar';
import { Bell, Search, ScanLine, Trash2, MoreVertical, Minus, Plus, StickyNote, X, Pause, FileSearch, Ticket, Printer, ChevronDown, Table2, User } from 'lucide-react';

const categories = ['ทั้งหมด', 'กาแฟ', 'นม', 'ชา', 'ปั่น', 'เบเกอรี่', 'ของว่าง'];

const menu = [
  { name: 'เอสเพรสโซ่', price: 45, color: 'from-[#6B4226] to-[#3B2418]' },
  { name: 'อเมริกาโน่', price: 55, color: 'from-[#3B2418] to-[#1F120A]' },
  { name: 'ลาเต้', price: 65, color: 'from-[#D4B896] to-[#A07E5A]' },
  { name: 'คาปูชิโน่', price: 65, color: 'from-[#C9A47D] to-[#8B6A4C]' },
  { name: 'มอคค่า', price: 75, color: 'from-[#8B5A3C] to-[#4A2E1E]' },
  { name: 'ชาเขียวลาเต้', price: 65, color: 'from-[#B4D48A] to-[#6B9950]' },
  { name: 'ชานม', price: 60, color: 'from-[#D4B896] to-[#8B6A4C]' },
  { name: 'ชามะนาว', price: 60, color: 'from-[#F4C842] to-[#C99524]' },
  { name: 'นมสด', price: 45, color: 'from-[#F5F1EA] to-[#D8CFC1]' },
  { name: 'โกโก้', price: 55, color: 'from-[#6B4226] to-[#3B2418]' },
  { name: 'ครัวซองต์', price: 55, color: 'from-[#E8B96A] to-[#B0803A]' },
  { name: 'ชีสเค้ก', price: 75, color: 'from-[#F5E4B8] to-[#D8B96A]' },
  { name: 'บราวนี่', price: 65, color: 'from-[#4A2E1E] to-[#2B1810]' },
  { name: 'คุกกี้ช็อกชิพ', price: 45, color: 'from-[#D4A574] to-[#8B6A3C]' },
  { name: 'แซนด์วิช', price: 65, color: 'from-[#E8D8A8] to-[#B89858]' },
];

const cart = [
  { name: 'ลาเต้', note: 'ร้อน, หวานน้อย', qty: 1, price: 65, color: 'from-[#D4B896] to-[#A07E5A]' },
  { name: 'อเมริกาโน่', note: 'เย็น, ไม่หวาน', qty: 1, price: 55, color: 'from-[#3B2418] to-[#1F120A]' },
  { name: 'ครัวซองต์', note: '', qty: 1, price: 55, color: 'from-[#E8B96A] to-[#B0803A]' },
  { name: 'ชาเขียวลาเต้', note: '', qty: 1, price: 65, color: 'from-[#B4D48A] to-[#6B9950]' },
];

const quickActions = [
  { label: 'ยกเลิกรายการ', icon: X, color: 'text-[#E85A6B]', bg: 'bg-[#FDE4E4]' },
  { label: 'พักรายการ', icon: Pause, color: 'text-[#8A7563]', bg: 'bg-[#F0EBE2]' },
  { label: 'ค้นหารายการ', icon: FileSearch, color: 'text-[#D97B2A]', bg: 'bg-[#FFEBD1]' },
  { label: 'คูปองส่วนลด', icon: Ticket, color: 'text-[#3F9C4A]', bg: 'bg-[#DFF3E0]' },
  { label: 'พิมพ์ใบเสร็จ', icon: Printer, color: 'text-[#5A9AE6]', bg: 'bg-[#E1EEFD]' },
];

export default function PreviewPOS() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      <PreviewSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold text-[#2B1D14]">POS</h1>
            <p className="text-xs text-[#8A7563] mt-0.5">จุดขาย / สร้างรายการสั่งซื้อ</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EDE2CE] bg-white text-sm text-[#4A3A2E]">
              <Table2 className="w-4 h-4" /> โต๊ะ 3
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EDE2CE] bg-white text-sm text-[#4A3A2E]">
              <User className="w-4 h-4" /> ลูกค้าทั่วไป <ChevronDown className="w-4 h-4" />
            </button>
            <button className="relative w-9 h-9 rounded-full bg-white border border-[#F0E7D8] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#4A3A2E]" />
              <span className="absolute -top-1 -right-1 bg-[#E85A6B] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            <span className="text-sm text-[#4A3A2E]">19:30 น.</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C7A98A] to-[#8B6A4E]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-5 px-8 pb-6 overflow-hidden">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-[#EDE2CE] px-4 py-2.5">
              <Search className="w-4 h-4 text-[#8A7563]" />
              <input placeholder="ค้นหาสินค้า / สแกนบาร์โค้ด" className="flex-1 bg-transparent outline-none text-sm" />
              <button className="p-1.5 rounded-lg hover:bg-[#FAF5EE]"><Search className="w-4 h-4 text-[#8A7563]" /></button>
              <button className="p-1.5 rounded-lg hover:bg-[#FAF5EE]"><ScanLine className="w-4 h-4 text-[#8A7563]" /></button>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((c, i) => (
                <button
                  key={c}
                  className={`px-5 py-2 rounded-full text-sm border ${
                    i === 0
                      ? 'bg-[#F27381] text-white border-[#F27381] font-semibold'
                      : 'bg-white border-[#EDE2CE] text-[#4A3A2E]'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full text-sm text-[#5A9AE6] font-medium">+ เพิ่มหมวด</button>
            </div>

            {/* Menu grid */}
            <div className="grid grid-cols-5 gap-4 overflow-y-auto pr-1">
              {menu.map((m) => (
                <div key={m.name} className="bg-white rounded-2xl p-3 border border-[#F1EBE1] hover:shadow-md transition">
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${m.color} mb-2`} />
                  <div className="font-semibold text-sm text-[#2B1D14] truncate">{m.name}</div>
                  <div className="text-xs text-[#8A7563] mt-0.5">{m.price} บาท</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-[#F1EBE1] p-3">
              <div className="text-xs font-semibold text-[#4A3A2E] mb-2 px-1">การทำงานด่วน</div>
              <div className="grid grid-cols-5 gap-2">
                {quickActions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label} className={`${a.bg} rounded-xl py-3 flex flex-col items-center gap-1`}>
                      <Icon className={`w-5 h-5 ${a.color}`} />
                      <span className={`text-xs ${a.color} font-medium`}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart */}
          <aside className="w-[340px] shrink-0 bg-white rounded-2xl border border-[#F1EBE1] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1EBE1]">
              <h3 className="font-bold text-[#2B1D14]">รายการสั่งซื้อ</h3>
              <div className="flex items-center gap-2 text-[#8A7563]">
                <button><Trash2 className="w-4 h-4" /></button>
                <button><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center border border-[#EDE2CE] rounded-lg py-1 px-2">
                    <span className="text-sm font-semibold text-[#2B1D14]">{it.qty}</span>
                    <div className="flex gap-1 mt-1">
                      <button className="w-4 h-4 rounded bg-[#FAF5EE] flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                      <button className="w-4 h-4 rounded bg-[#FAF5EE] flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${it.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#2B1D14] truncate">{it.name}</div>
                    {it.note && <div className="text-xs text-[#8A7563] truncate">{it.note}</div>}
                  </div>
                  <div className="text-sm font-semibold text-[#2B1D14]">{it.price}</div>
                </div>
              ))}
              <button className="w-full mt-2 border border-dashed border-[#DFD3BE] rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm text-[#8A7563]">
                <StickyNote className="w-4 h-4" /> เพิ่มหมายเหตุ
              </button>
            </div>
            <div className="px-5 py-4 border-t border-[#F1EBE1] space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-[#7A6656]">รวมรายการ</span><span className="font-semibold">4 รายการ</span></div>
              <div className="flex justify-between"><span className="text-[#7A6656]">ส่วนลด</span><span className="font-semibold">0 บาท</span></div>
              <div className="flex justify-between"><span className="text-[#7A6656]">ภาษี 7%</span><span className="font-semibold">{vat.toFixed(2)} บาท</span></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-[#2B1D14]">ยอดชำระ</span>
                <span className="text-2xl font-extrabold text-[#F27381]">{total.toFixed(2)} บาท</span>
              </div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <button className="py-3 rounded-xl bg-[#EAF2FF] text-[#5A9AE6] text-sm font-semibold">บันทึกรายการ</button>
              <button className="py-3 rounded-xl bg-[#F27381] text-white text-sm font-semibold">ชำระเงิน</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
