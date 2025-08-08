
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  trend: 'up' | 'down' | 'stable';
  predictions: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
  insights: Array<{
    type: 'opportunity' | 'warning' | 'success';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

const AIAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: 125400,
    orders: 847,
    customers: 234,
    avgOrderValue: 148,
    trend: 'up',
    predictions: {
      nextWeek: 135000,
      nextMonth: 580000,
      confidence: 87
    },
    insights: [
      {
        type: 'opportunity',
        title: 'เพิ่มยอดขายช่วงบ่าย',
        description: 'พบว่ายอดขายช่วง 14:00-16:00 ต่ำกว่าปกติ 23% แนะนำให้มีโปรโมชั่นพิเศษ',
        impact: 'high'
      },
      {
        type: 'success',
        title: 'เมนูใหม่ได้รับความนิยม',
        description: 'กาแฟเย็นมะม่วงได้รับการสั่งซื้อเพิ่มขึ้น 156% ในสัปดาห์นี้',
        impact: 'medium'
      },
      {
        type: 'warning',
        title: 'วัตถุดิบใกล้หมด',
        description: 'ถั่วกาแฟอาราบิก้าคาดว่าจะหมดใน 3 วัน ควรสั่งซื้อเพิ่ม',
        impact: 'high'
      }
    ]
  });

  const [salesData] = useState([
    { name: 'จันทร์', sales: 12000, orders: 45, customers: 32 },
    { name: 'อังคาร', sales: 15400, orders: 52, customers: 41 },
    { name: 'พุธ', sales: 18200, orders: 67, customers: 45 },
    { name: 'พฤหัส', sales: 21300, orders: 78, customers: 58 },
    { name: 'ศุกร์', sales: 28500, orders: 95, customers: 72 },
    { name: 'เสาร์', sales: 35600, orders: 124, customers: 89 },
    { name: 'อาทิตย์', sales: 32400, orders: 118, customers: 81 }
  ]);

  const [categoryData] = useState([
    { name: 'กาแฟร้อน', value: 45, color: '#8B4513' },
    { name: 'กาแฟเย็น', value: 35, color: '#CD853F' },
    { name: 'เครื่องดื่มอื่น', value: 12, color: '#DEB887' },
    { name: 'เบเกอรี่', value: 8, color: '#F4A460' }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // จำลองการวิเคราะห์ด้วย AI
    const steps = [
      'กำลังรวบรวมข้อมูล...',
      'วิเคราะห์แนวโน้ม...',
      'สร้างคำแนะนำ...',
      'คำนวณการทำนาย...',
      'สรุปผลลัพธ์...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress((i + 1) * 20);
      
      toast({
        title: 'AI Analysis',
        description: steps[i]
      });
    }

    setIsAnalyzing(false);
    toast({
      title: 'วิเคราะห์เสร็จสิ้น! 🤖',
      description: 'ได้ข้อมูลเชิงลึกใหม่แล้ว'
    });
  };

  const getInsightIcon = (type: 'opportunity' | 'warning' | 'success') => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
    }
  };

  const getInsightColor = (type: 'opportunity' | 'warning' | 'success') => {
    switch (type) {
      case 'opportunity': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'success': return 'bg-green-100 text-green-800';
    }
  };

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[impact]}>
        {impact === 'high' ? 'สูง' : impact === 'medium' ? 'กลาง' : 'ต่ำ'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Analytics Engine
            </CardTitle>
            <Button 
              onClick={runAIAnalysis} 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  เริ่มการวิเคราะห์ AI
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">ความคืบหน้า</span>
                <span className="text-sm text-gray-500">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">รายได้รวม</p>
                <p className="text-2xl font-bold">฿{analyticsData.revenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold">{analyticsData.orders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">+8.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">ลูกค้า</p>
                <p className="text-2xl font-bold">{analyticsData.customers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600">+15.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">ค่าเฉลี่ยต่อบิล</p>
                <p className="text-2xl font-bold">฿{analyticsData.avgOrderValue}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">+3.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              แนวโน้มยอดขาย (7 วันล่าสุด)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`฿${value}`, 'ยอดขาย']} />
                <Line type="monotone" dataKey="sales" stroke="#8B4513" strokeWidth={3} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              สัดส่วนประเภทสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart data={categoryData}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-gray-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            การทำนายด้วย AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">สัปดาห์หน้า</h3>
              <p className="text-2xl font-bold text-blue-600">
                ฿{analyticsData.predictions.nextWeek.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">+7.8% จากสัปดาห์นี้</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900">เดือนหน้า</h3>
              <p className="text-2xl font-bold text-purple-600">
                ฿{analyticsData.predictions.nextMonth.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">+12.4% จากเดือนนี้</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900">ความแม่นยำ</h3>
              <p className="text-2xl font-bold text-green-600">
                {analyticsData.predictions.confidence}%
              </p>
              <p className="text-sm text-green-600">จากข้อมูลในอดีต</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            ข้อมูลเชิงลึกจาก AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className={`p-2 rounded-lg ${insight.type === 'opportunity' ? 'bg-blue-100' : insight.type === 'warning' ? 'bg-orange-100' : 'bg-green-100'}`}>
                    <Icon className={`w-5 h-5 ${insight.type === 'opportunity' ? 'text-blue-600' : insight.type === 'warning' ? 'text-orange-600' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge className={getInsightColor(insight.type)}>
                        {insight.type === 'opportunity' ? 'โอกาส' : insight.type === 'warning' ? 'คำเตือน' : 'ความสำเร็จ'}
                      </Badge>
                      {getImpactBadge(insight.impact)}
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalyticsDashboard;
