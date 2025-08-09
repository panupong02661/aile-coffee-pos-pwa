
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, TrendingUp, Star, Calendar, ShoppingBag } from 'lucide-react';

const CustomerAnalytics = () => {
  const customerSegments = [
    { name: 'ลูกค้าใหม่', value: 35, color: '#8884d8' },
    { name: 'ลูกค้าประจำ', value: 45, color: '#82ca9d' },
    { name: 'ลูกค้า VIP', value: 20, color: '#ffc658' }
  ];

  const ageGroups = [
    { age: '18-25', count: 120, percentage: 30 },
    { age: '26-35', count: 180, percentage: 45 },
    { age: '36-45', count: 80, percentage: 20 },
    { age: '46+', count: 20, percentage: 5 }
  ];

  const loyaltyStats = [
    { tier: 'Bronze', count: 250, percentage: 60 },
    { tier: 'Silver', count: 120, percentage: 28 },
    { tier: 'Gold', count: 40, percentage: 10 },
    { tier: 'Platinum', count: 8, percentage: 2 }
  ];

  const visitFrequency = [
    { frequency: 'สัปดาห์ละครั้ง', count: 150 },
    { frequency: 'เดือนละ 2-3 ครั้ง', count: 180 },
    { frequency: 'เดือนละครั้ง', count: 80 },
    { frequency: 'น้อยกว่าเดือนละครั้ง', count: 40 }
  ];

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">การวิเคราะห์ลูกค้า</h1>
          <p className="text-gray-600">วิเคราะห์พฤติกรรมและข้อมูลลูกค้าเชิงลึก</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                ลูกค้าทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">418</div>
              <p className="text-xs text-green-600">+12% เดือนนี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                ลูกค้าใหม่เดือนนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-blue-600">+18% จากเดือนก่อน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="w-4 h-4 mr-2" />
                ลูกค้า VIP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-yellow-600">11.5% ของทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                อัตราการกลับมา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-green-600">+5% จากเดือนก่อน</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Customer Segments Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>กลุ่มลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Visit Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>ความถี่ในการเยี่ยมชม</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="frequency" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Age Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                กลุ่มอายุลูกค้า
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ageGroups.map((group) => (
                  <div key={group.age} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium w-16">{group.age} ปี</span>
                      <Progress value={group.percentage} className="w-32" />
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{group.count} คน</span>
                      <p className="text-sm text-gray-600">{group.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Program Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                โปรแกรมสมาชิก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyStats.map((stat) => (
                  <div key={stat.tier} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={
                          stat.tier === 'Platinum' ? 'default' :
                          stat.tier === 'Gold' ? 'secondary' :
                          stat.tier === 'Silver' ? 'outline' : 'destructive'
                        }
                        className={
                          stat.tier === 'Platinum' ? 'bg-purple-600' :
                          stat.tier === 'Gold' ? 'bg-yellow-600' :
                          stat.tier === 'Silver' ? 'bg-gray-400' : ''
                        }
                      >
                        {stat.tier}
                      </Badge>
                      <Progress value={stat.percentage} className="w-24" />
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{stat.count} คน</span>
                      <p className="text-sm text-gray-600">{stat.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
};

export default CustomerAnalytics;
