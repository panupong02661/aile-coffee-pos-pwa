
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

const SalesReportChart = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('total_amount, created_at, items_count')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group data by date
        const groupedData = orders?.reduce((acc: { [key: string]: { sales: number; orders: number } }, order) => {
          const date = new Date(order.created_at).toLocaleDateString('th-TH');
          if (!acc[date]) {
            acc[date] = { sales: 0, orders: 0 };
          }
          acc[date].sales += Number(order.total_amount);
          acc[date].orders += 1;
          return acc;
        }, {});

        const chartData = Object.entries(groupedData || {}).map(([date, data]) => ({
          date,
          sales: data.sales,
          orders: data.orders
        })).slice(-7); // Last 7 days

        setSalesData(chartData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
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
        <CardTitle>กราฟยอดขาย 7 วันที่ผ่านมา</CardTitle>
        <CardDescription>แสดงยอดขายและจำนวนออเดอร์รายวัน</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" name="ยอดขาย (บาท)" />
            <Bar dataKey="orders" fill="#82ca9d" name="จำนวนออเดอร์" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesReportChart;
