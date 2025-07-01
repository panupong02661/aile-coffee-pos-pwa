
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffList from '@/components/staff/StaffList';
import TimeAttendance from '@/components/staff/TimeAttendance';
import PermissionManagement from '@/components/staff/PermissionManagement';

const StaffManagement = () => {
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
                <CardTitle className="text-2xl text-coffee-800">จัดการพนักงาน</CardTitle>
                <CardDescription>ระบบจัดการพนักงาน บันทึกเวลาทำงาน และกำหนดสิทธิ์</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="staff-list" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="staff-list">รายชื่อพนักงาน</TabsTrigger>
                    <TabsTrigger value="time-attendance">บันทึกเวลาทำงาน</TabsTrigger>
                    <TabsTrigger value="permissions">กำหนดสิทธิ์</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="staff-list" className="mt-6">
                    <StaffList />
                  </TabsContent>
                  
                  <TabsContent value="time-attendance" className="mt-6">
                    <TimeAttendance />
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="mt-6">
                    <PermissionManagement />
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

export default StaffManagement;
