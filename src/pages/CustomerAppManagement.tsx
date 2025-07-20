import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Gift, Bell, Settings, Users, Calendar, Send } from 'lucide-react';
import BirthdayGiftManager from '@/components/BirthdayGiftManager';
import SpecialPromotionsManager from '@/components/SpecialPromotionsManager';
import CustomerCoupons from '@/components/CustomerCoupons';
import GiftSender from '@/components/GiftSender';

const CustomerAppManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-coffee-800 mb-2">
          จัดการแอปพลิเคชันลูกค้า
        </h1>
        <p className="text-coffee-600">
          ระบบจัดการคุณสมบัติต่างๆ ของแอปพลิเคชันสำหรับลูกค้า
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="birthday-gifts" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            ของขวัญวันเกิด
          </TabsTrigger>
          <TabsTrigger value="special-promotions" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            ของรางวัลพิเศษ
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            คูปองลูกค้า
          </TabsTrigger>
          <TabsTrigger value="send-gifts" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            ส่งของขวัญ
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            การแจ้งเตือน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  ผู้ใช้งาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">1,234</div>
                <p className="text-sm text-gray-600">ผู้ใช้งานทั้งหมด</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  ของขวัญ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">456</div>
                <p className="text-sm text-gray-600">ของขวัญที่แจกแล้ว</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  การแจ้งเตือน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">89</div>
                <p className="text-sm text-gray-600">การแจ้งเตือนวันนี้</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                การตั้งค่าแอป
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">ระบบสะสมแต้ม</h4>
                    <p className="text-sm text-gray-600">อัตราการแลกแต้มเป็นส่วนลด</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">1:1</div>
                    <div className="text-sm text-gray-500">แต้ม : บาท</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">ระบบสมาชิก</h4>
                    <p className="text-sm text-gray-600">ระดับสมาชิกและสิทธิประโยชน์</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-500">ระดับ</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="birthday-gifts">
          <BirthdayGiftManager />
        </TabsContent>

        <TabsContent value="special-promotions">
          <SpecialPromotionsManager />
        </TabsContent>

        <TabsContent value="coupons">
          <CustomerCoupons />
        </TabsContent>

        <TabsContent value="send-gifts">
          <GiftSender />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                ตั้งค่าการแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">การแจ้งเตือนออเดอร์ใหม่</h4>
                    <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีออเดอร์ใหม่</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">การแจ้งเตือนโปรโมชั่น</h4>
                    <p className="text-sm text-gray-600">แจ้งเตือนโปรโมชั่นใหม่ให้ลูกค้า</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAppManagement;
