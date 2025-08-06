
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  AlertTriangle,
  Star,
  Clock,
  BarChart3
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrder: number;
  salesGrowth: number;
  ordersGrowth: number;
  customerGrowth: number;
  lowStockItems: number;
}

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mock data - ในอนาคตจะดึงจากฐานข้อมูล
  const stats: DashboardStats = {
    totalSales: 125430,
    totalOrders: 342,
    totalCustomers: 89,
    averageOrder: 367,
    salesGrowth: 12.5,
    ordersGrowth: 8.2,
    customerGrowth: 15.3,
    lowStockItems: 5
  };

  const recentOrders = [
    { id: '#001', customer: 'คุณสมชาย', amount: 450, status: 'completed', time: '10:30' },
    { id: '#002', customer: 'คุณนารี', amount: 320, status: 'pending', time: '10:25' },
    { id: '#003', customer: 'คุณวิชาญ', amount: 580, status: 'completed', time: '10:20' },
    { id: '#004', customer: 'คุณจันทร์', amount: 220, status: 'cancelled', time: '10:15' },
  ];

  const topProducts = [
    { name: 'กาแฟอเมริกาโน่', sales: 45, revenue: 2250 },
    { name: 'กาแฟลาเต้', sales: 38, revenue: 2280 },
    { name: 'เค้กช็อกโกแลต', sales: 22, revenue: 1320 },
    { name: 'คุกกี้', sales: 18, revenue: 540 },
  ];

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    prefix = '' 
  }: {
    title: string;
    value: number;
    growth?: number;
    icon: any;
    prefix?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}
        </div>
        {growth !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {growth > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={growth > 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(growth)}%
            </span>
            <span className="ml-1">จากเดือนที่แล้ว</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'สำเร็จ';
      case 'pending': return 'รอดำเนินการ';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="แดชบอร์ด"
          page="dashboard"
        />
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="ยอดขายรวม"
                value={stats.totalSales}
                growth={stats.salesGrowth}
                icon={DollarSign}
                prefix="฿"
              />
              <StatCard
                title="จำนวนคำสั่งซื้อ"
                value={stats.totalOrders}
                growth={stats.ordersGrowth}
                icon={ShoppingCart}
              />
              <StatCard
                title="ลูกค้าทั้งหมด"
                value={stats.totalCustomers}
                growth={stats.customerGrowth}
                icon={Users}
              />
              <StatCard
                title="ยอดเฉลี่ย/คำสั่งซื้อ"
                value={stats.averageOrder}
                icon={BarChart3}
                prefix="฿"
              />
            </div>

            {/* Alerts */}
            {stats.lowStockItems > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="flex items-center gap-2 pt-6">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">
                    มีสินค้าคงคลังต่ำ {stats.lowStockItems} รายการ
                  </span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    ดูรายละเอียด
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    คำสั่งซื้อล่าสุด
                  </CardTitle>
                  <CardDescription>
                    คำสั่งซื้อในวันนี้
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.id}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customer} • {order.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">฿{order.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    ดูคำสั่งซื้อทั้งหมด
                  </Button>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    สินค้าขายดี
                  </CardTitle>
                  <CardDescription>
                    สินค้าที่ขายดีที่สุดในสัปดาห์นี้
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              #{index + 1} {product.name}
                            </span>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">฿{product.revenue.toLocaleString()}</p>
                            <p className="text-muted-foreground">{product.sales} ชิ้น</p>
                          </div>
                        </div>
                        <Progress 
                          value={(product.sales / topProducts[0].sales) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    ดูรายงานการขาย
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการด่วน</CardTitle>
                <CardDescription>
                  ฟีเจอร์ที่ใช้บ่อยสำหรับการจัดการร้านค้า
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                    <Package className="h-6 w-6" />
                    <span>เพิ่มสินค้าใหม่</span>
                  </Button>
                  <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                    <Users className="h-6 w-6" />
                    <span>เพิ่มสมาชิกใหม่</span>
                  </Button>
                  <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                    <BarChart3 className="h-6 w-6" />
                    <span>ดูรายงานยอดขาย</span>
                  </Button>
                  <Button className="h-auto p-4 flex-col gap-2" variant="outline">
                    <AlertTriangle className="h-6 w-6" />
                    <span>ตรวจสอบสต๊อก</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
