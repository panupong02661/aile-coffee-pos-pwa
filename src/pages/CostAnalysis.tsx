import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenuCostAnalysis {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit: number;
  profitMargin: number;
  soldCount: number;
  totalRevenue: number;
  totalProfit: number;
}

const CostAnalysis = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAnalysis, setMenuAnalysis] = useState<MenuCostAnalysis[]>([]);
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue'>('profit');

  useEffect(() => {
    loadCostAnalysis();
  }, []);

  const loadCostAnalysis = async () => {
    try {
      setIsLoading(true);

      // Load menu items with cost price
      const menuItemsQuery = await (supabase as any)
        .from('menu_items')
        .select('id, name, price, cost_price')
        .eq('is_active', true);

      if (menuItemsQuery.error) throw menuItemsQuery.error;
      const menuItems = menuItemsQuery.data;

      // Load completed orders
      const ordersQuery = await (supabase as any)
        .from('orders')
        .select('id')
        .in('status', ['completed', 'paid']);

      if (ordersQuery.error) throw ordersQuery.error;

      const completedOrderIds = ordersQuery.data?.map((o: any) => o.id) || [];

      // Load order items from completed orders only
      let orderItems: any[] = [];
      if (completedOrderIds.length > 0) {
        const orderItemsQuery = await (supabase as any)
          .from('order_items')
          .select('menu_item_id, quantity, total_price, order_id')
          .in('order_id', completedOrderIds);

        if (orderItemsQuery.error) throw orderItemsQuery.error;
        orderItems = orderItemsQuery.data || [];
      }

      // Calculate analysis for each menu item
      const analysis = menuItems?.map(item => {
        const itemOrders = orderItems.filter(order => order.menu_item_id === item.id) || [];
        const soldCount = itemOrders.reduce((sum, order) => sum + order.quantity, 0);
        const totalRevenue = itemOrders.reduce((sum, order) => sum + Number(order.total_price), 0);
        const cost = Number(item.cost_price) || 0;
        const profit = Number(item.price) - cost;
        const profitMargin = Number(item.price) > 0 ? (profit / Number(item.price)) * 100 : 0;
        const totalProfit = profit * soldCount;

        return {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          cost,
          profit,
          profitMargin,
          soldCount,
          totalRevenue,
          totalProfit,
        };
      }) || [];

      setMenuAnalysis(analysis);
    } catch (error) {
      console.error('Error loading cost analysis:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลวิเคราะห์ต้นทุนได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const sortedAnalysis = [...menuAnalysis].sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return b.totalProfit - a.totalProfit;
      case 'margin':
        return b.profitMargin - a.profitMargin;
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      default:
        return 0;
    }
  });

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalStats = {
    totalRevenue: menuAnalysis.reduce((sum, item) => sum + item.totalRevenue, 0),
    totalCost: menuAnalysis.reduce((sum, item) => sum + (item.cost * item.soldCount), 0),
    totalProfit: menuAnalysis.reduce((sum, item) => sum + item.totalProfit, 0),
    averageMargin: menuAnalysis.length > 0 
      ? menuAnalysis.reduce((sum, item) => sum + item.profitMargin, 0) / menuAnalysis.length 
      : 0,
  };

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto mt-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary" />
                วิเคราะห์ต้นทุนและกำไร
              </h1>
              <p className="text-gray-600 mt-2">วิเคราะห์กำไร-ขาดทุนแต่ละเมนู และเปรียบเทียบต้นทุนกับราคาขาย</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">รายได้รวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ฿{totalStats.totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">ต้นทุนรวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ฿{totalStats.totalCost.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">กำไรรวม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ฿{totalStats.totalProfit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">อัตรากำไรเฉลี่ย</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {totalStats.averageMargin.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sort Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={sortBy === 'profit' ? 'default' : 'outline'}
                onClick={() => setSortBy('profit')}
              >
                เรียงตามกำไร
              </Button>
              <Button
                variant={sortBy === 'margin' ? 'default' : 'outline'}
                onClick={() => setSortBy('margin')}
              >
                เรียงตามอัตรากำไร
              </Button>
              <Button
                variant={sortBy === 'revenue' ? 'default' : 'outline'}
                onClick={() => setSortBy('revenue')}
              >
                เรียงตามรายได้
              </Button>
            </div>

            {/* Menu Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดแต่ละเมนู</CardTitle>
                <CardDescription>วิเคราะห์ต้นทุนและกำไรของแต่ละรายการ</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">กำลังโหลด...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">เมนู</th>
                          <th className="text-right py-3 px-4">ราคาขาย</th>
                          <th className="text-right py-3 px-4">ต้นทุน</th>
                          <th className="text-right py-3 px-4">กำไร/ชิ้น</th>
                          <th className="text-right py-3 px-4">อัตรากำไร</th>
                          <th className="text-right py-3 px-4">ขายได้</th>
                          <th className="text-right py-3 px-4">รายได้รวม</th>
                          <th className="text-right py-3 px-4">กำไรรวม</th>
                          <th className="text-center py-3 px-4">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAnalysis.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.name}</td>
                            <td className="text-right py-3 px-4">฿{item.price.toFixed(2)}</td>
                            <td className="text-right py-3 px-4">฿{item.cost.toFixed(2)}</td>
                            <td className="text-right py-3 px-4">
                              <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ฿{item.profit.toFixed(2)}
                              </span>
                            </td>
                            <td className={`text-right py-3 px-4 font-semibold ${getProfitMarginColor(item.profitMargin)}`}>
                              {item.profitMargin.toFixed(1)}%
                            </td>
                            <td className="text-right py-3 px-4">{item.soldCount}</td>
                            <td className="text-right py-3 px-4">฿{item.totalRevenue.toFixed(2)}</td>
                            <td className="text-right py-3 px-4">
                              <span className={item.totalProfit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                ฿{item.totalProfit.toFixed(2)}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4">
                              {item.profitMargin >= 50 ? (
                                <Badge className="bg-green-500">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  ดีเยี่ยม
                                </Badge>
                              ) : item.profitMargin >= 30 ? (
                                <Badge className="bg-yellow-500">
                                  <Package className="w-3 h-3 mr-1" />
                                  ปานกลาง
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  ควรปรับ
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>คำแนะนำ</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sortedAnalysis.filter(item => item.profitMargin < 30).map(item => (
                    <li key={item.id} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <span>
                        <strong>{item.name}</strong> มีอัตรากำไรต่ำ ({item.profitMargin.toFixed(1)}%) 
                        แนะนำให้ปรับราคาขายเป็น ฿{(item.cost * 1.5).toFixed(2)} เพื่อให้ได้กำไร 50%
                      </span>
                    </li>
                  ))}
                  {sortedAnalysis.filter(item => item.profitMargin < 30).length === 0 && (
                    <li className="text-green-600 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>ยอดเยี่ยม! ทุกเมนูมีอัตรากำไรที่ดี</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;
