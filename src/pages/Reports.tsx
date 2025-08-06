
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import SalesReportChart from '@/components/reports/SalesReportChart';

const Reports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<string>('7d');

  const statsData = [
    {
      title: 'ยอดขายวันนี้',
      value: '฿12,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      description: 'เพิ่มขึ้นจากเมื่อวาน'
    },
    {
      title: 'จำนวนออเดอร์',
      value: '89',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      description: 'ออเดอร์ทั้งหมดวันนี้'
    },
    {
      title: 'ลูกค้าใหม่',
      value: '24',
      change: '-3.1%',
      trend: 'down',
      icon: Users,
      description: 'ลูกค้าลงทะเบียนใหม่'
    },
    {
      title: 'สินค้าขายดี',
      value: '156',
      change: '+5.8%',
      trend: 'up',
      icon: Package,
      description: 'รายการที่ขายได้'
    }
  ];

  const topProducts = [
    { name: 'กาแฟอเมริกาโน่', sales: 45, revenue: 2250 },
    { name: 'ลาเต้', sales: 38, revenue: 2280 },
    { name: 'คาปูชิโน่', sales: 32, revenue: 1920 },
    { name: 'เอสเปรสโซ่', sales: 28, revenue: 1400 },
    { name: 'มอคค่า', sales: 25, revenue: 1750 }
  ];

  const topCustomers = [
    { name: 'คุณสมชาย ใจดี', orders: 15, spent: 2250, phone: '081-xxx-1234' },
    { name: 'คุณสมหญิง รักกาแฟ', orders: 12, spent: 1890, phone: '082-xxx-5678' },
    { name: 'คุณวิทยา ชอบลาเต้', orders: 10, spent: 1650, phone: '083-xxx-9012' },
    { name: 'คุณมาลี กินหวาน', orders: 8, spent: 1320, phone: '084-xxx-3456' },
    { name: 'คุณจิ๋ว น้อยใจ', orders: 7, spent: 1155, phone: '085-xxx-7890' }
  ];

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
            {/* Header Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">รายงานการขาย</CardTitle>
                    <CardDescription>
                      ติดตามผลการดำเนินงานและสถิติการขาย
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">วันนี้</SelectItem>
                        <SelectItem value="7d">7 วันที่ผ่านมา</SelectItem>
                        <SelectItem value="30d">30 วันที่ผ่านมา</SelectItem>
                        <SelectItem value="90d">90 วันที่ผ่านมา</SelectItem>
                        <SelectItem value="custom">กำหนดเอง</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      ส่งออกรายงาน
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <div className="flex items-center mt-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={`text-xs ${
                              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
                <TabsTrigger value="products">สินค้า</TabsTrigger>
                <TabsTrigger value="customers">ลูกค้า</TabsTrigger>
                <TabsTrigger value="inventory">สต็อก</TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SalesReportChart />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        สรุปยอดขายรายเดือน
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>มกราคม 2024</span>
                          <span className="font-semibold">฿285,650</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>กุมภาพันธ์ 2024</span>
                          <span className="font-semibold">฿312,480</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>มีนาคม 2024</span>
                          <span className="font-semibold">฿298,750</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>เมษายน 2024</span>
                          <span className="font-semibold">฿325,120</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>สินค้าขายดี</CardTitle>
                    <CardDescription>10 อันดับสินค้าที่ขายดีที่สุด</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">ขายไป {product.sales} แก้ว</p>
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
              </TabsContent>

              <TabsContent value="customers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ลูกค้าประจำ</CardTitle>
                    <CardDescription>ลูกค้าที่ซื้อบ่อยที่สุด</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">฿{customer.spent.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{customer.orders} ออเดอร์</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>สต็อกคงเหลือ</CardTitle>
                    <CardDescription>รายการสต็อกที่ต่ำกว่าเกณฑ์</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">เมล็ดกาแฟอราบิก้า</p>
                          <p className="text-sm text-muted-foreground">คงเหลือ: 2.5 กก.</p>
                        </div>
                        <Badge variant="destructive">ต่ำ</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">นมสด</p>
                          <p className="text-sm text-muted-foreground">คงเหลือ: 8 ลิตร</p>
                        </div>
                        <Badge variant="secondary">ปานกลาง</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">น้ำตาลทราย</p>
                          <p className="text-sm text-muted-foreground">คงเหลือ: 1.2 กก.</p>
                        </div>
                        <Badge variant="destructive">ต่ำ</Badge>
                      </div>
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
