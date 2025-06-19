
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SalesChartProps {
  data: any[];
  type: 'line' | 'bar';
  title: string;
  description?: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
}

const chartConfig = {
  sales: {
    label: "ยอดขาย",
    color: "#8b5cf6",
  },
  orders: {
    label: "จำนวนออเดอร์",
    color: "#06b6d4",
  },
  discount: {
    label: "ส่วนลด",
    color: "#f59e0b",
  },
};

const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  type, 
  title, 
  description, 
  dataKey, 
  xAxisKey, 
  color = "#8b5cf6" 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color} 
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={dataKey} fill={color} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
