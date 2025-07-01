
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface CustomerTierData {
  tier: string;
  count: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomerAnalytics = () => {
  const [tierData, setTierData] = useState<CustomerTierData[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data: members, error } = await supabase
          .from('members')
          .select('tier');

        if (error) throw error;

        const total = members?.length || 0;
        setTotalCustomers(total);

        // Group by tier
        const tierCounts = members?.reduce((acc: { [key: string]: number }, member) => {
          acc[member.tier] = (acc[member.tier] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(tierCounts || {}).map(([tier, count]) => ({
          tier: tier === 'silver' ? 'เงิน' : tier === 'gold' ? 'ทอง' : 'แพลทินัม',
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }));

        setTierData(chartData);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การวิเคราะห์ลูกค้าตามระดับสมาชิก</CardTitle>
        <CardDescription>แสดงสัดส่วนลูกค้าแต่ละระดับสมาชิก (ทั้งหมด {totalCustomers} คน)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tierData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ tier, percentage }) => `${tier} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {tierData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tierData.map((tier, index) => (
            <div key={tier.tier} className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                {tier.count}
              </div>
              <div className="text-sm text-muted-foreground">{tier.tier} ({tier.percentage}%)</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAnalytics;
