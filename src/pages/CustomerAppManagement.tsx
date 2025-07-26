
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const CustomerAppManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          {/* Custom Header with Menu Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-coffee-800">จัดการแอปลูกค้า</h1>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-coffee-800">ระบบจัดการแอพพลิเคชั่นลูกค้า</CardTitle>
                <CardDescription>จัดการและกำหนดค่าแอพลูกค้า คูปอง และโปรโมชั่น</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="promotions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="promotions">โปรโมชั่น</TabsTrigger>
                    <TabsTrigger value="coupons">คูปอง</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่าแอป</TabsTrigger>
                    <TabsTrigger value="analytics">การวิเคราะห์</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="promotions" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">จัดการโปรโมชั่น</h3>
                      <p className="text-gray-600">กำหนดและจัดการโปรโมชั่นสำหรับลูกค้า</p>
                      
                      {/* Content for promotions management */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">โปรโมชั่นปัจจุบัน</h4>
                            <p className="text-sm text-gray-600">ดูและจัดการโปรโมชั่นที่กำลังใช้งาน</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">สร้างโปรโมชั่นใหม่</h4>
                            <p className="text-sm text-gray-600">เพิ่มโปรโมชั่นใหม่สำหรับลูกค้า</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">รายงานโปรโมชั่น</h4>
                            <p className="text-sm text-gray-600">ดูสถิติและผลลัพธ์ของโปรโมชั่น</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="coupons" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">จัดการคูปอง</h3>
                      <p className="text-gray-600">สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">ตั้งค่าแอป</h3>
                      <p className="text-gray-600">กำหนดค่าการทำงานของแอพลูกค้า</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">การวิเคราะห์</h3>
                      <p className="text-gray-600">ดูสстатистและการใช้งานของแอพลูกค้า</p>
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

export default CustomerAppManagement;
