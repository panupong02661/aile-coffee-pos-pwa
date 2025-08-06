
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shell } from '@/components/Shell';
import { 
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ShoppingCart,
  Target,
  Brain,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const SmartMenuRecommendations = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [timeFrame, setTimeFrame] = useState('week');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const menuRecommendations = [
    {
      id: 1,
      name: 'กาแฟเย็นมัทฉะลาเต้',
      category: 'เครื่องดื่ม',
      predictedPopularity: 85,
      expectedRevenue: 12500,
      targetSegment: 'วัยรุ่น-นักศึกษา',
      seasonality: 'ฤดูร้อน',
      ingredients: ['เมล็ดกาแฟ', 'ผงมัทฉะ', 'นมสด', 'น้ำแข็ง'],
      estimatedCost: 45,
      profitMargin: 65,
      confidence: 92,
      reason: 'เทรนด์มัทฉะกำลังฮิต และเป็นที่นิยมในกลุ่มลูกค้าวัยรุ่น'
    },
    {
      id: 2,
      name: 'ข้าวผัดน้ำพริกลงเรือ',
      category: 'อาหารจานหลัก',
      predictedPopularity: 78,
      expectedRevenue: 8900,
      targetSegment: 'ลูกค้าประจำ',
      seasonality: 'ตลอดปี',
      ingredients: ['ข้าวสวย', 'น้ำพริกลงเรือ', 'ผัก', 'ไข่'],
      estimatedCost: 35,
      profitMargin: 75,
      confidence: 88,
      reason: 'อาหารไทยต้นตำรับที่ได้รับความนิยมสูงในหมู่ลูกค้าทุกวัย'
    },
    {
      id: 3,
      name: 'เค้กบราวนี่ช็อกโกแลต',
      category: 'ของหวาน',
      predictedPopularity: 72,
      expectedRevenue: 6800,
      targetSegment: 'ครอบครัว',
      seasonality: 'ตลอดปี',
      ingredients: ['แป้ง', 'ช็อกโกแลต', 'เนย', 'ไข่'],
      estimatedCost: 28,
      profitMargin: 70,
      confidence: 85,
      reason: 'ของหวานที่เหมาะกับการมาร่วมกับครอบครัวและเป็นที่นิยม'
    }
  ];

  const customerSegmentPreferences = [
    { segment: 'วัยรุ่น-นักศึกษา', coffee: 85, dessert: 75, food: 45, healthy: 35 },
    { segment: 'ผู้ใหญ่วัยทำงาน', coffee: 90, dessert: 50, food: 80, healthy: 70 },
    { segment: 'ครอบครัว', coffee: 60, dessert: 85, food: 90, healthy: 65 },
    { segment: 'ผู้สูงอายุ', coffee: 70, dessert: 40, food: 75, healthy: 85 }
  ];

  const trendsData = [
    { month: 'ม.ค.', healthy: 65, coffee: 85, dessert: 70, fusion: 45 },
    { month: 'ก.พ.', healthy: 68, coffee: 88, dessert: 72, fusion: 50 },
    { month: 'มี.ค.', healthy: 72, coffee: 90, dessert: 68, fusion: 55 },
    { month: 'เม.ย.', healthy: 75, coffee: 85, dessert: 75, fusion: 60 },
    { month: 'พ.ค.', healthy: 78, coffee: 82, dessert: 78, fusion: 65 },
    { month: 'มิ.ย.', healthy: 82, coffee: 88, dessert: 80, fusion: 70 }
  ];

  const menuPerformance = [
    { name: 'กาแฟเย็น', popularity: 95, profitability: 80, satisfaction: 90 },
    { name: 'ข้าวผัด', popularity: 85, profitability: 90, satisfaction: 88 },
    { name: 'ส้มตำ', popularity: 80, profitability: 85, satisfaction: 92 },
    { name: 'เค้ก', popularity: 70, profitability: 75, satisfaction: 85 },
    { name: 'ชาไทย', popularity: 75, profitability: 78, satisfaction: 80 }
  ];

  const seasonalRecommendations = {
    spring: ['สลัดผลไม้', 'น้ำดื่มเฟรช', 'เมนูดีท็อกซ์'],
    summer: ['เครื่องดื่มเย็น', 'ไอศกรีม', 'ผลไม้แช่แข็ง'],
    autumn: ['กาแฟร้อน', 'ซุปร้อน', 'เบเกอรี่'],
    winter: ['ช็อกโกแลตร้อน', 'อาหารร้อน', 'ขนมอบอุ่น']
  };

  const getPopularityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const runMenuAnalysis = async () => {
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
              <Sparkles className="w-8 h-8 text-pink-600" />
              <h1 className="text-3xl font-bold">Smart Menu Recommendations</h1>
            </div>
            <p className="text-muted-foreground">
              แนะนำเมนูใหม่และเพิ่มประสิทธิภาพเมนูปัจจุบันด้วย AI
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="กลุ่มลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
                <SelectItem value="teens">วัยรุ่น-นักศึกษา</SelectItem>
                <SelectItem value="adults">ผู้ใหญ่วัยทำงาน</SelectItem>
                <SelectItem value="family">ครอบครัว</SelectItem>
                <SelectItem value="elderly">ผู้สูงอายุ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={runMenuAnalysis}
              disabled={isAnalyzing}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  วิเคราะห์ AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เมนูแนะนำ</CardTitle>
              <Sparkles className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                เมนูใหม่ที่น่าสนใจ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้คาดการณ์</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+฿28,200</div>
              <p className="text-xs text-muted-foreground">
                จากเมนูแนะนำ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความแม่นยำ</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.5%</div>
              <p className="text-xs text-muted-foreground">
                การทำนายความนิยม
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เทรนด์ปัจจุบัน</CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Healthy</div>
              <p className="text-xs text-muted-foreground">
                อาหารเพื่อสุขภาพ
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="recommendations">เมนูแนะนำ</TabsTrigger>
            <TabsTrigger value="customer-preferences">ความชอบลูกค้า</TabsTrigger>
            <TabsTrigger value="trends">เทรนด์ตลาด</TabsTrigger>
            <TabsTrigger value="performance">ประสิทธิภาพเมนู</TabsTrigger>
            <TabsTrigger value="seasonal">เมนูตามฤดูกาล</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              {menuRecommendations.map((menu) => (
                <Card key={menu.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{menu.name}</span>
                          <Badge variant="outline">{menu.category}</Badge>
                        </CardTitle>
                        <CardDescription>{menu.reason}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={getPopularityColor(menu.predictedPopularity)}>
                          {menu.predictedPopularity}% ความนิยม
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          ความมั่นใจ: {menu.confidence}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">ข้อมูลทางการตลาด</h5>
                        <div className="space-y-2 text-sm">
                          <div>กลุ่มเป้าหมาย: <span className="font-medium">{menu.targetSegment}</span></div>
                          <div>ฤดูกาล: <span className="font-medium">{menu.seasonality}</span></div>
                          <div>รายได้คาดการณ์: <span className="font-medium text-green-600">฿{menu.expectedRevenue.toLocaleString()}</span></div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">ต้นทุนและกำไร</h5>
                        <div className="space-y-2 text-sm">
                          <div>ต้นทุนต่อหน่วย: <span className="font-medium">฿{menu.estimatedCost}</span></div>
                          <div>อัตรากำไร: <span className="font-medium text-green-600">{menu.profitMargin}%</span></div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${menu.profitMargin}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">วัตถุดิบ</h5>
                        <div className="flex flex-wrap gap-2">
                          {menu.ingredients.map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full mt-3" size="sm">
                          เพิ่มเข้าเมนู
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customer-preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>ความชอบของลูกค้าตามกลุ่ม</span>
                </CardTitle>
                <CardDescription>
                  การวิเคราะห์ความชอบของลูกค้าในแต่ละกลุ่มอายุ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={customerSegmentPreferences}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="segment" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="กาแฟ" dataKey="coffee" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      <Radar name="ขนม" dataKey="dessert" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                      <Radar name="อาหาร" dataKey="food" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                      <Radar name="เพื่อสุขภาพ" dataKey="healthy" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>เทรนด์ความนิยมเมนู</span>
                </CardTitle>
                <CardDescription>
                  แนวโน้มความนิยมของประเภทอาหารในช่วง 6 เดือนที่ผ่านมา
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={3} name="อาหารเพื่อสุขภาพ" />
                      <Line type="monotone" dataKey="coffee" stroke="#8b5cf6" strokeWidth={2} name="เครื่องดื่มกาแฟ" />
                      <Line type="monotone" dataKey="dessert" stroke="#ec4899" strokeWidth={2} name="ของหวาน" />
                      <Line type="monotone" dataKey="fusion" stroke="#f59e0b" strokeWidth={2} name="ฟิวชั่น" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>ประสิทธิภาพเมนูปัจจุบัน</span>
                </CardTitle>
                <CardDescription>
                  การวิเคราะห์เมนูที่มีอยู่ในด้านความนิยม กำไร และความพึงพอใจ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuPerformance.map((menu, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{menu.name}</h4>
                        <div className="flex space-x-2">
                          <Badge variant="outline">
                            ความนิยม {menu.popularity}%
                          </Badge>
                          <Badge variant="outline">
                            กำไร {menu.profitability}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">ความนิยม</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${menu.popularity}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">ความกำไร</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${menu.profitability}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">ความพึงพอใจ</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${menu.satisfaction}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(seasonalRecommendations).map(([season, items], index) => (
                <Card key={season}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {season === 'spring' && 'ฤดูใบไม้ผลิ'}
                      {season === 'summer' && 'ฤดูร้อน'}
                      {season === 'autumn' && 'ฤดูใบไม้ร่วง'}
                      {season === 'winter' && 'ฤดูหนาว'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-2 border rounded">
                          <span>{item}</span>
                          <Button variant="outline" size="sm">
                            ดูรายละเอียด
                          </Button>
                        </div>
                      ))}
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

export default SmartMenuRecommendations;
