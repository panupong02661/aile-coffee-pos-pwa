import { Link } from 'react-router-dom';
import PreviewSidebar from '@/components/preview/PreviewSidebar';
import PreviewHeader from '@/components/preview/PreviewHeader';
import {
  Calculator, ClipboardList, Users, ShoppingBag,
  Package, Tag, TrendingUp, Settings, AlertTriangle,
} from 'lucide-react';

const menuCards = [
  { label: 'POS', desc: 'เริ่มขายสินค้า', icon: Calculator, bg: 'bg-[#FDE4E4]', iconBg: 'bg-[#F27381]', to: '/preview-pos' },
  { label: 'รายการสั่งซื้อ', desc: 'จัดการออเดอร์', icon: ClipboardList, bg: 'bg-[#FFF0D6]', iconBg: 'bg-[#F5A742]', to: '/preview-home' },
  { label: 'ลูกค้า', desc: 'ข้อมูลลูกค้า', icon: Users, bg: 'bg-[#E4E8FD]', iconBg: 'bg-[#7B8AE0]', to: '/preview-home' },
  { label: 'สินค้า', desc: 'จัดการสินค้า', icon: ShoppingBag, bg: 'bg-[#DFF3E0]', iconBg: 'bg-[#5FBF6B]', to: '/preview-home' },
  { label: 'สต๊อก', desc: 'เช็คสต๊อกสินค้า', icon: Package, bg: 'bg-[#E1EEFD]', iconBg: 'bg-[#5A9AE6]', to: '/preview-home' },
  { label: 'โปรโมชั่น', desc: 'จัดการโปรโมชั่น', icon: Tag, bg: 'bg-[#FFECD1]', iconBg: 'bg-[#F0A835]', to: '/preview-home' },
  { label: 'รายงาน', desc: 'ดูรายงาน', icon: TrendingUp, bg: 'bg-[#E4F1FD]', iconBg: 'bg-[#5AA3E0]', to: '/preview-home' },
  { label: 'ตั้งค่า', desc: 'ตั้งค่าระบบ', icon: Settings, bg: 'bg-[#EDEDED]', iconBg: 'bg-[#7A7A7A]', to: '/preview-home' },
];

const stats = [
  { label: 'ยอดขายวันนี้', value: '8,450 บาท', bg: 'bg-[#DFF3E0]', accent: 'text-[#3F9C4A]' },
  { label: 'ออเดอร์วันนี้', value: '32 รายการ', bg: 'bg-[#FFE7D1]', accent: 'text-[#D97B2A]' },
  { label: 'ลูกค้าใหม่วันนี้', value: '5 คน', bg: 'bg-[#E4E8FD]', accent: 'text-[#5A6ED0]' },
  { label: 'สินค้าใกล้หมด', value: '12 รายการ', bg: 'bg-[#FDDCDC]', accent: 'text-[#D9534F]', icon: AlertTriangle },
];

export default function PreviewHome() {
  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      <PreviewSidebar />
      <main className="flex-1 flex flex-col">
        <PreviewHeader />
        <div className="flex-1 px-8 pb-8">
          <div className="grid grid-cols-4 gap-5">
            {menuCards.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.label}
                  to={c.to}
                  className={`${c.bg} rounded-3xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
                >
                  <div className={`${c.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-3`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="font-bold text-[#2B1D14] text-lg">{c.label}</div>
                  <div className="text-xs text-[#7A6656] mt-0.5">{c.desc}</div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-5 mt-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 flex items-center justify-between`}>
                  <div>
                    <div className="text-xs text-[#6E5A48]">{s.label}</div>
                    <div className={`text-xl font-bold mt-1 ${s.accent}`}>{s.value}</div>
                  </div>
                  {Icon && <Icon className={`w-6 h-6 ${s.accent}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
