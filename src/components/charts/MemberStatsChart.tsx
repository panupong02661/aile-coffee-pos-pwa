import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface MemberStatsChartProps {
  genderData: any[];
  tierData: any[];
}

const chartConfig = {
  male: {
    label: "ชาย",
    color: "#3b82f6",
  },
  female: {
    label: "หญิง",
    color: "#ec4899",
  },
  other: {
    label: "อื่นๆ",
    color: "#6b7280",
  },
  silver: {
    label: "Silver",
    color: "#9ca3af",
  },
  gold: {
    label: "Gold",
    color: "#f59e0b",
  },
  platinum: {
    label: "Platinum",
    color: "#8b5cf6",
  },
};

const COLORS = ['#3b82f6', '#ec4899', '#6b7280'];
const TIER_COLORS = ['#9ca3af', '#f59e0b', '#8b5cf6'];

const MemberStatsChart: React.FC<MemberStatsChartProps> = ({ genderData, tierData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>สถิติเพศสมาชิก</CardTitle>
          <CardDescription>การแจกแจงสมาชิกตามเพศ</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ระดับสมาชิก</CardTitle>
          <CardDescription>การแจกแจงสมาชิกตามระดับ</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberStatsChart;