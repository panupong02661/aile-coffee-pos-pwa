
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MembershipDashboard from '@/components/MembershipDashboard';
import MemberList from '@/components/MemberList';
import MemberForm from '@/components/MemberForm';
import MembershipSettings from '@/components/MembershipSettings';
import PointsManagement from '@/components/PointsManagement';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const MemberManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-coffee-50">
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
                <CardTitle className="text-2xl text-coffee-800">จัดการสมาชิก</CardTitle>
                <CardDescription>จัดการข้อมูลสมาชิก ระดับสมาชิก และระบบแต้มสะสม</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
                    <TabsTrigger value="members">รายชื่อสมาชิก</TabsTrigger>
                    <TabsTrigger value="add-member">เพิ่มสมาชิก</TabsTrigger>
                    <TabsTrigger value="points">จัดการแต้ม</TabsTrigger>
                    <TabsTrigger value="qr-code">QR Code</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-6">
                    <MembershipDashboard />
                  </TabsContent>
                  
                  <TabsContent value="members" className="mt-6">
                    <MemberList />
                  </TabsContent>
                  
                  <TabsContent value="add-member" className="mt-6">
                    <MemberForm />
                  </TabsContent>
                  
                  <TabsContent value="points" className="mt-6">
                    <PointsManagement />
                  </TabsContent>

                  <TabsContent value="qr-code" className="mt-6">
                    <QRCodeGenerator />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-6">
                    <MembershipSettings />
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

export default MemberManagement;
