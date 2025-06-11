
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Calculator, 
  Clock,
  Table,
  Menu as MenuIcon,
  Users,
  Award,
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
    { id: 'points', label: 'จัดการแต้ม', icon: Award, path: '/points' },
    { id: 'advanced', label: 'ระบบขั้นสูง', icon: Cog, path: '/advanced' },
    { id: 'advanced-reports', label: 'รายงานขั้นสูง', icon: FileText, path: '/advanced-reports' },
    { id: 'advanced-payment', label: 'ชำระเงินขั้นสูง', icon: CreditCard, path: '/advanced-payment' },
    { id: 'inventory', label: 'จัดการคลังสินค้า', icon: Package, path: '/inventory' },
    { id: 'staff', label: 'จัดการพนักงาน', icon: UserCheck, path: '/staff' },
    { id: 'notifications', label: 'ระบบแจ้งเตือน', icon: Bell, path: '/notifications' },
    { id: 'mobile-app', label: 'แอปมือถือ', icon: Smartphone, path: '/mobile-app' },
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
    { id: 'printer', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer' },
  ];

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
      <div className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Card className="h-full border-coffee-200 rounded-none md:rounded-lg">
          <div className="p-4 border-b border-coffee-200">
            <h2 className="text-lg font-semibold text-coffee-800">Aile Coffee</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-2">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
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
