import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shell } from '@/components/Shell';
import { 
  BrainCircuit, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AIAnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data for analytics
  const customerBehaviorData = [
    { time: '09:00', visits: 15, purchases: 8, avgSpent: 180 },
    { time: '10:00', visits: 25, purchases: 15, avgSpent: 220 },
    { time: '11:00', visits: 40, purchases: 28, avgSpent: 250 },
    { time: '12:00', visits: 65, purchases: 45, avgSpent: 320 },
    { time: '13:00', visits: 55, purchases: 38, avgSpent: 280 },
    { time: '14:00', visits: 35, purchases: 22, avgSpent: 240 },
    { time: '15:00', visits: 30, purchases: 18, avgSpent: 200 },
    { time: '16:00', visits: 45, purchases: 30, avgSpent: 290 },
    { time: '17:00', visits: 60, purchases: 42, avgSpent: 350 },
    { time: '18:00', visits: 35, purchases: 20, avgSpent: 180 },
  ];

  const customerSegmentData = [
    { name: 'นักดื่มกาแฟประจำ', value: 35, color: '#ef4444' },
    { name: 'ลูกค้าช่วงเที่ยง', value: 25, color: '#f97316' },
    { name: 'นักชิมของหวาน', value: 20, color: '#eab308' },
    { name: 'ลูกค้าเป็นครั้งคราว', value: 20, color: '#22c55e' },
  ];

  const predictionsData = [
    { date: 'วันนี้', predicted: 4500, actual: 4200, confidence: 85 },
    { date: 'พรุ่งนี้', predicted: 4800, actual: null, confidence: 78 },
    { date: 'มะรืนนี้', predicted: 5200, actual: null, confidence: 72 },
    { date: 'อาทิตย์หน้า', predicted: 32000, actual: null, confidence: 65 },
  ];

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'ช่วงเวลาทอง 17:00-18:00',
      description: 'ยอดขายสูงสุดของวัน แนะนำให้เพิ่มโปรโมชั่นในช่วงนี้',
      impact: 'สูง',
      confidence: 92
    },
    {
      type: 'warning',
      title: 'ลูกค้าลดลง 15:00-16:00',
      description: 'ควรเพิ่มกิจกรรมหรือโปรโมชั่นในช่วงบ่าย',
      impact: 'กลาง',
      confidence: 78
    },
    {
      type: 'trend',
      title: 'เครื่องดื่มเย็นเติบโต 25%',
      description: 'ควรเพิ่มหลากหลายเมนูเครื่องดื่มเย็น',
      impact: 'สูง',
      confidence: 88
    },
    {
      type: 'customer',
      title: 'ลูกค้าใหม่เพิ่มขึ้น 18%',
      description: 'ควรมีโปรแกรม Welcome Offer สำหรับลูกค้าใหม่',
      impact: 'กลาง',
      confidence: 82
    }
  ];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
  };

  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'warning': return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'trend': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'customer': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'สูง': return 'bg-red-100 text-red-800';
      case 'กลาง': return 'bg-yellow-100 text-yellow-800';
      case 'ต่ำ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Shell>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <BrainCircuit className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
            </div>
            <p className="text-gray-600">วิเคราะห์พฤติกรรมลูกค้าและคาดการณ์แนวโน้มด้วย AI</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="24hours">24 ชั่วโมงล่าสุด</option>
                <option value="7days">7 วันล่าสุด</option>
                <option value="30days">30 วันล่าสุด</option>
                <option value="90days">3 เดือนล่าสุด</option>
              </select>
            </div>
            
            <Button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  รันการวิเคราะห์ AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5% จากเดือนที่แล้ว
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดขายวันนี้</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿4,250</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8.2% จากเมื่อวาน
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการแปลง</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.4%</div>
              <div className="flex items-center text-xs text-red-600">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                -2.1% จากสัปดาห์ที่แล้ว
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ค่าเฉลี่ยต่อออเดอร์</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿285</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +15.3% จากเดือนที่แล้ว
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="behavior" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="behavior">พฤติกรรมลูกค้า</TabsTrigger>
            <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
            <TabsTrigger value="predictions">การคาดการณ์</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Customer Behavior Analysis */}
          <TabsContent value="behavior">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>พฤติกรรมการเข้าชมตามช่วงเวลา</CardTitle>
                  <CardDescription>จำนวนลูกค้าและการซื้อตามชั่วโมง</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={customerBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="purchases" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ค่าใช้จ่ายเฉลี่ยตามช่วงเวลา</CardTitle>
                  <CardDescription>ยอดเฉลี่ยต่อออเดอร์ในแต่ละช่วงเวลา</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customerBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgSpent" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Segmentation */}
          <TabsContent value="segments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การแบ่งกลุ่มลูกค้า</CardTitle>
                  <CardDescription>กลุ่มลูกค้าตามพฤติกรรมการซื้อ</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={customerSegmentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดกลุ่มลูกค้า</CardTitle>
                  <CardDescription>ข้อมูลเชิงลึกของแต่ละกลุ่ม</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        ></div>
                        <span className="font-medium">{segment.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{segment.value}%</div>
                        <div className="text-sm text-gray-500">
                          {Math.round(segment.value * 28.47)} คน
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle>การคาดการณ์ยอดขาย</CardTitle>
                <CardDescription>คาดการณ์ยอดขายด้วย Machine Learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionsData.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{prediction.date}</div>
                        <div className="text-sm text-gray-500">
                          คาดการณ์: ฿{prediction.predicted.toLocaleString()}
                        </div>
                        {prediction.actual && (
                          <div className="text-sm text-green-600">
                            จริง: ฿{prediction.actual.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {prediction.confidence}% แม่นยำ
                        </Badge>
                        <Progress value={prediction.confidence} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">ความเชื่อมั่น</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={insight.confidence} className="w-20" />
                        <span className="text-sm font-medium">{insight.confidence}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default AIAnalyticsDashboard;
