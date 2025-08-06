
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shell } from '@/components/Shell';
import { 
  Megaphone,
  Target,
  Mail,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  ClickPointer,
  Star,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Send,
  Play,
  Pause,
  Settings
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
  ComposedChart,
  Legend
} from 'recharts';

const AutomatedMarketing = () => {
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const activeCampaigns = [
    {
      id: 1,
      name: 'โปรโมชั่นกาแฟเย็นฤดูร้อน',
      type: 'email',
      status: 'active',
      targetAudience: 'ลูกค้าประจำ',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      reach: 2847,
      clicks: 456,
      conversions: 89,
      revenue: 15670,
      budget: 5000,
      roi: 213
    },
    {
      id: 2,
      name: 'แคมเปญอาหารมื้อเที่ยง',
      type: 'sms',
      status: 'active',
      targetAudience: 'ลูกค้าใกล้ร้าน',
      startDate: '2024-01-10',
      endDate: '2024-01-31',
      reach: 1523,
      clicks: 287,
      conversions: 76,
      revenue: 12450,
      budget: 3000,
      roi: 315
    },
    {
      id: 3,
      name: 'โปรโมชั่นสมาชิกใหม่',
      type: 'push',
      status: 'paused',
      targetAudience: 'สมาชิกใหม่',
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      reach: 892,
      clicks: 178,
      conversions: 45,
      revenue: 8900,
      budget: 2500,
      roi: 256
    }
  ];

  const campaignPerformance = [
    { date: '2024-01-10', emails: 245, sms: 189, push: 167, conversions: 78 },
    { date: '2024-01-11', emails: 289, sms: 201, push: 145, conversions: 89 },
    { date: '2024-01-12', emails: 321, sms: 234, push: 189, conversions: 95 },
    { date: '2024-01-13', emails: 298, sms: 187, push: 156, conversions: 87 },
    { date: '2024-01-14', emails: 356, sms: 267, push: 198, conversions: 112 },
    { date: '2024-01-15', emails: 378, sms: 289, push: 223, conversions: 125 },
    { date: '2024-01-16', emails: 334, sms: 245, push: 187, conversions: 98 }
  ];

  const audienceSegments = [
    { name: 'ลูกค้าประจำ', size: 1247, engagement: 85, value: 'สูง', color: '#10b981' },
    { name: 'ลูกค้าใหม่', size: 892, engagement: 72, value: 'กลาง', color: '#3b82f6' },
    { name: 'ลูกค้าไม่ใช้งาน', size: 456, engagement: 45, value: 'ต่ำ', color: '#f59e0b' },
    { name: 'ลูกค้า VIP', size: 234, engagement: 95, value: 'สูงมาก', color: '#8b5cf6' }
  ];

  const campaignTemplates = [
    {
      id: 1,
      name: 'ยินดีต้อนรับสมาชิกใหม่',
      type: 'email',
      description: 'ส่งอัตโนมัติเมื่อมีสมาชิกใหม่สมัคร',
      trigger: 'new_member',
      expectedEngagement: 78,
      estimatedRoi: 145
    },
    {
      id: 2,
      name: 'เตือนลูกค้าที่ไม่กลับมา',
      type: 'email',
      description: 'ส่งให้ลูกค้าที่ไม่ใช้งานนาน 30 วัน',
      trigger: 'inactive_30days',
      expectedEngagement: 65,
      estimatedRoi: 189
    },
    {
      id: 3,
      name: 'โปรโมชั่นวันเกิด',
      type: 'sms',
      description: 'ส่งคูปองส่วนลดในวันเกิดลูกค้า',
      trigger: 'birthday',
      expectedEngagement: 92,
      estimatedRoi: 278
    },
    {
      id: 4,
      name: 'แนะนำสินค้าตามพฤติกรรม',
      type: 'push',
      description: 'แนะนำสินค้าตามประวัติการสั่งซื้อ',
      trigger: 'behavior_based',
      expectedEngagement: 83,
      estimatedRoi: 234
    }
  ];

  const marketingInsights = [
    {
      title: 'ช่วงเวลาส่งที่ดีที่สุด',
      description: 'ลูกค้าเปิดอีเมลมากที่สุดในช่วง 17:00-19:00',
      action: 'กำหนดเวลาส่งอัตโนมัติ',
      impact: 'เพิ่ม Open Rate 23%'
    },
    {
      title: 'กลุ่มลูกค้าที่ตอบสนองดี',
      description: 'ลูกค้าอายุ 25-35 ปี มีอัตราการแปลงสูงสุด',
      action: 'สร้างแคมเปญเฉพาะกลุ่ม',
      impact: 'เพิ่มยอดขาย 35%'
    },
    {
      title: 'ประเภทเนื้อหาที่นิยม',
      description: 'เนื้อหาที่มีรูปภาพสินค้าได้รับการคลิกสูง',
      action: 'เพิ่มรูปภาพในอีเมล',
      impact: 'เพิ่ม CTR 18%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'กำลังทำงาน';
      case 'paused': return 'หยุดชั่วคราว';
      case 'completed': return 'เสร็จสิ้น';
      case 'draft': return 'ร่าง';
      default: return status;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch(type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageCircle className="w-4 h-4" />;
      case 'push': return <Send className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const createNewCampaign = async () => {
    setIsCreatingCampaign(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCreatingCampaign(false);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Megaphone className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold">Automated Marketing Campaigns</h1>
            </div>
            <p className="text-muted-foreground">
              สร้างและจัดการแคมเปญการตลาดอัตโนมัติด้วย AI
            </p>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ประเภทแคมเปญ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">แคมเปญทั้งหมด</SelectItem>
                <SelectItem value="email">อีเมล</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วัน</SelectItem>
                <SelectItem value="30days">30 วัน</SelectItem>
                <SelectItem value="90days">90 วัน</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={createNewCampaign}
              disabled={isCreatingCampaign}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCreatingCampaign ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  สร้างแคมเปญใหม่
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แคมเปญที่ทำงาน</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                จาก 12 แคมเปญทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้เดือนนี้</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿47,890</div>
              <p className="text-xs text-green-600">
                +28% จากเดือนที่แล้ว
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">อัตราการแปลง</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.4%</div>
              <p className="text-xs text-blue-600">
                เหนือค่าเฉลี่ยอุตสาหกรรม
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI เฉลี่ย</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">267%</div>
              <p className="text-xs text-purple-600">
                ผลตอบแทนจากการลงทุน
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active-campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active-campaigns">แคมเปญปัจจุบัน</TabsTrigger>
            <TabsTrigger value="performance">ประสิทธิภาพ</TabsTrigger>
            <TabsTrigger value="audience">กลุ่มเป้าหมาย</TabsTrigger>
            <TabsTrigger value="templates">เทมเพลต</TabsTrigger>
            <TabsTrigger value="insights">ข้อมูลเชิงลึก</TabsTrigger>
          </TabsList>

          <TabsContent value="active-campaigns">
            <div className="space-y-6">
              {activeCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCampaignTypeIcon(campaign.type)}
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>
                            {campaign.targetAudience} • {campaign.startDate} - {campaign.endDate}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'active' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{campaign.reach.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">ผู้ได้รับ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{campaign.clicks}</div>
                        <div className="text-sm text-muted-foreground">คลิก</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{campaign.conversions}</div>
                        <div className="text-sm text-muted-foreground">การแปลง</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">฿{campaign.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">รายได้</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                      <span>ง산เบื้องต้น: ฿{campaign.budget.toLocaleString()}</span>
                      <span className="text-green-600 font-medium">ROI: {campaign.roi}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>ประสิทธิภาพแคมเปญ</span>
                </CardTitle>
                <CardDescription>
                  การติดตามผลงานของแคมเปญต่างๆ ในช่วง 7 วันที่ผ่านมา
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="emails" fill="#3b82f6" name="อีเมล" />
                      <Bar dataKey="sms" fill="#10b981" name="SMS" />
                      <Bar dataKey="push" fill="#f59e0b" name="Push" />
                      <Line type="monotone" dataKey="conversions" stroke="#ef4444" strokeWidth={3} name="การแปลง" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>กลุ่มเป้าหมาย</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={audienceSegments}
                        dataKey="size"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {audienceSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} คน`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดกลุ่มลูกค้า</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {audienceSegments.map((segment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          ></div>
                          <div>
                            <div className="font-medium">{segment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {segment.size} คน • มีส่วนร่วม {segment.engagement}%
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            segment.value === 'สูงมาก' ? 'text-purple-600' :
                            segment.value === 'สูง' ? 'text-green-600' :
                            segment.value === 'กลาง' ? 'text-blue-600' : 'text-orange-600'
                          }
                        >
                          {segment.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaignTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCampaignTypeIcon(template.type)}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{template.type.toUpperCase()}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>การมีส่วนร่วมคาดการณ์</span>
                        <span className="font-medium text-blue-600">{template.expectedEngagement}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ROI คาดการณ์</span>
                        <span className="font-medium text-green-600">{template.estimatedRoi}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>เงื่อนไขการเริ่มต้น</span>
                        <span className="text-muted-foreground">
                          {template.trigger === 'new_member' && 'สมาชิกใหม่'}
                          {template.trigger === 'inactive_30days' && 'ไม่ใช้งาน 30 วัน'}
                          {template.trigger === 'birthday' && 'วันเกิด'}
                          {template.trigger === 'behavior_based' && 'ตามพฤติกรรม'}
                        </span>
                      </div>
                      <Button className="w-full mt-4">
                        ใช้เทมเพลตนี้
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              {marketingInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <CardTitle>{insight.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="text-green-600">
                          {insight.impact}
                        </Badge>
                      </div>
                      <Button variant="outline">
                        {insight.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>คำแนะนำจาก AI</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">ปรับปรุงเวลาส่ง</h5>
                      <p className="text-sm text-blue-700">
                        การส่งอีเมลในช่วง 17:00-19:00 มีอัตราการเปิดสูงกว่า 23% เมื่อเทียบกับเวลาอื่น
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">เพิ่มความเป็นส่วนตัว</h5>
                      <p className="text-sm text-green-700">
                        อีเมลที่มีชื่อลูกค้าในหัวเรื่องมีอัตราการคลิกสูงกว่า 31%
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h5 className="font-medium text-orange-900 mb-2">ปรับปรุงเนื้อหา</h5>
                      <p className="text-sm text-orange-700">
                        เนื้อหาที่มีรูปภาพสินค้าคุณภาพสูงมีอัตราการแปลงสูงกว่า 45%
                      </p>
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

export default AutomatedMarketing;
