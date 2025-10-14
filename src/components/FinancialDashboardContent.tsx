import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Receipt,
  CreditCard,
  Banknote,
  PieChart as PieChartIcon,
  FileText
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const FinancialDashboardContent = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const { dashboardStats, loading, monthlyData, dailyData } = useDashboardStats();

  // Calculate financial data from dashboard stats
  const estimatedExpenses = dashboardStats.monthSales * 0.58; // Estimate 58% expenses
  const financialSummary = {
    revenue: dashboardStats.monthSales,
    expenses: estimatedExpenses,
    profit: dashboardStats.monthNetSales,
    margin: dashboardStats.monthSales > 0 ? (dashboardStats.monthNetSales / dashboardStats.monthSales * 100) : 0,
    tax: dashboardStats.monthNetSales * 0.07, // 7% VAT estimate
    cashFlow: dashboardStats.monthNetSales * 0.85 // Estimate 85% cash flow
  };

  // Use monthly data for financial trends
  const monthlyFinancials = monthlyData.slice(-6).map((data, index) => {
    const expenses = data.sales * 0.58;
    const profit = data.sales - expenses;
    return {
      month: data.month || `Month ${index + 1}`,
      revenue: data.sales,
      expenses: expenses,
      profit: profit,
      tax: profit * 0.07
    };
  });

  const expenseBreakdown = [
    { category: 'วัตถุดิบ', amount: estimatedExpenses * 0.515, percentage: 51.5, color: '#8884d8' },
    { category: 'เงินเดือนพนักงาน', amount: estimatedExpenses * 0.273, percentage: 27.3, color: '#82ca9d' },
    { category: 'ค่าเช่า', amount: estimatedExpenses * 0.121, percentage: 12.1, color: '#ffc658' },
    { category: 'สาธารณูปโภค', amount: estimatedExpenses * 0.048, percentage: 4.8, color: '#ff7300' },
    { category: 'อื่นๆ', amount: estimatedExpenses * 0.042, percentage: 4.2, color: '#00c49f' }
  ];

  const revenueChannels = dashboardStats.paymentMethods.map(method => ({
    channel: method.method === 'cash' ? 'POS' : method.method === 'promptpay' ? 'Mobile App' : 'Online Orders',
    amount: method.amount,
    percentage: method.percentage
  }));

  // Calculate weekly cash flow from daily data
  const weeklyData = dailyData.slice(-28);
  const cashFlowData = Array.from({ length: 4 }, (_, weekIndex) => {
    const weekData = weeklyData.slice(weekIndex * 7, (weekIndex + 1) * 7);
    const inflow = weekData.reduce((sum, day) => sum + day.sales, 0);
    const outflow = inflow * 0.58;
    return {
      week: `Week ${weekIndex + 1}`,
      inflow: inflow,
      outflow: outflow,
      net: inflow - outflow
    };
  });

  const taxDetails = [
    { type: 'VAT (7%)', base: financialSummary.revenue, amount: financialSummary.revenue * 0.07, status: 'pending' },
    { type: 'Corporate Tax (20%)', base: financialSummary.profit, amount: financialSummary.profit * 0.20, status: 'calculated' },
    { type: 'Withholding Tax (3%)', base: estimatedExpenses * 0.273, amount: estimatedExpenses * 0.273 * 0.03, status: 'paid' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-coffee-800">Financial Dashboard</h1>
          <p className="text-coffee-600 mt-2">กำไรขาดทุน กระแสเงินสด และการคำนวณภาษี</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
            <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
            <SelectItem value="90days">90 วันที่ผ่านมา</SelectItem>
            <SelectItem value="1year">1 ปีที่ผ่านมา</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{financialSummary.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={dashboardStats.monthSalesGrowthRate >= 0 ? "text-green-600" : "text-red-600"}>
                {dashboardStats.monthSalesGrowthRate >= 0 ? '+' : ''}{dashboardStats.monthSalesGrowthRate.toFixed(1)}%
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{financialSummary.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{financialSummary.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net profit this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.margin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Profit margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{Math.round(financialSummary.tax).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Due next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{Math.round(financialSummary.cashFlow).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Positive</span> this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Streams</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="tax">Tax Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `฿${Math.round(value as number).toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={3} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={3} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `฿${Math.round(value as number).toLocaleString()}`} />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `฿${Math.round(value as number).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseBreakdown.map((expense) => (
                  <div key={expense.category} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: expense.color }}
                      />
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">฿{Math.round(expense.amount).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{expense.percentage}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueChannels.map((channel) => (
                  <div key={channel.channel} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{channel.channel}</h3>
                      <Badge variant="secondary">{channel.percentage}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">฿{Math.round(channel.amount).toLocaleString()}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${channel.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => `฿${Math.round(value as number).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="inflow" fill="#82ca9d" name="Cash Inflow" />
                  <Bar dataKey="outflow" fill="#ff7300" name="Cash Outflow" />
                  <Bar dataKey="net" fill="#8884d8" name="Net Cash Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation & Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxDetails.map((tax) => (
                  <div key={tax.type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{tax.type}</h3>
                      <Badge 
                        variant={tax.status === 'paid' ? 'default' : tax.status === 'pending' ? 'destructive' : 'secondary'}
                      >
                        {tax.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tax Base</p>
                        <p className="font-medium">฿{Math.round(tax.base).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax Amount</p>
                        <p className="font-bold text-lg">฿{Math.round(tax.amount).toLocaleString()}</p>
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

export default FinancialDashboardContent;