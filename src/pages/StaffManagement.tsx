
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, UserPlus, Users } from 'lucide-react';

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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">รายชื่อพนักงาน</h3>
                        <Button>
                          <UserPlus className="w-4 h-4 mr-2" />
                          เพิ่มพนักงาน
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">นางสาวสมใจ ใจดี</h4>
                                <p className="text-sm text-muted-foreground">พนักงานเสิร์ฟ</p>
                              </div>
                              <div className="space-x-2">
                                <Badge variant="secondary">เข้างานแล้ว</Badge>
                                <Badge>Admin</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">นายสมชาย รักงาน</h4>
                                <p className="text-sm text-muted-foreground">บาริสต้า</p>
                              </div>
                              <div className="space-x-2">
                                <Badge variant="outline">ยังไม่เข้างาน</Badge>
                                <Badge variant="secondary">Staff</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="time-attendance" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">บันทึกเวลาทำงาน</h3>
                        <Button>
                          <Clock className="w-4 h-4 mr-2" />
                          เช็คอิน/เช็คเอาท์
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบบันทึกเวลาทำงาน...</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">กำหนดสิทธิ์การเข้าถึง</h3>
                        <Button>
                          <Shield className="w-4 h-4 mr-2" />
                          จัดการสิทธิ์
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-center text-muted-foreground">กำลังพัฒนาระบบจัดการสิทธิ์...</p>
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

export default StaffManagement;
