import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, CheckCheck, MessageSquare } from 'lucide-react';

interface NotificationSettings {
  id: string;
  shop_id: string;
  online_orders: {
    enabled: boolean;
    platforms?: {
      line?: { enabled: boolean; token: string };
      discord?: { enabled: boolean; token: string };
      telegram?: { enabled: boolean; token: string };
      instagram?: { enabled: boolean; token: string };
    };
    message_template?: string;
  };
  daily_reports: {
    enabled: boolean;
    platforms?: {
      line?: { enabled: boolean };
      discord?: { enabled: boolean };
      telegram?: { enabled: boolean };
      instagram?: { enabled: boolean };
    };
    time?: string;
  };
}

const NotificationPage = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าได้', variant: 'destructive' });
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการโหลด', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsChange = (section: string, field: string, value: any, platform?: string) => {
    setSettings((prevSettings: any) => {
      if (!prevSettings) return prevSettings;

      if (section === 'online_orders' && field === 'platforms' && platform) {
        return {
          ...prevSettings,
          online_orders: {
            ...prevSettings.online_orders,
            platforms: {
              ...prevSettings.online_orders.platforms,
              [platform]: {
                ...prevSettings.online_orders.platforms?.[platform],
                enabled: value,
              },
            },
          },
        };
      } else if (section === 'online_orders' && field === 'token' && platform) {
        return {
          ...prevSettings,
          online_orders: {
            ...prevSettings.online_orders,
            platforms: {
              ...prevSettings.online_orders.platforms,
              [platform]: {
                ...prevSettings.online_orders.platforms?.[platform],
                token: value,
              },
            },
          },
        };
      } else if (section === 'online_orders' && field === 'message_template') {
        return {
          ...prevSettings,
          online_orders: {
            ...prevSettings.online_orders,
            message_template: value,
          },
        };
      } else if (section === 'online_orders' && field === 'enabled') {
        return {
          ...prevSettings,
          online_orders: {
            ...prevSettings.online_orders,
            enabled: value,
          },
        };
      } else if (section === 'daily_reports' && field === 'platforms' && platform) {
        return {
          ...prevSettings,
          daily_reports: {
            ...prevSettings.daily_reports,
            platforms: {
              ...prevSettings.daily_reports.platforms,
              [platform]: {
                ...prevSettings.daily_reports.platforms?.[platform],
                enabled: value,
              },
            },
          },
        };
      } else if (section === 'daily_reports' && field === 'time') {
        return {
          ...prevSettings,
          daily_reports: {
            ...prevSettings.daily_reports,
            time: value,
          },
        };
      } else if (section === 'daily_reports' && field === 'enabled') {
        return {
          ...prevSettings,
          daily_reports: {
            ...prevSettings.daily_reports,
            enabled: value,
          },
        };
      }

      return prevSettings;
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          ...settings,
          online_orders: {
            ...settings.online_orders,
            platforms: {
              line: {
                enabled: settings.online_orders.platforms?.line?.enabled || false,
                token: settings.online_orders.platforms?.line?.token || ''
              },
              discord: {
                enabled: settings.online_orders.platforms?.discord?.enabled || false,
                token: settings.online_orders.platforms?.discord?.token || ''
              },
              telegram: {
                enabled: settings.online_orders.platforms?.telegram?.enabled || false,
                token: settings.online_orders.platforms?.telegram?.token || ''
              },
              instagram: {
                enabled: settings.online_orders.platforms?.instagram?.enabled || false,
                token: settings.online_orders.platforms?.instagram?.token || ''
              }
            }
          },
          daily_reports: {
            ...settings.daily_reports,
            platforms: {
              line: { enabled: settings.daily_reports.platforms?.line?.enabled || false },
              discord: { enabled: settings.daily_reports.platforms?.discord?.enabled || false },
              telegram: { enabled: settings.daily_reports.platforms?.telegram?.enabled || false },
              instagram: { enabled: settings.daily_reports.platforms?.instagram?.enabled || false }
            }
          }
        });

      if (error) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกการตั้งค่าได้', variant: 'destructive' });
      } else {
        toast({ title: 'สำเร็จ', description: 'บันทึกการตั้งค่าแล้ว' });
        fetchSettings();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการบันทึก', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            ตั้งค่าการแจ้งเตือน
          </CardTitle>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="online-orders-enabled">
                <MessageSquare className="w-4 h-4 mr-2 inline-block" />
                การแจ้งเตือนออเดอร์ออนไลน์
              </Label>
              <Switch
                id="online-orders-enabled"
                checked={settings?.online_orders?.enabled || false}
                onCheckedChange={(value) => handleSettingsChange('online_orders', 'enabled', value)}
              />
            </div>
            {settings?.online_orders?.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <Label>ข้อความแจ้งเตือน</Label>
                  <Textarea
                    placeholder="ใส่ข้อความแจ้งเตือนเมื่อมีออเดอร์ใหม่"
                    value={settings?.online_orders?.message_template || ''}
                    onChange={(e) => handleSettingsChange('online_orders', 'message_template', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.online_orders?.platforms?.line?.enabled || false}
                      onCheckedChange={(value) => handleSettingsChange('online_orders', 'platforms', value, 'line')}
                    />
                    <Input
                      type="text"
                      placeholder="Line Token"
                      value={settings?.online_orders?.platforms?.line?.token || ''}
                      onChange={(e) => handleSettingsChange('online_orders', 'token', e.target.value, 'line')}
                      disabled={!settings?.online_orders?.platforms?.line?.enabled}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Discord</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.online_orders?.platforms?.discord?.enabled || false}
                      onCheckedChange={(value) => handleSettingsChange('online_orders', 'platforms', value, 'discord')}
                    />
                    <Input
                      type="text"
                      placeholder="Discord Token"
                      value={settings?.online_orders?.platforms?.discord?.token || ''}
                      onChange={(e) => handleSettingsChange('online_orders', 'token', e.target.value, 'discord')}
                      disabled={!settings?.online_orders?.platforms?.discord?.enabled}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.online_orders?.platforms?.telegram?.enabled || false}
                      onCheckedChange={(value) => handleSettingsChange('online_orders', 'platforms', value, 'telegram')}
                    />
                    <Input
                      type="text"
                      placeholder="Telegram Token"
                      value={settings?.online_orders?.platforms?.telegram?.token || ''}
                      onChange={(e) => handleSettingsChange('online_orders', 'token', e.target.value, 'telegram')}
                      disabled={!settings?.online_orders?.platforms?.telegram?.enabled}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.online_orders?.platforms?.instagram?.enabled || false}
                      onCheckedChange={(value) => handleSettingsChange('online_orders', 'platforms', value, 'instagram')}
                    />
                    <Input
                      type="text"
                      placeholder="Instagram Token"
                      value={settings?.online_orders?.platforms?.instagram?.token || ''}
                      onChange={(e) => handleSettingsChange('online_orders', 'token', e.target.value, 'instagram')}
                      disabled={!settings?.online_orders?.platforms?.instagram?.enabled}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-reports-enabled">
                <CheckCheck className="w-4 h-4 mr-2 inline-block" />
                รายงานประจำวัน
              </Label>
              <Switch
                id="daily-reports-enabled"
                checked={settings?.daily_reports?.enabled || false}
                onCheckedChange={(value) => handleSettingsChange('daily_reports', 'enabled', value)}
              />
            </div>
            {settings?.daily_reports?.enabled && (
              <div className="pl-6 space-y-4">
                <div className="space-y-2">
                  <Label>เวลาส่งรายงาน</Label>
                  <Input
                    type="time"
                    value={settings?.daily_reports?.time || '08:00'}
                    onChange={(e) => handleSettingsChange('daily_reports', 'time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Line</Label>
                  <Switch
                    checked={settings?.daily_reports?.platforms?.line?.enabled || false}
                    onCheckedChange={(value) => handleSettingsChange('daily_reports', 'platforms', value, 'line')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discord</Label>
                  <Switch
                    checked={settings?.daily_reports?.platforms?.discord?.enabled || false}
                    onCheckedChange={(value) => handleSettingsChange('daily_reports', 'platforms', value, 'discord')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Switch
                    checked={settings?.daily_reports?.platforms?.telegram?.enabled || false}
                    onCheckedChange={(value) => handleSettingsChange('daily_reports', 'platforms', value, 'telegram')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Switch
                    checked={settings?.daily_reports?.platforms?.instagram?.enabled || false}
                    onCheckedChange={(value) => handleSettingsChange('daily_reports', 'platforms', value, 'instagram')}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;
