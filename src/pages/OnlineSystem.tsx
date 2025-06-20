import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Smartphone, QrCode, Users, Settings, BarChart3 } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import OnlineSystemHeader from '@/components/OnlineSystemHeader';

const OnlineSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
    { id: 'website', label: 'เว็บไซต์', icon: Globe },
    { id: 'mobile', label: 'แอปมือถือ', icon: Smartphone },
    { id: 'customers', label: 'ลูกค้าออนไลน์', icon: Users },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header พร้อมเมนู */}
      <OnlineSystemHeader 
        onMenuToggle={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        isOnlineMode={isOnlineMode}
        onOnlineModeToggle={setIsOnlineMode}
      />

      <div className="flex gap-6">
        {/* เมนูด้านข้าง */}
        {isMenuOpen && (
          <Card className="w-64 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">เมนูระบบออนไลน์</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 p-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start h-10 text-left"
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* เนื้อหาหลัก */}
        <div className="flex-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="text-xs">ภาพรวม</TabsTrigger>
              <TabsTrigger value="qr-code" className="text-xs">QR Code</TabsTrigger>
              <TabsTrigger value="website" className="text-xs">เว็บไซต์</TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs">แอปมือถือ</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs">ลูกค้า</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">ตั้งค่า</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">สถานะระบบ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={isOnlineMode ? "default" : "secondary"}>
                      {isOnlineMode ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ออเดอร์ออนไลน์วันนี้</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">25</div>
                    <p className="text-xs text-muted-foreground">+12% จากเมื่อวาน</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ยอดขายออนไลน์</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">฿4,250</div>
                    <p className="text-xs text-muted-foreground">+8% จากเมื่อวาน</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ลูกค้าใหม่</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">สมัครสมาชิกใหม่</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>การใช้งานระบบออนไลน์</CardTitle>
                  <CardDescription>
                    ภาพรวมการใช้งานระบบออนไลน์ของร้าน
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">เว็บไซต์สั่งอาหาร</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ให้ลูกค้าสั่งอาหารผ่านเว็บไซต์และชำระเงินออนไลน์
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">QR Code สมัครสมาชิก</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ลูกค้าสแกน QR Code เพื่อสมัครสมาชิกและรับสิทธิประโยชน์
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr-code">
              <QRCodeGenerator />
            </TabsContent>

            <TabsContent value="website" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>เว็บไซต์สั่งอาหาร</CardTitle>
                  <CardDescription>
                    จัดการเว็บไซต์สำหรับให้ลูกค้าสั่งอาหารออนไลน์
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">สถานะเว็บไซต์</h3>
                        <p className="text-sm text-muted-foreground">เว็บไซต์พร้อมใช้งาน</p>
                      </div>
                      <Badge variant="default">เปิดใช้งาน</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">ปรับแต่งเมนู</div>
                          <div className="text-sm text-muted-foreground">จัดการเมนูที่แสดงบนเว็บไซต์</div>
                        </div>
                      </Button>

                      <Button variant="outline" className="h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">ตั้งค่าการชำระเงิน</div>
                          <div className="text-sm text-muted-foreground">เพิ่มช่องทางการชำระเงิน</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>แอปมือถือ</CardTitle>
                  <CardDescription>
                    แอปมือถือสำหรับลูกค้าสั่งอาหาร
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">แอปมือถือ</h3>
                    <p className="text-muted-foreground mb-4">
                      ฟีเจอร์นี้จะพร้อมใช้งานในอนาคต
                    </p>
                    <Button variant="outline">แจ้งให้ทราบเมื่อพร้อม</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ลูกค้าออนไลน์</CardTitle>
                  <CardDescription>
                    จัดการลูกค้าที่สั่งอาหารผ่านระบบออนไลน์
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold">156</div>
                        <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold">89</div>
                        <div className="text-sm text-muted-foreground">ลูกค้าประจำ</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">ลูกค้าใหม่เดือนนี้</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ตั้งค่าระบบออนไลน์</CardTitle>
                  <CardDescription>
                    จัดการการตั้งค่าต่างๆ ของระบบออนไลน์
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">เปิด/ปิดระบบออนไลน์</h3>
                        <p className="text-sm text-muted-foreground">เปิดหรือปิดการรับออเดอร์ออนไลน์</p>
                      </div>
                      <Switch 
                        checked={isOnlineMode}
                        onCheckedChange={setIsOnlineMode}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">การแจ้งเตือนออเดอร์ใหม่</h3>
                        <p className="text-sm text-muted-foreground">รับการแจ้งเตือนเมื่อมีออเดอร์ใหม่</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">ยืนยันออเดอร์อัตโนมัติ</h3>
                        <p className="text-sm text-muted-foreground">ยืนยันออเดอร์โดยอัตโนมัติ</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OnlineSystem;
