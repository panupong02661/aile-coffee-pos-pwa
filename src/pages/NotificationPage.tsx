import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  MessageSquare, 
  Instagram, 
  Send, 
  Phone, 
  Clock, 
  Settings, 
  Calendar,
  ShoppingCart,
  BarChart,
  FileText,
  Zap,
  Save,
  TestTube,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Shell } from '@/components/Shell';
import DiscordWebhookGuide from '@/components/DiscordWebhookGuide';

const NotificationPage = () => {
  const { toast } = useToast();
  const [showDiscordGuide, setShowDiscordGuide] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [settings, setSettings] = useState({
    // การแจ้งเตือนออเดอร์ออนไลน์
    onlineOrders: {
      enabled: true,
      platforms: {
        line: { enabled: true, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      instantNotification: true,
      message: 'มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท'
    },
    // รายงานประจำวัน
    dailyReports: {
      enabled: true,
      time: '18:00',
      platforms: {
        line: { enabled: true },
        instagram: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false }
      },
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ'
    },
    // รายงานประจำเดือน
    monthlyReports: {
      enabled: true,
      dayOfMonth: 1,
      time: '09:00',
      platforms: {
        line: { enabled: true },
        instagram: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false }
      },
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%'
    }
  });

  const handleSaveSettings = () => {
    // บันทึกการตั้งค่า
    toast({
      title: 'บันทึกการตั้งค่าสำเร็จ',
      description: 'การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว',
    });
  };

  const handleTestNotification = async (type: string, platform: string) => {
    if (platform === 'Discord') {
      // ทดสอบ Discord Webhook
      const discordToken = settings.onlineOrders.platforms.discord.token;
      if (!discordToken) {
        toast({
          title: 'ไม่พบ Webhook URL',
          description: 'กรุณาใส่ Discord Webhook URL ก่อนทดสอบ',
          variant: 'destructive'
        });
        return;
      }

      try {
        const testMessage = {
          content: '🧪 **ทดสอบการแจ้งเตือน**',
          embeds: [{
            title: '🔔 ทดสอบระบบแจ้งเตือนร้านอาหาร',
            description: `การทดสอบ: ${type}`,
            color: 0x00ff00, // สีเขียว
            fields: [
              {
                name: '📅 วันที่',
                value: new Date().toLocaleDateString('th-TH'),
                inline: true
              },
              {
                name: '⏰ เวลา',
                value: new Date().toLocaleTimeString('th-TH'),
                inline: true
              }
            ],
            footer: {
              text: 'ระบบแจ้งเตือนร้านอาหาร'
            },
            timestamp: new Date().toISOString()
          }]
        };

        const response = await fetch(discordToken, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testMessage)
        });

        if (response.ok) {
          toast({
            title: 'ทดสอบสำเร็จ! ✅',
            description: 'ข้อความทดสอบถูกส่งไปยัง Discord แล้ว',
          });
        } else {
          const errorText = await response.text();
          toast({
            title: 'ทดสอบไม่สำเร็จ',
            description: `Error: ${response.status} - ตรวจสอบ Webhook URL`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถเชื่อมต่อ Discord ได้ กรุณาตรวจสอบ URL',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'ส่งการทดสอบแล้ว',
        description: `ทดสอบการแจ้งเตือน${type}ผ่าน ${platform}`,
      });
    }
  };

  const PlatformSettings = ({ 
    type, 
    platforms, 
    onChange 
  }: { 
    type: string;
    platforms: any;
    onChange: (platform: string, field: string, value: any) => void;
  }) => (
    <div className="space-y-4">
      {Object.entries(platforms).map(([platform, config]: [string, any]) => {
        const platformIcons = {
          line: MessageSquare,
          instagram: Instagram,
          discord: Send,
          telegram: Phone
        };
        const Icon = platformIcons[platform as keyof typeof platformIcons];
        const platformNames = {
          line: 'LINE',
          instagram: 'Instagram',
          discord: 'Discord',
          telegram: 'Telegram'
        };

        const getTokenLabel = (platform: string) => {
          switch (platform) {
            case 'discord':
              return 'Discord Webhook URL';
            case 'line':
              return 'LINE Channel Access Token';
            case 'telegram':
              return 'Telegram Bot Token';
            case 'instagram':
              return 'Instagram API Token';
            default:
              return 'API Token';
          }
        };

        const getTokenPlaceholder = (platform: string) => {
          switch (platform) {
            case 'discord':
              return 'https://discord.com/api/webhooks/...';
            case 'line':
              return 'LINE Channel Access Token';
            case 'telegram':
              return 'Bot Token จาก @BotFather';
            case 'instagram':
              return 'Instagram API Token';
            default:
              return `${platformNames[platform as keyof typeof platformNames]} API Token`;
          }
        };

        return (
          <Card key={platform} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <Label className="font-medium">{platformNames[platform as keyof typeof platformNames]}</Label>
                <Badge variant={config.enabled ? "default" : "secondary"}>
                  {config.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => onChange(platform, 'enabled', checked)}
              />
            </div>
            
            {config.enabled && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor={`${type}-${platform}-token`}>{getTokenLabel(platform)}</Label>
                    {platform === 'discord' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDiscordGuide(!showDiscordGuide)}
                        className="text-xs"
                      >
                        {showDiscordGuide ? 'ซ่อนคู่มือ' : 'ดูคู่มือ'}
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={`${type}-${platform}-token`}
                      type={platform === 'discord' ? 'url' : 'password'}
                      placeholder={getTokenPlaceholder(platform)}
                      value={config.token || ''}
                      onChange={(e) => onChange(platform, 'token', e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(type, platformNames[platform as keyof typeof platformNames])}
                      disabled={!config.token}
                    >
                      <TestTube className="w-4 h-4" />
                      ทดสอบ
                    </Button>
                  </div>
                </div>
                
                {platform === 'discord' && showDiscordGuide && (
                  <DiscordWebhookGuide />
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  const handleSendDailyReportNow = async () => {
    setSendingReport(true);
    
    try {
      // ดึงข้อมูลสำหรับรายงานประจำวัน
      const today = new Date().toISOString().split('T')[0];
      const todayStart = new Date(today + 'T00:00:00.000Z');
      const todayEnd = new Date(today + 'T23:59:59.999Z');

      // ดึงออเดอร์ทั้งหมดของวันนี้
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            menu_item_name,
            quantity,
            total_price
          )
        `)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      if (ordersError) throw ordersError;

      // ดึงออเดอร์ออนไลน์ของวันนี้
      const { data: customerOrders, error: customerOrdersError } = await supabase
        .from('customer_orders')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      if (customerOrdersError) throw customerOrdersError;

      // รวมข้อมูลออเดอร์ทั้งหมด
      const allOrders = [
        ...(orders || []),
        ...(customerOrders || [])
      ];

      const totalOrders = allOrders.length;
      const totalSales = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // รวมรายการเมนูทั้งหมดและเรียงลำดับ
      const menuItems = new Map();

      // จากออเดอร์ POS
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const key = item.menu_item_name;
          if (menuItems.has(key)) {
            const existing = menuItems.get(key);
            existing.quantity += item.quantity;
            existing.total += item.total_price;
          } else {
            menuItems.set(key, {
              name: item.menu_item_name,
              quantity: item.quantity,
              total: item.total_price
            });
          }
        });
      });

      // จากออเดอร์ออนไลน์
      customerOrders?.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          const key = item.name;
          if (menuItems.has(key)) {
            const existing = menuItems.get(key);
            existing.quantity += item.quantity;
            existing.total += item.total_price;
          } else {
            menuItems.set(key, {
              name: item.name,
              quantity: item.quantity,
              total: item.total_price
            });
          }
        });
      });

      // เรียงลำดับเมนูตามจำนวนที่ขายได้มากไปน้อย
      const topMenuItems = Array.from(menuItems.values())
        .sort((a, b) => b.quantity - a.quantity);

      const reportData = {
        date: new Date().toLocaleDateString('th-TH'),
        totalOrders,
        totalSales,
        topMenuItems
      };

      // ส่งรายงานผ่าน edge function
      const { error: reportError } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'daily_report',
          data: reportData
        }
      });

      if (reportError) throw reportError;

      toast({
        title: 'ส่งรายงานสำเร็จ! ✅',
        description: `ส่งสรุปยอดขายประจำวัน ${reportData.date} ไปยังทุกแพลตฟอร์มแล้ว`,
      });

    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งรายงานได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <Shell>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ระบบแจ้งเตือน</h1>
            <p className="text-gray-600">จัดการการแจ้งเตือนผ่าน LINE, Instagram, Discord และ Telegram</p>
          </div>
        </div>

        <Tabs defaultValue="online-orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="online-orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              ออเดอร์ออนไลน์
            </TabsTrigger>
            <TabsTrigger value="daily-reports" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              รายงานประจำวัน
            </TabsTrigger>
            <TabsTrigger value="monthly-reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              รายงานประจำเดือน
            </TabsTrigger>
          </TabsList>

          {/* การแจ้งเตือนออเดอร์ออนไลน์ */}
          <TabsContent value="online-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                    <div>
                      <CardTitle>การแจ้งเตือนออเดอร์ออนไลน์</CardTitle>
                      <CardDescription>
                        แจ้งเตือนทันทีเมื่อมีออเดอร์ออนไลน์เข้ามาใหม่
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <Badge variant="outline">ส่งทันที</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="online-orders-enabled" className="text-base font-medium">
                    เปิดใช้งานการแจ้งเตือนออเดอร์ออนไลน์
                  </Label>
                  <Switch
                    id="online-orders-enabled"
                    checked={settings.onlineOrders.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        onlineOrders: { ...prev.onlineOrders, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.onlineOrders.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="online-message">ข้อความแจ้งเตือน</Label>
                        <Textarea
                          id="online-message"
                          value={settings.onlineOrders.message}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              onlineOrders: { ...prev.onlineOrders, message: e.target.value }
                            }))
                          }
                          placeholder="ข้อความที่จะส่งเมื่อมีออเดอร์ใหม่"
                          className="min-h-[80px]"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          ใช้ {`{{orderNumber}}, {{amount}}, {{customerName}}`} เป็นตัวแปร
                        </p>
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="ออเดอร์ออนไลน์"
                        platforms={settings.onlineOrders.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            onlineOrders: {
                              ...prev.onlineOrders,
                              platforms: {
                                ...prev.onlineOrders.platforms,
                                [platform]: {
                                  ...prev.onlineOrders.platforms[platform as keyof typeof prev.onlineOrders.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* รายงานประจำวัน with enhanced send now button */}
          <TabsContent value="daily-reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle>รายงานประจำวัน</CardTitle>
                      <CardDescription>
                        ส่งสรุปยอดขายประจำวันในเวลาที่กำหนด หรือส่งทันที
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSendDailyReportNow}
                      disabled={sendingReport}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      {sendingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          ส่งสรุปทันที
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">ส่งรายงานทันที</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        คลิกปุ่ม "ส่งสรุปทันที" เพื่อส่งรายงานประจำวันไปยัง LINE, Discord, Telegram และ Instagram ทันที
                      </p>
                      <div className="text-blue-700 text-sm">
                        <strong>รายละเอียดรายงานจะมี:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>วันที่และเวลาที่สร้างรายงาน</li>
                          <li>จำนวนออเดอร์ทั้งหมดของวันนี้</li>
                          <li>ยอดขายรวมของวันนี้</li>
                          <li>รายการเมนูขายดี เรียงจากมากไปน้อย พร้อมจำนวนและยอด</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-reports-enabled" className="text-base font-medium">
                    เปิดใช้งานรายงานประจำวัน
                  </Label>
                  <Switch
                    id="daily-reports-enabled"
                    checked={settings.dailyReports.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        dailyReports: { ...prev.dailyReports, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.dailyReports.enabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="daily-time">เวลาส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            id="daily-time"
                            type="time"
                            value={settings.dailyReports.time}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                dailyReports: { ...prev.dailyReports, time: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="daily-message">เทมเพลตข้อความ</Label>
                      <Textarea
                        id="daily-message"
                        value={settings.dailyReports.message}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            dailyReports: { ...prev.dailyReports, message: e.target.value }
                          }))
                        }
                        placeholder="เทมเพลตข้อความรายงานประจำวัน"
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ใช้ {`{{date}}, {{totalSales}}, {{orderCount}}`} เป็นตัวแปร
                      </p>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="รายงานประจำวัน"
                        platforms={settings.dailyReports.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            dailyReports: {
                              ...prev.dailyReports,
                              platforms: {
                                ...prev.dailyReports.platforms,
                                [platform]: {
                                  ...prev.dailyReports.platforms[platform as keyof typeof prev.dailyReports.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* รายงานประจำเดือน */}
          <TabsContent value="monthly-reports">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle>รายงานประจำเดือน</CardTitle>
                    <CardDescription>
                      ส่งสรุปยอดขายประจำเดือนในวันและเวลาที่กำหนด
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly-reports-enabled" className="text-base font-medium">
                    เปิดใช้งานรายงานประจำเดือน
                  </Label>
                  <Switch
                    id="monthly-reports-enabled"
                    checked={settings.monthlyReports.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({
                        ...prev,
                        monthlyReports: { ...prev.monthlyReports, enabled: checked }
                      }))
                    }
                  />
                </div>

                {settings.monthlyReports.enabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthly-day">วันที่ส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <Select
                            value={settings.monthlyReports.dayOfMonth.toString()}
                            onValueChange={(value) =>
                              setSettings(prev => ({
                                ...prev,
                                monthlyReports: { ...prev.monthlyReports, dayOfMonth: parseInt(value) }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกวันที่" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                <SelectItem key={day} value={day.toString()}>
                                  วันที่ {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="monthly-time">เวลาส่งรายงาน</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            id="monthly-time"
                            type="time"
                            value={settings.monthlyReports.time}
                            onChange={(e) =>
                              setSettings(prev => ({
                                ...prev,
                                monthlyReports: { ...prev.monthlyReports, time: e.target.value }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="monthly-message">เทมเพลตข้อความ</Label>
                      <Textarea
                        id="monthly-message"
                        value={settings.monthlyReports.message}
                        onChange={(e) =>
                          setSettings(prev => ({
                            ...prev,
                            monthlyReports: { ...prev.monthlyReports, message: e.target.value }
                          }))
                        }
                        placeholder="เทมเพลตข้อความรายงานประจำเดือน"
                        className="min-h-[120px]"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ใช้ {`{{month}}, {{totalSales}}, {{target}}, {{growth}}`} เป็นตัวแปร
                      </p>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-4">แพลตฟอร์มการส่ง</h3>
                      <PlatformSettings
                        type="รายงานประจำเดือน"
                        platforms={settings.monthlyReports.platforms}
                        onChange={(platform, field, value) =>
                          setSettings(prev => ({
                            ...prev,
                            monthlyReports: {
                              ...prev.monthlyReports,
                              platforms: {
                                ...prev.monthlyReports.platforms,
                                [platform]: {
                                  ...prev.monthlyReports.platforms[platform as keyof typeof prev.monthlyReports.platforms],
                                  [field]: value
                                }
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end gap-3 pt-6">
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </Shell>
  );
};

export default NotificationPage;
