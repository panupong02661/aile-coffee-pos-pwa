
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Database, FileCheck, Lock, Shield } from 'lucide-react';

const SecuritySystem = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
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
                <CardTitle className="text-2xl text-foreground">ระบบรักษาความปลอดภัย</CardTitle>
                <CardDescription>ระบบสำรองข้อมูล ระบบ Log และการจัดการสิทธิ์</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="backup" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="backup">ระบบสำรองข้อมูล</TabsTrigger>
                    <TabsTrigger value="logs">ระบบ Log</TabsTrigger>
                    <TabsTrigger value="access">การจัดการสิทธิ์</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="backup" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">ระบบสำรองข้อมูล</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Database className="w-5 h-5 mr-2" />
                                Backup อัตโนมัติ
                              </span>
                              <Badge variant="secondary">เปิดใช้งาน</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">การสำรองข้อมูลอัตโนมัติทุกวัน</p>
                            <p className="text-xs text-muted-foreground mb-4">การสำรองล่าสุด: วันนี้ 03:00 น.</p>
                            <Button>ตั้งค่า Backup</Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <HardDrive className="w-5 h-5 mr-2" />
                              สำรองข้อมูลด้วยตนเอง
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">สำรองข้อมูลทันที</p>
                            <Button variant="outline">สำรองข้อมูลตอนนี้</Button>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>ประวัติการสำรองข้อมูล</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">2024-01-15 03:00:00</span>
                              <Badge variant="secondary">สำเร็จ</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">2024-01-14 03:00:00</span>
                              <Badge variant="secondary">สำเร็จ</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm">2024-01-13 03:00:00</span>
                              <Badge variant="secondary">สำเร็จ</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="logs" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">ระบบ Log</h3>
                        <Button>
                          <FileCheck className="w-4 h-4 mr-2" />
                          ดู Log ทั้งหมด
                        </Button>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>บันทึกการใช้งานล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm">ผู้ใช้: admin - เข้าสู่ระบบ</span>
                              <span className="text-xs text-muted-foreground">14:30:25</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm">สร้างออเดอร์ #12345</span>
                              <span className="text-xs text-muted-foreground">14:25:12</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                              <span className="text-sm">แก้ไขเมนู: กาแฟอเมริกาโน่</span>
                              <span className="text-xs text-muted-foreground">14:20:08</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="access" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">การจัดการสิทธิ์การเข้าถึง</h3>
                        <Button>
                          <Shield className="w-4 h-4 mr-2" />
                          จัดการสิทธิ์
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Lock className="w-5 h-5 mr-2" />
                              Role-based Access
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">จัดการสิทธิ์ตามบทบาทผู้ใช้</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Admin</span>
                                <Badge>เข้าถึงได้ทั้งหมด</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Manager</span>
                                <Badge variant="secondary">เข้าถึงจำกัด</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Staff</span>
                                <Badge variant="outline">เข้าถึงพื้นฐาน</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Shield className="w-5 h-5 mr-2" />
                              การควบคุมการเข้าถึง
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">ตั้งค่าการเข้าถึงแต่ละฟังก์ชั่น</p>
                            <Button variant="outline">ตั้งค่าสิทธิ์</Button>
                          </CardContent>
                        </Card>
                      </div>
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

export default SecuritySystem;
