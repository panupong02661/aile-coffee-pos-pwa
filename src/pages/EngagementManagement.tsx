
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StampCardManager from '@/components/engagement/StampCardManager';
import FestivalEventManager from '@/components/engagement/FestivalEventManager';
import EngagementDashboard from '@/components/engagement/EngagementDashboard';
import EngagementSettings from '@/components/engagement/EngagementSettings';
import FestivalThemeManager from '@/components/engagement/FestivalThemeManager';

const EngagementManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 md:ml-[56px]">
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                <CardTitle className="text-2xl text-foreground">🎯 ระบบ Engagement</CardTitle>
                <p className="text-sm text-muted-foreground">จัดการบัตรสะสมแสตมป์ กิจกรรมเทศกาล วงล้อนำโชค และอื่นๆ</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
                    <TabsTrigger value="stamp-card">แสตมป์</TabsTrigger>
                    <TabsTrigger value="festival">กิจกรรม</TabsTrigger>
                    <TabsTrigger value="themes">ธีม</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-6">
                    <EngagementDashboard />
                  </TabsContent>
                  
                  <TabsContent value="stamp-card" className="mt-6">
                    <StampCardManager />
                  </TabsContent>
                  
                  <TabsContent value="festival" className="mt-6">
                    <FestivalEventManager />
                  </TabsContent>
                  
                  <TabsContent value="themes" className="mt-6">
                    <FestivalThemeManager />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-6">
                    <EngagementSettings />
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

export default EngagementManagement;
