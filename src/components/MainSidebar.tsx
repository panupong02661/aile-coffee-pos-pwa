import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Gift, 
  Printer, 
  Globe, 
  Smartphone, 
  Warehouse,
  Users2,
  CreditCard,
  ShoppingBag,
  Truck,
  UserPlus,
  Cpu,
  Shield,
  Bell,
  TrendingUp,
  Brain,
  Activity,
  Target,
  DollarSign,
  Bot,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

const MainSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems: MenuCategory[] = [
    {
      category: "หลัก",
      items: [
        { icon: Home, label: "หน้าแรก", path: "/" },
        { icon: BarChart3, label: "แดชบอร์ด", path: "/dashboard" },
        { icon: ShoppingCart, label: "ขายหน้าร้าน (POS)", path: "/pos" },
      ]
    },
    {
      category: "จัดการสินค้า",
      items: [
        { icon: Package, label: "จัดการเมนู", path: "/menu" },
        { icon: Warehouse, label: "คลังสินค้า", path: "/inventory" },
      ]
    },
    {
      category: "ลูกค้าและสมาชิก",
      items: [
        { icon: Users, label: "จัดการสมาชิก", path: "/members" },
        { icon: Gift, label: "โปรโมชั่น", path: "/promotions" },
        { icon: Smartphone, label: "ระบบลูกค้า", path: "/customer-system" },
        { icon: UserPlus, label: "สมัครสมาชิก", path: "/member-registration" },
      ]
    },
    {
      category: "รายงานและการวิเคราะห์",
      items: [
        { icon: FileText, label: "รายงานทั่วไป", path: "/reports" },
        { icon: TrendingUp, label: "รายงานขั้นสูง", path: "/advanced-reports" },
      ]
    },
    {
      category: "📊 AI Analytics & BI",
      items: [
        { icon: Brain, label: "AI Analytics Dashboard", path: "/ai-analytics" },
        { icon: Activity, label: "Real-time BI", path: "/realtime-bi" },
        { icon: Target, label: "Predictive Analytics", path: "/predictive-analytics" },
        { icon: Users, label: "Customer Segmentation", path: "/customer-segmentation" },
        { icon: DollarSign, label: "Profitability Analysis", path: "/profitability-analysis" },
      ]
    },
    {
      category: "🤖 AI & Automation",
      items: [
        { icon: Bot, label: "Smart Menu", path: "/smart-menu" },
        { icon: Package, label: "Intelligent Inventory", path: "/intelligent-inventory" },
        { icon: Mail, label: "Automated Marketing", path: "/automated-marketing" },
      ]
    },
    {
      category: "ระบบออนไลน์",
      items: [
        { icon: Globe, label: "ระบบออนไลน์", path: "/online-system" },
        { icon: Smartphone, label: "แอปมือถือลูกค้า", path: "/customer-app" },
        { icon: ShoppingBag, label: "จัดการออเดอร์ออนไลน์", path: "/online-orders" },
        { icon: Truck, label: "ระบบส่งอาหาร", path: "/delivery" },
        { icon: Settings, label: "จัดการแอปลูกค้า", path: "/customer-app-management" },
      ]
    },
    {
      category: "จัดการระบบ",
      items: [
        { icon: Users2, label: "จัดการพนักงาน", path: "/staff" },
        { icon: CreditCard, label: "ระบบการเงิน", path: "/financial" },
        { icon: Printer, label: "ตั้งค่าเครื่องพิมพ์", path: "/printer" },
        { icon: Settings, label: "ตั้งค่าร้าน", path: "/settings" },
      ]
    },
    {
      category: "เทคโนโลยี",
      items: [
        { icon: Cpu, label: "ระบบเทคโนโลยี", path: "/technology" },
        { icon: Shield, label: "ระบบความปลอดภัย", path: "/security" },
        { icon: Smartphone, label: "ตั้งค่ามือถือ", path: "/mobile-settings" },
        { icon: Bell, label: "การแจ้งเตือน", path: "/notifications" },
        { icon: CreditCard, label: "QR Code PromptPay", path: "/qr-promptpay" },
        { icon: Shield, label: "คำแนะนำความปลอดภัย", path: "/security-recommendations" },
      ]
    }
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r bg-gray-100 dark:bg-gray-900 dark:border-gray-800 h-full">
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">เมนูหลัก</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{category.category}</div>
            {category.items.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                  location.pathname === item.path
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                    : "text-gray-700 dark:text-gray-400"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MainSidebar;
