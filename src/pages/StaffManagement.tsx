
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffList from '@/components/staff/StaffList';
import TimeAttendance from '@/components/staff/TimeAttendance';
import PermissionManagement from '@/components/staff/PermissionManagement';
import StaffActivityLog from '@/components/StaffActivityLog';

const StaffManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isPermissionsPage = location.pathname === '/permissions';

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
                <CardTitle className="text-2xl text-coffee-800">
                  {isPermissionsPage ? 'กำหนดสิทธิ์ผู้ใช้งาน' : 'จัดการพนักงาน'}
                </CardTitle>
                <CardDescription>
                  {isPermissionsPage 
                    ? 'สร้างผู้ใช้งาน กำหนดบทบาท และจัดการสิทธิ์การเข้าถึงระบบ' 
                    : 'ระบบจัดการพนักงาน บันทึกเวลาทำงาน'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPermissionsPage ? (
                  <PermissionManagement />
                ) : (
                  <Tabs defaultValue="staff-list" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="staff-list">รายชื่อพนักงาน</TabsTrigger>
                      <TabsTrigger value="time-attendance">บันทึกเวลาทำงาน</TabsTrigger>
                      <TabsTrigger value="activity-log">Log การใช้งาน</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="staff-list" className="mt-6">
                      <StaffList />
                    </TabsContent>
                    
                    <TabsContent value="time-attendance" className="mt-6">
                      <TimeAttendance />
                    </TabsContent>

                    <TabsContent value="activity-log" className="mt-6">
                      <StaffActivityLog />
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
