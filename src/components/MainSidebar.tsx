
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserProfile from './UserProfile';
import { 
  BarChart3, 
  Calculator, 
  Clock,
  Table,
  Menu as MenuIcon,
  Users,
  Globe,
  Cog,
  FileText,
  CreditCard,
  Package,
  UserCheck,
  Bell,
  Smartphone,
  ChefHat,
  Truck,
  UserCog,
  Brain,
  Settings,
  Percent,
  Shield,
  Store,
  Building,
  MessageCircle,
  Printer,
  QrCode,
  ShoppingCart,
  TrendingUp,
  PieChart,
  BarChart,
  UserPlus,
  Briefcase,
  MapPin,
  DollarSign,
  Receipt,
  Calculator as CalculatorIcon,
  Banknote,
  CreditCard as CardIcon,
  BookOpen,
  Mail,
  Calendar,
  Smartphone as PhoneIcon,
  Wifi,
  Database,
  HardDrive,
  FileCheck,
  Lock
} from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const location = useLocation();
  
  // Pages that exist and have implementations
  const existingPages = [
    '/', '/dashboard', '/menu', '/members', '/pos', '/reports', '/shop-settings', 
    '/promotions', '/online-system', '/customer-mobile-app', '/customer-app-management',
    '/qr-promptpay', '/inventory', '/printer-settings', '/online-orders', 
    '/security-recommendations', '/advanced-reports', '/sales-reports', '/product-reports',
    '/customer-analytics', '/staff', '/time-attendance', '/permissions', '/branch-management',
    '/accounting', '/income-expense', '/profit-loss', '/tax-system', '/vat-calculation',
    '/tax-invoice', '/credit-system', '/crm', '/customer-data', '/purchase-history',
    '/marketing', '/sms-marketing', '/email-marketing', '/table-reservation',
    '/digital-payment', '/credit-card', '/api-system', '/external-integration',
    '/staff-mobile-app', '/data-backup', '/auto-backup', '/system-logs',
    '/usage-logs', '/role-access', '/access-control', '/delivery-integration', '/notification-settings'
  ];
  
  const menuItems = [
    // POS และ Dashboard หลัก
    { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard' },
    { id: 'pos', label: 'POS', icon: Calculator, path: '/' },
    { id: 'orders', label: 'คิวสั่งซื้อ', icon: Clock, path: '/orders' },
    { id: 'online-orders', label: 'ออเดอร์ออนไลน์', icon: ShoppingCart, path: '/online-orders' },
    { id: 'tables', label: 'จัดการโต๊ะ', icon: Table, path: '/tables' },
    { id: 'menu', label: 'จัดการเมนู', icon: MenuIcon, path: '/menu' },
    { id: 'members', label: 'จัดการสมาชิก', icon: Users, path: '/members' },
    { id: 'inventory', label: 'จัดการคลังสินค้า', icon: Package, path: '/inventory' },
    
    // ระบบจัดการหลัก
    { id: 'advanced-reports', label: 'รายงานขั้นสูง', icon: TrendingUp, path: '/advanced-reports' },
    { id: 'sales-reports', label: 'รายงานยอดขาย', icon: BarChart, path: '/sales-reports' },
    { id: 'product-reports', label: 'รายงานสินค้า', icon: PieChart, path: '/product-reports' },
    { id: 'customer-analytics', label: 'การวิเคราะห์ลูกค้า', icon: UserCheck, path: '/customer-analytics' },
    { id: 'staff', label: 'จัดการพนักงาน', icon: UserPlus, path: '/staff' },
    { id: 'time-attendance', label: 'บันทึกเวลาทำงาน', icon: Clock, path: '/time-attendance' },
    { id: 'permissions', label: 'กำหนดสิทธิ์', icon: Shield, path: '/permissions' },
    { id: 'branch-management', label: 'จัดการสาขา', icon: MapPin, path: '/branch-management' },
    
    // ระบบการเงิน
    { id: 'accounting', label: 'ระบบบัญชี', icon: Briefcase, path: '/accounting' },
    { id: 'income-expense', label: 'รายรับ-รายจ่าย', icon: DollarSign, path: '/income-expense' },
    { id: 'profit-loss', label: 'กำไร-ขาดทุน', icon: TrendingUp, path: '/profit-loss' },
    { id: 'tax-system', label: 'ระบบภาษี', icon: Receipt, path: '/tax-system' },
    { id: 'vat-calculation', label: 'คำนวณภาษีมูลค่าเพิ่ม', icon: CalculatorIcon, path: '/vat-calculation' },
    { id: 'tax-invoice', label: 'ออกใบกำกับภาษี', icon: FileText, path: '/tax-invoice' },
    { id: 'credit-system', label: 'ระบบเครดิต', icon: Banknote, path: '/credit-system' },
    
    // ระบบลูกค้า
    { id: 'crm', label: 'ระบบ CRM', icon: UserCog, path: '/crm' },
    { id: 'customer-data', label: 'ข้อมูลลูกค้า', icon: Users, path: '/customer-data' },
    { id: 'purchase-history', label: 'ประวัติการซื้อ', icon: BookOpen, path: '/purchase-history' },
    { id: 'marketing', label: 'ระบบการตลาด', icon: MessageCircle, path: '/marketing' },
    { id: 'sms-marketing', label: 'SMS Marketing', icon: PhoneIcon, path: '/sms-marketing' },
    { id: 'email-marketing', label: 'Email Marketing', icon: Mail, path: '/email-marketing' },
    { id: 'table-reservation', label: 'ระบบจองโต๊ะ', icon: Calendar, path: '/table-reservation' },
    
    // ระบบเทคโนโลยี
    { id: 'digital-payment', label: 'การชำระเงินดิจิทัล', icon: CardIcon, path: '/digital-payment' },
    { id: 'qr-promptpay', label: 'QR Code PromptPay', icon: QrCode, path: '/qr-promptpay' },
    { id: 'credit-card', label: 'บัตรเครดิต', icon: CreditCard, path: '/credit-card' },
    { id: 'api-system', label: 'ระบบ API', icon: Wifi, path: '/api-system' },
    { id: 'external-integration', label: 'เชื่อมต่อระบบภายนอก', icon: Globe, path: '/external-integration' },
    { id: 'staff-mobile-app', label: 'Mobile App พนักงาน', icon: Smartphone, path: '/staff-mobile-app' },
    { id: 'customer-mobile-app', label: 'แอปมือถือลูกค้า', icon: PhoneIcon, path: '/customer-mobile-app' },
    { id: 'delivery-integration', label: 'ผูกระบบ Delivery', icon: Truck, path: '/delivery-integration' },
    
    // ระบบรักษาความปลอดภัย
    { id: 'security-recommendations', label: 'ระบบความปลอดภัยที่แนะนำ', icon: Shield, path: '/security-recommendations' },
    { id: 'data-backup', label: 'สำรองข้อมูล', icon: HardDrive, path: '/data-backup' },
    { id: 'auto-backup', label: 'Backup อัตโนมัติ', icon: Database, path: '/auto-backup' },
    { id: 'system-logs', label: 'ระบบ Log', icon: FileCheck, path: '/system-logs' },
    { id: 'usage-logs', label: 'บันทึกการใช้งาน', icon: FileText, path: '/usage-logs' },
    { id: 'role-access', label: 'Role-based Access', icon: Lock, path: '/role-access' },
    { id: 'access-control', label: 'จัดการสิทธิ์การเข้าถึง', icon: Shield, path: '/access-control' },
    
    // เมนูเดิมที่เหลือ
    { id: 'online-system', label: 'ระบบออนไลน์', icon: Globe, path: '/online-system' },
    { id: 'customer-app-management', label: 'แอปมือถือสำหรับจัดการลูกค้า', icon: UserCog, path: '/customer-app-management' },
    { id: 'advanced', label: 'ระบบขั้นสูง', icon: Cog, path: '/advanced' },
    { id: 'advanced-payment', label: 'ชำระเงินขั้นสูง', icon: CreditCard, path: '/advanced-payment' },
    { id: 'notifications', label: 'ระบบแจ้งเตือน', icon: Bell, path: '/notifications' },
    { id: 'kitchen', label: 'ระบบห้องครัว', icon: ChefHat, path: '/kitchen' },
    { id: 'delivery', label: 'ระบบส่งอาหาร', icon: Truck, path: '/delivery' },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Brain, path: '/ai-analytics' },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings' },
    { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports' },
    { id: 'promotions', label: 'โปรโมชั่น', icon: Percent, path: '/promotions' },
    { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings' },
    { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings' },
    { id: 'line-notify', label: 'แจ้งเตือน LINE', icon: MessageCircle, path: '/line-notify' },
    { id: 'printer-settings', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer-settings' },
    { id: 'notification-settings', label: 'แจ้งเตือนสรุปยอดขาย', icon: Bell, path: '/notification-settings' },
  ];

  const handleMenuClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Card className="h-full border-coffee-200 rounded-none">
          <div className="p-4 border-b border-coffee-200">
            <h2 className="text-lg font-semibold text-coffee-800">Aile Coffee</h2>
          </div>
          
          {/* User Profile Section */}
          <UserProfile />
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-2 pb-80 md:pb-16">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const hasPage = existingPages.includes(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleMenuClick}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-coffee-600 text-white'
                          : hasPage 
                            ? 'text-coffee-700 hover:bg-coffee-50'
                            : 'text-black hover:bg-coffee-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </>
  );
};

export default MainSidebar;
