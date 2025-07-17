
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Settings, 
  Users, 
  Bell, 
  Palette, 
  ShoppingCart,
  Star,
  MessageCircle,
  Download,
  Globe
} from 'lucide-react';

const CustomerAppManagement = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isMainSidebarOpen} 
        onClose={() => setIsMainSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleMainSidebar={() => setIsMainSidebarOpen(true)}
            showMainSidebarToggle={true}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="customer-app"
          />
          
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800 flex items-center gap-2">
                  <Smartphone className="w-6 h-6" />
                  จัดการแอปลูกค้า
                </CardTitle>
                <CardDescription>
                  ตั้งค่าและจัดการแอปพลิเคชันมือถือสำหรับลูกค้า
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="settings" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="settings">ตั้งค่าทั่วไป</TabsTrigger>
                    <TabsTrigger value="design">ออกแบบ</TabsTrigger>
                    <TabsTrigger value="features">ฟีเจอร์</TabsTrigger>
                    <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
                    <TabsTrigger value="analytics">สถิติ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="settings" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="app-name">ชื่อแอป</Label>
                            <Input id="app-name" placeholder="Aile Coffee App" />
                          </div>
                          <div>
                            <Label htmlFor="app-version">เวอร์ชัน</Label>
                            <Input id="app-version" placeholder="1.0.0" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="app-active" />
                            <Label htmlFor="app-active">เปิดใช้งานแอป</Label>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="api-url">API URL</Label>
                            <Input id="api-url" placeholder="https://api.ailecoffee.com" />
                          </div>
                          <div>
                            <Label htmlFor="support-email">อีเมลสนับสนุน</Label>
                            <Input id="support-email" placeholder="support@ailecoffee.com" type="email" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="maintenance-mode" />
                            <Label htmlFor="maintenance-mode">โหมดบำรุงรักษา</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="design" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Palette className="w-5 h-5" />
                              สีและธีม
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>สีหลัก</Label>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="w-8 h-8 bg-coffee-600 rounded border"></div>
                                <Input value="#8B4513" className="w-24" />
                              </div>
                            </div>
                            <div>
                              <Label>สีรอง</Label>
                              <div className="flex items-center space-x-2 mt-2">
                                <div className="w-8 h-8 bg-coffee-100 rounded border"></div>
                                <Input value="#F5F5DC" className="w-24" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>โลโก้และรูปภาพ</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>โลโก้แอป</Label>
                              <Button variant="outline" className="w-full mt-2">
                                อัปโหลดโลโก้
                              </Button>
                            </div>
                            <div>
                              <Label>รูปพื้นหลัง</Label>
                              <Button variant="outline" className="w-full mt-2">
                                อัปโหลดพื้นหลัง
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ShoppingCart className="w-5 h-5" />
                              <span>สั่งออนไลน์</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Star className="w-5 h-5" />
                              <span>โปรแกรมสะสมแต้ม</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-5 h-5" />
                              <span>แชทสนับสนุน</span>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bell className="w-5 h-5" />
                              <span>การแจ้งเตือน</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users className="w-5 h-5" />
                              <span>สมาชิกพิเศษ</span>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-5 h-5" />
                              <span>ภาษาหลายภาษา</span>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="mt-6">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
                          <CardDescription>
                            จัดการการแจ้งเตือนที่ส่งไปยังลูกค้า
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>แจ้งเตือนออเดอร์</Label>
                              <p className="text-sm text-muted-foreground">แจ้งเตือนสถานะออเดอร์</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>โปรโมชั่นใหม่</Label>
                              <p className="text-sm text-muted-foreground">แจ้งเตือนโปรโมชั่นและส่วนลด</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>คะแนนสะสม</Label>
                              <p className="text-sm text-muted-foreground">แจ้งเตือนการเปลี่ยนแปลงคะแนน</p>
                            </div>
                            <Switch />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>ข่าวสารร้าน</Label>
                              <p className="text-sm text-muted-foreground">ข่าวสารและอัพเดทจากร้าน</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Download className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">ดาวน์โหลดทั้งหมด</p>
                              <p className="text-2xl font-bold">1,234</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">ผู้ใช้งานปัจจุบัน</p>
                              <p className="text-2xl font-bold">856</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium">ออเดอร์วันนี้</p>
                              <p className="text-2xl font-bold">42</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium">คะแนนเฉลี่ย</p>
                              <p className="text-2xl font-bold">4.8</p>
                            </div>
                          </div>
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

export default CustomerAppManagement;
