
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import CustomerAppOverview from '@/components/CustomerAppOverview';
import BirthdayGiftManager from '@/components/BirthdayGiftManager';
import SpecialPromotionsManager from '@/components/SpecialPromotionsManager';
import CustomerCoupons from '@/components/CustomerCoupons';
import GiftSender from '@/components/GiftSender';

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
          {/* Header with Menu Button */}
          <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm border border-coffee-200">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-coffee-100"
              >
                <Menu className="w-5 h-5 text-coffee-700" />
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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="promotions">ส่งของรางวัล</TabsTrigger>
                    <TabsTrigger value="gifts">ของรางวัลพิเศษ</TabsTrigger>
                    <TabsTrigger value="members">ของรางวัลวันเกิด</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="promotions" className="mt-6">
                    <SpecialPromotionsManager />
                  </TabsContent>
                  
                  <TabsContent value="gifts" className="mt-6">
                    <BirthdayGiftManager />
                  </TabsContent>
                  
                  <TabsContent value="members" className="mt-6">
                    <MemberList />
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
