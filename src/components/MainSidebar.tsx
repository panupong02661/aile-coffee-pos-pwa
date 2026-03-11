
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import UserProfile from './UserProfile';
import POSGeneralSettings from './POSGeneralSettings';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import {
  BarChart3,
  Calculator,
  Clock,
  Table,
  Menu as MenuIcon,
  Users,
  Globe,
  FileText,
  CreditCard,
  Package,
  UserCheck,
  Bell,
  Smartphone,
  ChefHat,
  Truck,
  UserCog,
  Settings,
  Gamepad2,
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
  MapPin,
  DollarSign,
  Receipt,
  Calculator as CalculatorIcon,
  Banknote,
  BookOpen,
  Mail,
  Calendar,
  Smartphone as PhoneIcon,
  Wifi,
  Database,
  HardDrive,
  Ticket,
  MessageSquare,
  Tag,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Eye,
  LucideIcon,
} from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: { id: string; label: string; icon: LucideIcon; path: string }[];
}

const menuGroups: MenuGroup[] = [
  {
    id: 'main',
    label: 'หลัก',
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
    icon: Gamepad2,
    items: [
      { id: 'engagement', label: 'Engagement', icon: Gamepad2, path: '/engagement' },
      { id: 'promotions', label: 'จัดการแอปลูกค้า', icon: Percent, path: '/promotions' },
      { id: 'menu-promotions', label: 'โปรโมชั่นเมนู', icon: Tag, path: '/menu-promotions' },
      { id: 'coupon-management', label: 'คูปอง', icon: Ticket, path: '/coupon-management' },
    ],
  },
  {
    id: 'staff',
    label: 'พนักงาน',
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
    icon: Settings,
    items: [
      { id: 'shop-settings', label: 'ตั้งค่าร้าน', icon: Store, path: '/shop-settings' },
      { id: 'business-settings', label: 'ตั้งค่าธุรกิจ', icon: Building, path: '/business-settings' },
      { id: 'printer-settings', label: 'เครื่องพิมพ์', icon: Printer, path: '/printer-settings' },
      { id: 'security-dashboard', label: 'ความปลอดภัย', icon: Shield, path: '/security-dashboard' },
      { id: 'security-recommendations', label: 'แนะนำความปลอดภัย', icon: Shield, path: '/security-recommendations' },
      { id: 'app-build-guide', label: 'สร้างแอปมือถือ', icon: Smartphone, path: '/app-build-guide' },
    ],
  },
];

const MainSidebar = ({ isOpen, onClose }: MainSidebarProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { hasPermission } = useUserPermissions();

  // Filter menu groups based on user permissions
  const filteredMenuGroups = useMemo(() => {
    return menuGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasPermission(item.id)),
      }))
      .filter(group => group.items.length > 0);
  }, [hasPermission]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const activeGroup = filteredMenuGroups.find((g) =>
      g.items.some((item) => item.path === location.pathname)
    );
    return new Set(activeGroup ? [activeGroup.id] : ['main']);
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  const sidebarWidth = collapsed ? 'w-[56px]' : 'w-64';

  return (
    <TooltipProvider delayDuration={200}>
      {/* Overlay - shown when expanded */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 hidden md:block"
          onClick={() => setCollapsed(true)}
        />
      )}
      {!collapsed && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ease-in-out',
          sidebarWidth,
          // On desktop: always visible
          'md:translate-x-0',
          // On mobile: show/hide via translate
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full bg-card border-r border-border rounded-none flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-foreground truncate">
                Aile Coffee
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* User Profile (hide in collapsed) */}
          {!collapsed && (
            <div className="flex-shrink-0">
              <UserProfile />
            </div>
          )}

          {/* Menu */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className={cn('pb-6', collapsed ? 'p-1' : 'p-2')}>
                <nav className="space-y-0.5">
                  {filteredMenuGroups.map((group) => {
                    const isGroupOpen = openGroups.has(group.id);
                    const GroupIcon = group.icon;
                    const hasActiveItem = group.items.some(
                      (item) => item.path === location.pathname
                    );

                    return (
                      <div key={group.id}>
                        {/* Group header */}
                        {collapsed ? (
                          /* In collapsed mode: clicking icon expands the sidebar */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setCollapsed(false)}
                                className={cn(
                                  'flex items-center justify-center w-full rounded-lg transition-colors text-sm p-2 my-0.5',
                                  hasActiveItem
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                )}
                              >
                                <GroupIcon className="w-4 h-4 flex-shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              <p>{group.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={cn(
                              'flex items-center w-full rounded-lg transition-colors text-sm justify-between px-3 py-2',
                              hasActiveItem
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GroupIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{group.label}</span>
                            </div>
                            <ChevronDown
                              className={cn(
                                'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
                                isGroupOpen && 'rotate-180'
                              )}
                            />
                          </button>
                        )}

                        {/* Group items - only in expanded mode */}
                        {!collapsed && isGroupOpen && (
                          <div className="ml-3 border-l border-border/50 pl-2 mt-0.5 mb-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = location.pathname === item.path;

                              return (
                                <Link
                                  key={item.id}
                                  to={item.path}
                                  onClick={handleMenuClick}
                                  title={item.label}
                                  className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-xs',
                                    isActive
                                      ? 'bg-primary text-primary-foreground font-medium'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                  )}
                                >
                                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* POS General Settings */}
                {!collapsed && (
                  <>
                    <Separator className="my-3" />
                    <POSGeneralSettings />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MainSidebar;
