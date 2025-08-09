
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { AlertTriangle, Package, TrendingDown, TrendingUp, Download, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const InventoryReportsPage = () => {
  const { ingredients, stockMovements, loading, getLowStockIngredients } = useSupabaseData();

  const lowStockItems = getLowStockIngredients();
  const totalValue = ingredients.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);
  const activeIngredients = ingredients.filter(item => item.is_active);

  // สถิติการเคลื่อนไหวใน 30 วันที่ผ่านมา
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentMovements = stockMovements.filter(
    movement => new Date(movement.created_at) >= thirtyDaysAgo
  );

  const inboundMovements = recentMovements.filter(
    m => ['purchase', 'adjustment'].includes(m.movement_type) && m.quantity_change > 0
  ).reduce((sum, m) => sum + m.quantity_change, 0);

  const outboundMovements = recentMovements.filter(
    m => ['usage', 'waste'].includes(m.movement_type) || m.quantity_change < 0
  ).reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

  // ข้อมูลสำหรับกราฟ
  const categoryData = ingredients.reduce((acc: any, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { category, count: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].value += item.quantity * item.cost_per_unit;
    return acc;
  }, {});

  const chartData = Object.values(categoryData);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const turnoverData = ingredients.map(item => {
    const itemMovements = recentMovements.filter(m => m.ingredient_id === item.id);
    const usage = itemMovements
      .filter(m => m.movement_type === 'usage')
      .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);
    
    const turnoverRate = item.quantity > 0 ? (usage / item.quantity) * 100 : 0;
    
    return {
      name: item.name,
      turnoverRate: Math.round(turnoverRate),
      stock: item.quantity,
      category: item.category
    };
  }).sort((a, b) => b.turnoverRate - a.turnoverRate).slice(0, 10);

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานคลังสินค้า</h1>
            <p className="text-gray-600">วิเคราะห์และติดตามประสิทธิภาพการจัดการคลังสินค้า</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="w-4 h-4 mr-2" />
                จำนวนวัตถุดิบ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeIngredients.length}</div>
              <p className="text-xs text-gray-600">รายการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                มูลค่าคลังสินค้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{totalValue.toLocaleString()}</div>
              <p className="text-xs text-gray-600">บาท</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                รับเข้า (30 วัน)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inboundMovements.toLocaleString()}</div>
              <p className="text-xs text-gray-600">หน่วย</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                สินค้าใกล้หมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
              <p className="text-xs text-red-600">รายการ</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
            <TabsTrigger value="turnover">อัตราการหมุนเวียน</TabsTrigger>
            <TabsTrigger value="alerts">การแจ้งเตือน</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>มูลค่าตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'มูลค่า']} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สัดส่วนจำนวนตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-4">
              {Object.values(categoryData).map((category: any, index) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{category.category}</span>
                      <Badge variant="outline">{category.count} รายการ</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">มูลค่ารวม</span>
                      <span className="font-semibold">฿{category.value.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(category.value / totalValue) * 100} 
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {((category.value / totalValue) * 100).toFixed(1)}% ของมูลค่าทั้งหมด
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="turnover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>อัตราการหมุนเวียนสินค้า (Top 10)</CardTitle>
                <CardDescription>วัตถุดิบที่มีการใช้งานสูงสุดใน 30 วันที่ผ่านมา</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {turnoverData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.turnoverRate}%</p>
                        <p className="text-sm text-gray-600">คงเหลือ {item.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  สินค้าใกล้หมด
                </CardTitle>
                <CardDescription>วัตถุดิบที่มีจำนวนต่ำกว่าจุดสั่งซื้อ</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">ไม่มีสินค้าใกล้หมด</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-red-200 rounded bg-red-50">
                        <div>
                          <p className="font-medium text-red-800">{item.name}</p>
                          <p className="text-sm text-red-600">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {item.quantity} {item.unit}
                          </Badge>
                          <p className="text-xs text-red-600 mt-1">
                            ขั้นต่ำ: {item.minimum_stock} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default InventoryReportsPage;
