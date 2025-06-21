import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Globe, Smartphone, QrCode, Users, Settings, BarChart3, UserCog } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import OnlineSystemHeader from '@/components/OnlineSystemHeader';
import { Link } from 'react-router-dom';

const OnlineSystem = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
    { id: 'website', label: 'เว็บไซต์', icon: Globe },
    { id: 'mobile', label: 'แอปมือถือสำหรับลูกค้า', icon: Smartphone },
    { id: 'customer-management', label: 'แอปมือถือจัดการลูกค้า', icon: UserCog },
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
                      asChild={item.id === 'customer-management'}
                    >
                      {item.id === 'customer-management' ? (
                        <Link to="/customer-app-management">
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </>
                      )}
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="text-xs">ภาพรวม</TabsTrigger>
              <TabsTrigger value="qr-code" className="text-xs">QR Code</TabsTrigger>
              <TabsTrigger value="website" className="text-xs">เว็บไซต์</TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs">แอปลูกค้า</TabsTrigger>
              <TabsTrigger value="customer-management" className="text-xs">จัดการลูกค้า</TabsTrigger>
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
                  <CardTitle>แอปมือถือสำหรับลูกค้า</CardTitle>
                  <CardDescription>
                    แอปมือถือสำหรับลูกค้าสั่งอาหารออนไลน์และชำระเงิน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* สถานะแอปมือถือ */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">สถานะแอปมือถือ</h3>
                        <p className="text-sm text-muted-foreground">แอปพร้อมใช้งานสำหรับลูกค้า</p>
                      </div>
                      <Badge variant="default">เปิดใช้งาน</Badge>
                    </div>

                    {/* ฟีเจอร์หลัก */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">ระบบสมาชิก</h4>
                            <p className="text-sm text-muted-foreground">ลงทะเบียนและเข้าสู่ระบบ</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • ลูกค้าต้องสมัครสมาชิกก่อนใช้งาน<br/>
                          • รองรับมือถือและแท็บแล็ต<br/>
                          • ระบบแก้ไขข้อมูลส่วนตัว
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">บัตรสมาชิก</h4>
                            <p className="text-sm text-muted-foreground">แสดงระดับและแต้ม</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • บัตรสมาชิกแต่ละระดับ<br/>
                          • แสดงแต้มและยอดใช้จ่าย<br/>
                          • ระบบอัพเกรดอัตโนมัติ
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Rewards & Coupons</h4>
                            <p className="text-sm text-muted-foreground">ของรางวัลและคูปอง</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • แลกของรางวัลด้วยแต้ม<br/>
                          • เก็บและใช้คูปองส่วนลด<br/>
                          • ระบบจัดการคูปอง
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">ระบบสั่งอาหาร</h4>
                            <p className="text-sm text-muted-foreground">สั่งและชำระเงินออนไลน์</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • เลือกเมนูจากร้าน<br/>
                          • ชำระเงินออนไลน์<br/>
                          • ตรวจสอบสถานะออเดอร์
                        </div>
                      </div>
                    </div>

                    {/* ลิงก์ไปยังแอป */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-center">
                        <Smartphone className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">ทดลองใช้แอปมือถือ</h3>
                        <p className="text-muted-foreground mb-4">
                          ทดสอบฟีเจอร์แอปมือถือสำหรับลูกค้า
                        </p>
                        <Button 
                          onClick={() => window.open('/customer-mobile-app', '_blank')}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          เปิดแอปมือถือ
                        </Button>
                      </div>
                    </div>

                    {/* สถิติการใช้งาน */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">45</div>
                        <div className="text-sm text-muted-foreground">ผู้ใช้แอป</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">128</div>
                        <div className="text-sm text-muted-foreground">ออเดอร์จากแอป</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">฿8,450</div>
                        <div className="text-sm text-muted-foreground">ยอดขายจากแอป</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer-management" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="w-5 h-5" />
                    แอปมือถือสำหรับจัดการลูกค้า
                  </CardTitle>
                  <CardDescription>
                    ระบบจัดการลูกค้าและส่งของขวัญผ่านแอปมือถือ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* คำอธิบายฟีเจอร์ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">จัดการลูกค้า</h4>
                            <p className="text-sm text-muted-foreground">เลือกลูกค้าและจัดกลุ่ม</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • เลือกลูกค้าหลายคนพร้อมกัน<br/>
                          • กรองตามระดับสมาชิก<br/>
                          • ค้นหาด้วยชื่อและเบอร์โทร
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">ส่งของขวัญ</h4>
                            <p className="text-sm text-muted-foreground">ส่งรางวัลและโปรโมชั่น</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • เลือกของรางวัลจากระบบ<br/>
                          • ส่งโปรโมชั่นพิเศษ<br/>
                          • เพิ่มข้อความแนบได้
                        </div>
                      </div>
                    </div>

                    {/* ปุ่มเข้าสู่ระบบ */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-center">
                        <UserCog className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">เข้าสู่ระบบจัดการลูกค้า</h3>
                        <p className="text-muted-foreground mb-4">
                          จัดการและส่งของขวัญให้ลูกค้าผ่านระบบออนไลน์
                        </p>
                        <Button 
                          asChild
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          <Link to="/customer-app-management">
                            เปิดระบบจัดการลูกค้า
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* สถิติการใช้งาน */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">156</div>
                        <div className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">23</div>
                        <div className="text-sm text-muted-foreground">ของขวัญที่ส่งแล้ว</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">8</div>
                        <div className="text-sm text-muted-foreground">โปรโมชั่นที่ส่งแล้ว</div>
                      </div>
                    </div>
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
