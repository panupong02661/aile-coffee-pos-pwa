
import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { Shell } from '@/components/Shell';
import DiscordWebhookGuide from '@/components/DiscordWebhookGuide';

const NotificationPage = () => {
  const { toast } = useToast();
  const [showDiscordGuide, setShowDiscordGuide] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        line: { enabled: true, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ'
    },
    // รายงานประจำเดือน
    monthlyReports: {
      enabled: true,
      dayOfMonth: 1,
      time: '09:00',
      platforms: {
        line: { enabled: true, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%'
    }
  });

  // โหลดข้อมูลการตั้งค่าจากฐานข้อมูล
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          onlineOrders: (data as any).online_orders || settings.onlineOrders,
          dailyReports: (data as any).daily_reports || settings.dailyReports,
          monthlyReports: (data as any).monthly_reports || settings.monthlyReports
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'ไม่สามารถโหลดการตั้งค่าได้',
        description: 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { data: existingData } = await supabase
        .from('notification_settings')
        .select('id')
        .single();

      const settingsData = {
        online_orders: settings.onlineOrders,
        daily_reports: settings.dailyReports,
        monthly_reports: settings.monthlyReports,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingData) {
        result = await supabase
          .from('notification_settings')
          .update(settingsData)
          .eq('id', existingData.id);
      } else {
        result = await supabase
          .from('notification_settings')
          .insert({
            ...settingsData,
            id: crypto.randomUUID(),
            sound_enabled: true,
            volume: 0.5,
            duration: 5
          });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'บันทึกการตั้งค่าสำเร็จ ✅',
        description: 'การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'ไม่สามารถบันทึกการตั้งค่าได้',
        description: 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลรายงานประจำวัน
  const generateDailyReport = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // ดึงข้อมูลออเดอร์วันนี้
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, bill_discount, created_at')
        .gte('created_at', startOfDay.toISOString());

      if (ordersError) throw ordersError;

      // ดึงข้อมูลรายการเมนูที่ขายวันนี้
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          menu_item_name,
          quantity,
          total_price,
          order:orders!inner(created_at)
        `)
        .gte('order.created_at', startOfDay.toISOString());

      if (itemsError) throw itemsError;

      // คำนวณสถิติ
      const totalOrders = todayOrders?.length || 0;
      const totalSales = todayOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const totalDiscount = todayOrders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0;
      const netSales = totalSales - totalDiscount;

      // จัดกลุ่มเมนูและเรียงตามยอดขาย
      const menuStats = orderItems?.reduce((acc: any, item) => {
        const name = item.menu_item_name;
        if (!acc[name]) {
          acc[name] = { quantity: 0, totalSales: 0 };
        }
        acc[name].quantity += item.quantity;
        acc[name].totalSales += Number(item.total_price) || 0;
        return acc;
      }, {}) || {};

      const topMenus = Object.entries(menuStats)
        .map(([name, stats]: [string, any]) => ({
          name,
          quantity: stats.quantity,
          totalSales: stats.totalSales
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10);

      return {
        date: today.toLocaleDateString('th-TH'),
        time: today.toLocaleTimeString('th-TH'),
        totalOrders,
        totalSales,
        totalDiscount,
        netSales,
        topMenus
      };
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  };

  // ฟังก์ชันส่งรายงานไป Discord
  const sendDiscordReport = async (reportData: any, webhookUrl: string) => {
    const topMenusList = reportData.topMenus
      .map((menu: any, index: number) => 
        `${index + 1}. ${menu.name} - ${menu.quantity} รายการ (${menu.totalSales.toLocaleString()} บาท)`
      )
      .join('\n');

    const embed = {
      title: '📊 สรุปยอดขายประจำวัน',
      description: `รายงานสรุปยอดขายประจำวันที่ ${reportData.date}`,
      color: 0x00ff00,
      fields: [
        {
          name: '📅 วันที่สร้างรายงาน',
          value: `${reportData.date} เวลา ${reportData.time}`,
          inline: true
        },
        {
          name: '🛒 จำนวนออเดอร์ทั้งหมด',
          value: `${reportData.totalOrders} รายการ`,
          inline: true
        },
        {
          name: '💰 ยอดขายรวม',
          value: `${reportData.totalSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '💸 ส่วนลดรวม',
          value: `${reportData.totalDiscount.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '💵 ยอดขายสุทธิ',
          value: `${reportData.netSales.toLocaleString()} บาท`,
          inline: true
        },
        {
          name: '🏆 เมนูขายดี',
          value: topMenusList || 'ไม่มีข้อมูล',
          inline: false
        }
      ],
      footer: {
        text: 'ระบบแจ้งเตือนร้านอาหาร'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '📊 **รายงานประจำวัน - ส่งทันที**',
        embeds: [embed]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }
  };

  // ฟังก์ชันส่งรายงานไป LINE (placeholder)
  const sendLineReport = async (reportData: any, token: string) => {
    // TODO: Implement LINE notification
    console.log('Sending to LINE:', reportData);
  };

  // ฟังก์ชันส่งรายงานไป Telegram (placeholder)
  const sendTelegramReport = async (reportData: any, token: string) => {
    // TODO: Implement Telegram notification
    console.log('Sending to Telegram:', reportData);
  };

  // ฟังก์ชันส่งรายงานไป Instagram (placeholder)
  const sendInstagramReport = async (reportData: any, token: string) => {
    // TODO: Implement Instagram notification
    console.log('Sending to Instagram:', reportData);
  };

  // ฟังก์ชันส่งรายงานทันที
  const handleSendReportNow = async () => {
    setIsGeneratingReport(true);
    
    try {
      // สร้างรายงาน
      const reportData = await generateDailyReport();
      
      let sentCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // ส่งไป Discord ถ้าเปิดใช้งาน
      if (settings.dailyReports.platforms.discord.enabled && settings.dailyReports.platforms.discord.token) {
        try {
          await sendDiscordReport(reportData, settings.dailyReports.platforms.discord.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Discord: ${error}`);
        }
      }

      // ส่งไป LINE ถ้าเปิดใช้งาน
      if (settings.dailyReports.platforms.line.enabled && settings.dailyReports.platforms.line.token) {
        try {
          await sendLineReport(reportData, settings.dailyReports.platforms.line.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`LINE: ${error}`);
        }
      }

      // ส่งไป Telegram ถ้าเปิดใช้งาน
      if (settings.dailyReports.platforms.telegram.enabled && settings.dailyReports.platforms.telegram.token) {
        try {
          await sendTelegramReport(reportData, settings.dailyReports.platforms.telegram.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Telegram: ${error}`);
        }
      }

      // ส่งไป Instagram ถ้าเปิดใช้งาน
      if (settings.dailyReports.platforms.instagram.enabled && settings.dailyReports.platforms.instagram.token) {
        try {
          await sendInstagramReport(reportData, settings.dailyReports.platforms.instagram.token);
          sentCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Instagram: ${error}`);
        }
      }

      // แสดงผลลัพธ์
      if (sentCount > 0) {
        toast({
          title: 'ส่งรายงานสำเร็จ! ✅',
          description: `ส่งรายงานไปยัง ${sentCount} แพลตฟอร์มแล้ว${errorCount > 0 ? ` (มีข้อผิดพลาด ${errorCount} แพลตฟอร์ม)` : ''}`,
        });
      } else {
        toast({
          title: 'ไม่สามารถส่งรายงานได้',
          description: 'กรุณาตรวจสอบการตั้งค่าแพลตฟอร์มและ API Token',
          variant: 'destructive'
        });
      }

      if (errors.length > 0) {
        console.error('Notification errors:', errors);
      }

    } catch (error) {
      console.error('Error sending daily report:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างหรือส่งรายงานได้',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveSettings = () => {
    saveSettings();
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

          {/* รายงานประจำวัน */}
          <TabsContent value="daily-reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle>รายงานประจำวัน</CardTitle>
                      <CardDescription>
                        ส่งสรุปยอดขายประจำวันในเวลาที่กำหนด
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendReportNow}
                    disabled={isGeneratingReport}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Send className="w-4 h-4" />
                    {isGeneratingReport ? 'กำลังส่ง...' : 'ส่งสรุปทันที'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </div>
      </div>
    </Shell>
  );
};

export default NotificationPage;
