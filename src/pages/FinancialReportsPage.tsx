import { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, TrendingDown, Download, PieChart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  orderCount: number;
  averageOrderValue: number;
  dailyData: any[];
  categoryData: any[];
  expenseData: any[];
}

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  order_number: string;
}

const FinancialReportsPage = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    orderCount: 0,
    averageOrderValue: 0,
    dailyData: [],
    categoryData: [],
    expenseData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const { toast } = useToast();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // ดึงข้อมูลรายได้จากออเดอร์
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (ordersError) throw ordersError;

      // Since expenses table doesn't exist, we'll simulate expense data
      const mockExpenses = [
        { amount: 5000, expense_date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), category: 'วัตถุดิบ' },
        { amount: 2000, expense_date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), category: 'ค่าไฟฟ้า' },
        { amount: 3000, expense_date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), category: 'เช่าร้าน' },
        { amount: 1500, expense_date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), category: 'เงินเดือน' },
      ];

      // คำนวณข้อมูลทางการเงิน
      const totalRevenue = (orders as Order[])?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalExpenses = mockExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const netProfit = totalRevenue - totalExpenses;
      const orderCount = orders?.length || 0;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // สร้างข้อมูลรายวัน
      const dailyMap = new Map();
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        dailyMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0, profit: 0, orders: 0 });
      }

      (orders as Order[])?.forEach(order => {
        const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
        if (dailyMap.has(dateStr)) {
          const day = dailyMap.get(dateStr);
          day.revenue += Number(order.total_amount);
          day.orders += 1;
          day.profit = day.revenue - day.expenses;
        }
      });

      mockExpenses.forEach(expense => {
        const dateStr = expense.expense_date;
        if (dailyMap.has(dateStr)) {
          const day = dailyMap.get(dateStr);
          day.expenses += Number(expense.amount);
          day.profit = day.revenue - day.expenses;
        }
      });

      const dailyData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // ข้อมูลค่าใช้จ่ายตามหมวดหมู่
      const expenseCategoryMap = new Map();
      mockExpenses.forEach(expense => {
        const categoryName = expense.category || 'อื่นๆ';
        if (!expenseCategoryMap.has(categoryName)) {
          expenseCategoryMap.set(categoryName, { name: categoryName, value: 0 });
        }
        expenseCategoryMap.get(categoryName).value += Number(expense.amount);
      });

      const expenseData = Array.from(expenseCategoryMap.values());

      // ข้อมูลหมวดหมู่สินค้า (จำลอง)
      const categoryData = [
        { name: 'เครื่องดื่มร้อน', value: totalRevenue * 0.4 },
        { name: 'เครื่องดื่มเย็น', value: totalRevenue * 0.3 },
        { name: 'ขนม', value: totalRevenue * 0.2 },
        { name: 'อื่นๆ', value: totalRevenue * 0.1 }
      ];

      setFinancialData({
        totalRevenue,
        totalExpenses,
        netProfit,
        orderCount,
        averageOrderValue,
        dailyData,
        categoryData,
        expenseData
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลทางการเงินได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานทางการเงิน</h1>
            <p className="text-gray-600">วิเคราะห์รายได้ ค่าใช้จ่าย และกำไรของธุรกิจ</p>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
                <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
                <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                <SelectItem value="thisYear">ปีนี้</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                รายได้รวม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">฿{financialData.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                ค่าใช้จ่ายรวม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">฿{financialData.totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                กำไรสุทธิ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ฿{financialData.netProfit.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                จำนวนออเดอร์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialData.orderCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <PieChart className="w-4 h-4 mr-2" />
                ค่าเฉลี่ยต่อบิล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{financialData.averageOrderValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="revenue">รายได้</TabsTrigger>
            <TabsTrigger value="expenses">ค่าใช้จ่าย</TabsTrigger>
            <TabsTrigger value="profit">กำไร</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>แนวโน้มรายได้และค่าใช้จ่าย</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, '']} />
                      <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="รายได้" />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="ค่าใช้จ่าย" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>กำไรรายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'กำไร']} />
                      <Bar dataKey="profit" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>รายได้ตามหมวดหมู่สินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie
                      data={financialData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financialData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'รายได้']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ค่าใช้จ่ายตามหมวดหมู่</CardTitle>
              </CardHeader>
              <CardContent>
                {financialData.expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={financialData.expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {financialData.expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'ค่าใช้จ่าย']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลค่าใช้จ่ายในช่วงเวลานี้
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>อัตรากำไร</CardTitle>
                  <CardDescription>
                    อัตรากำไรรวม: {financialData.totalRevenue > 0 ? ((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1) : 0}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'กำไร']} />
                      <Bar dataKey="profit" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">วันที่กำไรสูงสุด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {financialData.dailyData.length > 0 ? (
                      (() => {
                        const maxProfitDay = financialData.dailyData.reduce((max, day) => 
                          day.profit > max.profit ? day : max
                        );
                        return (
                          <div>
                            <p className="text-sm text-gray-600">{maxProfitDay.date}</p>
                            <p className="text-2xl font-bold text-green-600">
                              ฿{maxProfitDay.profit.toLocaleString()}
                            </p>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-gray-500">ไม่มีข้อมูล</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">กำไรเฉลี่ยต่อวัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ฿{financialData.dailyData.length > 0 ? 
                        (financialData.dailyData.reduce((sum, day) => sum + day.profit, 0) / financialData.dailyData.length).toLocaleString() 
                        : '0'
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">วันที่มีกำไร</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {financialData.dailyData.filter(day => day.profit > 0).length}
                    </p>
                    <p className="text-sm text-gray-600">
                      จาก {financialData.dailyData.length} วัน
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default FinancialReportsPage;
