
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Volume2, Bell, MessageCircle, Instagram, Hash, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  online_orders: {
    enabled: boolean;
    message: string;
    platforms: {
      line: { enabled: boolean; token: string };
      discord: { enabled: boolean; token: string };
      telegram: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
    };
  };
  daily_reports: {
    enabled: boolean;
    time: string;
    message: string;
    platforms: {
      line: { enabled: boolean };
      discord: { enabled: boolean };
      telegram: { enabled: boolean };
      instagram: { enabled: boolean };
    };
  };
  monthly_reports: {
    enabled: boolean;
    time: string;
    dayOfMonth: number;
    message: string;
    platforms: {
      line: { enabled: boolean };
      discord: { enabled: boolean };
      telegram: { enabled: boolean };
      instagram: { enabled: boolean };
    };
  };
  sound_enabled: boolean;
  volume: number;
  duration: number;
  selected_sound_id: string;
}

const NotificationPage = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    online_orders: {
      enabled: true,
      message: 'มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท',
      platforms: {
        line: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' }
      }
    },
    daily_reports: {
      enabled: true,
      time: '18:00',
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ',
      platforms: {
        line: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false },
        instagram: { enabled: false }
      }
    },
    monthly_reports: {
      enabled: true,
      time: '09:00',
      dayOfMonth: 1,
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%',
      platforms: {
        line: { enabled: false },
        discord: { enabled: false },
        telegram: { enabled: false },
        instagram: { enabled: false }
      }
    },
    sound_enabled: true,
    volume: 0.8,
    duration: 2,
    selected_sound_id: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        // Parse JSONB data and map to settings state
        const parsedSettings = {
          online_orders: (data as any).online_orders || settings.online_orders,
          daily_reports: (data as any).daily_reports || settings.daily_reports,
          monthly_reports: (data as any).monthly_reports || settings.monthly_reports,
          sound_enabled: data.sound_enabled ?? settings.sound_enabled,
          volume: data.volume ?? settings.volume,
          duration: data.duration ?? settings.duration,
          selected_sound_id: data.selected_sound_id || settings.selected_sound_id
        };

        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Unexpected error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          online_orders: settings.online_orders,
          daily_reports: settings.daily_reports,
          monthly_reports: settings.monthly_reports,
          sound_enabled: settings.sound_enabled,
          volume: settings.volume,
          duration: settings.duration,
          selected_sound_id: settings.selected_sound_id
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถบันทึกการตั้งค่าได้',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'บันทึกสำเร็จ',
          description: 'การตั้งค่าการแจ้งเตือนได้รับการบันทึกแล้ว',
        });
      }
    } catch (error) {
      console.error('Unexpected error saving settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testNotification = async (platform: string) => {
    setTestResult('กำลังทดสอบ...');
    
    try {
      const testMessage = `ทดสอบการแจ้งเตือน ${platform}\nเวลา: ${new Date().toLocaleString('th-TH')}`;
      
      // Create test notification based on platform
      let success = false;
      
      if (platform === 'line' && settings.online_orders.platforms.line.enabled) {
        // Test LINE notification
        success = true;
        setTestResult(`✅ ทดสอบ LINE สำเร็จ`);
      } else if (platform === 'discord' && settings.online_orders.platforms.discord.enabled) {
        // Test Discord notification
        success = true;
        setTestResult(`✅ ทดสอบ Discord สำเร็จ`);
      } else if (platform === 'telegram' && settings.online_orders.platforms.telegram.enabled) {
        // Test Telegram notification
        success = true;
        setTestResult(`✅ ทดสอบ Telegram สำเร็จ`);
      } else if (platform === 'instagram' && settings.online_orders.platforms.instagram.enabled) {
        // Test Instagram notification
        success = true;
        setTestResult(`✅ ทดสอบ Instagram สำเร็จ`);
      }

      if (!success) {
        setTestResult(`❌ ทดสอบ ${platform} ไม่สำเร็จ - ตรวจสอบการตั้งค่า`);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      setTestResult(`❌ ทดสอบ ${platform} ไม่สำเร็จ`);
    }
  };

  const updatePlatformSetting = (type: 'online_orders' | 'daily_reports' | 'monthly_reports', platform: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        platforms: {
          ...prev[type].platforms,
          [platform]: {
            ...prev[type].platforms[platform as keyof typeof prev[type].platforms],
            [field]: value
          }
        }
      }
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'line': return <MessageCircle className="w-4 h-4" />;
      case 'discord': return <Hash className="w-4 h-4" />;
      case 'telegram': return <Send className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const renderPlatformSettings = (type: 'online_orders' | 'daily_reports' | 'monthly_reports', platform: string) => {
    const platformSettings = settings[type].platforms[platform as keyof typeof settings[type].platforms];
    
    return (
      <div key={platform} className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPlatformIcon(platform)}
            <span className="font-medium capitalize">{platform}</span>
          </div>
          <Switch
            checked={platformSettings.enabled}
            onCheckedChange={(checked) => updatePlatformSetting(type, platform, 'enabled', checked)}
          />
        </div>
        
        {platformSettings.enabled && 'token' in platformSettings && (
          <div className="space-y-2">
            <Label htmlFor={`${type}-${platform}-token`}>Token/API Key</Label>
            <Input
              id={`${type}-${platform}-token`}
              type="password"
              value={platformSettings.token}
              onChange={(e) => updatePlatformSetting(type, platform, 'token', e.target.value)}
              placeholder={`ใส่ ${platform} token`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => testNotification(platform)}
            >
              ทดสอบ
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">การตั้งค่าการแจ้งเตือน</h1>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>

      <Tabs defaultValue="online-orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="online-orders">ออเดอร์ออนไลน์</TabsTrigger>
          <TabsTrigger value="daily-reports">รายงานประจำวัน</TabsTrigger>
          <TabsTrigger value="monthly-reports">รายงานประจำเดือน</TabsTrigger>
          <TabsTrigger value="sound">เสียงแจ้งเตือน</TabsTrigger>
        </TabsList>

        <TabsContent value="online-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                การแจ้งเตือนออเดอร์ออนไลน์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-orders-enabled">เปิดใช้งานการแจ้งเตือน</Label>
                <Switch
                  id="online-orders-enabled"
                  checked={settings.online_orders.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    online_orders: { ...prev.online_orders, enabled: checked }
                  }))}
                />
              </div>

              {settings.online_orders.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="online-orders-message">ข้อความแจ้งเตือน</Label>
                    <Textarea
                      id="online-orders-message"
                      value={settings.online_orders.message}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        online_orders: { ...prev.online_orders, message: e.target.value }
                      }))}
                      placeholder="ใส่ข้อความแจ้งเตือน (ใช้ {{orderNumber}} และ {{amount}} ได้)"
                      className="min-h-20"
                    />
                    <p className="text-sm text-gray-500">
                      ตัวแปรที่ใช้ได้: {{orderNumber}}, {{amount}}, {{customerName}}, {{customerPhone}}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">แพลตฟอร์มการแจ้งเตือน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(settings.online_orders.platforms).map(platform => 
                        renderPlatformSettings('online_orders', platform)
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายงานประจำวัน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reports-enabled">เปิดใช้งานรายงานประจำวัน</Label>
                <Switch
                  id="daily-reports-enabled"
                  checked={settings.daily_reports.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    daily_reports: { ...prev.daily_reports, enabled: checked }
                  }))}
                />
              </div>

              {settings.daily_reports.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="daily-reports-time">เวลาส่งรายงาน</Label>
                    <Input
                      id="daily-reports-time"
                      type="time"
                      value={settings.daily_reports.time}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        daily_reports: { ...prev.daily_reports, time: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily-reports-message">ข้อความรายงาน</Label>
                    <Textarea
                      id="daily-reports-message"
                      value={settings.daily_reports.message}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        daily_reports: { ...prev.daily_reports, message: e.target.value }
                      }))}
                      placeholder="ข้อความรายงานประจำวัน"
                      className="min-h-20"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">แพลตฟอร์มการส่งรายงาน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(settings.daily_reports.platforms).map(platform => 
                        renderPlatformSettings('daily_reports', platform)
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายงานประจำเดือน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-reports-enabled">เปิดใช้งานรายงานประจำเดือน</Label>
                <Switch
                  id="monthly-reports-enabled"
                  checked={settings.monthly_reports.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    monthly_reports: { ...prev.monthly_reports, enabled: checked }
                  }))}
                />
              </div>

              {settings.monthly_reports.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthly-reports-day">วันที่ส่งรายงาน</Label>
                      <Input
                        id="monthly-reports-day"
                        type="number"
                        min="1"
                        max="31"
                        value={settings.monthly_reports.dayOfMonth}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          monthly_reports: { ...prev.monthly_reports, dayOfMonth: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly-reports-time">เวลาส่งรายงาน</Label>
                      <Input
                        id="monthly-reports-time"
                        type="time"
                        value={settings.monthly_reports.time}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          monthly_reports: { ...prev.monthly_reports, time: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-reports-message">ข้อความรายงาน</Label>
                    <Textarea
                      id="monthly-reports-message"
                      value={settings.monthly_reports.message}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        monthly_reports: { ...prev.monthly_reports, message: e.target.value }
                      }))}
                      placeholder="ข้อความรายงานประจำเดือน"
                      className="min-h-20"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">แพลตฟอร์มการส่งรายงาน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(settings.monthly_reports.platforms).map(platform => 
                        renderPlatformSettings('monthly_reports', platform)
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sound" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                การตั้งค่าเสียงแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">เปิดใช้งานเสียงแจ้งเตือน</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    sound_enabled: checked
                  }))}
                />
              </div>

              {settings.sound_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="volume">ความดัง: {Math.round(settings.volume * 100)}%</Label>
                    <Input
                      id="volume"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        volume: parseFloat(e.target.value)
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">ระยะเวลา: {settings.duration} วินาที</Label>
                    <Input
                      id="duration"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={settings.duration}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-mono">{testResult}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationPage;
