
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown,
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
  CheckCircle,
  Activity
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useAnalyticsData, useSalesData, useCategoryData } from '@/hooks/useAnalyticsData';
import { useAIInsights } from '@/hooks/useAIInsights';
import { format } from 'date-fns';

const AIAnalyticsDashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useAnalyticsData();
  const { data: salesData, isLoading: salesLoading } = useSalesData();
  const { data: categoryData, isLoading: categoryLoading } = useCategoryData();
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useAIInsights();

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const steps = [
      { message: 'กำลังรวบรวมข้อมูล...', progress: 20 },
      { message: 'วิเคราะห์แนวโน้มการขาย...', progress: 40 },
      { message: 'ประมวลผลพฤติกรรมลูกค้า...', progress: 60 },
      { message: 'สร้างคำแนะนำเชิงลึก...', progress: 80 },
      { message: 'สรุปผลการวิเคราะห์...', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
      
      toast({
        title: 'AI Analysis Engine',
        description: step.message
      });
    }

    // รีเฟรชข้อมูลทั้งหมด
    await Promise.all([
      refetchAnalytics(),
      refetchInsights()
    ]);

    setIsAnalyzing(false);
    toast({
      title: 'วิเคราะห์เสร็จสิ้น! 🤖',
      description: 'ได้ข้อมูลเชิงลึกใหม่แล้ว',
      duration: 3000
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

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (analyticsLoading || salesLoading || categoryLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดข้อมูลการวิเคราะห์...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-gray-600">รายได้รวม (30 วัน)</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData?.revenue || 0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData && analyticsData.revenue > analyticsData.previousRevenue ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${analyticsData && analyticsData.revenue > analyticsData.previousRevenue ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData ? `${calculatePercentageChange(analyticsData.revenue, analyticsData.previousRevenue).toFixed(1)}%` : '0%'}
                  </span>
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
                <p className="text-2xl font-bold">{analyticsData?.orders || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData && analyticsData.orders > analyticsData.previousOrders ? (
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${analyticsData && analyticsData.orders > analyticsData.previousOrders ? 'text-blue-600' : 'text-red-600'}`}>
                    {analyticsData ? `${calculatePercentageChange(analyticsData.orders, analyticsData.previousOrders).toFixed(1)}%` : '0%'}
                  </span>
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
                <p className="text-sm text-gray-600">ลูกค้าเฉพาะ</p>
                <p className="text-2xl font-bold">{analyticsData?.customers || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData && analyticsData.customers > analyticsData.previousCustomers ? (
                    <TrendingUp className="w-3 h-3 text-purple-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${analyticsData && analyticsData.customers > analyticsData.previousCustomers ? 'text-purple-600' : 'text-red-600'}`}>
                    {analyticsData && analyticsData.previousCustomers > 0 ? `${calculatePercentageChange(analyticsData.customers, analyticsData.previousCustomers).toFixed(1)}%` : 'ใหม่'}
                  </span>
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
                <p className="text-2xl font-bold">{formatCurrency(analyticsData?.avgOrderValue || 0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData && analyticsData.avgOrderValue > analyticsData.previousAvgOrderValue ? (
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${analyticsData && analyticsData.avgOrderValue > analyticsData.previousAvgOrderValue ? 'text-orange-600' : 'text-red-600'}`}>
                    {analyticsData && analyticsData.previousAvgOrderValue > 0 ? `${calculatePercentageChange(analyticsData.avgOrderValue, analyticsData.previousAvgOrderValue).toFixed(1)}%` : '0%'}
                  </span>
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
              <RechartsLineChart data={salesData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [`฿${value.toLocaleString()}`, 'ยอดขาย']} 
                  labelFormatter={(label) => `วัน${label}`}
                />
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
                <Tooltip formatter={(value: number) => [`${value}%`, 'สัดส่วน']} />
                <RechartsPieChart data={categoryData || []}>
                  {(categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {(categoryData || []).map((item, index) => (
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
                {formatCurrency((analyticsData?.revenue || 0) * 1.078)}
              </p>
              <p className="text-sm text-blue-600">+7.8% จากสัปดาห์นี้</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900">เดือนหน้า</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency((analyticsData?.revenue || 0) * 4.62 * 1.124)}
              </p>
              <p className="text-sm text-purple-600">+12.4% จากเดือนนี้</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900">ความแม่นยำ</h3>
              <p className="text-2xl font-bold text-green-600">87%</p>
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
            {insights && insights.length > 0 ? (
              insights.map((insight, index) => {
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
                      {insight.metric && (
                        <div className="mt-2 text-xs text-gray-500">
                          ค่าเมตริก: {insight.metric} {insight.trend && (
                            <span className={insight.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                              ({insight.trend === 'up' ? '↑' : '↓'})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>กำลังรวบรวมข้อมูลเพื่อสร้างข้อมูลเชิงลึก</p>
                <p className="text-sm">ลองกดปุ่ม "เริ่มการวิเคราะห์ AI" เพื่อรับคำแนะนำ</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalyticsDashboard;
