
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store,
  Bell,
  Printer,
  CreditCard,
  Smartphone,
  Globe,
  Shield,
  Database,
  Save,
  Upload
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ShopBasicSettings from '@/components/ShopBasicSettings';
import ReceiptSettings from '@/components/ReceiptSettings';
import AutoPrintSettings from '@/components/AutoPrintSettings';

const ShopSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="ตั้งค่าร้านค้า"
          page="other"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">ตั้งค่าร้านค้า</CardTitle>
                <CardDescription>
                  จัดการข้อมูลร้านค้า ระบบต่างๆ และการตั้งค่าทั่วไป
                </CardDescription>
              </CardHeader>
            </Card>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
                <TabsTrigger value="receipt">ใบเสร็จ</TabsTrigger>
                <TabsTrigger value="printer">เครื่องพิมพ์</TabsTrigger>
                <TabsTrigger value="payment">การชำระเงิน</TabsTrigger>
                <TabsTrigger value="mobile">มือถือ</TabsTrigger>
                <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
                <TabsTrigger value="online">ออนไลน์</TabsTrigger>
                <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-6">
                <ShopBasicSettings />
              </TabsContent>
              
              <TabsContent value="receipt" className="mt-6">
                <ReceiptSettings />
              </TabsContent>
              
              <TabsContent value="printer" className="mt-6">
                <AutoPrintSettings />
              </TabsContent>
              
              <TabsContent value="payment" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      ตั้งค่าการชำระเงิน
                    </CardTitle>
                    <CardDescription>
                      จัดการช่องทางการรับชำระเงินต่างๆ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">เงินสด</Label>
                          <p className="text-sm text-muted-foreground">
                            รับชำระเงินด้วยเงินสด
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">QR Code PromptPay</Label>
                          <p className="text-sm text-muted-foreground">
                            รับชำระเงินผ่าน QR Code PromptPay
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>หมายเลขบัญชี PromptPay</Label>
                        <Input placeholder="หมายเลขโทรศัพท์หรือเลขประจำตัวประชาชน" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">บัตรเครดิต/เดบิต</Label>
                          <p className="text-sm text-muted-foreground">
                            รับชำระเงินด้วยบัตรเครดิตและเดบิต
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">โอนเงินออนไลน์</Label>
                          <p className="text-sm text-muted-foreground">
                            รับโอนเงินผ่านธนาคารออนไลน์
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mobile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      ตั้งค่าแอปมือถือ
                    </CardTitle>
                    <CardDescription>
                      จัดการการแจ้งเตือนและฟีเจอร์สำหรับมือถือ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">การแจ้งเตือนผ่าน Push Notification</Label>
                          <p className="text-sm text-muted-foreground">
                            รับแจ้งเตือนเมื่อมีออเดอร์ใหม่
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">เสียงแจ้งเตือน</Label>
                          <p className="text-sm text-muted-foreground">
                            เล่นเสียงเมื่อมีออเดอร์ใหม่
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">การสั่นเตือน</Label>
                          <p className="text-sm text-muted-foreground">
                            สั่นเครื่องเมื่อมีออเดอร์ใหม่
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>ระดับความดังของเสียง</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">เบา</SelectItem>
                            <SelectItem value="medium">กลาง</SelectItem>
                            <SelectItem value="high">ดัง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      ตั้งค่าการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      จัดการการแจ้งเตือนต่างๆ ของระบบ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">แจ้งเตือนออเดอร์ใหม่</Label>
                          <p className="text-sm text-muted-foreground">
                            แจ้งเตือนเมื่อมีลูกค้าสั่งสินค้า
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">แจ้งเตือนสินค้าหมด</Label>
                          <p className="text-sm text-muted-foreground">
                            แจ้งเตือนเมื่อสินค้าใกล้หมดหรือหมด
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">แจ้งเตือนยอดขายประจำวัน</Label>
                          <p className="text-sm text-muted-foreground">
                            ส่งสรุปยอดขายประจำวัน
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>ช่องทางการแจ้งเตือน</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="email" defaultChecked />
                            <Label htmlFor="email">อีเมล</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="line" />
                            <Label htmlFor="line">LINE Notify</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="discord" />
                            <Label htmlFor="discord">Discord Webhook</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="online" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      ตั้งค่าระบบออนไลน์
                    </CardTitle>
                    <CardDescription>
                      จัดการร้านค้าออนไลน์และการสั่งซื้อออนไลน์
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">เปิดร้านค้าออนไลน์</Label>
                          <p className="text-sm text-muted-foreground">
                            เปิดให้ลูกค้าสั่งซื้อผ่านออนไลน์
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>ลิงก์ร้านค้าออนไลน์</Label>
                        <div className="flex gap-2">
                          <Input placeholder="ชื่อร้านค้าของคุณ" />
                          <span className="flex items-center text-sm text-muted-foreground">.myshop.com</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">รับออเดอร์นอกเวลา</Label>
                          <p className="text-sm text-muted-foreground">
                            อนุญาตให้สั่งซื้อนอกเวลาทำการ
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>เวลาเปิด</Label>
                          <Input type="time" defaultValue="08:00" />
                        </div>
                        <div className="space-y-2">
                          <Label>เวลาปิด</Label>
                          <Input type="time" defaultValue="20:00" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      ความปลอดภัย
                    </CardTitle>
                    <CardDescription>
                      จัดการการรักษาความปลอดภัยของระบบ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">การเข้าสู่ระบบด้วยรหัส PIN</Label>
                          <p className="text-sm text-muted-foreground">
                            ต้องใส่รหัส PIN ก่อนเข้าใช้ระบบ
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>รหัส PIN (4 หลัก)</Label>
                        <Input type="password" maxLength={4} placeholder="••••" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">บันทึกการใช้งาน</Label>
                          <p className="text-sm text-muted-foreground">
                            บันทึกการใช้งานระบบทั้งหมด
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">สำรองข้อมูลอัตโนมัติ</Label>
                          <p className="text-sm text-muted-foreground">
                            สำรองข้อมูลไปยัง Cloud อัตโนมัติ
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="space-y-3">
                        <Label>ความถี่ในการสำรองข้อมูล</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">ทุกชั่วโมง</SelectItem>
                            <SelectItem value="daily">ทุกวัน</SelectItem>
                            <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 space-x-2">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        สำรองข้อมูลตอนนี้
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
