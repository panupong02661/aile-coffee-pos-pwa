
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Menu, Smartphone, Download, Bell, Settings, Users, BarChart3, Gift, CreditCard } from 'lucide-react';
import MainSidebar from '@/components/MainSidebar';

const CustomerAppManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const appStats = {
    totalDownloads: 1250,
    activeUsers: 890,
    dailyActiveUsers: 234,
    pushNotifications: 156
  };

  const features = [
    {
      id: 'menu-browsing',
      name: 'ดูเมนูและสั่งอาหาร',
      description: 'ลูกค้าสามารถดูเมนู สั่งอาหาร และชำระเงินผ่านแอป',
      enabled: true,
      icon: Smartphone
    },
    {
      id: 'loyalty-program',
      name: 'โปรแกรมสะสมแต้ม',
      description: 'ระบบสะสมแต้มและแลกของรางวัล',
      enabled: true,
      icon: Gift
    },
    {
      id: 'push-notifications',
      name: 'การแจ้งเตือน',
      description: 'ส่งการแจ้งเตือนโปรโมชั่นและสถานะออเดอร์',
      enabled: false,
      icon: Bell
    },
    {
      id: 'payment-integration',
      name: 'ชำระเงินออนไลน์',
      description: 'รองรับการชำระเงินผ่าน PromptPay และบัตรเครดิต',
      enabled: true,
      icon: CreditCard
    }
  ];

  return (
    <>
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleSidebar}
              className="text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-coffee-800">จัดการแอปมือถือลูกค้า</h1>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="features">ฟีเจอร์</TabsTrigger>
            <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="analytics">สถิติ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ดาวน์โหลดทั้งหมด</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appStats.totalDownloads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+20.1% จากเดือนที่แล้ว</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ผู้ใช้งานปัจจุบัน</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appStats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15.3% จากเดือนที่แล้ว</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ผู้ใช้รายวัน</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appStats.dailyActiveUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+5.2% จากเมื่อวาน</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">การแจ้งเตือนส่งแล้ว</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appStats.pushNotifications.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">วันนี้</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ฟีเจอร์แอปมือถือ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-8 w-8 text-coffee-600" />
                        <div>
                          <h3 className="font-medium">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={feature.enabled ? "default" : "secondary"}>
                          {feature.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                        <Switch checked={feature.enabled} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>การจัดการการแจ้งเตือน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    ฟีเจอร์การจัดการการแจ้งเตือนจะพัฒนาในเร็วๆ นี้
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>สถิติการใช้งานแอป</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    กราฟและสถิติการใช้งานจะแสดงที่นี่
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CustomerAppManagement;
