import {
  BarChart3, Calculator, Clock, Table, Menu as MenuIcon, Users, FileText,
  Package, UserCheck, Bell, Smartphone, ChefHat, Truck, UserCog, Settings,
  Gamepad2, Percent, Shield, Store, Building, MessageCircle, Printer, QrCode,
  ShoppingCart, TrendingUp, BarChart, UserPlus, MapPin, DollarSign, Banknote,
  Smartphone as PhoneIcon, Wifi, Ticket, MessageSquare, Tag, Eye, LucideIcon,
} from 'lucide-react';

export interface LauncherItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  tint?: string; // tailwind bg class for iOS-style icon backdrop
}

export interface LauncherGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: LauncherItem[];
}

export const launcherGroups: LauncherGroup[] = [
  {
    id: 'main', label: 'หลัก', icon: Calculator,
    items: [
      { id: 'pos', label: 'POS', icon: Calculator, path: '/', tint: 'from-orange-500 to-red-500' },
      { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard', tint: 'from-blue-500 to-indigo-600' },
      { id: 'shop-benchmark', label: 'Benchmark', icon: Eye, path: '/shop-benchmark', tint: 'from-violet-500 to-purple-600' },
    ],
  },
  {
    id: 'store', label: 'ร้านค้า & ออเดอร์', icon: ShoppingCart,
    items: [
      { id: 'kitchen-display', label: 'จอครัว', icon: ChefHat, path: '/kitchen-display', tint: 'from-amber-500 to-orange-600' },
      { id: 'customer-display', label: 'จอลูกค้า', icon: Table, path: '/customer-display', tint: 'from-sky-500 to-blue-600' },
      { id: 'online-orders', label: 'ออเดอร์ออนไลน์', icon: ShoppingCart, path: '/online-orders', tint: 'from-emerald-500 to-teal-600' },
      { id: 'delivery-integration', label: 'Delivery', icon: Truck, path: '/delivery-integration', tint: 'from-rose-500 to-pink-600' },
      { id: 'delivery-management', label: 'จัดการจัดส่ง', icon: Truck, path: '/delivery-management', tint: 'from-pink-500 to-rose-600' },
      { id: 'delivery-tracking', label: 'ติดตามเดลิเวอรี่', icon: MapPin, path: '/delivery-tracking', tint: 'from-red-500 to-orange-500' },
      { id: 'queue-management', label: 'ระบบคิว', icon: Users, path: '/queue-management', tint: 'from-teal-500 to-cyan-600' },
      { id: 'table-management', label: 'จัดการโต๊ะ', icon: Table, path: '/table-management', tint: 'from-cyan-500 to-blue-500' },
    ],
  },
  {
    id: 'menu', label: 'เมนู & สินค้า', icon: MenuIcon,
    items: [
      { id: 'menu', label: 'จัดการเมนู', icon: MenuIcon, path: '/menu', tint: 'from-lime-500 to-green-600' },
      { id: 'inventory', label: 'คลังสินค้า', icon: Package, path: '/inventory', tint: 'from-green-500 to-emerald-600' },
      { id: 'cost-analysis', label: 'วิเคราะห์ต้นทุน', icon: DollarSign, path: '/cost-analysis', tint: 'from-yellow-500 to-amber-600' },
    ],
  },
  {
    id: 'customers', label: 'ลูกค้า & สมาชิก', icon: Users,
    items: [
      { id: 'members', label: 'จัดการสมาชิก', icon: Users, path: '/members', tint: 'from-indigo-500 to-blue-600' },
      { id: 'customer-mobile-app', label: 'แอปลูกค้า', icon: PhoneIcon, path: '/customer-mobile-app', tint: 'from-fuchsia-500 to-pink-500' },
      { id: 'customer-app-management', label: 'จัดการแอปลูกค้า', icon: UserCog, path: '/customer-app-management', tint: 'from-purple-500 to-fuchsia-600' },
    ],
  },
  {
    id: 'promotions', label: 'โปรโมชั่น & Engagement', icon: Gamepad2,
    items: [
      { id: 'engagement', label: 'Engagement', icon: Gamepad2, path: '/engagement', tint: 'from-pink-500 to-red-500' },
      { id: 'promotions', label: 'โปรโมชั่น', icon: Percent, path: '/promotions', tint: 'from-red-500 to-pink-600' },
      { id: 'menu-promotions', label: 'โปรโมชั่นเมนู', icon: Tag, path: '/menu-promotions', tint: 'from-orange-500 to-red-600' },
      { id: 'coupon-management', label: 'คูปอง', icon: Ticket, path: '/coupon-management', tint: 'from-amber-500 to-yellow-600' },
    ],
  },
  {
    id: 'staff', label: 'พนักงาน', icon: UserPlus,
    items: [
      { id: 'staff', label: 'จัดการพนักงาน', icon: UserPlus, path: '/staff', tint: 'from-blue-500 to-cyan-600' },
      { id: 'time-attendance', label: 'บันทึกเวลา', icon: Clock, path: '/time-attendance', tint: 'from-slate-500 to-slate-700' },
      { id: 'permissions', label: 'สิทธิ์ผู้ใช้', icon: Shield, path: '/permissions', tint: 'from-zinc-500 to-zinc-700' },
    ],
  },
  {
    id: 'reports', label: 'รายงาน & วิเคราะห์', icon: BarChart,
    items: [
      { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports', tint: 'from-blue-500 to-indigo-600' },
      { id: 'advanced-reports', label: 'รายงานขั้นสูง', icon: TrendingUp, path: '/advanced-reports', tint: 'from-indigo-500 to-purple-600' },
      { id: 'analytics-dashboard', label: 'Analytics', icon: TrendingUp, path: '/analytics-dashboard', tint: 'from-violet-500 to-indigo-600' },
      { id: 'customer-analytics', label: 'วิเคราะห์ลูกค้า', icon: UserCheck, path: '/customer-analytics', tint: 'from-purple-500 to-pink-500' },
    ],
  },
  {
    id: 'finance', label: 'การเงิน', icon: Banknote,
    items: [
      { id: 'financial-dashboard', label: 'Financial', icon: DollarSign, path: '/financial-dashboard', tint: 'from-emerald-500 to-green-600' },
      { id: 'qr-promptpay', label: 'QR PromptPay', icon: QrCode, path: '/qr-promptpay', tint: 'from-teal-500 to-emerald-600' },
      { id: 'credit-system', label: 'ระบบเครดิต', icon: Banknote, path: '/credit-system', tint: 'from-green-500 to-lime-600' },
    ],
  },
  {
    id: 'communication', label: 'การสื่อสาร', icon: MessageCircle,
    items: [
      { id: 'notifications', label: 'แจ้งเตือน', icon: Bell, path: '/notifications', tint: 'from-amber-500 to-orange-500' },
      { id: 'line-messaging', label: 'LINE', icon: MessageCircle, path: '/line-messaging', tint: 'from-green-500 to-emerald-500' },
      { id: 'review-management', label: 'รีวิว', icon: MessageSquare, path: '/review-management', tint: 'from-yellow-500 to-amber-500' },
      { id: 'wifi-vouchers', label: 'WiFi', icon: Wifi, path: '/wifi-vouchers', tint: 'from-sky-500 to-cyan-500' },
    ],
  },
  {
    id: 'settings', label: 'ตั้งค่า & ระบบ', icon: Settings,
    items: [
      { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings', tint: 'from-slate-500 to-gray-700' },
      { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings', tint: 'from-gray-500 to-slate-700' },
      { id: 'printer-settings', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer-settings', tint: 'from-stone-500 to-zinc-700' },
      { id: 'security-dashboard', label: 'ความปลอดภัย', icon: Shield, path: '/security-dashboard', tint: 'from-red-500 to-rose-600' },
      { id: 'app-build-guide', label: 'สร้างแอป', icon: Smartphone, path: '/app-build-guide', tint: 'from-blue-500 to-indigo-500' },
    ],
  },
];

export const launcherItemsFlat: LauncherItem[] = launcherGroups.flatMap(g => g.items);
