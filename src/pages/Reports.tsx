
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import CancelledOrdersList from '@/components/CancelledOrdersList';
import SalesChart from '@/components/charts/SalesChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Reports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dailyData, monthlyData, loading } = useDashboardStats();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-coffee-800">รายงาน</h1>
            <p className="text-coffee-600 mt-2">รายงานยอดขายและข้อมูลต่างๆ ของร้าน</p>
          </div>

          <Tabs defaultValue="cancelled-orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cancelled-orders">ออเดอร์ที่ยกเลิก</TabsTrigger>
              <TabsTrigger value="daily-sales">ยอดขายรายวัน</TabsTrigger>
              <TabsTrigger value="monthly-sales">ยอดขายรายเดือน</TabsTrigger>
            </TabsList>

            <TabsContent value="cancelled-orders">
              <CancelledOrdersList />
            </TabsContent>

            <TabsContent value="daily-sales">
              <Card>
                <CardHeader>
                  <CardTitle>รายงานยอดขายรายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
                  ) : (
                    <SalesChart
                      data={dailyData}
                      type="line"
                      title="ยอดขายรายวัน (30 วันล่าสุด)"
                      dataKey="net_sales"
                      xAxisKey="date"
                      color="#8b5cf6"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly-sales">
              <Card>
                <CardHeader>
                  <CardTitle>รายงานยอดขายรายเดือน</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
                  ) : (
                    <SalesChart
                      data={monthlyData}
                      type="bar"
                      title="ยอดขายรายเดือน (12 เดือนล่าสุด)"
                      dataKey="net_sales"
                      xAxisKey="month"
                      color="#06b6d4"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reports;
