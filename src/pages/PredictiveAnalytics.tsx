
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shell } from '@/components/Shell';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  ShoppingCart,
  Target,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
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
  ComposedChart,
  Legend
} from 'recharts';

const PredictiveAnalytics = () => {
  const [forecastPeriod, setForecastPeriod] = useState('30days');
  const [selectedModel, setSelectedModel] = useState('advanced');

  // Mock data for sales prediction
  const salesForecastData = [
    { date: '2024-01-15', actual: 45000, predicted: 46500, confidence: 95 },
    { date: '2024-01-16', actual: 52000, predicted: 51200, confidence: 94 },
    { date: '2024-01-17', actual: 48000, predicted: 49100, confidence: 93 },
    { date: '2024-01-18', actual: 55000, predicted: 54300, confidence: 96 },
    { date: '2024-01-19', actual: null, predicted: 57800, confidence: 88 },
    { date: '2024-01-20', actual: null, predicted: 62100, confidence: 87 },
    { date: '2024-01-21', actual: null, predicted: 58900, confidence: 86 },
    { date: '2024-01-22', actual: null, predicted: 65200, confidence: 85 },
  ];

  const demandForecastData = [
    { product: 'กาแฟเย็น', current: 120, predicted: 145, trend: 'up', accuracy: 92 },
    { product: 'ชาไทย', current: 85, predicted: 78, trend: 'down', accuracy: 89 },
    { product: 'ข้าวผัด', current: 65, predicted: 72, trend: 'up', accuracy: 95 },
    { product: 'ส้มตำ', current: 45, predicted: 52, trend: 'up', accuracy: 88 },
    { product: 'ก๋วยเตี๋ยว', current: 98, predicted: 105, trend: 'up', accuracy: 91 },
    { product: 'เค้ก', current: 32, predicted: 28, trend: 'down', accuracy: 87 },
  ];

  const seasonalTrends = [
    { month: 'ม.ค.', sales2023: 580000, predicted2024: 645000, growth: 11.2 },
    { month: 'ก.พ.', sales2023: 520000, predicted2024: 592000, growth: 13.8 },
    { month: 'มี.ค.', sales2023: 650000, predicted2024: 715000, growth: 10.0 },
    { month: 'เม.ย.', sales2023: 720000, predicted2024: 798000, growth: 10.8 },
    { month: 'พ.ค.', sales2023: 680000, predicted2024: 748000, growth: 10.0 },
    { month: 'มิ.ย.', sales2023: 590000, predicted2024: 649000, growth: 10.0 },
  ];

  const modelAccuracy = [
    { model: 'Linear Regression', accuracy: 78, speed: 'เร็วมาก' },
    { model: 'Random Forest', accuracy: 85, speed: 'เร็ว' },
    { model: 'LSTM Neural Network', accuracy: 92, speed: 'ปานกลาง' },
    { model: 'Advanced Ensemble', accuracy: 96, speed: 'ช้า' },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Predictive Analytics</h1>
            <p className="text-muted-foreground">
              คาดการณ์ยอดขายและความต้องการสินค้าด้วย AI ขั้นสูง
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วันข้างหน้า</SelectItem>
                <SelectItem value="30days">30 วันข้างหน้า</SelectItem>
                <SelectItem value="90days">3 เดือนข้างหน้า</SelectItem>
                <SelectItem value="1year">1 ปีข้างหน้า</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="โมเดล AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Model</SelectItem>
                <SelectItem value="advanced">Advanced AI</SelectItem>
                <SelectItem value="deep">Deep Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดขายคาดการณ์</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿1,847,250</div>
              <p className="text-xs text-muted-foreground">
                30 วันข้างหน้า
              </p>
              <Badge variant="outline" className="mt-2 text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.3%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความแม่นยำ</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.6%</div>
              <p className="text-xs text-muted-foreground">
                โมเดลปัจจุบัน
              </p>
              <Badge variant="outline" className="mt-2 text-blue-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                สูงมาก
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แนวโน้มโดยรวม</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">เติบโต</div>
              <p className="text-xs text-muted-foreground">
                ช่วง 3 เดือนข้างหน้า
              </p>
              <Badge variant="outline" className="mt-2 text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15.2%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การปรับปรุงล่าสุด</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 ชม.</div>
              <p className="text-xs text-muted-foreground">
                ที่ผ่านมา
              </p>
              <Badge variant="outline" className="mt-2 text-orange-600">
                <Zap className="w-3 h-3 mr-1" />
                อัปเดตแล้ว
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales-forecast" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales-forecast">การคาดการณ์ยอดขาย</TabsTrigger>
            <TabsTrigger value="demand-forecast">ความต้องการสินค้า</TabsTrigger>
            <TabsTrigger value="seasonal-analysis">การวิเคราะห์ตามฤดูกาล</TabsTrigger>
            <TabsTrigger value="model-performance">ประสิทธิภาพโมเดล</TabsTrigger>
          </TabsList>

          <TabsContent value="sales-forecast">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>การคาดการณ์ยอดขายรายวัน</span>
                  </CardTitle>
                  <CardDescription>
                    เส้นสีน้ำเงิน: ยอดขายจริง | เส้นสีแดง: ยอดขายคาดการณ์
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salesForecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            new Intl.NumberFormat('th-TH').format(Number(value)), 
                            name === 'actual' ? 'ยอดขายจริง' : 'ยอดขายคาดการณ์'
                          ]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="ยอดขายจริง"
                          connectNulls={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="ยอดขายคาดการณ์"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="confidence" 
                          stroke="transparent" 
                          fill="#10b981" 
                          fillOpacity={0.1}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demand-forecast">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>การคาดการณ์ความต้องการสินค้า</span>
                  </CardTitle>
                  <CardDescription>
                    เปรียบเทียบความต้องการปัจจุบันกับที่คาดการณ์
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demandForecastData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <h4 className="font-medium">{item.product}</h4>
                            <p className="text-sm text-muted-foreground">
                              ความแม่นยำ: {item.accuracy}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {item.current} → {item.predicted}
                            </span>
                            {item.trend === 'up' ? (
                              <Badge variant="outline" className="text-green-600">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{((item.predicted - item.current) / item.current * 100).toFixed(1)}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                {((item.predicted - item.current) / item.current * 100).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seasonal-analysis">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>การวิเคราะห์แนวโน้มตามฤดูกาล</span>
                  </CardTitle>
                  <CardDescription>
                    เปรียบเทียบยอดขายปีที่แล้วกับการคาดการณ์ปีนี้
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seasonalTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => new Intl.NumberFormat('th-TH').format(Number(value))}
                        />
                        <Legend />
                        <Bar 
                          dataKey="sales2023" 
                          fill="#6b7280" 
                          name="ยอดขาย 2023"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="predicted2024" 
                          fill="#3b82f6" 
                          name="คาดการณ์ 2024"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="model-performance">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>ประสิทธิภาพของโมเดล AI</span>
                  </CardTitle>
                  <CardDescription>
                    เปรียบเทียบความแม่นยำของโมเดลต่างๆ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelAccuracy.map((model, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{model.model}</h4>
                          <Badge 
                            variant={selectedModel === model.model.toLowerCase().replace(/\s+/g, '-') ? 'default' : 'outline'}
                          >
                            {model.accuracy}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${model.accuracy}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>ความเร็ว: {model.speed}</span>
                          <span>แม่นยำ: {model.accuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>ข้อเสนอแนะสำหรับการปรับปรุง</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900">เพิ่มข้อมูลภายนอก</h5>
                        <p className="text-sm text-blue-700">
                          เชื่อมต่อข้อมูลสภาพอากาศและเทศกาลเพื่อปรับปรุงความแม่นยำ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-green-900">อัปเดตโมเดลเป็นรายสัปดาห์</h5>
                        <p className="text-sm text-green-700">
                          เพิ่มการเรียนรู้ต่อเนื่องเพื่อปรับตัวกับเทรนด์ใหม่
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-orange-900">เพิ่มข้อมูลลูกค้า</h5>
                        <p className="text-sm text-orange-700">
                          รวมข้อมูลพฤติกรรมลูกค้าเพื่อคาดการณ์ที่แม่นยำยิ่งขึ้น
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default PredictiveAnalytics;
