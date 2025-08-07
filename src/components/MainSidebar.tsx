
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Coffee,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Gift,
  Settings,
  Printer,
  Smartphone,
  Globe,
  Shield,
  CreditCard,
  UserCheck,
  X,
  Home,
  FileText,
  Brain,
  Gamepad2,
  CreditCard as CardIcon,
  Bell
} from 'lucide-react';

interface MainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ isOpen, onClose }) => {
  const navigationItems = [
    {
      title: "หน้าหลัก",
      items: [
        { name: "หน้าแรก", href: "/", icon: Home },
        { name: "แดชบอร์ด", href: "/dashboard", icon: BarChart3 },
        { name: "ขายหน้าร้าน (POS)", href: "/pos", icon: ShoppingCart },
      ]
    },
    {
      title: "จัดการข้อมูล",
      items: [
        { name: "จัดการเมนู", href: "/menu-management", icon: Coffee },
        { name: "จัดการสต็อก", href: "/inventory", icon: Package },
        { name: "รายงาน", href: "/reports", icon: FileText },
        { name: "จัดการสมาชิก", href: "/member-management", icon: Users },
        { name: "โปรโมชั่น", href: "/promotions", icon: Gift },
      ]
    },
    {
      title: "ระบบออนไลน์",
      items: [
        { name: "ระบบออนไลน์", href: "/online-system", icon: Globe },
        { name: "จัดการออเดอร์ออนไลน์", href: "/online-orders", icon: ShoppingCart },
        { name: "แอปลูกค้า", href: "/customer-app", icon: Smartphone },
        { name: "จัดการแอปลูกค้า", href: "/customer-app-management", icon: Smartphone },
        { name: "เชื่อมต่อเดลิเวอรี่", href: "/delivery-integration", icon: Package },
      ]
    },
    {
      title: "ระบบอัจฉริยะ",
      items: [
        { name: "AI Analytics", href: "/ai-analytics", icon: Brain },
        { name: "วิเคราะห์พฤติกรรม", href: "/predictive-analytics", icon: BarChart3 },
        { name: "BI Dashboard", href: "/realtime-bi", icon: BarChart3 },
        { name: "กลุ่มลูกค้า", href: "/customer-segmentation", icon: Users },
        { name: "วิเคราะห์กำไร", href: "/profitability-analysis", icon: CreditCard },
        { name: "แนะนำเมนูอัจฉริยะ", href: "/smart-recommendations", icon: Brain },
        { name: "สต็อกอัจฉริยะ", href: "/intelligent-inventory", icon: Package },
        { name: "รายงานขั้นสูง", href: "/advanced-reports", icon: FileText },
        { name: "การตลาดอัตโนมัติ", href: "/automated-marketing", icon: Gift },
      ]
    },
    {
      title: "ระบบเกมและสมาชิก",
      items: [
        { name: "ระบบเกม", href: "/gamification-system", icon: Gamepad2 },
        { name: "บัตรสมาชิกดิจิทัล", href: "/virtual-loyalty-card", icon: CardIcon },
        { name: "Push Notifications", href: "/push-notifications", icon: Bell },
        { name: "PWA Application", href: "/pwa-application", icon: Smartphone },
      ]
    },
    {
      title: "ตั้งค่า",
      items: [
        { name: "ตั้งค่าร้าน", href: "/shop-settings", icon: Settings },
        { name: "ตั้งค่าเครื่องพิมพ์", href: "/printer-settings", icon: Printer },
        { name: "ตั้งค่ามือถือ", href: "/mobile-settings", icon: Smartphone },
        { name: "ระบบรักษาความปลอดภัย", href: "/security-system", icon: Shield },
        { name: "ระบบการเงิน", href: "/financial-system", icon: CreditCard },
        { name: "จัดการพนักงาน", href: "/staff-management", icon: UserCheck },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0 md:static md:z-auto"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Coffee POS</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)] px-4">
          <div className="py-4 space-y-6">
            {navigationItems.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) => cn(
                        "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={onClose}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
                {section !== navigationItems[navigationItems.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default MainSidebar;
