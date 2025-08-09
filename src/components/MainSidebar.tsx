
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coffee,
  X,
  ChevronRight,
  Home,
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Package,
  Printer,
  Smartphone,
  Bell,
  Globe,
  Shield,
  Cpu,
  Store,
  UserPlus,
  Calculator,
  Table,
  TrendingUp,
  Package2,
  UserCheck,
  FileSpreadsheet,
  History,
  Warehouse,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Initialize expanded sections based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpanded = new Set<string>();

    if (['/orders', '/tables'].includes(currentPath)) {
      newExpanded.add('operations');
    } else if (['/sales-reports', '/product-reports', '/customer-analytics', '/inventory-reports', '/financial-reports'].includes(currentPath)) {
      newExpanded.add('reports');
    } else if (['/inventory', '/stock-movement'].includes(currentPath)) {
      newExpanded.add('inventory');
    } else if (['/shop-settings', '/staff-management', '/system-settings'].includes(currentPath)) {
      newExpanded.add('settings');
    } else if (['/online-system', '/customer-system', '/security-system', '/technology-system'].includes(currentPath)) {
      newExpanded.add('systems');
    }

    setExpandedSections(newExpanded);
  }, [location.pathname]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const menuSections = [
    {
      id: 'main',
      title: 'หลัก',
      items: [
        { id: 'pos', label: 'POS', icon: Calculator, path: '/', badge: null },
        { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard', badge: null },
      ]
    },
    {
      id: 'operations',
      title: 'การดำเนินงาน',
      items: [
        { id: 'orders', label: 'คิวสั่งซื้อ', icon: ShoppingCart, path: '/orders', badge: 'Hot' },
        { id: 'tables', label: 'จัดการโต๊ะ', icon: Table, path: '/tables', badge: null },
        { id: 'menu', label: 'จัดการเมนู', icon: Package, path: '/menu-management', badge: null },
        { id: 'promotions', label: 'โปรโมชั่น', icon: TrendingUp, path: '/promotions', badge: null },
      ]
    },
    {
      id: 'members',
      title: 'สมาชิก',
      items: [
        { id: 'members', label: 'สมาชิก', icon: Users, path: '/member-management', badge: null },
        { id: 'member-registration', label: 'ลงทะเบียน', icon: UserPlus, path: '/member-registration', badge: null },
      ]
    },
    {
      id: 'reports',
      title: 'รายงาน',
      items: [
        { id: 'sales-reports', label: 'รายงานยอดขาย', icon: TrendingUp, path: '/sales-reports', badge: null },
        { id: 'product-reports', label: 'รายงานสินค้า', icon: Package2, path: '/product-reports', badge: null },
        { id: 'customer-analytics', label: 'การวิเคราะห์ลูกค้า', icon: UserCheck, path: '/customer-analytics', badge: null },
        { id: 'inventory-reports', label: 'รายงานคลังสินค้า', icon: FileSpreadsheet, path: '/inventory-reports', badge: 'New' },
        { id: 'financial-reports', label: 'รายงานการเงิน', icon: CreditCard, path: '/financial-reports', badge: 'New' },
        { id: 'reports', label: 'รายงานทั้งหมด', icon: FileText, path: '/reports', badge: null },
      ]
    },
    {
      id: 'inventory',
      title: 'คลังสินค้า',
      items: [
        { id: 'inventory', label: 'วัตถุดิบ', icon: Warehouse, path: '/inventory', badge: null },
        { id: 'stock-movement', label: 'ประวัติการเคลื่อนไหว', icon: History, path: '/stock-movement', badge: 'New' },
      ]
    },
    {
      id: 'settings',
      title: 'การตั้งค่า',
      items: [
        { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings', badge: null },
        { id: 'staff-management', label: 'จัดการพนักงาน', icon: Users, path: '/staff-management', badge: null },
        { id: 'system-settings', label: 'การตั้งค่าระบบ', icon: Settings, path: '/system-settings', badge: 'New' },
        { id: 'printer-settings', label: 'ตั้งค่าเครื่องพิมพ์', icon: Printer, path: '/printer-settings', badge: null },
        { id: 'mobile-settings', label: 'ตั้งค่ามือถือ', icon: Smartphone, path: '/mobile-settings', badge: null },
        { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell, path: '/notifications', badge: null },
      ]
    },
    {
      id: 'systems',
      title: 'ระบบขั้นสูง',
      items: [
        { id: 'online-system', label: 'ระบบออนไลน์', icon: Globe, path: '/online-system', badge: null },
        { id: 'customer-system', label: 'ระบบลูกค้า', icon: Users, path: '/customer-system', badge: null },
        { id: 'security-system', label: 'ระบบรักษาความปลอดภัย', icon: Shield, path: '/security-system', badge: null },
        { id: 'technology-system', label: 'ระบบเทคโนโลยี', icon: Cpu, path: '/technology-system', badge: null },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-coffee-200 z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coffee-200">
          <div className="flex items-center space-x-2">
            <Coffee className="w-6 h-6 text-coffee-600" />
            <h2 className="text-lg font-semibold text-coffee-800">ระบบจัดการร้าน</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-coffee-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-coffee-600" />
          </button>
        </div>

        {/* Menu */}
        <div className="p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-coffee-600 hover:text-coffee-800 transition-colors mb-3"
              >
                <span>{section.title}</span>
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.has(section.id) ? 'rotate-90' : ''
                  }`}
                />
              </button>
              
              {(expandedSections.has(section.id) || section.id === 'main') && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
                          active
                            ? 'bg-coffee-600 text-white shadow-md'
                            : 'text-coffee-700 hover:bg-coffee-50 hover:text-coffee-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${
                            active ? 'text-white' : 'text-coffee-500 group-hover:text-coffee-600'
                          }`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === 'Hot' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-coffee-200 bg-coffee-50">
          <Card className="p-3">
            <div className="text-center">
              <Coffee className="w-8 h-8 mx-auto text-coffee-600 mb-2" />
              <p className="text-sm font-medium text-coffee-800">ระบบ POS</p>
              <p className="text-xs text-coffee-600">เวอร์ชั่น 2.1.0</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MainSidebar;
