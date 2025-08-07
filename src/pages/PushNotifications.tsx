import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Send,
  Settings,
  Users,
  Clock,
  Calendar,
  Target,
  MessageSquare,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  Coffee,
  ShoppingCart,
  Star,
  Zap,
  Heart,
  TrendingUp,
  User,
  Globe
} from 'lucide-react';

const PushNotifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    orders: true,
    promotions: true,
    inventory: false,
    system: true,
    marketing: false
  });
  const [subscribers, setSubscribers] = useState(1247);
  const [sentNotifications, setSentNotifications] = useState(8934);
  const [openRate, setOpenRate] = useState(68.5);
  const { toast } = useToast();

  // Mock notification templates
  const templates = [
    {
      id: 'order_ready',
      name: 'ออเดอร์พร้อม',
      title: 'ออเดอร์ของคุณพร้อมแล้ว! ☕',
      body: 'กรุณามารับออเดอร์ที่เคาน์เตอร์',
      icon: Coffee,
      category: 'orders',
      usage: 234
    },
    {
      id: 'promotion',
      name: 'โปรโมชั่นพิเศษ',
      title: 'ส่วนลด 30% วันนี้เท่านั้น! 🎉',
      body: 'รีบมาก่อนหมดเวลา 18:00 น.',
      icon: Gift,
      category: 'promotions',
      usage: 189
    },
    {
      id: 'new_menu',
      name: 'เมนูใหม่',
      title: 'เมนูใหม่มาแล้ว! 🆕',
      body: 'ลองชิมเมนูใหม่พิเศษของเรา',
      icon: Star,
      category: 'marketing',
      usage: 156
    },
    {
      id: 'loyalty_points',
      name: 'แต้มสะสม',
      title: 'คุณได้รับแต้ม! ⭐',
      body: 'แต้มสะสมของคุณ +50 แต้ม',
      icon: Heart,
      category: 'orders',
      usage: 298
    }
  ];

  // Mock scheduled notifications
  const [scheduledNotifications, setScheduledNotifications] = useState([
    {
      id: 'SCH001',
      title: 'Happy Hour เริ่มแล้ว! 🎉',
      message: 'ส่วนลด 25% เวลา 14:00-16:00 น.',
      scheduledTime: '2024-01-08 14:00',
      status: 'scheduled',
      recipients: 'all_customers',
      recipientCount: 1247
    },
    {
      id: 'SCH002',
      title: 'อย่าลืมมารับออเดอร์นะคะ ☕',
      message: 'ออเดอร์ของคุณรออยู่ที่เคาน์เตอร์',
      scheduledTime: '2024-01-08 16:30',
      status: 'sent',
      recipients: 'specific_users',
      recipientCount: 5
    },
    {
      id: 'SCH003',
      title: 'เมนูใหม่พรุ่งนี้! 🆕',
      message: 'เตรียมตัวให้พร้อมกับรสชาติใหม่',
      scheduledTime: '2024-01-09 10:00',
      status: 'scheduled',
      recipients: 'vip_customers',
      recipientCount: 89
    }
  ]);

  // Mock analytics data
  const [analyticsData] = useState({
    today: { sent: 45, delivered: 43, opened: 31, clicked: 12 },
    week: { sent: 289, delivered: 276, opened: 189, clicked: 78 },
    month: { sent: 1156, delivered: 1089, opened: 746, clicked: 298 }
  });

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setIsServiceWorkerReady(!!registration);
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "สิทธิ์การแจ้งเตือนได้รับอนุญาต! ✅",
          description: "ตั้งแต่นี้คุณจะได้รับการแจ้งเตือนจากแอป",
        });
      } else {
        toast({
          title: "ไม่สามารถขอสิทธิ์ได้",
          description: "กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าเบราว์เซอร์",
          variant: "destructive"
        });
      }
    }
  };

  const sendTestNotification = (template: typeof templates[0]) => {
    if (notificationPermission === 'granted') {
      new Notification(template.title, {
        body: template.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `test-${template.id}`,
        requireInteraction: true
      });

      toast({
        title: "ส่งการแจ้งเตือนทดสอบแล้ว! 📱",
        description: `ใช้เทมเพลต: ${template.name}`,
      });
    } else {
      toast({
        title: "ไม่สามารถส่งได้",
        description: "กรุณาอนุญาตการแจ้งเตือนก่อน",
        variant: "destructive"
      });
    }
  };

  const sendBulkNotification = (notification: typeof scheduledNotifications[0]) => {
    // Simulate sending bulk notification
    setScheduledNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, status: 'sent' } : n)
    );
    
    setSentNotifications(prev => prev + notification.recipientCount);
    
    toast({
      title: "ส่งการแจ้งเตือนสำเร็จ! 🎉",
      description: `ส่งไปยัง ${notification.recipientCount} ผู้รับ`,
    });
  };

  const toggleNotificationSetting = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    
    toast({
      title: "บันทึกการตั้งค่าแล้ว! ⚙️",
      description: "การเปลี่ยนแปลงจะมีผลทันที",
    });
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-500', text: 'อนุญาตแล้ว' };
      case 'denied':
        return { icon: AlertCircle, color: 'text-red-500', text: 'ถูกปฏิเสธ' };
      default:
        return { icon: Info, color: 'text-yellow-500', text: 'รออนุญาต' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">ส่งแล้ว</Badge>;
      case 'scheduled':
        return <Badge variant="outline">กำหนดการ</Badge>;
      case 'failed':
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      default:
        return <Badge variant="secondary">ร่าง</Badge>;
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <Shell>
      <div className="h-screen bg-background flex">
        <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title="ระบบแจ้งเตือนพุช (Push Notifications)"
          />
          
          <div className="p-6 space-y-6">
            {/* Permission Status & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">สถานะสิทธิ์</p>
                      <p className="text-lg font-semibold">{permissionStatus.text}</p>
                    </div>
                    <permissionStatus.icon className={`w-8 h-8 ${permissionStatus.color}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ผู้สมัครรับ</p>
                      <p className="text-lg font-semibold">{subscribers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ส่งทั้งหมด</p>
                      <p className="text-lg font-semibold">{sentNotifications.toLocaleString()}</p>
                    </div>
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">อัตราเปิด</p>
                      <p className="text-lg font-semibold">{openRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permission Request Alert */}
            {notificationPermission !== 'granted' && (
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    กรุณาอนุญาตการแจ้งเตือนเพื่อใช้งานฟีเจอร์นี้ได้อย่างเต็มรูปแบบ
                  </span>
                  <Button onClick={requestNotificationPermission} size="sm">
                    ขอสิทธิ์
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="send">ส่งการแจ้งเตือน</TabsTrigger>
                <TabsTrigger value="templates">เทมเพลต</TabsTrigger>
                <TabsTrigger value="schedule">กำหนดการ</TabsTrigger>
                <TabsTrigger value="analytics">สถิติ</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              {/* Send Notifications Tab */}
              <TabsContent value="send" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      ส่งการแจ้งเตือนทันที
                    </CardTitle>
                    <CardDescription>
                      สร้างและส่งการแจ้งเตือนให้ผู้ใช้ทันที
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">หัวข้อการแจ้งเตือน</Label>
                        <Input 
                          id="title"
                          placeholder="เช่น: ออเดอร์ของคุณพร้อมแล้ว!"
                          defaultValue="ออเดอร์ของคุณพร้อมแล้ว! ☕"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipients">ผู้รับ</Label>
                        <Select defaultValue="all_customers">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_customers">ลูกค้าทั้งหมด (1,247)</SelectItem>
                            <SelectItem value="vip_customers">ลูกค้า VIP (89)</SelectItem>
                            <SelectItem value="recent_orders">ลูกค้าที่สั่งล่าสุด (156)</SelectItem>
                            <SelectItem value="specific_users">เลือกเฉพาะ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">ข้อความ</Label>
                      <Textarea 
                        id="message"
                        placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                        defaultValue="กรุณามารับออเดอร์ที่เคาน์เตอร์ภายใน 10 นาที"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="icon">ไอคอน</Label>
                        <Select defaultValue="coffee">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coffee">☕ กาแฟ</SelectItem>
                            <SelectItem value="gift">🎁 ของขวัญ</SelectItem>
                            <SelectItem value="star">⭐ ดาว</SelectItem>
                            <SelectItem value="heart">❤️ หัวใจ</SelectItem>
                            <SelectItem value="bell">🔔 กระดิ่ง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">ความสำคัญ</Label>
                        <Select defaultValue="normal">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">ต่ำ</SelectItem>
                            <SelectItem value="normal">ปกติ</SelectItem>
                            <SelectItem value="high">สูง</SelectItem>
                            <SelectItem value="urgent">เร่งด่วน</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "ส่งการแจ้งเตือนสำเร็จ! 🎉",
                            description: "ส่งไปยังลูกค้าทั้งหมด 1,247 คน",
                          });
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        ส่งทันที
                      </Button>
                      <Button variant="outline" onClick={() => {
                        toast({
                          title: "บันทึกร่างสำเร็จ! 📝",
                          description: "สามารถกลับมาแก้ไขและส่งทีหลังได้",
                        });
                      }}>
                        บันทึกร่าง
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      เทมเพลตการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      เทมเพลตที่ใช้บ่อยสำหรับส่งการแจ้งเตือน
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <template.icon className="w-6 h-6 text-primary" />
                            <div>
                              <h3 className="font-semibold">{template.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ใช้งาน {template.usage} ครั้ง
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="p-2 bg-muted rounded">
                              <p className="font-medium text-sm">{template.title}</p>
                              <p className="text-xs text-muted-foreground">{template.body}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => sendTestNotification(template)}
                            >
                              ทดสอบ
                            </Button>
                            <Button size="sm" className="flex-1">
                              ใช้เทมเพลต
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      กำหนดการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      จัดการการแจ้งเตือนที่กำหนดเวลาไว้
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scheduledNotifications.map((notification) => (
                        <div key={notification.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            {getStatusBadge(notification.status)}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(notification.scheduledTime).toLocaleString('th-TH')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {notification.recipientCount} คน
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              {notification.status === 'scheduled' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    แก้ไข
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => sendBulkNotification(notification)}
                                  >
                                    ส่งเลย
                                  </Button>
                                </>
                              )}
                              {notification.status === 'sent' && (
                                <Button size="sm" variant="outline">
                                  ดูรายละเอียด
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      สถิติการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      วิเคราะห์ประสิทธิภาพการแจ้งเตือนของคุณ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">วันนี้</h3>
                        <div className="space-y-1 text-sm">
                          <p>ส่ง: <span className="font-medium">{analyticsData.today.sent}</span></p>
                          <p>ส่งสำเร็จ: <span className="font-medium text-green-600">{analyticsData.today.delivered}</span></p>
                          <p>เปิด: <span className="font-medium text-blue-600">{analyticsData.today.opened}</span></p>
                          <p>คลิก: <span className="font-medium text-purple-600">{analyticsData.today.clicked}</span></p>
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">7 วันที่แล้ว</h3>
                        <div className="space-y-1 text-sm">
                          <p>ส่ง: <span className="font-medium">{analyticsData.week.sent}</span></p>
                          <p>ส่งสำเร็จ: <span className="font-medium text-green-600">{analyticsData.week.delivered}</span></p>
                          <p>เปิด: <span className="font-medium text-blue-600">{analyticsData.week.opened}</span></p>
                          <p>คลิก: <span className="font-medium text-purple-600">{analyticsData.week.clicked}</span></p>
                        </div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">30 วันที่แล้ว</h3>
                        <div className="space-y-1 text-sm">
                          <p>ส่ง: <span className="font-medium">{analyticsData.month.sent}</span></p>
                          <p>ส่งสำเร็จ: <span className="font-medium text-green-600">{analyticsData.month.delivered}</span></p>
                          <p>เปิด: <span className="font-medium text-blue-600">{analyticsData.month.opened}</span></p>
                          <p>คลิก: <span className="font-medium text-purple-600">{analyticsData.month.clicked}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">อัตราการเปิด (Open Rate)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>วันนี้</span>
                            <span className="font-medium">{Math.round((analyticsData.today.opened / analyticsData.today.delivered) * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>7 วัน</span>
                            <span className="font-medium">{Math.round((analyticsData.week.opened / analyticsData.week.delivered) * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>30 วัน</span>
                            <span className="font-medium">{Math.round((analyticsData.month.opened / analyticsData.month.delivered) * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">อัตราการคลิก (Click Rate)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>วันนี้</span>
                            <span className="font-medium">{Math.round((analyticsData.today.clicked / analyticsData.today.opened) * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>7 วัน</span>
                            <span className="font-medium">{Math.round((analyticsData.week.clicked / analyticsData.week.opened) * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>30 วัน</span>
                            <span className="font-medium">{Math.round((analyticsData.month.clicked / analyticsData.month.opened) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      ตั้งค่าการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                      จัดการประเภทการแจ้งเตือนและการตั้งค่า
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">ประเภทการแจ้งเตือน</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'orders', label: 'ออเดอร์และการสั่งซื้อ', desc: 'แจ้งเตือนเกี่ยวกับสถานะออเดอร์', icon: ShoppingCart },
                          { key: 'promotions', label: 'โปรโมชั่นและส่วนลด', desc: 'ข้อเสนอพิเศษและส่วนลด', icon: Gift },
                          { key: 'inventory', label: 'สินค้าคงคลัง', desc: 'แจ้งเตือนสต็อกสินค้า', icon: Target },
                          { key: 'system', label: 'ระบบและการบำรุงรักษา', desc: 'อัพเดทระบบและการแจ้งเตือนสำคัญ', icon: Settings },
                          { key: 'marketing', label: 'การตลาดและกิจกรรม', desc: 'กิจกรรมพิเศษและข่าวสาร', icon: Zap }
                        ].map(({ key, label, desc, icon: Icon }) => (
                          <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{label}</p>
                                <p className="text-sm text-muted-foreground">{desc}</p>
                              </div>
                            </div>
                            <Switch 
                              checked={notificationSettings[key as keyof typeof notificationSettings]}
                              onCheckedChange={() => toggleNotificationSetting(key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">การตั้งค่าขั้นสูง</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">เสียงการแจ้งเตือน</p>
                            <p className="text-sm text-muted-foreground">เปิด/ปิดเสียงการแจ้งเตือน</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">การสั่นของเครื่อง</p>
                            <p className="text-sm text-muted-foreground">สั่นเครื่องเมื่อได้รับการแจ้งเตือน</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">แสดงบนหน้าจอล็อก</p>
                            <p className="text-sm text-muted-foreground">แสดงการแจ้งเตือนบนหน้าจอล็อก</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">โหมดไม่รบกวน</p>
                            <p className="text-sm text-muted-foreground">หยุดการแจ้งเตือนเวลา 22:00-08:00</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">ข้อมูลเทคนิค</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Service Worker: {isServiceWorkerReady ? '✅ พร้อมใช้งาน' : '❌ ไม่พร้อม'}</p>
                        <p>Notification API: {'Notification' in window ? '✅ รองรับ' : '❌ ไม่รองรับ'}</p>
                        <p>Push API: {'PushManager' in window ? '✅ รองรับ' : '❌ ไม่รองรับ'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default PushNotifications;
