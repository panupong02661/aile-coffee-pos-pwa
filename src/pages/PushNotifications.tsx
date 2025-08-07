
import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  Coffee,
  Star,
  TrendingUp,
  Heart,
  Crown,
  History,
  BarChart
} from 'lucide-react';

import { NotificationService, NotificationTemplate, ScheduledNotification } from '@/components/notifications/NotificationService';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationScheduler } from '@/components/notifications/NotificationScheduler';

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
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [stats, setStats] = useState({
    subscribers: 1247,
    sentNotifications: 8934,
    openRate: 68.5
  });
  const { toast } = useToast();

  // Notification templates
  const templates: NotificationTemplate[] = [
    {
      id: 'order_ready',
      name: 'ออเดอร์พร้อม',
      title: 'ออเดอร์ของคุณพร้อมแล้ว! ☕',
      body: 'กรุณามารับออเดอร์ที่เคาน์เตอร์',
      category: 'orders',
      usage: 234
    },
    {
      id: 'promotion',
      name: 'โปรโมชั่นพิเศษ',
      title: 'ส่วนลด 30% วันนี้เท่านั้น! 🎉',
      body: 'รีบมาก่อนหมดเวลา 18:00 น.',
      category: 'promotions',
      usage: 189
    },
    {
      id: 'new_menu',
      name: 'เมนูใหม่',
      title: 'เมนูใหม่มาแล้ว! 🆕',
      body: 'ลองชิมเมนูใหม่พิเศษของเรา',
      category: 'marketing',
      usage: 156
    },
    {
      id: 'loyalty_points',
      name: 'แต้มสะสม',
      title: 'คุณได้รับแต้ม! ⭐',
      body: 'แต้มสะสมของคุณ +50 แต้ม',
      category: 'orders',
      usage: 298
    },
    {
      id: 'birthday_special',
      name: 'วันเกิดพิเศษ',
      title: 'สุขสันต์วันเกิด! 🎂',
      body: 'รับกาแฟฟรี 1 แก้วในวันพิเศษของคุณ',
      category: 'promotions',
      usage: 67
    },
    {
      id: 'inventory_alert',
      name: 'แจ้งเตือนสต็อก',
      title: 'สินค้าใกล้หมด! ⚠️',
      body: 'กาแฟ Arabica เหลือ 5 ถุง',
      category: 'inventory',
      usage: 45
    }
  ];

  // Mock analytics data
  const analyticsData = {
    today: { sent: 45, delivered: 43, opened: 31, clicked: 12 },
    week: { sent: 289, delivered: 276, opened: 189, clicked: 78 },
    month: { sent: 1156, delivered: 1089, opened: 746, clicked: 298 }
  };

  useEffect(() => {
    // Initialize notification service and get current stats
    const serviceStats = NotificationService.getStats();
    setNotificationPermission(serviceStats.permission);
    setIsServiceWorkerReady(serviceStats.serviceWorkerReady);
    setStats({
      subscribers: serviceStats.subscribers,
      sentNotifications: serviceStats.sentNotifications,
      openRate: 68.5
    });

    // Load scheduled notifications
    const scheduled = NotificationService.getScheduledNotifications();
    setScheduledNotifications(scheduled);

    // Load notification settings
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await NotificationService.requestPermission();
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
  };

  const sendTestNotification = (template: NotificationTemplate) => {
    const success = NotificationService.sendTestNotification(template);
    
    if (success) {
      // Update template usage
      template.usage += 1;
      
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

  const sendBulkNotification = async (notification: ScheduledNotification) => {
    try {
      const success = await NotificationService.sendBulkNotification({
        title: notification.title,
        message: notification.message,
        recipients: notification.recipients,
        recipientCount: notification.recipientCount
      });

      if (success) {
        // Update notification status
        NotificationService.updateScheduledNotification(notification.id, 'sent');
        
        // Refresh scheduled notifications
        const updated = NotificationService.getScheduledNotifications();
        setScheduledNotifications(updated);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          sentNotifications: prev.sentNotifications + notification.recipientCount
        }));
        
        toast({
          title: "ส่งการแจ้งเตือนสำเร็จ! 🎉",
          description: `ส่งไปยัง ${notification.recipientCount} ผู้รับ`,
        });
      }
    } catch (error) {
      NotificationService.updateScheduledNotification(notification.id, 'failed');
      toast({
        title: "ส่งการแจ้งเตือนล้มเหลว",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const handleSettingsChange = (newSettings: typeof notificationSettings) => {
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleScheduled = (notification: ScheduledNotification) => {
    setScheduledNotifications(prev => [...prev, notification]);
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

  const deleteScheduledNotification = (id: string) => {
    const updated = scheduledNotifications.filter(n => n.id !== id);
    setScheduledNotifications(updated);
    localStorage.setItem('scheduledNotifications', JSON.stringify(updated));
    
    toast({
      title: "ลบการแจ้งเตือนแล้ว",
      description: "การแจ้งเตือนที่กำหนดการถูกลบเรียบร้อย",
    });
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
                      <p className="text-lg font-semibold">{stats.subscribers.toLocaleString()}</p>
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
                      <p className="text-lg font-semibold">{stats.sentNotifications.toLocaleString()}</p>
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
                      <p className="text-lg font-semibold">{stats.openRate}%</p>
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
                <NotificationScheduler onScheduled={handleScheduled} />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((template) => {
                        const IconComponent = template.category === 'orders' ? Coffee : 
                                           template.category === 'promotions' ? Gift :
                                           template.category === 'marketing' ? Star : Heart;
                        
                        return (
                          <div key={template.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                              <IconComponent className="w-6 h-6 text-primary" />
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
                        );
                      })}
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
                      {scheduledNotifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>ยังไม่มีการแจ้งเตือนที่กำหนดการไว้</p>
                          <p className="text-sm">สร้างการแจ้งเตือนใหม่ในแท็บ "ส่งการแจ้งเตือน"</p>
                        </div>
                      ) : (
                        scheduledNotifications.map((notification) => (
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
                                    <Button 
                                      size="sm"
                                      onClick={() => sendBulkNotification(notification)}
                                    >
                                      ส่งเลย
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => deleteScheduledNotification(notification.id)}
                                    >
                                      ลบ
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
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="w-5 h-5" />
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
                  <CardContent>
                    <NotificationSettings 
                      settings={notificationSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                    
                    <div className="pt-4 border-t mt-6">
                      <h4 className="font-semibold mb-2">ข้อมูลเทคนิค</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Service Worker: {isServiceWorkerReady ? '✅ พร้อมใช้งาน' : '❌ ไม่พร้อม'}</p>
                        <p>Notification API: {'Notification' in window ? '✅ รองรับ' : '❌ ไม่รองรับ'}</p>
                        <p>Push API: {'PushManager' in window ? '✅ รองรับ' : '❌ ไม่รองรับ'}</p>
                        <p>สถานะสิทธิ์: {permissionStatus.text}</p>
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
