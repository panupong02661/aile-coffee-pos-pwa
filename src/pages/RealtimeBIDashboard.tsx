
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shell } from '@/components/Shell';
import { 
  Zap, 
  Activity, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RealtimeBIDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock real-time data
  const [realtimeData, setRealtimeData] = useState({
    currentSales: 4850,
    activeUsers: 145,
    ordersToday: 89,
    conversionRate: 72.4,
    avgOrderValue: 285,
    topSellingItem: "กาแฟลาเต้",
    peakHour: "17:00-18:00",
    systemHealth: 98.5
  });

  const [salesTrend, setSalesTrend] = useState([
    { time: '14:00', sales: 3200, orders: 45, users: 120 },
    { time: '14:30', sales: 3450, orders: 48, users: 135 },
    { time: '15:00', sales: 3680, orders: 52, users: 125 },
    { time: '15:30', sales: 4100, orders: 58, users: 140 },
    { time: '16:00', sales: 4350, orders: 62, users: 145 },
    { time: '16:30', sales: 4850, orders: 68, users: 155 },
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'สต็อกกาแฟเมล็ดเหลือน้อย (< 10%)', time: '2 นาทีที่แล้ว', severity: 'medium' },
    { id: 2, type: 'info', message: 'ยอดขายทะลุเป้าหมายรายวัน', time: '5 นาทีที่แล้ว', severity: 'low' },
    { id: 3, type: 'success', message: 'ลูกค้าใหม่เพิ่มขึ้น 15%', time: '8 นาทีที่แล้ว', severity: 'low' },
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState([
    { metric: 'Server Response Time', value: 245, unit: 'ms', status: 'good' },
    { metric: 'Database Performance', value: 98.2, unit: '%', status: 'excellent' },
    { metric: 'API Uptime', value: 99.9, unit: '%', status: 'excellent' },
    { metric: 'Cache Hit Rate', value: 87.5, unit: '%', status: 'good' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sales data
      setRealtimeData(prev => ({
        ...prev,
        currentSales: prev.currentSales + Math.floor(Math.random() * 200) - 50,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        ordersToday: prev.ordersToday + Math.floor(Math.random() * 3),
        conversionRate: Math.max(0, Math.min(100, prev.conversionRate + (Math.random() - 0.5) * 2)),
      }));

      // Update sales trend
      setSalesTrend(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          sales: prev[prev.length - 1].sales + Math.floor(Math.random() * 300) - 100,
          orders: prev[prev.length - 1].orders + Math.floor(Math.random() * 5),
          users: prev[prev.length - 1].users + Math.floor(Math.random() * 20) - 10,
        };
        return [...prev.slice(-5), newPoint];
      });

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    setLastUpdate(new Date());
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'success': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Shell>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Real-time Business Intelligence</h1>
            </div>
            <p className="text-gray-600">แดshboard ข้อมูลสดๆ แบบ Real-time พร้อมการอัปเดตทันที</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500">
              อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')}
            </div>
            
            <Button 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse m-2"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดขายปัจจุบัน</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{realtimeData.currentSales.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% จากเมื่อวาน
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse m-2"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้ออนไลน์</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeData.activeUsers}</div>
              <div className="flex items-center text-xs text-blue-600 mt-1">
                <Activity className="w-3 h-3 mr-1" />
                กำลังเปิดดูแอป
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse m-2"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ออเดอร์วันนี้</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeData.ordersToday}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8 ออเดอร์ในชั่วโมงนี้
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse m-2"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการแปลง</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtimeData.conversionRate.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <Clock className="w-3 h-3 mr-1" />
                อัปเดตทุก 30 วินาที
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime">ข้อมูลสด</TabsTrigger>
            <TabsTrigger value="alerts">การแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="performance">ประสิทธิภาพระบบ</TabsTrigger>
            <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
          </TabsList>

          {/* Real-time Data */}
          <TabsContent value="realtime">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>แนวโน้มยอดขายสด</span>
                  </CardTitle>
                  <CardDescription>อัปเดตทุก 30 วินาที</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>ผู้ใช้และออเดอร์สด</span>
                  </CardTitle>
                  <CardDescription>ข้อมูลการใช้งานแบบ Real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือนแบบ Real-time</CardTitle>
                <CardDescription>เหตุการณ์และการแจ้งเตือนที่เกิดขึ้นในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium text-gray-900">{alert.message}</div>
                        <div className="text-sm text-gray-500 mt-1">{alert.time}</div>
                      </div>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}
                      >
                        {alert.severity === 'high' ? 'สูง' : alert.severity === 'medium' ? 'กลาง' : 'ต่ำ'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ประสิทธิภาพระบบ</CardTitle>
                  <CardDescription>สถานะและประสิทธิภาพของระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{metric.metric}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                            {metric.value} {metric.unit}
                          </span>
                          <Badge variant={metric.status === 'excellent' ? 'default' : metric.status === 'good' ? 'secondary' : 'destructive'}>
                            {metric.status === 'excellent' ? 'ดีเยี่ยม' : metric.status === 'good' ? 'ดี' : 'ต้องปรับปรุง'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สถิติการใช้งาน</CardTitle>
                  <CardDescription>ข้อมูลการใช้งานระบบแบบ Real-time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ค่าเฉลี่ยต่อออเดอร์</span>
                    <span className="font-semibold">฿{realtimeData.avgOrderValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">สินค้าขายดี</span>
                    <span className="font-semibold">{realtimeData.topSellingItem}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ช่วงเวลายอดขายสูงสุด</span>
                    <span className="font-semibold">{realtimeData.peakHour}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">สุขภาพระบบ</span>
                    <span className="font-semibold text-green-600">{realtimeData.systemHealth}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>การวิเคราะห์แบบ Real-time</CardTitle>
                <CardDescription>ข้อมูลเชิงลึกจากการวิเคราะห์ข้อมูลสด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium">แนวโน้มบวก</span>
                    </div>
                    <p className="text-sm text-gray-600">ยอดขายเพิ่มขึ้น 15% เทียบกับเมื่อวาน</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">ลูกค้าใหม่</span>
                    </div>
                    <p className="text-sm text-gray-600">มีลูกค้าใหม่เข้ามา 25 คนในวันนี้</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">สต็อกสินค้า</span>
                    </div>
                    <p className="text-sm text-gray-600">สินค้า 3 รายการใกล้หมด</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default RealtimeBIDashboard;
