import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  Clock,
  Eye,
  Target,
  Activity,
  Calendar
} from 'lucide-react';
import { useDashboardStatsOptimized } from '@/hooks/useDashboardStatsOptimized';

const AnalyticsDashboardContent = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const { dashboardStats, loading, hourlyData, dailyData, monthlyData } = useDashboardStatsOptimized();

  // Convert hourly data to customer behavior format with useMemo
  const customerBehavior = useMemo(() => hourlyData.map(data => ({
    hour: `${data.hour.toString().padStart(2, '0')}:00`,
    visitors: data.orders * 3, // Estimate: assume 3 visitors per order
    orders: data.orders,
    conversion: data.orders > 0 ? Math.round((data.orders / (data.orders * 3)) * 100) : 0
  })), [hourlyData]);

  // Use top products from dashboard stats with useMemo
  const productPerformance = useMemo(() => dashboardStats.topProducts.slice(0, 5).map(product => ({
    name: product.name,
    sales: product.quantity,
    revenue: product.revenue,
    margin: 65 // Default margin estimate
  })), [dashboardStats.topProducts]);

  // Calculate channel distribution from payment methods with useMemo
  const channelData = useMemo(() => {
    const totalSales = dashboardStats.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    return [
      { name: 'POS', value: totalSales > 0 ? Math.round((dashboardStats.todaySales / totalSales) * 100) : 65, color: '#8884d8' },
      { name: 'Mobile App', value: 25, color: '#82ca9d' },
      { name: 'Online', value: 10, color: '#ffc658' }
    ];
  }, [dashboardStats.paymentMethods, dashboardStats.todaySales]);

  // Use member tiers from dashboard stats with useMemo
  const customerSegments = useMemo(() => dashboardStats.memberTierStats.map(tier => ({
    segment: tier.tier === 'platinum' ? 'VIP' : tier.tier === 'gold' ? 'Regular' : 'New',
    count: tier.count,
    revenue: tier.total_spent,
    avgOrder: tier.count > 0 ? Math.round(tier.total_spent / tier.count) : 0
  })), [dashboardStats.memberTierStats]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800">Analytics Dashboard</h1>
          <p className="text-coffee-600 mt-2">วิเคราะห์พฤติกรรมลูกค้าและยอดขายตามช่วงเวลา</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24hours">24 ชั่วโมงที่ผ่านมา</SelectItem>
            <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
            <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
            <SelectItem value="90days">90 วันที่ผ่านมา</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todayOrders * 3}</div>
            <p className="text-xs text-muted-foreground">
              <span className={dashboardStats.salesGrowthRate > 0 ? "text-green-600" : "text-red-600"}>
                {dashboardStats.salesGrowthRate > 0 ? '+' : ''}{dashboardStats.salesGrowthRate.toFixed(1)}%
              </span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.todayOrders > 0 ? Math.round((dashboardStats.todayOrders / (dashboardStats.todayOrders * 3)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{dashboardStats.averageOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.peakHours.length > 0 ? 
                `${dashboardStats.peakHours[0].hour.toString().padStart(2, '0')}:00` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.peakHours.length > 0 ? 
                `${dashboardStats.peakHours[0].orders} orders` : 
                'No data'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList>
          <TabsTrigger value="behavior">Customer Behavior</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="channels">Sales Channels</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Traffic & Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={customerBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="visitors"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Visitors"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      stroke="#ff7300"
                      strokeWidth={3}
                      name="Conversion %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} orders • Margin: {product.margin}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₿{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{channel.value}%</p>
                      <p className="text-sm text-muted-foreground">of total sales</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment) => (
                  <div key={segment.segment} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{segment.segment} Customers</h3>
                      <Badge variant="secondary">{segment.count} customers</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-bold">₿{segment.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="text-lg font-bold">₿{segment.avgOrder}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboardContent;