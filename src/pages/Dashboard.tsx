
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { mockDashboardStats } from '@/data/mockData';

const Dashboard = () => {
  const stats = mockDashboardStats;

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

  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-coffee-800">แดชบอร์ด</h1>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-coffee-200">
            <CardHeader>
              <CardTitle className="text-coffee-800">ยอดขายรายชั่วโมง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-coffee-400">
                <BarChart3 className="w-16 h-16" />
                <span className="ml-2">กราฟยอดขายรายชั่วโมง</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-coffee-200">
            <CardHeader>
              <CardTitle className="text-coffee-800">สินค้าขายดี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Latte', sales: 25, percent: 35 },
                  { name: 'Americano', sales: 18, percent: 25 },
                  { name: 'Cappuccino', sales: 15, percent: 21 },
                  { name: 'Iced Latte', sales: 12, percent: 17 },
                  { name: 'Green Tea Latte', sales: 8, percent: 11 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-coffee-700">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-coffee-100 rounded-full h-2">
                        <div 
                          className="bg-coffee-500 h-2 rounded-full" 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="text-sm text-coffee-600 w-8">{item.sales}</span>
                    </div>
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
  );
};

export default Dashboard;
