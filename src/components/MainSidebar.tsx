
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
  Lock,
  Activity,
  Target,
  Zap,
  Palette,
  MousePointer,
  Filter,
  Keyboard,
  WifiOff,
  Archive,
  Image,
  Download,
  Server,
  AlertTriangle,
  ScanLine,
  Camera,
  Navigation,
  LineChart,
  Eye,
  Layers,
  FlaskConical,
  Timer,
  TestTube,
  Navigation2
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
    '/usage-logs', '/role-access', '/access-control', '/delivery-integration',
    '/notifications'
  ];
  
  const menuItems = [
    // POS และ Dashboard หลัก
    { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard' },
    { id: 'pos', label: 'POS', icon: Calculator, path: '/' },
    { id: 'orders', label: 'คิวสั่งซื้อ', icon: Clock, path: '/orders' },
    { id: 'online-orders', label: 'ออเดอร์ออนไลน์', icon: ShoppingCart, path: '/online-orders' },
    { id: 'delivery-integration', label: 'Delivery Integration', icon: Truck, path: '/delivery-integration' },
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
    
    // ระบบรักษาความปลอดภัย
    { id: 'security-recommendations', label: 'ระบบความปลอดภัยที่แนะนำ', icon: Shield, path: '/security-recommendations' },
    { id: 'data-backup', label: 'สำรองข้อมูล', icon: HardDrive, path: '/data-backup' },
    { id: 'auto-backup', label: 'Backup อัตโนมัติ', icon: Database, path: '/auto-backup' },
    { id: 'system-logs', label: 'ระบบ Log', icon: FileCheck, path: '/system-logs' },
    { id: 'usage-logs', label: 'บันทึกการใช้งาน', icon: FileText, path: '/usage-logs' },
    { id: 'role-access', label: 'Role-based Access', icon: Lock, path: '/role-access' },
    { id: 'access-control', label: 'จัดการสิทธิ์การเข้าถึง', icon: Shield, path: '/access-control' },
    
    // 📊 ระบบวิเคราะห์และรายงานขั้นสูง (ใหม่ - สีแดง)
    { id: 'ai-analytics-dashboard', label: 'AI Analytics Dashboard', icon: Brain, path: '/ai-analytics-dashboard', isNew: true },
    { id: 'predictive-analytics', label: 'Predictive Analytics', icon: Activity, path: '/predictive-analytics', isNew: true },
    { id: 'realtime-bi', label: 'Real-time Business Intelligence', icon: LineChart, path: '/realtime-bi', isNew: true },
    { id: 'customer-segmentation', label: 'Customer Segmentation', icon: Target, path: '/customer-segmentation', isNew: true },
    { id: 'profitability-analysis', label: 'Profitability Analysis', icon: TrendingUp, path: '/profitability-analysis', isNew: true },
    
    // 🤖 ระบบ AI และ Automation (ใหม่ - สีแดง)
    { id: 'smart-recommendation', label: 'Smart Recommendation Engine', icon: Brain, path: '/smart-recommendation', isNew: true },
    { id: 'smart-inventory-ai', label: 'Smart Inventory Management', icon: Package, path: '/smart-inventory-ai', isNew: true },
    
    // 📱 ระบบลูกค้าขั้นสูง (ใหม่ - สีแดง)
    { id: 'pwa-app', label: 'Progressive Web App (PWA)', icon: Smartphone, path: '/pwa-app', isNew: true },
    { id: 'gamification', label: 'Gamification System', icon: Target, path: '/gamification', isNew: true },
    { id: 'virtual-loyalty', label: 'Virtual Loyalty Card', icon: CardIcon, path: '/virtual-loyalty', isNew: true },
    { id: 'push-notifications', label: 'Push Notifications', icon: Bell, path: '/push-notifications', isNew: true },
    
    // 🎨 UI/UX Enhancement (ใหม่ - สีแดง)
    { id: 'dark-mode', label: 'Dark Mode', icon: Palette, path: '/dark-mode', isNew: true },
    { id: 'responsive-design', label: 'Responsive Design ที่ดีขึ้น', icon: Smartphone, path: '/responsive-design', isNew: true },
    { id: 'drag-drop', label: 'Drag & Drop Interface', icon: MousePointer, path: '/drag-drop', isNew: true },
    { id: 'advanced-filtering', label: 'Advanced Filtering', icon: Filter, path: '/advanced-filtering', isNew: true },
    { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard, path: '/keyboard-shortcuts', isNew: true },
    
    // ⚡ Performance Optimization (ใหม่ - สีแดง)
    { id: 'offline-first', label: 'Offline-First Architecture', icon: WifiOff, path: '/offline-first', isNew: true },
    { id: 'smart-caching', label: 'Smart Caching', icon: Archive, path: '/smart-caching', isNew: true },
    { id: 'image-optimization', label: 'Image Optimization', icon: Image, path: '/image-optimization', isNew: true },
    { id: 'lazy-loading', label: 'Lazy Loading', icon: Zap, path: '/lazy-loading', isNew: true },
    { id: 'cdn-integration', label: 'CDN Integration', icon: Server, path: '/cdn-integration', isNew: true },
    
    // 🔒 Security Enhancement (ใหม่ - สีแดง)
    { id: 'rbac-advanced', label: 'Role-Based Access Control ขั้นสูง', icon: Shield, path: '/rbac-advanced', isNew: true },
    { id: 'fraud-detection', label: 'Fraud Detection', icon: AlertTriangle, path: '/fraud-detection', isNew: true },
    
    // 📈 Business Intelligence (ใหม่ - สีแดง)
    { id: 'advanced-reporting-new', label: 'Advanced Reporting ใหม่', icon: BarChart3, path: '/advanced-reporting-new', isNew: true },
    { id: 'custom-dashboards', label: 'Custom Dashboards', icon: PieChart, path: '/custom-dashboards', isNew: true },
    { id: 'data-export', label: 'Data Export', icon: Download, path: '/data-export', isNew: true },
    { id: 'automated-reports', label: 'Automated Reports', icon: Clock, path: '/automated-reports', isNew: true },
    { id: 'kpi-monitoring', label: 'KPI Monitoring', icon: Target, path: '/kpi-monitoring', isNew: true },
    
    // 🌐 Integration & API (ใหม่ - สีแดง)
    { id: 'third-party-pos', label: 'Third-Party POS Integration', icon: Calculator, path: '/third-party-pos', isNew: true },
    { id: 'accounting-integration', label: 'Accounting Software Integration', icon: Briefcase, path: '/accounting-integration', isNew: true },
    { id: 'social-media-integration', label: 'Social Media Integration', icon: MessageCircle, path: '/social-media-integration', isNew: true },
    { id: 'email-marketing-tools', label: 'Email Marketing Tools', icon: Mail, path: '/email-marketing-tools', isNew: true },
    { id: 'webhook-support', label: 'Webhook Support', icon: Wifi, path: '/webhook-support', isNew: true },
    
    // 🎯 Marketing Automation (ใหม่ - สีแดง)
    { id: 'ab-testing', label: 'A/B Testing', icon: TestTube, path: '/ab-testing', isNew: true },
    { id: 'customer-journey', label: 'Customer Journey Mapping', icon: Navigation2, path: '/customer-journey', isNew: true },
    { id: 'retention-analytics', label: 'Retention Analytics', icon: UserCheck, path: '/retention-analytics', isNew: true },
    
    // 🍽️ Restaurant-Specific Features (ใหม่ - สีแดง)
    { id: 'kitchen-display', label: 'Kitchen Display System', icon: ChefHat, path: '/kitchen-display', isNew: true },
    { id: 'queue-management', label: 'Queue Management', icon: Users, path: '/queue-management', isNew: true },
    { id: 'recipe-management', label: 'Recipe Management', icon: FlaskConical, path: '/recipe-management', isNew: true },
    { id: 'allergen-tracking', label: 'Allergen Tracking', icon: Eye, path: '/allergen-tracking', isNew: true },
    
    // 📱 Mobile Enhancements (ใหม่ - สีแดง)
    { id: 'barcode-scanner', label: 'Barcode Scanner', icon: ScanLine, path: '/barcode-scanner', isNew: true },
    { id: 'camera-integration', label: 'Camera Integration', icon: Camera, path: '/camera-integration', isNew: true },
    { id: 'gps-integration', label: 'GPS Integration', icon: Navigation, path: '/gps-integration', isNew: true },
    
    // เมนูเดิมที่เหลือ
    { id: 'online-system', label: 'ระบบออนไลน์', icon: Globe, path: '/online-system' },
    { id: 'customer-app-management', label: 'แอปมือถือสำหรับจัดการลูกค้า', icon: UserCog, path: '/customer-app-management' },
    { id: 'advanced', label: 'ระบบขั้นสูง', icon: Cog, path: '/advanced' },
    { id: 'advanced-payment', label: 'ชำระเงินขั้นสูง', icon: CreditCard, path: '/advanced-payment' },
    { id: 'notifications', label: 'แจ้งเตือน', icon: Bell, path: '/notifications' },
    { id: 'kitchen', label: 'ระบบห้องครัว', icon: ChefHat, path: '/kitchen' },
    { id: 'delivery', label: 'ระบบส่งอาหาร', icon: Truck, path: '/delivery' },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Brain, path: '/ai-analytics' },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings' },
    { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports' },
    { id: 'promotions', label: 'โปรโมชั่น', icon: Percent, path: '/promotions' },
    { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings' },
    { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings' },
    { id: 'printer-settings', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer-settings' },
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
                  const isNew = item.isNew || false;
                  
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
                            : isNew
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-black hover:bg-coffee-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {isNew && (
                        <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
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
