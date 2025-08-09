
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

const SalesReports = () => {
  const dailySales = [
    { date: '1 ม.ค.', sales: 15000, orders: 45 },
    { date: '2 ม.ค.', sales: 18000, orders: 52 },
    { date: '3 ม.ค.', sales: 22000, orders: 61 },
    { date: '4 ม.ค.', sales: 19000, orders: 48 },
    { date: '5 ม.ค.', sales: 25000, orders: 68 },
    { date: '6 ม.ค.', sales: 28000, orders: 75 },
    { date: '7 ม.ค.', sales: 32000, orders: 82 }
  ];

  const topProducts = [
    { name: 'กาแฟเอสเปรสโซ', sales: 250, revenue: 12500 },
    { name: 'กาแฟคาปูชิโน่', sales: 180, revenue: 10800 },
    { name: 'เค้กช็อกโกแลต', sales: 120, revenue: 8400 },
    { name: 'ชาเขียว', sales: 95, revenue: 4750 },
  ];

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานยอดขาย</h1>
          <p className="text-gray-600">วิเคราะห์ยอดขายและประสิทธิภาพของธุรกิจ</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                ยอดขายวันนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿32,000</div>
              <p className="text-xs text-green-600">+15% จากเมื่อวาน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                คำสั่งซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82</div>
              <p className="text-xs text-green-600">+12% จากเมื่อวาน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                ลูกค้าใหม่
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-blue-600">+8% จากเมื่อวาน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                ค่าเฉลี่ยต่อบิล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿390</div>
              <p className="text-xs text-green-600">+5% จากเมื่อวาน</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Daily Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>ยอดขายรายวัน</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดขาย']} />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Trend */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ออเดอร์`, 'คำสั่งซื้อ']} />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>สินค้าขายดี</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} ชิ้น</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">฿{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

export default SalesReports;
