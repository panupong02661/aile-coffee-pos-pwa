import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { mockDashboardStats } from '@/data/mockData';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'month' | 'year'>('day');
  const stats = mockDashboardStats;

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const statCards = [
    {
      title: 'ยอดขายวันนี้',
      value: `฿${stats.todaySales.toLocaleString()}`,
      icon: TrendingUp,
      trend: `+${stats.salesGrowth}%`,
      color: 'text-green-600'
    },
    {
      title: 'จำนวนออเดอร์',
      value: stats.todayOrders,
      icon: ShoppingCart,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'จำนวนลูกค้า',
      value: stats.todayCustomers,
      icon: Users,
      trend: '+8%',
      color: 'text-purple-600'
    },
    {
      title: 'ยอดขายเฉลี่ย',
      value: `฿${Math.round(stats.todaySales / stats.todayOrders)}`,
      icon: BarChart3,
      trend: '+5%',
      color: 'text-orange-600'
    }
  ];

  const getTopSellingItems = (period: 'day' | 'month' | 'year') => {
    const baseItems = [
      { name: 'Latte', sales: 25, percent: 35, revenue: 1875 },
      { name: 'Americano', sales: 18, percent: 25, revenue: 1350 },
      { name: 'Cappuccino', sales: 15, percent: 21, revenue: 1275 },
      { name: 'Iced Latte', sales: 12, percent: 17, revenue: 1020 },
      { name: 'Green Tea Latte', sales: 8, percent: 11, revenue: 680 }
    ];

    if (period === 'month') {
      return baseItems.map(item => ({
        ...item,
        sales: item.sales * 30,
        revenue: item.revenue * 30
      }));
    }

    if (period === 'year') {
      return baseItems.map(item => ({
        ...item,
        sales: item.sales * 365,
        revenue: item.revenue * 365
      }));
    }

    return baseItems;
  };

  const getTopMembers = () => [
    { name: 'คุณสมชาย', purchases: 45, spent: 13500, tier: 'Gold' },
    { name: 'คุณมาลี', purchases: 38, spent: 11400, tier: 'Gold' },
    { name: 'คุณสมศรี', purchases: 32, spent: 9600, tier: 'Silver' },
    { name: 'คุณจิรายุ', purchases: 28, spent: 8400, tier: 'Silver' },
    { name: 'คุณนันทนา', purchases: 25, spent: 7500, tier: 'Silver' }
  ];

  const periodLabels = {
    day: 'ประจำวัน',
    month: 'ประจำเดือน',
    year: 'ประจำปี'
  };

  const topSellingItems = getTopSellingItems(selectedPeriod);
  const topMembers = getTopMembers();

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            title="แดชบอร์ด"
          />

          <div className="mb-6">
            <p className="text-coffee-600 mt-2">ภาพรวมและสถิติการขาย</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-coffee-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-coffee-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-coffee-800">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">{stat.trend}</span> จากเมื่อวาน
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Selling Items */}
            <Card className="border-coffee-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-coffee-800">สินค้าขายดี</CardTitle>
                  <div className="flex space-x-2">
                    {(['day', 'month', 'year'] as const).map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        className={`${
                          selectedPeriod === period
                            ? 'bg-coffee-600 hover:bg-coffee-700 text-white'
                            : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                        }`}
                      >
                        {periodLabels[period]}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-coffee-600 pb-2 border-b border-coffee-200">
                    <span>อันดับ</span>
                    <span>สินค้า</span>
                    <span>ยอดขาย</span>
                    <span>รายได้</span>
                  </div>
                  {topSellingItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-coffee-600 font-medium">#{index + 1}</span>
                      <span className="text-sm text-coffee-700">{item.name}</span>
                      <span className="text-sm text-coffee-600">{item.sales.toLocaleString()}</span>
                      <span className="text-sm font-medium text-coffee-600">฿{item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Members */}
            <Card className="border-coffee-200">
              <CardHeader>
                <CardTitle className="text-coffee-800">สมาชิกซื้อสูงสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-coffee-600 pb-2 border-b border-coffee-200">
                    <span>อันดับ</span>
                    <span>ชื่อ</span>
                    <span>ครั้ง</span>
                    <span>ยอดรวม</span>
                  </div>
                  {topMembers.map((member, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-coffee-600 font-medium">#{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-coffee-700">{member.name}</span>
                        <span className="text-xs text-coffee-500">{member.tier}</span>
                      </div>
                      <span className="text-sm text-coffee-600">{member.purchases}</span>
                      <span className="text-sm font-medium text-coffee-600">฿{member.spent.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="border-coffee-200">
            <CardHeader>
              <CardTitle className="text-coffee-800">ออเดอร์ล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: '001', time: '14:32', items: 'Latte, Croissant', total: 105, status: 'เสร็จสิ้น' },
                  { id: '002', time: '14:28', items: 'Americano x2', total: 90, status: 'เสร็จสิ้น' },
                  { id: '003', time: '14:25', items: 'Cappuccino, Chocolate Cake', total: 140, status: 'เสร็จสิ้น' },
                  { id: '004', time: '14:20', items: 'Iced Latte, Green Tea Latte', total: 125, status: 'เสร็จสิ้น' }
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-sm text-coffee-600">#{order.id}</span>
                      <span className="text-sm text-coffee-500">{order.time}</span>
                      <span className="text-sm text-coffee-700">{order.items}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-coffee-600">฿{order.total}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
