import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Shell } from '@/components/Shell';
import { 
  Zap,
  Target,
  Users,
  TrendingUp,
  Mail,
  MessageSquare,
  Bell,
  MousePointerClick,
  Calendar,
  BarChart3,
  Eye,
  Heart,
  Share2,
  Award,
  Clock,
  DollarSign,
  Sparkles,
  Brain,
  Activity
} from 'lucide-react';

const AutomatedMarketing = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [campaignName, setCampaignName] = useState('');
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const customerSegments = [
    { id: 1, name: 'ลูกค้าใหม่', size: 1200, engagement: 0.15 },
    { id: 2, name: 'ลูกค้าประจำ', size: 800, engagement: 0.45 },
    { id: 3, name: 'ลูกค้า VIP', size: 300, engagement: 0.75 }
  ];

  const campaignPerformance = {
    opens: 4567,
    clicks: 1234,
    conversions: 345,
    ctr: 0.27,
    roi: 1.45
  };

  const topProducts = [
    { id: 1, name: 'กาแฟอาราบิก้า', sales: 567 },
    { id: 2, name: 'เค้กช็อกโกแลต', sales: 456 },
    { id: 3, name: 'ชาเขียวมัทฉะ', sales: 345 }
  ];

  const runCampaignAnalysis = async () => {
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
              <Sparkles className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold">Automated Marketing</h1>
            </div>
            <p className="text-muted-foreground">
              สร้างแคมเปญการตลาดอัตโนมัติและเพิ่มยอดขาย
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={runCampaignAnalysis}
              disabled={isAnalyzing}
              className="bg-orange-600 hover:bg-orange-700"
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
              <CardTitle className="text-sm font-medium">ลูกค้าเป้าหมาย</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,300</div>
              <p className="text-xs text-muted-foreground">
                ลูกค้าที่สามารถเข้าถึงได้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดขายเพิ่มขึ้น</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-muted-foreground">
                จากการตลาดอัตโนมัติ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">
                อัตราการเปลี่ยนเป็นลูกค้า
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ช่องทางหลัก</CardTitle>
              <Activity className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Email</div>
              <p className="text-xs text-muted-foreground">
                การตลาดผ่านอีเมล
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaign" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaign">สร้างแคมเปญ</TabsTrigger>
            <TabsTrigger value="performance">ผลลัพธ์แคมเปญ</TabsTrigger>
          </TabsList>
          <TabsContent value="campaign">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดแคมเปญ</CardTitle>
                  <CardDescription>ตั้งค่าแคมเปญการตลาดของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed" htmlFor="campaignName">
                      ชื่อแคมเปญ
                    </label>
                    <Input 
                      type="text" 
                      id="campaignName" 
                      placeholder="ชื่อแคมเปญ" 
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                      กลุ่มเป้าหมาย
                    </label>
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกกลุ่มลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
                        <SelectItem value="new">ลูกค้าใหม่</SelectItem>
                        <SelectItem value="loyal">ลูกค้าประจำ</SelectItem>
                        <SelectItem value="vip">ลูกค้า VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                      ช่องทางการตลาด
                    </label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกช่องทาง" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">อีเมล</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed" htmlFor="message">
                      ข้อความ
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="ใส่ข้อความที่นี่..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                      เปิดใช้งาน
                    </label>
                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    สร้างแคมเปญ
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ตัวอย่างข้อความ</CardTitle>
                  <CardDescription>ดูตัวอย่างข้อความที่จะส่ง</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      {selectedChannel === 'email' && <Mail className="w-5 h-5 text-gray-500" />}
                      {selectedChannel === 'sms' && <MessageSquare className="w-5 h-5 text-gray-500" />}
                      {selectedChannel === 'push' && <Bell className="w-5 h-5 text-gray-500" />}
                      <span className="text-sm font-medium">ถึง: {selectedSegment === 'all' ? 'ลูกค้าทั้งหมด' : selectedSegment}</span>
                    </div>
                    <p className="mt-2 text-sm">
                      {message || 'ใส่ข้อความที่นี่...'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MousePointerClick className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">คลิกเพื่อดูรายละเอียด</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ภาพรวมแคมเปญ</CardTitle>
                  <CardDescription>สถิติแคมเปญล่าสุด</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">เปิด</div>
                      <div className="text-2xl font-bold">{campaignPerformance.opens}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">คลิก</div>
                      <div className="text-2xl font-bold">{campaignPerformance.clicks}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Conversion</div>
                      <div className="text-2xl font-bold">{campaignPerformance.conversions}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">CTR</div>
                      <div className="text-2xl font-bold">{(campaignPerformance.ctr * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">ROI</div>
                    <div className="text-2xl font-bold">{(campaignPerformance.roi * 100).toFixed(0)}%</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>สินค้าขายดี</CardTitle>
                  <CardDescription>สินค้าที่ได้รับความนิยมจากแคมเปญ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-lg font-bold">{product.sales}</div>
                    </div>
                  ))}
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
