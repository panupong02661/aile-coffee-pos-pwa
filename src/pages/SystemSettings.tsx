
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Printer, 
  Wifi,
  HardDrive,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Users,
  CreditCard,
  FileText,
  Palette
} from 'lucide-react';

const SystemSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { shopSettings, receiptSettings } = useSupabaseData();
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    maxOrders: 1000,
    sessionTimeout: 60,
    enableLogging: true,
    logLevel: 'info',
    maintenanceMode: false,
    allowGuestOrders: true,
    requireCustomerInfo: false,
    autoCalculateTax: true,
    taxRate: 7,
    defaultCurrency: 'THB',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    language: 'th',
    theme: 'light'
  });

  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionSecure: true,
    auditLogging: true,
    encryptData: true,
    ipWhitelist: '',
    enableRateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 60
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmail: true,
    enablePush: true,
    enableSMS: false,
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: false,
    errorAlerts: true,
    maintenanceNotifications: true,
    emailServer: 'smtp.gmail.com',
    emailPort: 587,
    emailUsername: '',
    emailPassword: '',
    smsProvider: '',
    smsApiKey: '',
    pushApiKey: ''
  });

  const handleSaveSystemSettings = async () => {
    try {
      // บันทึกการตั้งค่าระบบ
      toast({
        title: 'สำเร็จ',
        description: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      // บันทึกการตั้งค่าความปลอดภัย
      toast({
        title: 'สำเร็จ',
        description: 'บันทึกการตั้งค่าความปลอดภัยเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      // บันทึกการตั้งค่าการแจ้งเตือน
      toast({
        title: 'สำเร็จ',
        description: 'บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    }
  };

  const handleSystemRestart = async () => {
    try {
      toast({
        title: 'กำลังรีสตาร์ทระบบ',
        description: 'ระบบจะหยุดทำงานชั่วคราว...'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถรีสตาร์ทระบบได้',
        variant: 'destructive'
      });
    }
  };

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
                <CardTitle className="text-2xl text-coffee-800 flex items-center">
                  <Settings className="w-6 h-6 mr-2" />
                  การตั้งค่าระบบ
                </CardTitle>
                <CardDescription>จัดการการตั้งค่าระบบ ความปลอดภัย และการแจ้งเตือน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="general">ทั่วไป</TabsTrigger>
                    <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
                    <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
                    <TabsTrigger value="database">ฐานข้อมูล</TabsTrigger>
                    <TabsTrigger value="integration">การเชื่อมต่อ</TabsTrigger>
                    <TabsTrigger value="maintenance">บำรุงรักษา</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Monitor className="w-5 h-5 mr-2" />
                            การตั้งค่าทั่วไป
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="autoBackup">สำรองข้อมูลอัตโนมัติ</Label>
                            <Switch 
                              id="autoBackup"
                              checked={systemSettings.autoBackup}
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ความถี่การสำรองข้อมูล</Label>
                            <Select 
                              value={systemSettings.backupFrequency}
                              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">ทุกชั่วโมง</SelectItem>
                                <SelectItem value="daily">รายวัน</SelectItem>
                                <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                                <SelectItem value="monthly">รายเดือน</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>จำนวนออเดอร์สูงสุดต่อวัน</Label>
                            <Input
                              type="number"
                              value={systemSettings.maxOrders}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, maxOrders: parseInt(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>หมดเวลาเซสชัน (นาที)</Label>
                            <Input
                              type="number"
                              value={systemSettings.sessionTimeout}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="maintenanceMode">โหมดบำรุงรักษา</Label>
                            <Switch 
                              id="maintenanceMode"
                              checked={systemSettings.maintenanceMode}
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            การตั้งค่าธุรกิจ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="allowGuestOrders">อนุญาตสั่งซื้อโดยไม่ต้องสมาชิก</Label>
                            <Switch 
                              id="allowGuestOrders"
                              checked={systemSettings.allowGuestOrders}
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowGuestOrders: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="autoCalculateTax">คำนวณภาษีอัตโนมัติ</Label>
                            <Switch 
                              id="autoCalculateTax"
                              checked={systemSettings.autoCalculateTax}
                              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoCalculateTax: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>อัตราภาษี (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={systemSettings.taxRate}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>สกุลเงินหลัก</Label>
                            <Select 
                              value={systemSettings.defaultCurrency}
                              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultCurrency: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="THB">บาท (THB)</SelectItem>
                                <SelectItem value="USD">ดอลลาร์ (USD)</SelectItem>
                                <SelectItem value="EUR">ยูโร (EUR)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>รูปแบบภาษา</Label>
                            <Select 
                              value={systemSettings.language}
                              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="th">ไทย</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleSaveSystemSettings}>
                        <Settings className="w-4 h-4 mr-2" />
                        บันทึกการตั้งค่า
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            การรักษาความปลอดภัย
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableTwoFactor">ยืนยันตัวตน 2 ขั้นตอน</Label>
                            <Switch 
                              id="enableTwoFactor"
                              checked={securitySettings.enableTwoFactor}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ความยาวรหัสผ่านขั้นต่ำ</Label>
                            <Input
                              type="number"
                              value={securitySettings.passwordMinLength}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="passwordRequireSpecial">ต้องมีอักขระพิเศษ</Label>
                            <Switch 
                              id="passwordRequireSpecial"
                              checked={securitySettings.passwordRequireSpecial}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireSpecial: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>จำนวนครั้งที่เข้าสู่ระบบผิดสูงสุด</Label>
                            <Input
                              type="number"
                              value={securitySettings.maxLoginAttempts}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ระยะเวลาล็อคบัญชี (นาที)</Label>
                            <Input
                              type="number"
                              value={securitySettings.lockoutDuration}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Lock className="w-5 h-5 mr-2" />
                            การเข้าถึงและการเข้ารหัส
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sessionSecure">เซสชันที่ปลอดภัย</Label>
                            <Switch 
                              id="sessionSecure"
                              checked={securitySettings.sessionSecure}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, sessionSecure: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="auditLogging">บันทึกการตรวจสอบ</Label>
                            <Switch 
                              id="auditLogging"
                              checked={securitySettings.auditLogging}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="encryptData">เข้ารหัสข้อมูล</Label>
                            <Switch 
                              id="encryptData"
                              checked={securitySettings.encryptData}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, encryptData: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>รายชื่อ IP ที่อนุญาต</Label>
                            <Textarea
                              placeholder="192.168.1.1, 10.0.0.1"
                              value={securitySettings.ipWhitelist}
                              onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableRateLimit">จำกัดอัตราการเข้าถึง</Label>
                            <Switch 
                              id="enableRateLimit"
                              checked={securitySettings.enableRateLimit}
                              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableRateLimit: checked }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleSaveSecuritySettings}>
                        <Shield className="w-4 h-4 mr-2" />
                        บันทึกการตั้งค่าความปลอดภัย
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Bell className="w-5 h-5 mr-2" />
                            ประเภทการแจ้งเตือน
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableEmail">อีเมล</Label>
                            <Switch 
                              id="enableEmail"
                              checked={notificationSettings.enableEmail}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableEmail: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="enablePush">การแจ้งเตือนแบบผลัก</Label>
                            <Switch 
                              id="enablePush"
                              checked={notificationSettings.enablePush}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enablePush: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="enableSMS">SMS</Label>
                            <Switch 
                              id="enableSMS"
                              checked={notificationSettings.enableSMS}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableSMS: checked }))}
                            />
                          </div>

                          <hr />

                          <div className="flex items-center justify-between">
                            <Label htmlFor="orderNotifications">การแจ้งเตือนออเดอร์</Label>
                            <Switch 
                              id="orderNotifications"
                              checked={notificationSettings.orderNotifications}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="lowStockAlerts">แจ้งเตือนสินค้าใกล้หมด</Label>
                            <Switch 
                              id="lowStockAlerts"
                              checked={notificationSettings.lowStockAlerts}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="dailyReports">รายงานรายวัน</Label>
                            <Switch 
                              id="dailyReports"
                              checked={notificationSettings.dailyReports}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, dailyReports: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="errorAlerts">แจ้งเตือนข้อผิดพลาด</Label>
                            <Switch 
                              id="errorAlerts"
                              checked={notificationSettings.errorAlerts}
                              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, errorAlerts: checked }))}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            การตั้งค่าเซิร์ฟเวอร์
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>เซิร์ฟเวอร์อีเมล</Label>
                            <Input
                              value={notificationSettings.emailServer}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailServer: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>พอร์ตอีเมล</Label>
                            <Input
                              type="number"
                              value={notificationSettings.emailPort}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailPort: parseInt(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ชื่อผู้ใช้อีเมล</Label>
                            <Input
                              value={notificationSettings.emailUsername}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailUsername: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>รหัสผ่านอีเมล</Label>
                            <Input
                              type="password"
                              value={notificationSettings.emailPassword}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailPassword: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ผู้ให้บริการ SMS</Label>
                            <Input
                              placeholder="Twilio, AWS SNS, etc."
                              value={notificationSettings.smsProvider}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsProvider: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>API Key สำหรับ SMS</Label>
                            <Input
                              type="password"
                              value={notificationSettings.smsApiKey}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsApiKey: e.target.value }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleSaveNotificationSettings}>
                        <Bell className="w-4 h-4 mr-2" />
                        บันทึกการตั้งค่าการแจ้งเตือน
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="database" className="mt-6">
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Database className="w-5 h-5 mr-2" />
                            สถานะฐานข้อมูล
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>สถานะการเชื่อมต่อ</span>
                            <Badge variant="default" className="bg-green-500">เชื่อมต่อแล้ว</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>ขนาดฐานข้อมูล</span>
                            <span>127.5 MB</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>จำนวนตาราง</span>
                            <span>45 ตาราง</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>การสำรองข้อมูลล่าสุด</span>
                            <span>2 ชั่วโมงที่แล้ว</span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid gap-4 md:grid-cols-3">
                        <Button variant="outline">
                          <HardDrive className="w-4 h-4 mr-2" />
                          สำรองข้อมูลทันที
                        </Button>
                        <Button variant="outline">
                          <Database className="w-4 h-4 mr-2" />
                          ตรวจสอบฐานข้อมูล
                        </Button>
                        <Button variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          ส่งออกข้อมูล
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="integration" className="mt-6">
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Wifi className="w-5 h-5 mr-2" />
                            การเชื่อมต่อภายนอก
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="border rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">เครื่องพิมพ์</span>
                                <Badge variant="default" className="bg-green-500">เชื่อมต่อแล้ว</Badge>
                              </div>
                              <p className="text-sm text-gray-600">EPSON TM-T20II</p>
                            </div>

                            <div className="border rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">ระบบชำระเงิน</span>
                                <Badge variant="secondary">ไม่ได้เชื่อมต่อ</Badge>
                              </div>
                              <p className="text-sm text-gray-600">PromptPay, Credit Card</p>
                            </div>

                            <div className="border rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">แพลตฟอร์มจัดส่ง</span>
                                <Badge variant="secondary">ไม่ได้เชื่อมต่อ</Badge>
                              </div>
                              <p className="text-sm text-gray-600">GrabFood, FoodPanda</p>
                            </div>

                            <div className="border rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">LINE Official Account</span>
                                <Badge variant="secondary">ไม่ได้เชื่อมต่อ</Badge>
                              </div>
                              <p className="text-sm text-gray-600">การแจ้งเตือนและโปรโมชั่น</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance" className="mt-6">
                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            การบำรุงรักษาระบบ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <h4 className="font-medium">สถานะระบบ</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span>CPU ใช้งาน</span>
                                  <Badge variant="outline">23%</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>RAM ใช้งาน</span>
                                  <Badge variant="outline">45%</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>พื้นที่ดิสก์</span>
                                  <Badge variant="outline">67%</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">ข้อมูลระบบ</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span>เวอร์ชั่นระบบ</span>
                                  <Badge variant="secondary">v2.1.0</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>เวลาทำงาน</span>
                                  <span>7 วัน 14 ชั่วโมง</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>อัปเดตล่าสุด</span>
                                  <span>15 ม.ค. 2567</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h4 className="font-medium mb-4">การดำเนินการบำรุงรักษา</h4>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                              <Button variant="outline" className="h-auto p-4 flex-col">
                                <Settings className="w-6 h-6 mb-2" />
                                <span>ตรวจสอบระบบ</span>
                              </Button>
                              <Button variant="outline" className="h-auto p-4 flex-col">
                                <HardDrive className="w-6 h-6 mb-2" />
                                <span>ทำความสะอาดแคช</span>
                              </Button>
                              <Button variant="outline" className="h-auto p-4 flex-col">
                                <Database className="w-6 h-6 mb-2" />
                                <span>เพิ่มประสิทธิภาพ DB</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-auto p-4 flex-col"
                                onClick={handleSystemRestart}
                              >
                                <Monitor className="w-6 h-6 mb-2" />
                                <span>รีสตาร์ทระบบ</span>
                              </Button>
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

export default SystemSettings;
