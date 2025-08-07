
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Shell } from '@/components/Shell';
import { 
  Users, 
  Target, 
  TrendingUp,
  PieChart,
  BarChart3,
  Filter,
  Search,
  Download,
  Mail,
  MessageCircle,
  Gift,
  Star,
  ShoppingBag,
  Calendar,
  DollarSign
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const CustomerSegmentation = () => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Customer segments data
  const customerSegments = [
    {
      id: 'champions',
      name: 'ลูกค้า Champions',
      description: 'ลูกค้าที่มีความถี่และยอดซื้อสูงสุด',
      count: 145,
      percentage: 12.5,
      color: '#10b981',
      avgSpend: 1250,
      frequency: 15.2,
      lastPurchase: 3,
      characteristics: ['ซื้อบ่อย', 'ยอดสูง', 'ลูกค้าภักดี'],
      marketingStrategy: ['โปรโมชั่นพิเศษ', 'สิทธิประโยชน์เฉพาะ', 'ข้อมูลข่าวสารก่อนใคร']
    },
    {
      id: 'loyal_customers',
      name: 'ลูกค้าภักดี',
      description: 'ซื้อบ่อยแต่ยอดปานกลาง',
      count: 289,
      percentage: 24.8,
      color: '#3b82f6',
      avgSpend: 850,
      frequency: 12.8,
      lastPurchase: 5,
      characteristics: ['ความถี่สูง', 'ยอดปานกลาง', 'มั่นคง'],
      marketingStrategy: ['เพิ่มยอดซื้อต่อครั้ง', 'แนะนำสินค้าเพิ่มเติม', 'โปรแกรม Cross-sell']
    },
    {
      id: 'potential_loyalists',
      name: 'ลูกค้าที่มีศักยภาพ',
      description: 'ลูกค้าใหม่ที่มีแนวโน้มดี',
      count: 356,
      percentage: 30.5,
      color: '#f59e0b',
      avgSpend: 650,
      frequency: 8.5,
      lastPurchase: 8,
      characteristics: ['ลูกค้าใหม่', 'มีศักยภาพ', 'กำลังทดลอง'],
      marketingStrategy: ['สร้างความพึงพอใจ', 'โปรแกรมสมาชิก', 'ติดตาม Follow-up']
    },
    {
      id: 'at_risk',
      name: 'ลูกค้าเสี่ยงหลุด',
      description: 'เคยซื้อมากแต่ลดลง',
      count: 198,
      percentage: 17.0,
      color: '#ef4444',
      avgSpend: 950,
      frequency: 3.2,
      lastPurchase: 45,
      characteristics: ['เคยซื้อมาก', 'ความถี่ลดลง', 'เสี่ยงสูญเสีย'],
      marketingStrategy: ['Win-back Campaign', 'โปรโมชั่นพิเศษ', 'สอบถามปัญหา']
    },
    {
      id: 'hibernating',
      name: 'ลูกค้าหยุดซื้อ',
      description: 'ไม่ได้ซื้อมานาน',
      count: 178,
      percentage: 15.2,
      color: '#6b7280',
      avgSpend: 420,
      frequency: 1.8,
      lastPurchase: 120,
      characteristics: ['ไม่ซื้อมานาน', 'ยอดต่ำ', 'อาจสูญเสีย'],
      marketingStrategy: ['Re-engagement', 'ส่วนลดพิเศษ', 'สำรวจความต้องการ']
    }
  ];

  // RFM Analysis data
  const rfmData = [
    { segment: 'Champions', recency: 9, frequency: 9, monetary: 9 },
    { segment: 'Loyal', recency: 7, frequency: 8, monetary: 6 },
    { segment: 'Potential', recency: 8, frequency: 6, monetary: 5 },
    { segment: 'At Risk', recency: 3, frequency: 8, monetary: 7 },
    { segment: 'Hibernating', recency: 1, frequency: 2, monetary: 3 },
  ];

  // Customer behavior by segment
  const behaviorData = [
    { segment: 'Champions', mobile: 85, desktop: 15, avgSessionTime: 12.5, cartAbandonment: 15 },
    { segment: 'Loyal', mobile: 75, desktop: 25, avgSessionTime: 9.8, cartAbandonment: 22 },
    { segment: 'Potential', mobile: 90, desktop: 10, avgSessionTime: 7.2, cartAbandonment: 35 },
    { segment: 'At Risk', mobile: 70, desktop: 30, avgSessionTime: 5.1, cartAbandonment: 45 },
    { segment: 'Hibernating', mobile: 60, desktop: 40, avgSessionTime: 3.2, cartAbandonment: 65 },
  ];

  const totalCustomers = customerSegments.reduce((sum, segment) => sum + segment.count, 0);

  const selectedSegmentData = useMemo(() => {
    return customerSegments.find(segment => segment.id === selectedSegment);
  }, [selectedSegment]);

  return (
    <Shell>
      <div className="container max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Customer Segmentation</h1>
            </div>
            <p className="text-gray-600">จัดกลุ่มลูกค้าตามพฤติกรรมการซื้อ เพื่อสร้างกลยุทธ์การตลาดที่เหมาะสม</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              กรองข้อมูล
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ส่งออกข้อมูล
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              <div className="text-xs text-gray-500">แบ่งเป็น 5 กลุ่ม</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กลุ่มที่ดีที่สุด</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Champions</div>
              <div className="text-xs text-green-600">12.5% ของลูกค้าทั้งหมด</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ค่าเฉลี่ยต่อลูกค้า</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿749</div>
              <div className="text-xs text-gray-500">ในช่วง 3 เดือน</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ลูกค้าเสี่ยงหลุด</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">376</div>
              <div className="text-xs text-red-500">ต้องดูแลเป็นพิเศษ</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="segments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="segments">กลุ่มลูกค้า</TabsTrigger>
            <TabsTrigger value="rfm">RFM Analysis</TabsTrigger>
            <TabsTrigger value="behavior">พฤติกรรมการซื้อ</TabsTrigger>
            <TabsTrigger value="campaigns">แคมเปญการตลาด</TabsTrigger>
          </TabsList>

          {/* Customer Segments */}
          <TabsContent value="segments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>การแจกแจงกลุ่มลูกค้า</CardTitle>
                  <CardDescription>สัดส่วนลูกค้าในแต่ละกลุ่ม</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={customerSegments}
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        onClick={(data) => setSelectedSegment(data.id)}
                      >
                        {customerSegments.map((segment) => (
                          <Cell key={segment.id} fill={segment.color} />
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
                  <CardDescription>
                    {selectedSegmentData ? `ข้อมูลกลุ่ม ${selectedSegmentData.name}` : 'คลิกที่กลุ่มในกราฟเพื่อดูรายละเอียด'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSegmentData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: selectedSegmentData.color }}
                          ></div>
                          <span className="font-semibold">{selectedSegmentData.name}</span>
                        </div>
                        <Badge>{selectedSegmentData.count} คน</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">ยอดซื้อเฉลี่ย</div>
                          <div className="text-lg font-semibold">฿{selectedSegmentData.avgSpend}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">ความถี่ซื้อ</div>
                          <div className="text-lg font-semibold">{selectedSegmentData.frequency} ครั้ง/เดือน</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-2">ลักษณะเด่น</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSegmentData.characteristics.map((char, index) => (
                            <Badge key={index} variant="outline">{char}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-2">กลยุทธ์การตลาด</div>
                        <ul className="space-y-1">
                          {selectedSegmentData.marketingStrategy.map((strategy, index) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>คลิกที่กลุ่มในกราฟเพื่อดูรายละเอียด</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              {customerSegments.map((segment) => (
                <Card key={segment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        ></div>
                        <div>
                          <div className="font-semibold">{segment.name}</div>
                          <div className="text-sm text-gray-600">{segment.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="font-semibold">{segment.count}</div>
                          <div className="text-xs text-gray-500">ลูกค้า</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{segment.percentage}%</div>
                          <div className="text-xs text-gray-500">สัดส่วน</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">฿{segment.avgSpend}</div>
                          <div className="text-xs text-gray-500">ยอดเฉลี่ย</div>
                        </div>
                        <Button size="sm" variant="outline">
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* RFM Analysis */}
          <TabsContent value="rfm">
            <Card>
              <CardHeader>
                <CardTitle>RFM Analysis</CardTitle>
                <CardDescription>การวิเคราะห์ลูกค้าด้วย Recency, Frequency, Monetary</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={rfmData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis dataKey="segment" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="recency" fill="#ef4444" name="Recency" />
                    <Bar dataKey="frequency" fill="#3b82f6" name="Frequency" />
                    <Bar dataKey="monetary" fill="#10b981" name="Monetary" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Analysis */}
          <TabsContent value="behavior">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>พฤติกรรมการใช้งาน</CardTitle>
                  <CardDescription>เปรียบเทียบพฤติกรรมระหว่างกลุ่ม</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={behaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgSessionTime" fill="#3b82f6" name="เวลาเฉลี่ย (นาที)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>อัตราการยกเลิกตะกร้า</CardTitle>
                  <CardDescription>เปรียบเทียบอัตราการยกเลิกตะกร้าของแต่ละกลุ่ม</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={behaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cartAbandonment" fill="#ef4444" name="การยกเลิก (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Marketing Campaigns */}
          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customerSegments.slice(0, 4).map((segment) => (
                <Card key={segment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span>{segment.name}</span>
                    </CardTitle>
                    <CardDescription>แคมเปญการตลาดที่แนะนำ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {segment.marketingStrategy.map((strategy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{strategy}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          สร้างแคมเปญ
                        </Button>
                      </div>
                    ))}
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

export default CustomerSegmentation;
