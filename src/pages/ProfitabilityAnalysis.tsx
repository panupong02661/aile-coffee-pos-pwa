
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Shell } from '@/components/Shell';
import { 
  TrendingUp, 
  DollarSign, 
  Package,
  BarChart3,
  PieChart,
  Calculator,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Eye,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';

const ProfitabilityAnalysis = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Product profitability data
  const productProfitability = [
    {
      id: 1,
      name: 'กาแฟลาเต้',
      category: 'เครื่องดื่มร้อน',
      revenue: 45200,
      cost: 18080,
      profit: 27120,
      profitMargin: 60,
      quantity: 904,
      profitPerUnit: 30,
      trend: 'up'
    },
    {
      id: 2,
      name: 'เค้กช็อกโกแลต',
      category: 'ของหวาน',
      revenue: 38500,
      cost: 23100,
      profit: 15400,
      profitMargin: 40,
      quantity: 385,
      profitPerUnit: 40,
      trend: 'up'
    },
    {
      id: 3,
      name: 'กาแฟเอสเพรสโซ่',
      category: 'เครื่องดื่มร้อน',
      revenue: 28900,
      cost: 11560,
      profit: 17340,
      profitMargin: 60,
      quantity: 578,
      profitPerUnit: 30,
      trend: 'stable'
    },
    {
      id: 4,
      name: 'แซนวิชแฮม',
      category: 'อาหาร',
      revenue: 24600,
      cost: 17220,
      profit: 7380,
      profitMargin: 30,
      quantity: 246,
      profitPerUnit: 30,
      trend: 'down'
    },
    {
      id: 5,
      name: 'ชาเขียวเย็น',
      category: 'เครื่องดื่มเย็น',
      revenue: 22800,
      cost: 9120,
      profit: 13680,
      profitMargin: 60,
      quantity: 456,
      profitPerUnit: 30,
      trend: 'up'
    }
  ];

  // Category profitability
  const categoryProfitability = [
    {
      category: 'เครื่องดื่มร้อน',
      revenue: 89500,
      cost: 35800,
      profit: 53700,
      profitMargin: 60,
      products: 12,
      color: '#ef4444'
    },
    {
      category: 'ของหวาน',
      revenue: 54200,
      cost: 32520,
      profit: 21680,
      profitMargin: 40,
      products: 8,
      color: '#f97316'
    },
    {
      category: 'เครื่องดื่มเย็น',
      revenue: 42300,
      cost: 16920,
      profit: 25380,
      profitMargin: 60,
      products: 10,
      color: '#3b82f6'
    },
    {
      category: 'อาหาร',
      revenue: 35800,
      cost: 25060,
      profit: 10740,
      profitMargin: 30,
      products: 6,
      color: '#10b981'
    }
  ];

  // Monthly profit trend
  const monthlyProfitTrend = [
    { month: 'ม.ค.', revenue: 180000, cost: 108000, profit: 72000, margin: 40 },
    { month: 'ก.พ.', revenue: 195000, cost: 117000, profit: 78000, margin: 40 },
    { month: 'มี.ค.', revenue: 210000, cost: 126000, profit: 84000, margin: 40 },
    { month: 'เม.ย.', revenue: 225000, cost: 130500, profit: 94500, margin: 42 },
    { month: 'พ.ค.', revenue: 240000, cost: 136800, profit: 103200, margin: 43 },
    { month: 'มิ.ย.', revenue: 255000, cost: 140250, profit: 114750, margin: 45 },
  ];

  // Cost breakdown
  const costBreakdown = [
    { name: 'วัตถุดิบ', value: 45, color: '#ef4444' },
    { name: 'แรงงาน', value: 25, color: '#f97316' },
    { name: 'ค่าเช่า', value: 15, color: '#eab308' },
    { name: 'สาธารณูปโภค', value: 8, color: '#3b82f6' },
    { name: 'อื่นๆ', value: 7, color: '#10b981' }
  ];

  const totalProfit = productProfitability.reduce((sum, product) => sum + product.profit, 0);
  const totalRevenue = productProfitability.reduce((sum, product) => sum + product.revenue, 0);
  const overallMargin = (totalProfit / totalRevenue) * 100;

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <Shell>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Profitability Analysis</h1>
            </div>
            <p className="text-gray-600">วิเคราะห์กำไรรายสินค้าและหมวดหมู่อย่างละเอียด</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาสนี้</option>
                <option value="year">ปีนี้</option>
              </select>
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              กรองข้อมูล
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กำไรรวม</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">฿{totalProfit.toLocaleString()}</div>
              <div className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% จากเดือนที่แล้ว
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตรากำไรรวม</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMargin.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">เป้าหมาย: 50%</div>
              <Progress value={overallMargin} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สินค้าทำกำไรสูงสุด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{productProfitability[0].name}</div>
              <div className="text-xs text-green-600">
                ฿{productProfitability[0].profit.toLocaleString()} กำไร
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หมวดที่ดีที่สุด</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{categoryProfitability[0].category}</div>
              <div className="text-xs text-green-600">
                {categoryProfitability[0].profitMargin}% อัตรากำไร
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">รายสินค้า</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
            <TabsTrigger value="trends">แนวโน้ม</TabsTrigger>
            <TabsTrigger value="costs">โครงสร้างต้นทุน</TabsTrigger>
          </TabsList>

          {/* Product Profitability */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>การวิเคราะห์กำไรรายสินค้า</CardTitle>
                <CardDescription>รายละเอียดกำไรของแต่ละสินค้า</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">สินค้า</th>
                        <th className="text-right p-3">ยอดขาย</th>
                        <th className="text-right p-3">ต้นทุน</th>
                        <th className="text-right p-3">กำไร</th>
                        <th className="text-right p-3">อัตรากำไร</th>
                        <th className="text-right p-3">จำนวน</th>
                        <th className="text-center p-3">แนวโน้ม</th>
                        <th className="text-center p-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productProfitability.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </td>
                          <td className="text-right p-3 font-medium">
                            ฿{product.revenue.toLocaleString()}
                          </td>
                          <td className="text-right p-3">
                            ฿{product.cost.toLocaleString()}
                          </td>
                          <td className="text-right p-3 font-medium text-green-600">
                            ฿{product.profit.toLocaleString()}
                          </td>
                          <td className="text-right p-3">
                            <Badge variant={product.profitMargin >= 50 ? "default" : product.profitMargin >= 30 ? "secondary" : "destructive"}>
                              {product.profitMargin}%
                            </Badge>
                          </td>
                          <td className="text-right p-3">
                            {product.quantity.toLocaleString()}
                          </td>
                          <td className="text-center p-3">
                            {getTrendIcon(product.trend)}
                          </td>
                          <td className="text-center p-3">
                            {product.profitMargin >= 50 ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : product.profitMargin >= 30 ? (
                              <Eye className="w-4 h-4 text-yellow-500 mx-auto" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Analysis */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>กำไรตามหมวดหมู่</CardTitle>
                  <CardDescription>สัดส่วนกำไรของแต่ละหมวดหมู่</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryProfitability}
                        dataKey="profit"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {categoryProfitability.map((category) => (
                          <Cell key={category.category} fill={category.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>เปรียบเทียบอัตรากำไร</CardTitle>
                  <CardDescription>อัตรากำไรของแต่ละหมวดหมู่</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryProfitability}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="profitMargin" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {categoryProfitability.map((category) => (
                <Card key={category.category}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-semibold">{category.category}</span>
                      </div>
                      <Badge>{category.products} สินค้า</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">ยอดขาย</div>
                        <div className="font-semibold">฿{category.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">กำไร</div>
                        <div className="font-semibold text-green-600">฿{category.profit.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">อัตรากำไร</div>
                        <div className="font-semibold">{category.profitMargin}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profit Trends */}
          <TabsContent value="trends">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>แนวโน้มกำไรรายเดือน</CardTitle>
                  <CardDescription>การเปลี่ยนแปลงของกำไรและอัตรากำไรตลอด 6 เดือน</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={monthlyProfitTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="profit" fill="#10b981" name="กำไร (บาท)" />
                      <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#ef4444" strokeWidth={3} name="อัตรากำไร (%)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">กำไรเพิ่มขึ้น</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">฿42,750</div>
                    <div className="text-sm text-gray-600">ในช่วง 6 เดือน</div>
                    <div className="flex items-center text-sm text-green-600 mt-2">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +59.4% เทียบกับช่วงเดียวกันปีที่แล้ว
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">อัตรากำไรเฉลี่ย</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42.5%</div>
                    <div className="text-sm text-gray-600">ในช่วง 6 เดือน</div>
                    <Progress value={42.5} className="mt-2" />
                    <div className="text-xs text-gray-500 mt-1">เป้าหมาย: 45%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">การเจริญเติบโต</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">+5%</div>
                    <div className="text-sm text-gray-600">อัตรากำไรต่อเดือน</div>
                    <div className="text-xs text-blue-600 mt-2">แนวโน้มดีขึ้นต่อเนื่อง</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cost Structure */}
          <TabsContent value="costs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>โครงสร้างต้นทุน</CardTitle>
                  <CardDescription>การแจกแจงต้นทุนตามประเภท</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={costBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {costBreakdown.map((cost) => (
                          <Cell key={cost.name} fill={cost.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดต้นทุน</CardTitle>
                  <CardDescription>สัดส่วนและจำนวนต้นทุนแต่ละประเภท</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {costBreakdown.map((cost) => (
                    <div key={cost.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: cost.color }}
                        ></div>
                        <span className="font-medium">{cost.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{cost.value}%</div>
                        <div className="text-sm text-gray-500">
                          ฿{((totalRevenue - totalProfit) * cost.value / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default ProfitabilityAnalysis;
