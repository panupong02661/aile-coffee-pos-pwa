
import { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SalesChart from '@/components/charts/SalesChart';
import MemberStatsChart from '@/components/charts/MemberStatsChart';
import { SalesCalendar } from '@/components/SalesCalendar';
import { AlertTriangle, Package, TrendingUp, DollarSign, ShoppingCart, Users, Clock, Calendar, CalendarDays, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
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
        'md:ml-[56px]'
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
              <h1 className="text-3xl font-bold text-coffee-800">แดชบอร์ดรายงาน</h1>
              <p className="text-coffee-600 mt-2">ภาพรวมการดำเนินงาน: ยอดขาย, วิธีชำระเงิน, สมาชิก, โปรโมชั่น</p>
            </div>
            <Button onClick={refreshData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              รีเฟรช
            </Button>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยอดขายวันนี้</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{dashboardStats.todaySales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {dashboardStats.todayOrders} ออเดอร์
                  {dashboardStats.salesGrowthRate !== 0 && (
                    <span className={`text-xs ${dashboardStats.salesGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({dashboardStats.salesGrowthRate > 0 ? '+' : ''}{dashboardStats.salesGrowthRate.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ส่วนลดวันนี้</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">฿{dashboardStats.todayDiscount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ส่วนลดที่ให้
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยอดสุทธิวันนี้</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">฿{dashboardStats.todayNetSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  หลังหักส่วนลด
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalMembers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardStats.newMembersToday} วันนี้
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Indicators (Week/Month) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">แนวโน้มยอดขาย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">เทียบ 7 วันก่อน:</span>
                  <span className={`font-medium ${dashboardStats.weekSalesGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardStats.weekSalesGrowthRate >= 0 ? '+' : ''}{dashboardStats.weekSalesGrowthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">เทียบเดือนก่อน:</span>
                  <span className={`font-medium ${dashboardStats.monthSalesGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardStats.monthSalesGrowthRate >= 0 ? '+' : ''}{dashboardStats.monthSalesGrowthRate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ประสิทธิภาพธุรกิจ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AOV:</span>
                  <span className="font-medium">฿{dashboardStats.averageOrderValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ออเดอร์/ลูกค้า:</span>
                  <span className="font-medium">{dashboardStats.ordersPerCustomer.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">อัตราผลตอบแทน:</span>
                  <span className="font-medium">{dashboardStats.customerReturnRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">การมีส่วนร่วม:</span>
                  <span className="font-medium">{dashboardStats.memberEngagementRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">วิธีการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardStats.paymentMethods.map((method) => (
                  <div key={method.method} className="flex justify-between">
                    <span className="text-sm text-muted-foreground capitalize">
                      {method.method === 'cash' ? 'เงินสด' : 
                       method.method === 'promptpay' ? 'PromptPay' : 
                       method.method === 'points' ? 'แต้มสะสม' : method.method}:
                    </span>
                    <span className="font-medium">
                      ฿{method.amount.toLocaleString()} ({method.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">แต้มใช้วันนี้:</span>
                  <span className="font-medium text-purple-600">{dashboardStats.pointsUsageToday.toLocaleString()} แต้ม</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">แต้มใช้เดือนนี้:</span>
                  <span className="font-medium text-purple-600">{dashboardStats.pointsUsageMonth.toLocaleString()} แต้ม</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ช่วงเวลาเร่งด่วน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dashboardStats.peakHours.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลวันนี้</p>
                ) : (
                  dashboardStats.peakHours.map((peak, index) => (
                    <div key={peak.hour} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        #{index + 1} - {peak.hour.toString().padStart(2, '0')}:00:
                      </span>
                      <span className="font-medium">{peak.orders} orders</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Promotions / Coupons */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>โปรโมชั่น / คูปอง</CardTitle>
              <CardDescription>ยอดใช้และประสิทธิภาพของโปรโมชั่น</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardStats.promotionStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ยังไม่มีการใช้โปรโมชั่นในช่วงนี้</p>
                ) : (
                  dashboardStats.promotionStats.map((p) => (
                    <div key={p.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">ใช้ {p.usage_count} ครั้ง</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">ส่วนลดรวม ≈ ฿{p.total_discount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">ผลต่อรายได้ ≈ ฿{p.revenue_impact.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">สรุปประจำเดือน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ยอดขาย:</span>
                  <span className="font-medium">฿{dashboardStats.monthSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ส่วนลด:</span>
                  <span className="font-medium text-orange-600">฿{dashboardStats.monthDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ยอดสุทธิ:</span>
                  <span className="font-medium text-green-600">฿{dashboardStats.monthNetSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">จำนวนออเดอร์:</span>
                  <span className="font-medium">{dashboardStats.monthOrders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">แนวโน้มเทียบเดือนก่อน:</span>
                  <span className={`font-medium ${dashboardStats.monthSalesGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dashboardStats.monthSalesGrowthRate >= 0 ? '+' : ''}{dashboardStats.monthSalesGrowthRate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">สมาชิกใหม่เดือนนี้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{dashboardStats.newMembersMonth}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  เพิ่มขึ้นจากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">มูลค่าสต็อก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">฿{totalStockValue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {ingredients.length} รายการวัตถุดิบ
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Calendar */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesCalendar initialMonthOffset={-1} />
            <SalesCalendar />
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

          {/* Member Statistics - Remove original section */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  แจ้งเตือนสต็อกต่ำ
                  {lowStockItems.length > 0 && (
                    <Badge variant="destructive">{lowStockItems.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  วัตถุดิบที่ใกล้หมดและต้องเติมสต็อก
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่มีวัตถุดิบที่สต็อกต่ำ ✅</p>
                  ) : (
                    <>
                      {lowStockItems.slice(0, 3).map((ingredient) => (
                        <div key={ingredient.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div>
                            <p className="font-medium text-orange-800">{ingredient.name}</p>
                            <p className="text-sm text-orange-600">
                              เหลือ {ingredient.quantity} {ingredient.unit} (ขั้นต่ำ {ingredient.minimum_stock} {ingredient.unit})
                            </p>
                          </div>
                          <Badge variant="destructive">
                            ขาด {ingredient.minimum_stock - ingredient.quantity} {ingredient.unit}
                          </Badge>
                        </div>
                      ))}
                      {lowStockItems.length > 3 && (
                        <div className="text-center">
                          <Link to="/inventory">
                            <Button variant="outline" size="sm">
                              ดูทั้งหมด ({lowStockItems.length} รายการ)
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Best Sellers with Profit */}
            <Card>
              <CardHeader>
                <CardTitle>สินค้าขายดีจริง</CardTitle>
                <CardDescription>
                  สินค้าที่ขายดีที่สุดจากออเดอร์จริง
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats.topProducts.length > 0 ? (
                    dashboardStats.topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium text-green-800">{product.name}</p>
                            <p className="text-sm text-green-600">
                              ขาย {product.quantity} ชิ้น | รายได้ ฿{product.revenue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-700">฿{product.profit.toFixed(2)}</p>
                          <p className="text-sm text-green-600">กำไรประมาณ</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    bestSellers.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="font-medium text-green-800">{item.name}</p>
                          <p className="text-sm text-green-600">
                            ราคา ฿{item.price} | ต้นทุน ฿{item.cost.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-700">฿{item.profit.toFixed(2)}</p>
                          <p className="text-sm text-green-600">{item.margin.toFixed(1)}% margin</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Member Tier Analysis */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-coffee-800 mb-4">การวิเคราะห์สมาชิกเชิงลึก</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>แยกตามระดับสมาชิก</CardTitle>
                  <CardDescription>การกระจายสมาชิกในแต่ละระดับและพฤติกรรมการใช้จ่าย</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardStats.memberTierStats.map((tier) => (
                      <div key={tier.tier} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={tier.tier === 'platinum' ? 'default' : tier.tier === 'gold' ? 'secondary' : 'outline'}
                            className={
                              tier.tier === 'platinum' ? 'bg-purple-600' : 
                              tier.tier === 'gold' ? 'bg-yellow-600' : 
                              'bg-gray-400'
                            }
                          >
                            {tier.tier.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-medium text-blue-800">{tier.count} คน</p>
                            <p className="text-sm text-blue-600">{tier.percentage.toFixed(1)}% ของสมาชิก</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-700">฿{tier.avg_spent.toLocaleString()}</p>
                          <p className="text-sm text-blue-600">เฉลี่ยต่อคน</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <MemberStatsChart genderData={genderStats} tierData={tierStats} />
            </div>
          </div>

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
