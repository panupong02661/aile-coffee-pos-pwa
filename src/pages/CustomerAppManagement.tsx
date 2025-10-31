
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
import RecipientsList from '@/components/RecipientsList';
import CustomerPromotionDetails from '@/components/CustomerPromotionDetails';
import CustomerGiftDetails from '@/components/CustomerGiftDetails';
import CustomerRewardDetails from '@/components/CustomerRewardDetails';

const CustomerAppManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-9">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="birthday-gifts">ของขวัญวันเกิด</TabsTrigger>
                    <TabsTrigger value="special-rewards">ของรางวัลพิเศษ</TabsTrigger>
                    <TabsTrigger value="coupons">คูปองลูกค้า</TabsTrigger>
                    <TabsTrigger value="send-gifts">ส่งของขวัญ</TabsTrigger>
                    <TabsTrigger value="recipients">รายชื่อที่ได้รับ</TabsTrigger>
                    <TabsTrigger value="promotion-details">คูปองโปรโมชั่น</TabsTrigger>
                    <TabsTrigger value="gift-details">ของขวัญ</TabsTrigger>
                    <TabsTrigger value="reward-details">รางวัลแต้ม</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <CustomerAppOverview />
                  </TabsContent>
                  
                  <TabsContent value="birthday-gifts" className="mt-6">
                    <BirthdayGiftManager />
                  </TabsContent>
                  
                  <TabsContent value="special-rewards" className="mt-6">
                    <SpecialPromotionsManager onPromotionCreated={() => setActiveTab('special-rewards')} />
                  </TabsContent>
                  
                  <TabsContent value="coupons" className="mt-6">
                    <CustomerCoupons />
                  </TabsContent>
                  
                  <TabsContent value="send-gifts" className="mt-6">
                    <GiftSender />
                  </TabsContent>
                  
                  <TabsContent value="recipients" className="mt-6">
                    <RecipientsList />
                  </TabsContent>
                  
                  <TabsContent value="promotion-details" className="mt-6">
                    <CustomerPromotionDetails />
                  </TabsContent>
                  
                  <TabsContent value="gift-details" className="mt-6">
                    <CustomerGiftDetails />
                  </TabsContent>
                  
                  <TabsContent value="reward-details" className="mt-6">
                    <CustomerRewardDetails />
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
