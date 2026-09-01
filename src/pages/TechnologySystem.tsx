
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, CreditCard, Wifi, Smartphone } from 'lucide-react';

const TechnologySystem = () => {
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
                <CardTitle className="text-2xl text-foreground">ระบบเทคโนโลยี</CardTitle>
                <CardDescription>ระบบชำระเงินดิจิทัล API และแอพมือถือ</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="payment" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="payment">การชำระเงินดิจิทัล</TabsTrigger>
                    <TabsTrigger value="api">ระบบ API</TabsTrigger>
                    <TabsTrigger value="mobile">Mobile App</TabsTrigger>
                    <TabsTrigger value="integration">การเชื่อมต่อ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="payment" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">การชำระเงินดิจิทัล</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center">
                                <QrCode className="w-5 h-5 mr-2" />
                                PromptPay QR Code
                              </span>
                              <Badge variant="secondary">เปิดใช้งาน</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">รับชำระเงินผ่าน QR Code PromptPay</p>
                            <Button>ตั้งค่า PromptPay</Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                บัตรเครดิต/เดบิต
                              </span>
                              <Badge variant="outline">ยังไม่เปิดใช้งาน</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">รับชำระเงินผ่านบัตรเครดิต/เดบิต</p>
                            <Button variant="outline">เชื่อมต่อระบบบัตร</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="api" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบ API</h3>
                        <Button>
                          <Wifi className="w-4 h-4 mr-2" />
                          จัดการ API
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบ API สำหรับเชื่อมต่อกับระบบภายนอก...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Mobile Application</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Smartphone className="w-5 h-5 mr-2" />
                              แอพพนักงาน
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">แอพสำหรับพนักงานจัดการออเดอร์</p>
                            <Button>ดาวน์โหลดแอพ</Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Smartphone className="w-5 h-5 mr-2" />
                              แอพลูกค้า
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">แอพสำหรับลูกค้าสั่งอาหาร</p>
                            <Button>ดาวน์โหลดแอพ</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="integration" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">การเชื่อมต่อระบบภายนอก</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาการเชื่อมต่อกับระบบภายนอก...</p>
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

export default TechnologySystem;
