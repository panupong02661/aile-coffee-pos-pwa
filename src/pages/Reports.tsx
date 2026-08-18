
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import CancelledOrdersList from '@/components/CancelledOrdersList';
import AllOrdersList from '@/components/AllOrdersList';
import SalesChart from '@/components/charts/SalesChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import ProfitLossReport from '@/components/reports/ProfitLossReport';
import { Download, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dailyData, monthlyData, dashboardStats, loading, refreshData } = useDashboardStats();
  const { ingredients, menuItems, calculateMenuItemCost } = useSupabaseData();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const downloadDailyReport = () => {
    console.log('📊 Attempting to download daily report');
    console.log('Daily data:', dailyData);
    
    if (!dailyData || dailyData.length === 0) {
      toast({
        title: 'ไม่มีข้อมูล',
        description: 'ไม่มีข้อมูลรายงานรายวันให้ดาวน์โหลด',
        variant: 'destructive',
      });
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(
        dailyData.map(item => ({
          'วันที่': item.date,
          'ยอดขายรวม': item.sales,
          'ส่วนลด': item.discount,
          'ยอดขายสุทธิ': item.net_sales,
          'จำนวนบิล': item.orders
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานรายวัน');
      
      const fileName = `รายงานยอดขายรายวัน_${new Date().toLocaleDateString('th-TH')}.xlsx`;
      console.log('📄 Attempting to write file:', fileName);
      
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ File download initiated successfully');
      toast({
        title: 'ดาวน์โหลดสำเร็จ',
        description: 'รายงานยอดขายรายวันถูกดาวน์โหลดแล้ว',
      });
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: `ไม่สามารถดาวน์โหลดรายงานได้: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const downloadMonthlyReport = () => {
    console.log('📊 Attempting to download monthly report');
    console.log('Monthly data:', monthlyData);
    
    if (!monthlyData || monthlyData.length === 0) {
      toast({
        title: 'ไม่มีข้อมูล',
        description: 'ไม่มีข้อมูลรายงานรายเดือนให้ดาวน์โหลด',
        variant: 'destructive',
      });
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(
        monthlyData.map(item => ({
          'เดือน': item.month,
          'ยอดขายรวม': item.sales,
          'ส่วนลด': item.discount,
          'ยอดขายสุทธิ': item.net_sales,
          'จำนวนบิล': item.orders
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานรายเดือน');
      
      const fileName = `รายงานยอดขายรายเดือน_${new Date().toLocaleDateString('th-TH')}.xlsx`;
      console.log('📄 Attempting to write file:', fileName);
      
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ File download initiated successfully');
      toast({
        title: 'ดาวน์โหลดสำเร็จ',
        description: 'รายงานยอดขายรายเดือนถูกดาวน์โหลดแล้ว',
      });
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: `ไม่สามารถดาวน์โหลดรายงานได้: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Listen for real-time order updates
  useEffect(() => {
    const channel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log('📊 Real-time order update detected, refreshing reports data...');
          refreshData();
          setLastRefresh(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  return (
    <div className="min-h-screen bg-background flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">รายงาน</h1>
            <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
              รายงานยอดขายและข้อมูลต่างๆ ของร้าน
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                🔄 อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString('th-TH')}
              </span>
            </p>
          </div>

          <Tabs defaultValue="all-orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 h-auto rounded-xl p-1">
              <TabsTrigger value="all-orders" className="rounded-lg py-2 text-xs sm:text-sm">ประวัติบิล</TabsTrigger>
              <TabsTrigger value="cancelled-orders" className="rounded-lg py-2 text-xs sm:text-sm">ยกเลิก</TabsTrigger>
              <TabsTrigger value="daily-sales" className="rounded-lg py-2 text-xs sm:text-sm">รายวัน</TabsTrigger>
              <TabsTrigger value="monthly-sales" className="rounded-lg py-2 text-xs sm:text-sm">รายเดือน</TabsTrigger>
              <TabsTrigger value="profit-loss" className="rounded-lg py-2 text-xs sm:text-sm">กำไร-ขาดทุน</TabsTrigger>
            </TabsList>


            <TabsContent value="all-orders">
              <AllOrdersList />
            </TabsContent>

            <TabsContent value="cancelled-orders">
              <CancelledOrdersList />
            </TabsContent>

            <TabsContent value="daily-sales">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>รายงานยอดขายรายวัน</CardTitle>
                  <Button 
                    onClick={downloadDailyReport} 
                    disabled={loading || dailyData.length === 0}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลด Excel
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-72 w-full rounded-xl" />
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>รายงานยอดขายรายเดือน</CardTitle>
                  <Button 
                    onClick={downloadMonthlyReport} 
                    disabled={loading || monthlyData.length === 0}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลด Excel
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-72 w-full rounded-xl" />
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

            <TabsContent value="profit-loss">
              <ProfitLossReport
                dashboardStats={dashboardStats}
                monthlyData={monthlyData}
                menuItems={menuItems}
                calculateMenuItemCost={calculateMenuItemCost}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Reports;
