import {
  BarChart3, Calculator, Clock, Table, Menu as MenuIcon, Users, FileText,
  Package, UserCheck, Bell, Smartphone, ChefHat, Truck, UserCog, Settings,
  Gamepad2, Percent, Shield, Store, Building, MessageCircle, Printer, QrCode,
  ShoppingCart, TrendingUp, BarChart, UserPlus, MapPin, DollarSign, Banknote,
  Wifi, Ticket, MessageSquare, Tag, Eye, Smartphone as PhoneIcon, LucideIcon,
} from 'lucide-react';

export interface PreviewMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface PreviewMenuGroup {
  id: string;
  label: string;
  short: string;
  icon: LucideIcon;
  items: PreviewMenuItem[];
}

export const previewMenuGroups: PreviewMenuGroup[] = [
  {
    id: 'main',
    label: 'หลัก',
    short: 'หลัก',
    icon: Calculator,
    items: [
      { id: 'pos', label: 'POS', icon: Calculator, path: '/' },
      { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard' },
      { id: 'shop-benchmark', label: 'Benchmark ร้านค้า', icon: Eye, path: '/shop-benchmark' },
    ],
  },
  {
    id: 'store',
    label: 'ร้านค้า & ออเดอร์',
    short: 'ออเดอร์',
    icon: ShoppingCart,
    items: [
      { id: 'kitchen-display', label: 'จอครัว (KDS)', icon: ChefHat, path: '/kitchen-display' },
      { id: 'customer-display', label: 'จอลูกค้า', icon: Table, path: '/customer-display' },
      { id: 'online-orders', label: 'ออเดอร์ออนไลน์', icon: ShoppingCart, path: '/online-orders' },
      { id: 'delivery-integration', label: 'Delivery', icon: Truck, path: '/delivery-integration' },
      { id: 'delivery-management', label: 'จัดการจัดส่ง', icon: Truck, path: '/delivery-management' },
      { id: 'delivery-tracking', label: 'ติดตามเดลิเวอรี่', icon: MapPin, path: '/delivery-tracking' },
      { id: 'queue-management', label: 'ระบบคิว', icon: Users, path: '/queue-management' },
      { id: 'queue-display', label: 'จอแสดงคิว', icon: Eye, path: '/queue-display' },
      { id: 'table-management', label: 'จัดการโต๊ะ', icon: Table, path: '/table-management' },
    ],
  },
  {
    id: 'menu',
    label: 'เมนู & สินค้า',
    short: 'เมนู',
    icon: MenuIcon,
    items: [
      { id: 'menu', label: 'จัดการเมนู', icon: MenuIcon, path: '/menu' },
      { id: 'inventory', label: 'คลังสินค้า', icon: Package, path: '/inventory' },
      { id: 'cost-analysis', label: 'วิเคราะห์ต้นทุน', icon: DollarSign, path: '/cost-analysis' },
    ],
  },
  {
    id: 'customers',
    label: 'ลูกค้า & สมาชิก',
    short: 'ลูกค้า',
    icon: Users,
    items: [
      { id: 'members', label: 'จัดการสมาชิก', icon: Users, path: '/members' },
      { id: 'customer-mobile-app', label: 'แอปลูกค้า', icon: PhoneIcon, path: '/customer-mobile-app' },
      { id: 'customer-app-management', label: 'จัดการแอปลูกค้า', icon: UserCog, path: '/customer-app-management' },
    ],
  },
  {
    id: 'promotions',
    label: 'โปรโมชั่น & Engagement',
    short: 'โปรโมชั่น',
    icon: Gamepad2,
    items: [
      { id: 'engagement', label: 'Engagement', icon: Gamepad2, path: '/engagement' },
      { id: 'promotions', label: 'โปรโมชั่น', icon: Percent, path: '/promotions' },
      { id: 'menu-promotions', label: 'โปรโมชั่นเมนู', icon: Tag, path: '/menu-promotions' },
      { id: 'coupon-management', label: 'คูปอง', icon: Ticket, path: '/coupon-management' },
    ],
  },
  {
    id: 'staff',
    label: 'พนักงาน',
    short: 'พนักงาน',
    icon: UserPlus,
    items: [
      { id: 'staff', label: 'จัดการพนักงาน', icon: UserPlus, path: '/staff' },
      { id: 'time-attendance', label: 'บันทึกเวลา', icon: Clock, path: '/time-attendance' },
      { id: 'permissions', label: 'สิทธิ์ผู้ใช้', icon: Shield, path: '/permissions' },
    ],
  },
  {
    id: 'reports',
    label: 'รายงาน & วิเคราะห์',
    short: 'รายงาน',
    icon: BarChart,
    items: [
      { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports' },
      { id: 'advanced-reports', label: 'รายงานขั้นสูง', icon: TrendingUp, path: '/advanced-reports' },
      { id: 'analytics-dashboard', label: 'Analytics', icon: TrendingUp, path: '/analytics-dashboard' },
      { id: 'customer-analytics', label: 'วิเคราะห์ลูกค้า', icon: UserCheck, path: '/customer-analytics' },
    ],
  },
  {
    id: 'finance',
    label: 'การเงิน',
    short: 'การเงิน',
    icon: Banknote,
    items: [
      { id: 'financial-dashboard', label: 'Financial Dashboard', icon: DollarSign, path: '/financial-dashboard' },
      { id: 'qr-promptpay', label: 'QR PromptPay', icon: QrCode, path: '/qr-promptpay' },
      { id: 'credit-system', label: 'ระบบเครดิต', icon: Banknote, path: '/credit-system' },
    ],
  },
  {
    id: 'communication',
    label: 'การสื่อสาร',
    short: 'สื่อสาร',
    icon: MessageCircle,
    items: [
      { id: 'notifications', label: 'แจ้งเตือน', icon: Bell, path: '/notifications' },
      { id: 'line-messaging', label: 'LINE Messaging', icon: MessageCircle, path: '/line-messaging' },
      { id: 'review-management', label: 'จัดการรีวิว', icon: MessageSquare, path: '/review-management' },
      { id: 'wifi-vouchers', label: 'WiFi ลูกค้า', icon: Wifi, path: '/wifi-vouchers' },
    ],
  },
  {
    id: 'settings',
    label: 'ตั้งค่า & ระบบ',
    short: 'ตั้งค่า',
    icon: Settings,
    items: [
      { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings' },
      { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings' },
      { id: 'printer-settings', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer-settings' },
      { id: 'security-dashboard', label: 'ความปลอดภัย', icon: Shield, path: '/security-dashboard' },
      { id: 'app-build-guide', label: 'สร้างแอปมือถือ', icon: Smartphone, path: '/app-build-guide' },
    ],
  },
];

export const allPreviewItems = previewMenuGroups.flatMap((g) =>
  g.items.map((i) => ({ ...i, groupLabel: g.label }))
);
