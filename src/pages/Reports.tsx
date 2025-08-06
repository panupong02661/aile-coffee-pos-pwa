
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Star,
  Clock,
  BarChart3,
  FileText,
  Printer
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import SalesReportChart from '@/components/reports/SalesReportChart';
import ProductReportTable from '@/components/reports/ProductReportTable';
import CustomerAnalytics from '@/components/reports/CustomerAnalytics';

const Reports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedDateRange, setSelectedDateRange] = useState('today');

  const salesData = [
    { date: '01/01', sales: 15000, orders: 45 },
    { date: '02/01', sales: 18000, orders: 52 },
    { date: '03/01', sales: 22000, orders: 58 },
    { date: '04/01', sales: 19000, orders: 48 },
    { date: '05/01', sales: 25000, orders: 65 },
    { date: '06/01', sales: 28000, orders: 72 },
    { date: '07/01', sales: 32000, orders: 85 },
  ];

  const topSellingProducts = [
    { name: 'กาแฟอเมริกาโน่', quantity: 145, revenue: 7250, growth: 15.2 },
    { name: 'กาแฟลาเต้', quantity: 128, revenue: 7680, growth: 12.8 },
    { name: 'คาปูชิโน่', quantity: 95, revenue: 6175, growth: -2.3 },
    { name: 'เอสเปรสโซ', quantity: 87, revenue: 4350, growth: 8.7 },
    { name: 'เค้กช็อกโกแลต', quantity: 65, revenue: 3900, growth: 22.1 },
  ];

  const customerSegments = [
    { segment: 'สมาชิกแพลตินัม', count: 15, percentage: 5.2, avgSpend: 1250 },
    { segment: 'สมาชิกทอง', count: 45, percentage: 15.6, avgSpend: 850 },
    { segment: 'สมาชิกเงิน', count: 128, percentage: 44.3, avgSpend: 450 },
    { segment: 'ลูกค้าทั่วไป', count: 101, percentage: 34.9, avgSpend: 320 },
  ];

  const ReportCard = ({ 
    title, 
    value, 
    change, 
    changeType,
    icon: Icon, 
    prefix = '',
    suffix = ''
  }: {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative';
    icon: any;
    prefix?: string;
    suffix?: string;
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
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1">จากช่วงก่อนหน้า</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
          title="รายงาน"
          page="other"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Date Range Selector */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      ช่วงเวลา
                    </CardTitle>
                    <CardDescription>
                      เลือกช่วงเวลาสำหรับดูรายงาน
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      ส่งออก Excel
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      พิมพ์รายงาน
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['today', '7days', '30days', '90days', 'custom'].map((range) => (
                    <Button
                      key={range}
                      variant={selectedDateRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDateRange(range)}
                    >
                      {range === 'today' && 'วันนี้'}
                      {range === '7days' && '7 วันที่ผ่านมา'}
                      {range === '30days' && '30 วันที่ผ่านมา'}
                      {range === '90days' && '90 วันที่ผ่านมา'}
                      {range === 'custom' && 'กำหนดเอง'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sales">รายงานการขาย</TabsTrigger>
                <TabsTrigger value="products">รายงานสินค้า</TabsTrigger>
                <TabsTrigger value="customers">รายงานลูกค้า</TabsTrigger>
                <TabsTrigger value="inventory">รายงานสต๊อก</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sales" className="space-y-6">
                {/* Sales Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <ReportCard
                    title="ยอดขายรวม"
                    value={125430}
                    change={12.5}
                    changeType="positive"
                    icon={DollarSign}
                    prefix="฿"
                  />
                  <ReportCard
                    title="จำนวนคำสั่งซื้อ"
                    value={342}
                    change={8.2}
                    changeType="positive"
                    icon={ShoppingCart}
                  />
                  <ReportCard
                    title="ยอดเฉลี่ย/คำสั่ง"
                    value={367}
                    change={3.1}
                    changeType="positive"
                    icon={BarChart3}
                    prefix="฿"
                  />
                  <ReportCard
                    title="อัตราการคืนสินค้า"
                    value="2.3"
                    change={0.5}
                    changeType="negative"
                    icon={TrendingDown}
                    suffix="%"
                  />
                </div>

                {/* Sales Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>แผนภูมิยอดขาย</CardTitle>
                    <CardDescription>แสดงยอดขายในช่วงเวลาที่เลือก</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SalesReportChart data={salesData} />
                  </CardContent>
                </Card>

                {/* Sales by Time */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>ยอดขายตามช่วงเวลา</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { time: '08:00-10:00', sales: 15000, percentage: 20 },
                          { time: '10:00-12:00', sales: 25000, percentage: 35 },
                          { time: '12:00-14:00', sales: 18000, percentage: 25 },
                          { time: '14:00-16:00', sales: 12000, percentage: 15 },
                          { time: '16:00-18:00', sales: 8000, percentage: 5 },
                        ].map((period) => (
                          <div key={period.time} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{period.time}</span>
                              <span className="font-medium">฿{period.sales.toLocaleString()}</span>
                            </div>
                            <Progress value={period.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>ยอดขายตามวัน</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { day: 'จันทร์', sales: 18000, percentage: 25 },
                          { day: 'อังคาร', sales: 22000, percentage: 30 },
                          { day: 'พุธ', sales: 20000, percentage: 28 },
                          { day: 'พฤหัสบดี', sales: 25000, percentage: 35 },
                          { day: 'ศุกร์', sales: 28000, percentage: 40 },
                          { day: 'เสาร์', sales: 32000, percentage: 45 },
                          { day: 'อาทิตย์', sales: 35000, percentage: 50 },
                        ].map((day) => (
                          <div key={day.day} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{day.day}</span>
                              <span className="font-medium">฿{day.sales.toLocaleString()}</span>
                            </div>
                            <Progress value={day.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6">
                {/* Product Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      สินค้าขายดี
                    </CardTitle>
                    <CardDescription>
                      สินค้าที่ขายดีที่สุดในช่วงเวลาที่เลือก
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topSellingProducts.map((product, index) => (
                        <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ขาย {product.quantity} ชิ้น
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">฿{product.revenue.toLocaleString()}</p>
                            <div className="flex items-center gap-1">
                              {product.growth > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                              <span className={`text-xs ${
                                product.growth > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {Math.abs(product.growth)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <ProductReportTable />
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-6">
                {/* Customer Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <ReportCard
                    title="ลูกค้าใหม่"
                    value={28}
                    change={15.3}
                    changeType="positive"
                    icon={Users}
                  />
                  <ReportCard
                    title="ลูกค้าที่กลับมาซื้อ"
                    value={45}
                    change={8.7}
                    changeType="positive"
                    icon={Users}
                  />
                  <ReportCard
                    title="อัตราการกลับมาซื้อ"
                    value="68"
                    change={5.2}
                    changeType="positive"
                    icon={TrendingUp}
                    suffix="%"
                  />
                </div>

                {/* Customer Segments */}
                <Card>
                  <CardHeader>
                    <CardTitle>กลุ่มลูกค้า</CardTitle>
                    <CardDescription>
                      การแบ่งกลุ่มลูกค้าตามระดับสมาชิก
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerSegments.map((segment) => (
                        <div key={segment.segment} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{segment.segment}</span>
                              <Badge variant="secondary">
                                {segment.count} คน
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                ฿{segment.avgSpend.toLocaleString()}/คน
                              </span>
                            </div>
                          </div>
                          <Progress value={segment.percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {segment.percentage}% ของลูกค้าทั้งหมด
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <CustomerAnalytics />
              </TabsContent>
              
              <TabsContent value="inventory" className="space-y-6">
                {/* Inventory Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <ReportCard
                    title="สินค้าทั้งหมด"
                    value={156}
                    icon={Package}
                  />
                  <ReportCard
                    title="สินค้าคงคลังต่ำ"
                    value={8}
                    change={2}
                    changeType="negative"
                    icon={TrendingDown}
                  />
                  <ReportCard
                    title="สินค้าหมด"
                    value={3}
                    change={1}
                    changeType="negative"
                    icon={Package}
                  />
                  <ReportCard
                    title="มูลค่าสต๊อก"
                    value={245000}
                    change={5.8}
                    changeType="positive"
                    icon={DollarSign}
                    prefix="฿"
                  />
                </div>

                {/* Low Stock Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <Package className="h-5 w-5" />
                      สินค้าคงคลังต่ำ
                    </CardTitle>
                    <CardDescription>
                      สินค้าที่ต้องเติมสต๊อก
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'เมล็ดกาแฟอราบิก้า', current: 2, minimum: 10, unit: 'กก.' },
                        { name: 'นมสด', current: 5, minimum: 20, unit: 'ลิตร' },
                        { name: 'ถ้วยกระดาษ', current: 50, minimum: 200, unit: 'ใบ' },
                        { name: 'น้ำตาล', current: 3, minimum: 15, unit: 'กก.' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              คงเหลือ: {item.current} {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-1">
                              ต่ำกว่าขั้นต่ำ
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              ขั้นต่ำ: {item.minimum} {item.unit}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
