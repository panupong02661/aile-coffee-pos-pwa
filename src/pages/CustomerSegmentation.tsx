
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shell } from '@/components/Shell';
import { Header } from '@/components/Header';
import { 
  Users, 
  ShoppingBag, 
  Target, 
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  Filter,
  Download,
  Mail,
  MessageSquare
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const CustomerSegmentation = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const { dashboardStats, loading } = useDashboardStats();

  // Mock customer segments data
  const customerSegments = [
    {
      id: 'vip',
      name: 'VIP ลูกค้าประจำ',
      description: 'ลูกค้าที่ซื้อมากกว่า 10,000 บาท/เดือน',
      count: 245,
      percentage: 8.6,
      avgSpent: 15420,
      frequency: 18.5,
      color: '#ef4444',
      growth: '+12%'
    },
    {
      id: 'regular',
      name: 'ลูกค้าประจำ',
      description: 'ลูกค้าที่ซื้อสม่ำเสมอ 3,000-10,000 บาท/เดือน',
      count: 892,
      percentage: 31.3,
      avgSpent: 6850,
      frequency: 12.3,
      color: '#f97316',
      growth: '+8%'
    },
    {
      id: 'occasional',
      name: 'ลูกค้าเป็นครั้งคราว',
      description: 'ลูกค้าที่ซื้อ 1,000-3,000 บาท/เดือน',
      count: 1156,
      percentage: 40.6,
      avgSpent: 2340,
      frequency: 6.8,
      color: '#eab308',
      growth: '+5%'
    },
    {
      id: 'new',
      name: 'ลูกค้าใหม่',
      description: 'ลูกค้าที่เพิ่งเข้ามาใน 30 วันล่าสุด',
      count: 554,
      percentage: 19.5,
      avgSpent: 890,
      frequency: 2.1,
      color: '#22c55e',
      growth: '+25%'
    }
  ];

  const segmentBehavior = [
    { time: '08:00', vip: 45, regular: 120, occasional: 80, new: 25 },
    { time: '10:00', vip: 55, regular: 180, occasional: 140, new: 45 },
    { time: '12:00', vip: 78, regular: 220, occasional: 190, new: 65 },
    { time: '14:00', vip: 65, regular: 160, occasional: 120, new: 35 },
    { time: '16:00', vip: 82, regular: 200, occasional: 160, new: 50 },
    { time: '18:00', vip: 95, regular: 250, occasional: 200, new: 70 },
    { time: '20:00', vip: 60, regular: 140, occasional: 100, new: 30 }
  ];

  const lifetimeValue = [
    { segment: 'VIP', value: 125000, customers: 245 },
    { segment: 'ประจำ', value: 45000, customers: 892 },
    { segment: 'เป็นครั้งคราว', value: 18000, customers: 1156 },
    { segment: 'ใหม่', value: 3500, customers: 554 }
  ];

  const retentionData = [
    { month: 'ม.ค.', vip: 98, regular: 85, occasional: 65, new: 45 },
    { month: 'ก.พ.', vip: 97, regular: 82, occasional: 62, new: 38 },
    { month: 'มี.ค.', vip: 96, regular: 80, occasional: 58, new: 32 },
    { month: 'เม.ย.', vip: 95, regular: 78, occasional: 55, new: 28 },
    { month: 'พ.ค.', vip: 94, regular: 75, occasional: 52, new: 25 },
    { month: 'มิ.ย.', vip: 93, regular: 73, occasional: 48, new: 22 }
  ];

  const getSegmentDetails = (segmentId: string) => {
    return customerSegments.find(seg => seg.id === segmentId) || customerSegments[0];
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header title="การแบ่งกลุ่มลูกค้า" />
      
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">การแบ่งกลุ่มลูกค้า</h1>
            <p className="text-gray-600">วิเคราะห์และจัดกลุ่มลูกค้าตามพฤติกรรมการซื้อ</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              กรองข้อมูล
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ส่งออก
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              ส่งแคมเปญ
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {customerSegments.map((segment) => (
            <Card 
              key={segment.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedSegment === segment.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedSegment(segment.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <Badge variant="outline" className="text-green-600">
                    {segment.growth}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-1">{segment.name}</h3>
                <div className="text-2xl font-bold mb-2">{segment.count.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{segment.percentage}% ของลูกค้าทั้งหมด</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
            <TabsTrigger value="value">มูลค่าลูกค้า</TabsTrigger>
            <TabsTrigger value="retention">การกลับมา</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การกระจายตัวของลูกค้า</CardTitle>
                  <CardDescription>สัดส่วนลูกค้าในแต่ละกลุ่ม</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerSegments}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}
                      >
                        {customerSegments.map((segment, index) => (
                          <Cell key={`cell-${index}`} fill={segment.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดกลุ่ม: {getSegmentDetails(selectedSegment).name}</CardTitle>
                  <CardDescription>{getSegmentDetails(selectedSegment).description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getSegmentDetails(selectedSegment).count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">จำนวนลูกค้า</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ฿{getSegmentDetails(selectedSegment).avgSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">ยอดเฉลี่ย/เดือน</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getSegmentDetails(selectedSegment).frequency}
                      </div>
                      <div className="text-sm text-gray-500">ครั้ง/เดือน</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {getSegmentDetails(selectedSegment).percentage}%
                      </div>
                      <div className="text-sm text-gray-500">สัดส่วน</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      สร้างแคมเปญสำหรับกลุ่มนี้
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior">
            <Card>
              <CardHeader>
                <CardTitle>พฤติกรรมการซื้อตามช่วงเวลา</CardTitle>
                <CardDescription>แสดงพฤติกรรมการซื้อของแต่ละกลุ่มลูกค้าตามช่วงเวลา</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={segmentBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="vip" stroke="#ef4444" strokeWidth={3} name="VIP" />
                    <Line type="monotone" dataKey="regular" stroke="#f97316" strokeWidth={2} name="ประจำ" />
                    <Line type="monotone" dataKey="occasional" stroke="#eab308" strokeWidth={2} name="เป็นครั้งคราว" />
                    <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} name="ใหม่" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Value Tab */}
          <TabsContent value="value">
            <Card>
              <CardHeader>
                <CardTitle>มูลค่าลูกค้าตลอดชีวิต (CLV)</CardTitle>
                <CardDescription>เปรียบเทียบมูลค่าลูกค้าเฉลี่ยของแต่ละกลุ่ม</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={lifetimeValue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention">
            <Card>
              <CardHeader>
                <CardTitle>อัตราการกลับมาของลูกค้า</CardTitle>
                <CardDescription>แสดงเปอร์เซ็นต์ลูกค้าที่กลับมาซื้อในแต่ละเดือน</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="vip" stroke="#ef4444" strokeWidth={3} name="VIP (%)" />
                    <Line type="monotone" dataKey="regular" stroke="#f97316" strokeWidth={2} name="ประจำ (%)" />
                    <Line type="monotone" dataKey="occasional" stroke="#eab308" strokeWidth={2} name="เป็นครั้งคราว (%)" />
                    <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} name="ใหม่ (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default CustomerSegmentation;
