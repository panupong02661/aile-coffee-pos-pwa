
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, TrendingUp, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SalesReportChart from '@/components/reports/SalesReportChart';
import ProductReportTable from '@/components/reports/ProductReportTable';
import CustomerAnalytics from '@/components/reports/CustomerAnalytics';
import { useDashboardStatsOptimized } from '@/hooks/useDashboardStatsOptimized';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const AdvancedReports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { 
    hourlyData, 
    dailyData, 
    monthlyData,
    genderStats,
    tierStats, 
    dashboardStats,
    loading 
  } = useDashboardStatsOptimized();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleExportReport = (type: string) => {
    try {
      let worksheetData: any[] = [];
      let filename = '';

      if (type === 'sales') {
        // Export sales data
        const salesData = dailyData.map(item => ({
          'วันที่': new Date(item.date).toLocaleDateString('th-TH'),
          'ยอดขาย (บาท)': item.sales,
          'จำนวนออเดอร์': item.orders,
          'ส่วนลด (บาท)': item.discount || 0,
          'ยอดขายสุทธิ (บาท)': (item.sales - (item.discount || 0)),
        }));

        worksheetData = salesData;
        filename = `รายงานยอดขาย_${new Date().toLocaleDateString('th-TH')}.xlsx`;

      } else if (type === 'products') {
        // Export product data from dashboard stats
        const productData = dashboardStats.topProducts.map((item, index) => ({
          'อันดับ': index + 1,
          'ชื่อสินค้า': item.name,
          'จำนวนที่ขาย': item.quantity,
          'ยอดขาย (บาท)': item.revenue,
          'กำไร (บาท)': item.profit || 0,
        }));

        worksheetData = productData;
        filename = `รายงานสินค้า_${new Date().toLocaleDateString('th-TH')}.xlsx`;

      } else if (type === 'customers') {
        // Export customer analytics
        const customerData = [
          {
            'รายการ': 'จำนวนสมาชิกทั้งหมด',
            'ค่า': dashboardStats.totalMembers,
          },
          {
            'รายการ': 'สมาชิกใหม่ (เดือนนี้)',
            'ค่า': dashboardStats.newMembersMonth,
          },
          {
            'รายการ': 'ยอดขายต่อลูกค้าเฉลี่ย (บาท)',
            'ค่า': dashboardStats.averageOrderValue?.toFixed(2) || 0,
          },
        ];

        // Add gender distribution
        genderStats?.forEach(item => {
          customerData.push({
            'รายการ': `จำนวนสมาชิก${item.name === 'ชาย' ? 'ชาย' : item.name === 'หญิง' ? 'หญิง' : 'อื่นๆ'}`,
            'ค่า': `${item.value} (${item.percentage.toFixed(2)}%)`,
          });
        });

        // Add tier distribution
        tierStats?.forEach(item => {
          customerData.push({
            'รายการ': `สมาชิกระดับ ${item.name}`,
            'ค่า': item.value,
          });
        });

        worksheetData = customerData;
        filename = `รายงานลูกค้า_${new Date().toLocaleDateString('th-TH')}.xlsx`;
      }

      if (worksheetData.length === 0) {
        toast({
          title: 'ไม่มีข้อมูล',
          description: 'ไม่พบข้อมูลที่จะส่งออก',
          variant: 'destructive',
        });
        return;
      }

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
        wch: Math.min(
          maxWidth,
          Math.max(
            key.length,
            ...worksheetData.map(row => String(row[key] || '').length)
          )
        ),
      }));
      ws['!cols'] = colWidths;

      // Export file
      XLSX.writeFile(wb, filename);

      toast({
        title: 'ส่งออกสำเร็จ',
        description: `ดาวน์โหลดไฟล์ ${filename} เรียบร้อยแล้ว`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออกรายงานได้',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar} 
      />
      
      <div className="flex-1">
        <div className="p-4">
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
          
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800">รายงานขั้นสูง</CardTitle>
                <CardDescription>ระบบรายงานและการวิเคราะห์ข้อมูลแบบละเอียด</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sales" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sales">รายงานยอดขาย</TabsTrigger>
                    <TabsTrigger value="products">รายงานสินค้า</TabsTrigger>
                    <TabsTrigger value="customers">การวิเคราะห์ลูกค้า</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sales" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">รายงานยอดขาย</h3>
                        <Button onClick={() => handleExportReport('sales')}>
                          <Download className="w-4 h-4 mr-2" />
                          ส่งออกรายงาน
                        </Button>
                      </div>
                      
                      <SalesReportChart />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ยอดขายวันนี้</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿12,345</div>
                            <p className="text-xs text-muted-foreground">+20.1% จากเมื่อวาน</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ยอดขายเดือนนี้</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿345,678</div>
                            <p className="text-xs text-muted-foreground">+12.5% จากเดือนที่แล้ว</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">จำนวนออเดอร์</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">+8.2% จากเมื่อวาน</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ยอดขายเฉลี่ย</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿79</div>
                            <p className="text-xs text-muted-foreground">ต่อออเดอร์</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="products" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">รายงานสินค้าขายดี</h3>
                        <Button onClick={() => handleExportReport('products')}>
                          <Download className="w-4 h-4 mr-2" />
                          ส่งออกรายงาน
                        </Button>
                      </div>
                      
                      <ProductReportTable />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="customers" className="mt-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">การวิเคราะห์พฤติกรรมลูกค้า</h3>
                        <Button onClick={() => handleExportReport('customers')}>
                          <Download className="w-4 h-4 mr-2" />
                          ส่งออกรายงาน
                        </Button>
                      </div>
                      
                      <CustomerAnalytics />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;
