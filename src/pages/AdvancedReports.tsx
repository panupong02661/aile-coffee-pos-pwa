
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, TrendingUp, Users } from 'lucide-react';

const AdvancedReports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(true)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="products" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">รายงานสินค้าขายดี</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบรายงานสินค้า...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="customers" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">การวิเคราะห์พฤติกรรมลูกค้า</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบวิเคราะห์ลูกค้า...</p>
                        </CardContent>
                      </Card>
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
