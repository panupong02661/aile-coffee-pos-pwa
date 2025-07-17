
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, Receipt, CreditCard, TrendingUp, FileText } from 'lucide-react';

const FinancialSystem = () => {
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
                <CardTitle className="text-2xl text-coffee-800">ระบบการเงิน</CardTitle>
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
                        <Button>
                          <DollarSign className="w-4 h-4 mr-2" />
                          บันทึกรายรับ
                        </Button>
                        <Button variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          บันทึกรายจ่าย
                        </Button>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm font-medium">ภาษีมูลค่าเพิ่ม</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">฿1,234</div>
                            <p className="text-xs text-muted-foreground">สำหรับเดือนนี้</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm font-medium">ใบกำกับภาษี</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">15</div>
                            <p className="text-xs text-muted-foreground">ออกแล้วเดือนนี้</p>
                          </CardContent>
                        </Card>
                      </div>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm font-medium">ยอดเครดิตคงเหลือ</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-orange-600">฿25,000</div>
                            <p className="text-xs text-muted-foreground">จากลูกค้า 8 ราย</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm font-medium">ค้างชำระ</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600">฿3,500</div>
                            <p className="text-xs text-muted-foreground">เกินกำหนด 3 ราย</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reports" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">รายงานการเงิน</h3>
                        <Button>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          สร้างรายงาน
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-sm">รายงานกำไรขาดทุน</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">ดูสรุปรายได้และค่าใช้จ่าย</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-sm">งบดุล</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">สถานะทางการเงินของธุรกิจ</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-sm">กระแสเงินสด</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">การเคลื่อนไหวของเงินสด</p>
                          </CardContent>
                        </Card>
                      </div>
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
