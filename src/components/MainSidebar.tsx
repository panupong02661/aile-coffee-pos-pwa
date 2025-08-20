
import React from 'react';
import { X, BarChart3, Package, Users, Settings, FileText, Utensils, Gift, ShoppingCart, Clock, Truck, Grid3X3, Menu as MenuIcon, UserCheck, Star, TrendingUp, Shield, Bell, Smartphone, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: BarChart3, label: 'แดชบอร์ด', path: '/dashboard' },
    { icon: Utensils, label: 'POS', path: '/' },
    { icon: Clock, label: 'คำสั่งซื้อ', path: '/orders' },
    { icon: Truck, label: 'ออเดอร์ออนไลน์', path: '/online-orders' },
    { icon: Grid3X3, label: 'จัดการโต๊ะ', path: '/table-management' },
    { icon: MenuIcon, label: 'จัดการเมนู', path: '/menu-management' },
    { icon: Users, label: 'จัดการสมาชิก', path: '/member-management' },
    { icon: UserCheck, label: 'การใดว่าพนักงาน', path: '/staff-management' },
    { icon: Star, label: 'จัดการสลิ่งค่า', path: '/promotions' },
    { icon: Package, label: 'รายงานขายสินค้า', path: '/reports' },
    { icon: TrendingUp, label: 'รายงานขั้นสูง', path: '/advanced-reports' },
    { icon: FileText, label: 'รายงานสินค้า', path: '/inventory' },
    { icon: Gift, label: 'ระบบสมาชิก', path: '/customer-system' },
    { icon: ShoppingCart, label: 'ระบบออนไลน์', path: '/online-system' },
    { icon: Truck, label: 'Delivery Integration', path: '/delivery-integration' },
    { icon: Shield, label: 'ระบบรักษาความปลอดภัย', path: '/security-system' },
    { icon: Bell, label: 'การแจ้งเตือน', path: '/notifications' },
    { icon: Smartphone, label: 'การตั้งค่ามือถือ', path: '/mobile-settings' },
    { icon: Wrench, label: 'ระบบเทคโนโลยี', path: '/technology-system' },
    { icon: Settings, label: 'ตั้งค่าร้าน', path: '/shop-settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-coffee-200 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'w-80' : 'w-64'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coffee-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-coffee-800">เมนูหลัก</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-coffee-600 hover:text-coffee-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "default" : "ghost"}
                  className={`
                    w-full justify-start mb-1 h-10
                    ${active 
                      ? 'bg-coffee-100 text-coffee-800 hover:bg-coffee-200' 
                      : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
                    }
                  `}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MainSidebar;
