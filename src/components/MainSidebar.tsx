
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Calculator, 
  BarChart3, 
  Menu as MenuIcon, 
  Users, 
  FileText, 
  Settings,
  Truck,
  Bell
} from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'pos', label: 'POS', icon: Calculator, path: '/' },
    { id: 'dashboard', label: 'แดชบอร์ด', icon: BarChart3, path: '/dashboard' },
    { id: 'menu', label: 'จัดการเมนู', icon: MenuIcon, path: '/menu' },
    { id: 'members', label: 'สมาชิก', icon: Users, path: '/members' },
    { id: 'reports', label: 'รายงาน', icon: FileText, path: '/reports' },
    { id: 'delivery-integration', label: 'ผูกระบบ Delivery', icon: Truck, path: '/delivery-integration' },
    { id: 'notification-settings', label: 'การแจ้งเตือน', icon: Bell, path: '/notification-settings' },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, path: '/settings' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <Card className="fixed left-0 top-0 w-64 h-full border-coffee-200 z-50 rounded-none">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-coffee-800 mb-4">เมนูหลัก</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-coffee-600 text-white'
                      : 'text-coffee-700 hover:bg-coffee-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </Card>
    </>
  );
};

export default MainSidebar;
