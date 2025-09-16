import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import SalesChart from '@/components/charts/SalesChart';
import MemberStatsChart from '@/components/charts/MemberStatsChart';
import { AlertTriangle, Package, TrendingUp, DollarSign, ShoppingCart, Users, Clock, Calendar, CalendarDays, RefreshCw, ArrowUpRight, ArrowDownRight, Activity, Target, Zap, BarChart3, PieChart, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realTimeData, setRealTimeData] = useState(Date.now());
  const [animationKey, setAnimationKey] = useState(0);
  
  const {
    ingredients,
    menuItems,
    getLowStockIngredients,
    calculateMenuItemCost,
    calculateMenuItemProfit,
    calculateMenuItemMargin,
    loading: dataLoading
  } = useSupabaseData();

  const {
    hourlyData,
    dailyData,
    monthlyData,
    genderStats,
    tierStats,
    dashboardStats,
    loading: statsLoading,
    refreshData
  } = useDashboardStats();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(Date.now());
      setAnimationKey(prev => prev + 1);
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  if (dataLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto"></div>
          <p className="mt-4 text-coffee-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const lowStockItems = getLowStockIngredients();
  const totalStockValue = ingredients.reduce((total, ingredient) => 
    total + (ingredient.quantity * ingredient.cost_per_unit), 0
  );

  const bestSellers = menuItems.slice(0, 5).map(item => ({
    ...item,
    cost: calculateMenuItemCost(item.id),
    profit: calculateMenuItemProfit(item.id),
    margin: calculateMenuItemMargin(item.id)
  }));

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="dashboard"
          />
          
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-coffee-800 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-coffee-600" />
                แดชบอร์ดวิเคราะห์ข้อมูล
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              </h1>
              <p className="text-coffee-600 mt-2">
                ข้อมูลแบบเรียลไทม์ • อัปเดตล่าสุด: {formatTime(realTimeData)} • รีเฟรชอัตโนมัติทุก 30 วินาที
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="week">7 วัน</SelectItem>
                  <SelectItem value="month">30 วัน</SelectItem>
                  <SelectItem value="quarter">3 เดือน</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={refreshData} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                รีเฟรช
              </Button>
            </div>
          </div>

          {/* Enhanced Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card key={`sales-${animationKey}`} className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">ยอดขายวันนี้</CardTitle>
                <div className="relative">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">฿{dashboardStats.todaySales.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">{dashboardStats.todayOrders} ออเดอร์</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(dashboardStats.salesGrowthRate)}
                    <span className={`text-sm font-medium ${getTrendColor(dashboardStats.salesGrowthRate)}`}>
                      {dashboardStats.salesGrowthRate > 0 ? '+' : ''}{dashboardStats.salesGrowthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(100, (dashboardStats.todaySales / 10000) * 100)} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">ส่วนลดวันนี้</CardTitle>
                <div className="relative">
                  <Target className="h-4 w-4 text-orange-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800">฿{dashboardStats.todayDiscount.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">ส่วนลดที่ให้</p>
                  <Badge variant="outline" className="text-orange-600">
                    {((dashboardStats.todayDiscount / dashboardStats.todaySales) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(100, (dashboardStats.todayDiscount / dashboardStats.todaySales) * 100)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">ยอดสุทธิวันนี้</CardTitle>
                <div className="relative">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">฿{dashboardStats.todayNetSales.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">หลังหักส่วนลด</p>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">กำไรสุทธิ</span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(100, (dashboardStats.todayNetSales / dashboardStats.todaySales) * 100)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">สมาชิกทั้งหมด</CardTitle>
                <div className="relative">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{dashboardStats.totalMembers.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">+{dashboardStats.newMembersToday} วันนี้</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    เติบโต
                  </Badge>
                </div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="hourly" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hourly" className="gap-2">
                <Clock className="w-4 h-4" />
                รายชั่วโมง
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <Calendar className="w-4 h-4" />
                รายวัน
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                รายเดือน
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hourly" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart
                  data={hourlyData}
                  type="line"
                  title="ยอดขายรายชั่วโมง"
                  description="ยอดขายในวันนี้แบ่งตามชั่วโมง"
                  dataKey="sales"
                  xAxisKey="hour"
                  color="#8b5cf6"
                />
                <SalesChart
                  data={hourlyData}
                  type="bar"
                  title="จำนวนออเดอร์รายชั่วโมง"
                  description="จำนวนออเดอร์ในวันนี้แบ่งตามชั่วโมง"
                  dataKey="orders"
                  xAxisKey="hour"
                  color="#06b6d4"
                />
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart
                  data={dailyData}
                  type="line"
                  title="ยอดขายรายวัน"
                  description="ยอดขาย 30 วันที่ผ่านมา"
                  dataKey="net_sales"
                  xAxisKey="date"
                  color="#10b981"
                />
                <SalesChart
                  data={dailyData}
                  type="bar"
                  title="ส่วนลดรายวัน"
                  description="ส่วนลดที่ให้ 30 วันที่ผ่านมา"
                  dataKey="discount"
                  xAxisKey="date"
                  color="#f59e0b"
                />
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart
                  data={monthlyData}
                  type="bar"
                  title="ยอดขายรายเดือน"
                  description="ยอดขาย 12 เดือนที่ผ่านมา"
                  dataKey="net_sales"
                  xAxisKey="month"
                  color="#10b981"
                />
                <SalesChart
                  data={monthlyData}
                  type="line"
                  title="จำนวนออเดอร์รายเดือน"
                  description="จำนวนออเดอร์ 12 เดือนที่ผ่านมา"
                  dataKey="orders"
                  xAxisKey="month"
                  color="#06b6d4"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การจัดการด่วน</CardTitle>
              <CardDescription>
                เข้าถึงฟีเจอร์สำคัญได้อย่างรวดเร็ว
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/inventory">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Package className="h-6 w-6" />
                    <span className="text-sm">จัดการสต็อก</span>
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">จัดการเมนู</span>
                  </Button>
                </Link>
                <Link to="/members">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">สมาชิก</span>
                  </Button>
                </Link>
                <Link to="/promotions">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">โปรโมชั่น</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;