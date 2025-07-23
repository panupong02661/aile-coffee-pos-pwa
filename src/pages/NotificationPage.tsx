import React, { useState, useEffect } from 'react';
import { Shell } from "@/components/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DiscordWebhookGuide from '@/components/DiscordWebhookGuide';

interface NotificationSettings {
  online_orders: {
    enabled: boolean;
    platforms: {
      line: { enabled: boolean; token: string; };
      instagram: { enabled: boolean; token: string; };
      discord: { enabled: boolean; token: string; };
      telegram: { enabled: boolean; token: string; };
    };
    message: string;
  };
  daily_reports: {
    enabled: boolean;
    time: string;
    platforms: {
      line: { enabled: boolean; };
      instagram: { enabled: boolean; };
      discord: { enabled: boolean; };
      telegram: { enabled: boolean; };
    };
    message: string;
  };
  monthly_reports: {
    enabled: boolean;
    dayOfMonth: number;
    time: string;
    platforms: {
      line: { enabled: boolean; };
      instagram: { enabled: boolean; };
      discord: { enabled: boolean; };
      telegram: { enabled: boolean; };
    };
    message: string;
  };
}

const NotificationPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    online_orders: {
      enabled: true,
      platforms: {
        line: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      message: 'มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท'
    },
    daily_reports: {
      enabled: true,
      time: '18:00',
      platforms: {
        line: { enabled: false },
        instagram: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false }
      },
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ'
    },
    monthly_reports: {
      enabled: true,
      dayOfMonth: 1,
      time: '09:00',
      platforms: {
        line: { enabled: false },
        instagram: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false }
      },
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%'
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Query the correct notification_settings table that contains our JSONB columns
      const { data, error } = await supabase
        .from('notification_settings')
        .select('online_orders, daily_reports, monthly_reports')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setSettings({
          online_orders: (data.online_orders as any) || settings.online_orders,
          daily_reports: (data.daily_reports as any) || settings.daily_reports,
          monthly_reports: (data.monthly_reports as any) || settings.monthly_reports
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // First check if any record exists
      const { data: existingData } = await supabase
        .from('notification_settings')
        .select('id')
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('notification_settings')
          .update({
            online_orders: settings.online_orders,
            daily_reports: settings.daily_reports,
            monthly_reports: settings.monthly_reports
          })
          .eq('id', existingData.id);

        if (error) {
          console.error('Error updating settings:', error);
          toast({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถบันทึกการตั้งค่าได้',
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            online_orders: settings.online_orders,
            daily_reports: settings.daily_reports,
            monthly_reports: settings.monthly_reports
          });

        if (error) {
          console.error('Error inserting settings:', error);
          toast({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถบันทึกการตั้งค่าได้',
            variant: 'destructive',
          });
          return;
        }
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendDailyReport = async () => {
    try {
      setIsLoading(true);
      
      // Get today's sales data
      const today = new Date().toISOString().split('T')[0];
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถดึงข้อมูลยอดขายได้',
          variant: 'destructive',
        });
        return;
      }

      const totalSales = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const orderCount = ordersData?.length || 0;

      // Call the notification function
      const { error: notificationError } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'daily_report',
          data: {
            date: new Date().toLocaleDateString('th-TH'),
            totalSales,
            orderCount
          }
        }
      });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถส่งรายงานได้',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'ส่งรายงานสำเร็จ',
        description: `ส่งสรุปยอดขายวันนี้แล้ว (฿${totalSales}, ${orderCount} รายการ)`,
      });
    } catch (error) {
      console.error('Error sending daily report:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งรายงานได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPlatform = async (platform: string) => {
    try {
      setIsLoading(true);
      
      // Test message data
      const testData = {
        order_number: 'TEST-001',
        customer_name: 'ลูกค้าทดสอบ',
        total: 150,
        items: [
          { name: 'กาแฟอเมริกาโน่', quantity: 1, price: 80 },
          { name: 'ขนมปังโฮลวีท', quantity: 1, price: 70 }
        ]
      };

      const { error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'order',
          data: testData
        }
      });

      if (error) {
        console.error('Test notification error:', error);
        toast({
          title: 'การทดสอบล้มเหลว',
          description: `ไม่สามารถส่งข้อความทดสอบไปยัง ${platform} ได้`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'ทดสอบสำเร็จ',
        description: `ส่งข้อความทดสอบไปยัง ${platform} แล้ว`,
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทดสอบการส่งข้อความได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testOrderNotification = async () => {
    try {
      setIsLoading(true);
      
      const testData = {
        order_number: 'TEST-001',
        customer_name: 'ลูกค้าทดสอบ',
        total: 250,
        items: [
          { name: 'กาแฟลาเต้', quantity: 2, price: 90 },
          { name: 'คุกกี้ช็อกโกแลต', quantity: 1, price: 70 }
        ]
      };

      const { error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type: 'order',
          data: testData
        }
      });

      if (error) {
        console.error('Test notification error:', error);
        toast({
          title: 'การทดสอบล้มเหลว',
          description: 'ไม่สามารถส่งการแจ้งเตือนทดสอบได้',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'ทดสอบสำเร็จ',
        description: 'ส่งการแจ้งเตือนออเดอร์ทดสอบแล้ว',
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทดสอบการแจ้งเตือนได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (section: keyof NotificationSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const updatePlatformSettings = (section: keyof NotificationSettings, platform: string, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        platforms: {
          ...prev[section].platforms,
          [platform]: {
            ...prev[section].platforms[platform],
            ...updates
          }
        }
      }
    }));
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">การตั้งค่าการแจ้งเตือน</h1>
          <p className="text-muted-foreground">
            จัดการการแจ้งเตือนสำหรับออเดอร์ออนไลน์และรายงาน
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={saveSettings} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            บันทึกการตั้งค่า
          </Button>
          <Button variant="outline" onClick={testOrderNotification} disabled={isLoading}>
            <TestTube className="w-4 h-4 mr-2" />
            ทดสอบการแจ้งเตือนออเดอร์
          </Button>
        </div>

        <Tabs defaultValue="online-orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="online-orders">ออเดอร์ออนไลน์</TabsTrigger>
            <TabsTrigger value="daily-reports">รายงานประจำวัน</TabsTrigger>
            <TabsTrigger value="monthly-reports">รายงานประจำเดือน</TabsTrigger>
          </TabsList>

          <TabsContent value="online-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือนออเดอร์ออนไลน์</CardTitle>
                <CardDescription>
                  การตั้งค่าการแจ้งเตือนเมื่อมีออเดอร์ใหม่เข้ามา
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.online_orders.enabled}
                    onCheckedChange={(enabled) => updateSettings('online_orders', { enabled })}
                  />
                  <Label>เปิดใช้งานการแจ้งเตือนออเดอร์ออนไลน์</Label>
                </div>

                <div className="space-y-4">
                  <Label>ข้อความแจ้งเตือน</Label>
                  <Textarea
                    value={settings.online_orders.message}
                    onChange={(e) => updateSettings('online_orders', { message: e.target.value })}
                    placeholder="ข้อความที่จะส่งเมื่อมีออเดอร์ใหม่"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    ใช้ orderNumber, customerName, amount เป็นตัวแปร
                  </p>
                </div>

                {/* Platform Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LINE */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">LINE Notify</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.online_orders.platforms.line.enabled}
                          onCheckedChange={(enabled) => updatePlatformSettings('online_orders', 'line', { enabled })}
                        />
                        <Label>เปิดใช้งาน LINE</Label>
                      </div>
                      <div>
                        <Label>LINE Notify Token</Label>
                        <Input
                          type="password"
                          value={settings.online_orders.platforms.line.token}
                          onChange={(e) => updatePlatformSettings('online_orders', 'line', { token: e.target.value })}
                          placeholder="ใส่ LINE Notify Token"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testPlatform('LINE')}
                        disabled={!settings.online_orders.platforms.line.enabled || !settings.online_orders.platforms.line.token}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        ทดสอบ LINE
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Instagram */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instagram</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.online_orders.platforms.instagram.enabled}
                          onCheckedChange={(enabled) => updatePlatformSettings('online_orders', 'instagram', { enabled })}
                        />
                        <Label>เปิดใช้งาน Instagram</Label>
                      </div>
                      <div>
                        <Label>Instagram API Token</Label>
                        <Input
                          type="password"
                          value={settings.online_orders.platforms.instagram.token}
                          onChange={(e) => updatePlatformSettings('online_orders', 'instagram', { token: e.target.value })}
                          placeholder="ใส่ Instagram API Token"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testPlatform('Instagram')}
                        disabled={!settings.online_orders.platforms.instagram.enabled || !settings.online_orders.platforms.instagram.token}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        ทดสอบ Instagram
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Discord */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Discord</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.online_orders.platforms.discord.enabled}
                          onCheckedChange={(enabled) => updatePlatformSettings('online_orders', 'discord', { enabled })}
                        />
                        <Label>เปิดใช้งาน Discord</Label>
                      </div>
                      <div>
                        <Label>Discord Webhook URL</Label>
                        <Input
                          type="password"
                          value={settings.online_orders.platforms.discord.token}
                          onChange={(e) => updatePlatformSettings('online_orders', 'discord', { token: e.target.value })}
                          placeholder="https://discord.com/api/webhooks/..."
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testPlatform('Discord')}
                        disabled={!settings.online_orders.platforms.discord.enabled || !settings.online_orders.platforms.discord.token}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        ทดสอบ Discord
                      </Button>
                      <DiscordWebhookGuide />
                    </CardContent>
                  </Card>

                  {/* Telegram */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Telegram</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.online_orders.platforms.telegram.enabled}
                          onCheckedChange={(enabled) => updatePlatformSettings('online_orders', 'telegram', { enabled })}
                        />
                        <Label>เปิดใช้งาน Telegram</Label>
                      </div>
                      <div>
                        <Label>Telegram Bot Token</Label>
                        <Input
                          type="password"
                          value={settings.online_orders.platforms.telegram.token}
                          onChange={(e) => updatePlatformSettings('online_orders', 'telegram', { token: e.target.value })}
                          placeholder="ใส่ Telegram Bot Token"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testPlatform('Telegram')}
                        disabled={!settings.online_orders.platforms.telegram.enabled || !settings.online_orders.platforms.telegram.token}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        ทดสอบ Telegram
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>รายงานประจำวัน</CardTitle>
                <CardDescription>
                  การตั้งค่าการส่งรายงานยอดขายประจำวัน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.daily_reports.enabled}
                    onCheckedChange={(enabled) => updateSettings('daily_reports', { enabled })}
                  />
                  <Label>เปิดใช้งานรายงานประจำวัน</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>เวลาส่งรายงาน</Label>
                    <Input
                      type="time"
                      value={settings.daily_reports.time}
                      onChange={(e) => updateSettings('daily_reports', { time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>ข้อความรายงาน</Label>
                  <Textarea
                    value={settings.daily_reports.message}
                    onChange={(e) => updateSettings('daily_reports', { message: e.target.value })}
                    placeholder="ข้อความรายงานประจำวัน"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    ใช้ date, totalSales, orderCount เป็นตัวแปร
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={sendDailyReport} disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    ส่งสรุปทันที
                  </Button>
                </div>

                {/* Platform switches for daily reports */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(settings.daily_reports.platforms).map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Switch
                        checked={settings.daily_reports.platforms[platform].enabled}
                        onCheckedChange={(enabled) => updatePlatformSettings('daily_reports', platform, { enabled })}
                      />
                      <Label className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly-reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>รายงานประจำเดือน</CardTitle>
                <CardDescription>
                  การตั้งค่าการส่งรายงานยอดขายประจำเดือน
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.monthly_reports.enabled}
                    onCheckedChange={(enabled) => updateSettings('monthly_reports', { enabled })}
                  />
                  <Label>เปิดใช้งานรายงานประจำเดือน</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>วันที่ส่งรายงาน (ของเดือน)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.monthly_reports.dayOfMonth}
                      onChange={(e) => updateSettings('monthly_reports', { dayOfMonth: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>เวลาส่งรายงาน</Label>
                    <Input
                      type="time"
                      value={settings.monthly_reports.time}
                      onChange={(e) => updateSettings('monthly_reports', { time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>ข้อความรายงาน</Label>
                  <Textarea
                    value={settings.monthly_reports.message}
                    onChange={(e) => updateSettings('monthly_reports', { message: e.target.value })}
                    placeholder="ข้อความรายงานประจำเดือน"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    ใช้ month, totalSales, target, growth เป็นตัวแปร
                  </p>
                </div>

                {/* Platform switches for monthly reports */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(settings.monthly_reports.platforms).map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Switch
                        checked={settings.monthly_reports.platforms[platform].enabled}
                        onCheckedChange={(enabled) => updatePlatformSettings('monthly_reports', platform, { enabled })}
                      />
                      <Label className="capitalize">{platform}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default NotificationPage;
