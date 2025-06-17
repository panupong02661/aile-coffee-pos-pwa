
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberList from '@/components/MemberList';
import MemberForm from '@/components/MemberForm';
import MembershipSettings from '@/components/MembershipSettings';
import PointsManagement from '@/components/PointsManagement';

const MemberManagement = () => {
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
                <CardTitle className="text-2xl text-coffee-800">จัดการสมาชิก</CardTitle>
                <CardDescription>จัดการข้อมูลสมาชิก ระดับสมาชิก และระบบแต้มสะสม</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="members" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="members">รายชื่อสมาชิก</TabsTrigger>
                    <TabsTrigger value="add-member">เพิ่มสมาชิก</TabsTrigger>
                    <TabsTrigger value="points">จัดการแต้ม</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่าระบบสมาชิก</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="members" className="mt-6">
                    <MemberList />
                  </TabsContent>
                  
                  <TabsContent value="add-member" className="mt-6">
                    <MemberForm />
                  </TabsContent>
                  
                  <TabsContent value="points" className="mt-6">
                    <PointsManagement />
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
