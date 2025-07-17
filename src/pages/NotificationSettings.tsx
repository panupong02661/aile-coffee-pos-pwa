
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  id: string;
  is_enabled: boolean;
  report_time: string;
  line_enabled: boolean;
  line_webhook_url: string | null;
  telegram_enabled: boolean;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  discord_enabled: boolean;
  discord_webhook_url: string | null;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_report_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // สร้างการตั้งค่าเริ่มต้น
        const { data: newSettings, error: createError } = await supabase
          .from('daily_report_settings')
          .insert({
            is_enabled: false,
            report_time: '18:00:00'
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตั้งค่าได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('daily_report_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตการตั้งค่าแล้ว"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (platform: string) => {
    if (!settings) return;

    setTesting(platform);
    
    try {
      // จำลองการทดสอบส่งข้อความ
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2; // จำลองความสำเร็จ 80%
      
      toast({
        title: success ? "ทดสอบสำเร็จ" : "ทดสอบไม่สำเร็จ",
        description: success 
          ? `ส่งข้อความทดสอบไปยัง ${platform} สำเร็จ`
          : "กรุณาตรวจสอบการตั้งค่าและลองอีกครั้ง",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Test notification failed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทดสอบการส่งข้อความได้",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">ไม่พบการตั้งค่า</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">แจ้งเตือนสรุปยอดขาย</h1>
          <p className="text-muted-foreground">ตั้งค่าการส่งรายงานประจำวันอัตโนมัติ</p>
        </div>
      </div>

      {/* การตั้งค่าหลัก */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            การตั้งค่าหลัก
            <Badge variant={settings.is_enabled ? "default" : "secondary"}>
              {settings.is_enabled ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> เปิดใช้งาน</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" /> ปิดใช้งาน</>
              )}
            </Badge>
          </CardTitle>
          <CardDescription>
            ตั้งค่าการส่งรายงานสรุปยอดขายประจำวัน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>เปิดใช้งานการส่งรายงานอัตโนมัติ</Label>
              <p className="text-sm text-muted-foreground">
                ระบบจะส่งรายงานสรุปยอดขายทุกวันตามเวลาที่กำหนด
              </p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ is_enabled: checked })
              }
            />
          </div>

          {settings.is_enabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="report-time">เวลาส่งรายงาน</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="report-time"
                    type="time"
                    value={settings.report_time}
                    onChange={(e) => 
                      updateSettings({ report_time: e.target.value })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">น.</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ระบบจะส่งรายงานทุกวันในเวลาที่กำหนด
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* การตั้งค่า LINE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            LINE Notify
          </CardTitle>
          <CardDescription>
            ส่งรายงานผ่าน LINE Notify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>เปิดใช้งาน LINE Notify</Label>
            <Switch
              checked={settings.line_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ line_enabled: checked })
              }
            />
          </div>

          {settings.line_enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="line-webhook">LINE Notify Token</Label>
                <Input
                  id="line-webhook"
                  type="password"
                  placeholder="ใส่ LINE Notify Token"
                  value={settings.line_webhook_url || ''}
                  onChange={(e) => 
                    updateSettings({ line_webhook_url: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  รับ Token ได้ที่ <a href="https://notify-bot.line.me" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notify-bot.line.me</a>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('LINE')}
                disabled={testing === 'LINE' || !settings.line_webhook_url}
              >
                {testing === 'LINE' ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                ทดสอบส่งข้อความ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* การตั้งค่า Telegram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            Telegram Bot
          </CardTitle>
          <CardDescription>
            ส่งรายงานผ่าน Telegram Bot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>เปิดใช้งาน Telegram Bot</Label>
            <Switch
              checked={settings.telegram_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ telegram_enabled: checked })
              }
            />
          </div>

          {settings.telegram_enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram-token">Bot Token</Label>
                <Input
                  id="telegram-token"
                  type="password"
                  placeholder="ใส่ Telegram Bot Token"
                  value={settings.telegram_bot_token || ''}
                  onChange={(e) => 
                    updateSettings({ telegram_bot_token: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram-chat">Chat ID</Label>
                <Input
                  id="telegram-chat"
                  placeholder="ใส่ Chat ID"
                  value={settings.telegram_chat_id || ''}
                  onChange={(e) => 
                    updateSettings({ telegram_chat_id: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  สร้าง Bot ได้ที่ <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@BotFather</a>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('Telegram')}
                disabled={testing === 'Telegram' || !settings.telegram_bot_token || !settings.telegram_chat_id}
              >
                {testing === 'Telegram' ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                ทดสอบส่งข้อความ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* การตั้งค่า Discord */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            Discord Webhook
          </CardTitle>
          <CardDescription>
            ส่งรายงานผ่าน Discord Webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>เปิดใช้งาน Discord Webhook</Label>
            <Switch
              checked={settings.discord_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ discord_enabled: checked })
              }
            />
          </div>

          {settings.discord_enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                <Input
                  id="discord-webhook"
                  type="password"
                  placeholder="ใส่ Discord Webhook URL"
                  value={settings.discord_webhook_url || ''}
                  onChange={(e) => 
                    updateSettings({ discord_webhook_url: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  สร้าง Webhook ได้ใน Server Settings → Integrations → Webhooks
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('Discord')}
                disabled={testing === 'Discord' || !settings.discord_webhook_url}
              >
                {testing === 'Discord' ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                ทดสอบส่งข้อความ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ตัวอย่างรายงาน */}
      <Card>
        <CardHeader>
          <CardTitle>ตัวอย่างรายงาน</CardTitle>
          <CardDescription>
            นี่คือตัวอย่างข้อความที่จะส่งในรายงานประจำวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="font-bold mb-2">📊 สรุปยอดขาย - {new Date().toLocaleDateString('th-TH')}</div>
            <div>💰 ยอดขายรวม: ฿15,240</div>
            <div>🛍️ จำนวนออเดอร์: 48 ออเดอร์</div>
            <div>👥 ลูกค้าใหม่: 12 คน</div>
            <div>⭐ เมนูขายดี: กาแฟเย็น, ชาเขียวมัทฉะ</div>
            <div className="mt-2 text-muted-foreground">
              ส่งโดยระบบ Aile Coffee POS
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
