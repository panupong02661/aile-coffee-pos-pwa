
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Coffee, 
  Package,
  Users, 
  Settings, 
  Gift,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MainSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'ขายหน้าร้าน', href: '/', icon: ShoppingCart },
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { name: 'จัดการเมนู', href: '/menu', icon: Coffee },
    { name: 'จัดการคลัง', href: '/inventory', icon: Package },
    { name: 'สมาชิก', href: '/members', icon: Users },
    { name: 'โปรโมชั่น', href: '/promotions', icon: Gift },
    { name: 'ตั้งค่าร้าน', href: '/shop-settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-coffee-800">ระบบ POS</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-coffee-100 text-coffee-800 border-r-2 border-coffee-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default MainSidebar;
