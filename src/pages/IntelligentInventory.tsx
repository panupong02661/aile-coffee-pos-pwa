
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shell } from '@/components/Shell';
import { 
  Package, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  Calendar,
  BarChart3,
  Brain,
  Zap,
  Clock,
  DollarSign,
  Target,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend
} from 'recharts';

const IntelligentInventory = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const inventoryData = [
    { 
      id: 1, 
      name: 'เมล็ดกาแฟอราบิก้า', 
      currentStock: 15, 
      optimalStock: 50, 
      predictedDemand: 45, 
      daysUntilEmpty: 3, 
      status: 'critical',
      supplier: 'Coffee Import Co.',
      lastOrdered: '2024-01-10',
      cost: 850
    },
    { 
      id: 2, 
      name: 'นมสด', 
      currentStock: 25, 
      optimalStock: 40, 
      predictedDemand: 35, 
      daysUntilEmpty: 7, 
      status: 'warning',
      supplier: 'Daily Fresh',
      lastOrdered: '2024-01-12',
      cost: 120
    },
    { 
      id: 3, 
      name: 'น้ำตาล', 
      currentStock: 80, 
      optimalStock: 60, 
      predictedDemand: 20, 
      daysUntilEmpty: 45, 
      status: 'overstock',
      supplier: 'Sweet Supply',
      lastOrdered: '2024-01-05',
      cost: 85
    },
    { 
      id: 4, 
      name: 'ถ้วยกระดาษ', 
      currentStock: 45, 
      optimalStock: 50, 
      predictedDemand: 40, 
      daysUntilEmpty: 12, 
      status: 'good',
      supplier: 'Pack Pro',
      lastOrdered: '2024-01-08',
      cost: 320
    }
  ];

  const demandForecast = [
    { date: '2024-01-15', coffee: 12, milk: 8, sugar: 5, cups: 15 },
    { date: '2024-01-16', coffee: 15, milk: 10, sugar: 6, cups: 18 },
    { date: '2024-01-17', coffee: 18, milk: 12, sugar: 7, cups: 20 },
    { date: '2024-01-18', coffee: 14, milk: 9, sugar: 5, cups: 16 },
    { date: '2024-01-19', coffee: 20, milk: 15, sugar: 8, cups: 25 },
    { date: '2024-01-20', coffee: 22, milk: 16, sugar: 9, cups: 28 },
    { date: '2024-01-21', coffee: 16, milk: 11, sugar: 6, cups: 19 }
  ];

  const costAnalysis = [
    { category: 'เมล็ดกาแฟ', cost: 25000, percentage: 40, trend: 'up' },
    { category: 'นมและครีม', cost: 12000, percentage: 20, trend: 'stable' },
    { category: 'วัตถุดิบขนม', cost: 8000, percentage: 13, trend: 'down' },
    { category: 'บรรจุภัณฑ์', cost: 7500, percentage: 12, trend: 'up' },
    { category: 'อื่นๆ', cost: 9500, percentage: 15, trend: 'stable' }
  ];

  const supplierPerformance = [
    { name: 'Coffee Import Co.', deliveryTime: 2.5, reliability: 95, cost: 4.2, overall: 'A' },
    { name: 'Daily Fresh', deliveryTime: 1.2, reliability: 98, cost: 3.8, overall: 'A+' },
    { name: 'Sweet Supply', deliveryTime: 3.1, reliability: 88, cost: 4.8, overall: 'B+' },
    { name: 'Pack Pro', deliveryTime: 2.8, reliability: 92, cost: 4.0, overall: 'A-' }
  ];

  const autoReorderRules = [
    { item: 'เมล็ดกาแฟอราบิก้า', minLevel: 20, orderQuantity: 50, active: true },
    { item: 'นมสด', minLevel: 15, orderQuantity: 30, active: true },
    { item: 'น้ำตาล', minLevel: 25, orderQuantity: 40, active: false },
    { item: 'ถ้วยกระดาษ', minLevel: 30, orderQuantity: 100, active: true }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'good': return 'text-green-600 bg-green-100';
      case 'overstock': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'critical': return 'วิกฤต';
      case 'warning': return 'เตือน';
      case 'good': return 'ปกติ';
      case 'overstock': return 'สต็อกเกิน';
      default: return 'ไม่ทราบ';
    }
  };

  const pieColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  const runInventoryOptimization = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold">Intelligent Inventory Management</h1>
            </div>
            <p className="text-muted-foreground">
              ระบบจัดการคลังสินค้าอัจฉริยะด้วย AI พร้อมการคาดการณ์และสั่งซื้ออัตโนมัติ
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ช่วงเวลาวิเคราะห์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วันข้างหน้า</SelectItem>
                <SelectItem value="30days">30 วันข้างหน้า</SelectItem>
                <SelectItem value="90days">3 เดือนข้างหน้า</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={runInventoryOptimization}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  เพิ่มประสิทธิภาพ AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายการวิกฤต</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">
                ต้องสั่งซื้อด่วน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มูลค่าคลังสินค้า</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿156,750</div>
              <p className="text-xs text-muted-foreground">
                ณ วันนี้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การหมุนเวียน</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5x</div>
              <p className="text-xs text-muted-foreground">
                ต่อปี
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความแม่นยำ AI</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                การคาดการณ์
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory-status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="inventory-status">สถานะสินค้า</TabsTrigger>
            <TabsTrigger value="demand-forecast">คาดการณ์ความต้องการ</TabsTrigger>
            <TabsTrigger value="cost-analysis">วิเคราะห์ต้นทุน</TabsTrigger>
            <TabsTrigger value="suppliers">ผู้จัดจำหน่าย</TabsTrigger>
            <TabsTrigger value="auto-reorder">สั่งซื้ออัตโนมัติ</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory-status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>สถานะสินค้าคงคลัง</span>
                </CardTitle>
                <CardDescription>
                  รายการสินค้าทั้งหมดและสถานะปัจจุบัน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryData.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            สต็อก: {item.currentStock} | เหมาะสม: {item.optimalStock}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            จากร้าน: {item.supplier}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.daysUntilEmpty} วัน
                        </div>
                        <div className="text-sm font-medium">
                          ฿{item.cost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demand-forecast">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>การคาดการณ์ความต้องการ</span>
                </CardTitle>
                <CardDescription>
                  ความต้องการสินค้าในอนาคต 7 วันข้างหน้า
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={demandForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="coffee" fill="#8b5cf6" name="เมล็ดกาแฟ" />
                      <Bar dataKey="milk" fill="#06b6d4" name="นมสด" />
                      <Bar dataKey="sugar" fill="#eab308" name="น้ำตาล" />
                      <Line type="monotone" dataKey="cups" stroke="#ef4444" name="ถ้วย" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost-analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การแบ่งต้นทุนตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costAnalysis}
                        dataKey="cost"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {costAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดต้นทุน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: pieColors[index] }}
                          ></div>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">฿{item.cost.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.percentage}%
                            {item.trend === 'up' && <TrendingUp className="inline w-3 h-3 ml-1 text-red-500" />}
                            {item.trend === 'down' && <TrendingDown className="inline w-3 h-3 ml-1 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>ประสิทธิภาพผู้จัดจำหน่าย</span>
                </CardTitle>
                <CardDescription>
                  การประเมินผู้จัดจำหน่ายตามเกณฑ์ต่างๆ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplierPerformance.map((supplier, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{supplier.name}</h4>
                        <Badge 
                          className={
                            supplier.overall.includes('A') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          เกรด {supplier.overall}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">เวลาส่งของ</span>
                          <div className="font-medium">{supplier.deliveryTime} วัน</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ความเชื่อถือ</span>
                          <div className="font-medium">{supplier.reliability}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">คะแนนต้นทุน</span>
                          <div className="font-medium">{supplier.cost}/5</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auto-reorder">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>กฎการสั่งซื้ออัตโนมัติ</span>
                </CardTitle>
                <CardDescription>
                  ตั้งค่าการสั่งซื้ออัตโนมัติเมื่อสินค้าใกล้หมด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {autoReorderRules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{rule.item}</h4>
                        <p className="text-sm text-muted-foreground">
                          สั่งซื้อเมื่อเหลือ {rule.minLevel} หน่วย | จำนวน {rule.orderQuantity} หน่วย
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={rule.active ? "default" : "outline"}>
                          {rule.active ? 'เปิดใช้' : 'ปิดใช้'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          แก้ไข
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default IntelligentInventory;
