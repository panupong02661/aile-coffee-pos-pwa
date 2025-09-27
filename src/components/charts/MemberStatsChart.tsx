import React from 'react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gender Statistics Chart */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-coffee-800">สถิติเพศสมาชิก</h3>
          <p className="text-sm text-coffee-600">การแจกแจงสมาชิกตามเพศ</p>
        </div>
        <ChartContainer config={chartConfig} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={60}
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
      </div>

      {/* Member Tier Chart */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-coffee-800">ระดับสมาชิก</h3>
          <p className="text-sm text-coffee-600">การแจกแจงสมาชิกตามระดับ</p>
        </div>
        <ChartContainer config={chartConfig} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierData}>
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
      </div>
    </div>
  );
};

export default MemberStatsChart;