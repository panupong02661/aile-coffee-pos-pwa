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
  const { dashboardStats, loading } = useDashboardStats();

  // Mock financial data - replace with real data
  const financialSummary = {
    revenue: 285000,
    expenses: 165000,
    profit: 120000,
    margin: 42.1,
    tax: 18500,
    cashFlow: 101500
  };

  const monthlyFinancials = [
    { month: 'Jan', revenue: 245000, expenses: 145000, profit: 100000, tax: 15000 },
    { month: 'Feb', revenue: 265000, expenses: 155000, profit: 110000, tax: 16500 },
    { month: 'Mar', revenue: 285000, expenses: 165000, profit: 120000, tax: 18000 },
    { month: 'Apr', revenue: 295000, expenses: 172000, profit: 123000, tax: 18500 },
    { month: 'May', revenue: 315000, expenses: 185000, profit: 130000, tax: 19500 },
    { month: 'Jun', revenue: 335000, expenses: 195000, profit: 140000, tax: 21000 }
  ];

  const expenseBreakdown = [
    { category: 'วัตถุดิบ', amount: 85000, percentage: 51.5, color: '#8884d8' },
    { category: 'เงินเดือนพนักงาน', amount: 45000, percentage: 27.3, color: '#82ca9d' },
    { category: 'ค่าเช่า', amount: 20000, percentage: 12.1, color: '#ffc658' },
    { category: 'สาธารณูปโภค', amount: 8000, percentage: 4.8, color: '#ff7300' },
    { category: 'อื่นๆ', amount: 7000, percentage: 4.2, color: '#00c49f' }
  ];

  const revenueChannels = [
    { channel: 'POS', amount: 185250, percentage: 65 },
    { channel: 'Mobile App', amount: 71250, percentage: 25 },
    { channel: 'Online Orders', amount: 28500, percentage: 10 }
  ];

  const cashFlowData = [
    { week: 'Week 1', inflow: 75000, outflow: 45000, net: 30000 },
    { week: 'Week 2', inflow: 82000, outflow: 48000, net: 34000 },
    { week: 'Week 3', inflow: 78000, outflow: 52000, net: 26000 },
    { week: 'Week 4', inflow: 85000, outflow: 55000, net: 30000 }
  ];

  const taxDetails = [
    { type: 'VAT (7%)', base: 285000, amount: 19950, status: 'pending' },
    { type: 'Corporate Tax (20%)', base: 120000, amount: 24000, status: 'calculated' },
    { type: 'Withholding Tax (3%)', base: 45000, amount: 1350, status: 'paid' }
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
            <div className="text-2xl font-bold">₿{financialSummary.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿{financialSummary.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+6.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿{financialSummary.profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.margin}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿{financialSummary.tax.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Due next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿{financialSummary.cashFlow.toLocaleString()}</div>
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
                    <Tooltip formatter={(value) => `₿${value.toLocaleString()}`} />
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
                    <Tooltip formatter={(value, name) => 
                      name === 'margin' ? `${((value as number) / (monthlyFinancials.find(d => d.month === (value as any))?.revenue || 1) * 100).toFixed(1)}%` : `₿${(value as number).toLocaleString()}`
                    } />
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
                    <Tooltip formatter={(value) => `₿${(value as number).toLocaleString()}`} />
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
                      <p className="font-bold">₿{expense.amount.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold">₿{channel.amount.toLocaleString()}</p>
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
                  <Tooltip formatter={(value) => `₿${(value as number).toLocaleString()}`} />
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
                        <p className="font-medium">₿{tax.base.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax Amount</p>
                        <p className="font-bold text-lg">₿{tax.amount.toLocaleString()}</p>
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