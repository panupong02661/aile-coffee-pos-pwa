
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserCog, Mail, MessageCircle, Calendar, Users } from 'lucide-react';

const CustomerSystem = () => {
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
                <CardTitle className="text-2xl text-coffee-800">ระบบลูกค้า</CardTitle>
                <CardDescription>ระบบ CRM การตลาด และการจองโต๊ะครบครัน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="crm" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="crm">ระบบ CRM</TabsTrigger>
                    <TabsTrigger value="marketing">ระบบการตลาด</TabsTrigger>
                    <TabsTrigger value="reservation">ระบบจองโต๊ะ</TabsTrigger>
                    <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="crm" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบ CRM - จัดการลูกค้า</h3>
                        <Button>
                          <UserCog className="w-4 h-4 mr-2" />
                          จัดการข้อมูลลูกค้า
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">1,234</div>
                            <p className="text-xs text-muted-foreground">+15% จากเดือนที่แล้ว</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ลูกค้าใหม่เดือนนี้</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">89</div>
                            <p className="text-xs text-muted-foreground">+22% จากเดือนที่แล้ว</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ลูกค้าประจำ</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">456</div>
                            <p className="text-xs text-muted-foreground">37% ของลูกค้าทั้งหมด</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบประวัติการซื้อแบบละเอียด...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="marketing" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">ระบบการตลาด</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <MessageCircle className="w-5 h-5 mr-2" />
                              SMS Marketing
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">ส่งข้อความโปรโมชั่นผ่าน SMS</p>
                            <Button>ส่ง SMS แคมเปญ</Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Mail className="w-5 h-5 mr-2" />
                              Email Marketing
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">ส่งอีเมลโปรโมชั่นและข่าวสาร</p>
                            <Button>ส่งอีเมลแคมเปญ</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reservation" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบจองโต๊ะ</h3>
                        <Button>
                          <Calendar className="w-4 h-4 mr-2" />
                          จัดการการจอง
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบจองโต๊ะสำหรับร้านอาหาร...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">การวิเคราะห์ลูกค้า</h3>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบวิเคราะห์พฤติกรรมลูกค้า...</p>
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

export default CustomerSystem;
