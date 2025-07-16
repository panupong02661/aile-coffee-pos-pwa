import React, { useState } from 'react';
import { LoginSystem } from './LoginSystem';
import { POSInterface } from './POSInterface';
import { StockManagement } from './StockManagement';
import { LoyaltyProgram } from './LoyaltyProgram';
import { DiscountManager } from './DiscountManager';
import { PaymentHandling } from './PaymentHandling';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calculator, 
  Package, 
  Users, 
  Percent, 
  CreditCard, 
  BarChart3,
  Upload,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  role: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addOns: Array<{ id: string; name: string; price: number }>;
}

type POSView = 'pos' | 'stock' | 'loyalty' | 'discount' | 'payment' | 'dashboard' | 'reports' | 'upload';

const MainPOSSystem: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<POSView>('pos');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  if (!user) {
    return <LoginSystem onLogin={setUser} />;
  }

  const menuItems = [
    { id: 'pos' as POSView, label: 'POS Interface', icon: Calculator },
    { id: 'stock' as POSView, label: 'Stock Management', icon: Package },
    { id: 'loyalty' as POSView, label: 'Loyalty Program', icon: Users },
    { id: 'discount' as POSView, label: 'Discount Management', icon: Percent },
    { id: 'payment' as POSView, label: 'Payment Handling', icon: CreditCard },
    { id: 'dashboard' as POSView, label: 'Dashboard & Reports', icon: BarChart3 },
    { id: 'upload' as POSView, label: 'Menu Image Upload', icon: Upload },
    { id: 'reports' as POSView, label: 'Receipt Printing', icon: FileText },
  ];

  const getTotalAmount = () => {
    return currentOrder.reduce((total, item) => {
      const itemTotal = (item.price + item.addOns.reduce((sum, addon) => sum + addon.price, 0)) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const handleOrderComplete = (order: OrderItem[]) => {
    setCurrentOrder(order);
    setCurrentView('payment');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'pos':
        return <POSInterface onOrderComplete={handleOrderComplete} />;
      case 'stock':
        return <StockManagement />;
      case 'loyalty':
        return <LoyaltyProgram />;
      case 'discount':
        return <DiscountManager />;
      case 'payment':
        return (
          <PaymentHandling 
            order={currentOrder} 
            total={getTotalAmount()}
            onPaymentComplete={() => {
              setCurrentOrder([]);
              setCurrentView('pos');
            }}
          />
        );
      case 'dashboard':
        return <DashboardView />;
      case 'upload':
        return <MenuImageUpload />;
      case 'reports':
        return <ReceiptPrinting />;
      default:
        return <POSInterface onOrderComplete={handleOrderComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r">
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary">POS System</h1>
          <p className="text-sm text-muted-foreground">ยินดีต้อนรับ, {user.name}</p>
        </div>
        
        <nav className="px-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setUser(null)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
};

// Placeholder components for remaining features
const DashboardView: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Dashboard & Reports</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">ยอดขายวันนี้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">฿12,450</div>
          <p className="text-sm text-muted-foreground">+15% จากเมื่อวาน</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">จำนวนออเดอร์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89</div>
          <p className="text-sm text-muted-foreground">+8% จากเมื่อวาน</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">ลูกค้าใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-sm text-muted-foreground">+20% จากเมื่อวาน</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">เมนูขายดี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">Americano</div>
          <p className="text-sm text-muted-foreground">24 แก้ว</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const MenuImageUpload: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Menu Image Upload</h2>
    <Card>
      <CardHeader>
        <CardTitle>อัพโหลดรูปภาพเมนู</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          <Button className="mt-4">เลือกไฟล์</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default MainPOSSystem;

const ReceiptPrinting: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Receipt Printing</h2>
    <Card>
      <CardHeader>
        <CardTitle>การตั้งค่าใบเสร็จ</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">กำลังพัฒนาฟีเจอร์การพิมพ์ใบเสร็จในรูปแบบ PDF</p>
      </CardContent>
    </Card>
  </div>
);