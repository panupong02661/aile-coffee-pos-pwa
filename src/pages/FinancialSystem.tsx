
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, Receipt, CreditCard } from 'lucide-react';

const FinancialSystem = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar} 
      />
      
      <div className="flex-1 md:ml-[56px]">
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
                <CardTitle className="text-2xl text-foreground">ระบบการเงิน</CardTitle>
                <CardDescription>ระบบบัญชี ภาษี และเครดิตครบครัน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="accounting" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="accounting">ระบบบัญชี</TabsTrigger>
                    <TabsTrigger value="tax">ระบบภาษี</TabsTrigger>
                    <TabsTrigger value="credit">ระบบเครดิต</TabsTrigger>
                    <TabsTrigger value="reports">รายงานการเงิน</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="accounting" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">ระบบบัญชี</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">รายรับวันนี้</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">฿12,345</div>
                            <p className="text-xs text-muted-foreground">เพิ่มขึ้น 12% จากเมื่อวาน</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">รายจ่ายวันนี้</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600">฿3,456</div>
                            <p className="text-xs text-muted-foreground">ลดลง 5% จากเมื่อวาน</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">฿8,889</div>
                            <p className="text-xs text-muted-foreground">มาร์จิ้น 72%</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button>บันทึกรายรับ</Button>
                        <Button variant="outline">บันทึกรายจ่าย</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tax" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบภาษี</h3>
                        <Button>
                          <Receipt className="w-4 h-4 mr-2" />
                          ออกใบกำกับภาษี
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบคำนวณภาษีมูลค่าเพิ่ม...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="credit" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบเครดิต</h3>
                        <Button>
                          <CreditCard className="w-4 h-4 mr-2" />
                          จัดการเครดิต
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบให้ลูกค้าซื้อเชื่อ...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reports" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">รายงานการเงิน</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนารายงานการเงินแบบละเอียด...</p>
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

export default FinancialSystem;
