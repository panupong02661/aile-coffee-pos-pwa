
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

interface AnalyticsData {
  totalCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
  retentionRate: number;
  growthRate: number;
}

const SegmentAnalytics = ({ data }: { data: AnalyticsData }) => {
  const metrics = [
    {
      title: 'ลูกค้าทั้งหมด',
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
      change: '+12%',
      positive: true
    },
    {
      title: 'รายได้รวม',
      value: `฿${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+8.5%',
      positive: true
    },
    {
      title: 'ยอดเฉลี่ยต่อออเดอร์',
      value: `฿${data.avgOrderValue}`,
      icon: TrendingUp,
      change: '-2.1%',
      positive: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.positive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ml-1 ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>อัตราการกลับมาซื้อ</CardTitle>
          <CardDescription>แยกตามกลุ่มลูกค้า</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">VIP ลูกค้า</span>
                <Badge variant="secondary">92%</Badge>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">ลูกค้าประจำ</span>
                <Badge variant="secondary">78%</Badge>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">ลูกค้าใหม่</span>
                <Badge variant="secondary">45%</Badge>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">ลูกค้าไม่ประจำ</span>
                <Badge variant="secondary">23%</Badge>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentAnalytics;
