
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
  Printer
} from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard' },
    { id: 'pos', label: 'POS', icon: Calculator, path: '/' },
    { id: 'orders', label: 'คิวสั่งซื้อ', icon: Clock, path: '/orders' },
    { id: 'tables', label: 'จัดการโต๊ะ', icon: Table, path: '/tables' },
    { id: 'menu', label: 'จัดการเมนู', icon: MenuIcon, path: '/menu' },
    { id: 'members', label: 'จัดการสมาชิก', icon: Users, path: '/members' },
    { id: 'online-system', label: 'ระบบออนไลน์', icon: Globe, path: '/online-system' },
    { id: 'customer-mobile-app', label: 'แอปมือถือสำหรับลูกค้า', icon: Smartphone, path: '/customer-mobile-app' },
    { id: 'customer-app-management', label: 'แอปมือถือสำหรับจัดการลูกค้า', icon: UserCog, path: '/customer-app-management' },
    { id: 'advanced', label: 'ระบบขั้นสูง', icon: Cog, path: '/advanced' },
    { id: 'advanced-reports', label: 'รายงานขั้นสูง', icon: FileText, path: '/advanced-reports' },
    { id: 'advanced-payment', label: 'ชำระเงินขั้นสูง', icon: CreditCard, path: '/advanced-payment' },
    { id: 'inventory', label: 'จัดการคลังสินค้า', icon: Package, path: '/inventory' },
    { id: 'staff', label: 'จัดการพนักงาน', icon: UserCheck, path: '/staff' },
    { id: 'notifications', label: 'ระบบแจ้งเตือน', icon: Bell, path: '/notifications' },
    { id: 'kitchen', label: 'ระบบห้องครัว', icon: ChefHat, path: '/kitchen' },
    { id: 'delivery', label: 'ระบบส่งอาหาร', icon: Truck, path: '/delivery' },
    { id: 'crm', label: 'ระบบ CRM', icon: UserCog, path: '/crm' },
    { id: 'ai-analytics', label: 'AI Analytics', icon: Brain, path: '/ai-analytics' },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings' },
    { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports' },
    { id: 'promotions', label: 'โปรโมชั่น', icon: Percent, path: '/promotions' },
    { id: 'permissions', label: 'สิทธิ์การเข้าถึง', icon: Shield, path: '/permissions' },
    { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings' },
    { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings' },
    { id: 'line-notify', label: 'แจ้งเตือน LINE', icon: MessageCircle, path: '/line-notify' },
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
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleMenuClick}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? 'bg-coffee-600 text-white'
                          : 'text-coffee-700 hover:bg-coffee-50'
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
