import { Link, useLocation } from 'react-router-dom';
import {
  Home, Calculator, ClipboardList, Users, Package, Boxes,
  Tag, BarChart3, Settings, UserCircle, LogOut, Coffee,
} from 'lucide-react';

const items = [
  { label: 'หน้าหลัก', icon: Home, path: '/preview-home' },
  { label: 'POS', icon: Calculator, path: '/preview-pos' },
  { label: 'รายการสั่งซื้อ', icon: ClipboardList, path: '/preview-home' },
  { label: 'ลูกค้า', icon: Users, path: '/preview-home' },
  { label: 'สินค้า', icon: Package, path: '/preview-home' },
  { label: 'สต๊อก', icon: Boxes, path: '/preview-home' },
  { label: 'โปรโมชั่น', icon: Tag, path: '/preview-home' },
  { label: 'รายงาน', icon: BarChart3, path: '/preview-home' },
  { label: 'ตั้งค่า', icon: Settings, path: '/preview-home' },
  { label: 'ผู้ใช้งาน', icon: UserCircle, path: '/preview-home' },
  { label: 'ออกจากระบบ', icon: LogOut, path: '/preview-home' },
];

export default function PreviewSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#F1EBE1] flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-9 h-9 rounded-full bg-[#F5E8D6] flex items-center justify-center">
          <Coffee className="w-5 h-5 text-[#C97B4A]" />
        </div>
        <span className="font-bold text-[#3B2A1F] text-lg">Aile Coffee</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((it, i) => {
          const Icon = it.icon;
          const active = pathname === it.path && (i === 0 ? pathname === '/preview-home' : i === 1 ? pathname === '/preview-pos' : false);
          return (
            <Link
              key={i}
              to={it.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-colors ${
                active
                  ? 'bg-[#FADEE1] text-[#E85A6B] font-semibold'
                  : 'text-[#4A3A2E] hover:bg-[#FAF5EE]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
