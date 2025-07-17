
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Clock, Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSetting {
  id: string;
  notification_type: string;
  is_enabled: boolean;
  schedule_time: string;
  line_webhook_url: string | null;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  discord_webhook_url: string | null;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('notification_type', 'daily_sales_report')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดการตั้งค่าได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSetting>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async (platform: 'line' | 'telegram' | 'discord') => {
    if (!settings) return;

    setSending(true);
    try {
      // จำลองการส่งการแจ้งเตือนทดสอบ
      await new Promise(resolve => setTimeout(resolve, 2000));

      const platformNames = {
        line: 'LINE',
        telegram: 'Telegram', 
        discord: 'Discord'
      };

      toast({
        title: "ส่งการแจ้งเตือนทดสอบสำเร็จ",
        description: `ส่งการแจ้งเตือนทดสอบไปยัง ${platformNames[platform]} แล้ว`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งการแจ้งเตือนทดสอบได้",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const generateSampleReport = () => {
    const today = new Date().toLocaleDateString('th-TH');
    return `📊 รายงานยอดขายประจำวัน ${today}

💰 ยอดขายรวม: ฿2,450.00
🛒 จำนวนออเดอร์: 23 ออเดอร์
📈 เฉลี่ยต่อออเดอร์: ฿106.52

🏆 เมนูขายดี:
1. กาแฟอเมริกาโน - 8 แก้ว
2. คาปูชิโน่ - 6 แก้ว
3. ลาเต้ - 5 แก้ว

💳 ช่องทางชำระเงิน:
- เงินสด: ฿1,680.00 (68.6%)
- โอนเงิน: ฿770.00 (31.4%)

ขอบคุณสำหรับการขายที่ดีในวันนี้! 🙏`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่พบการตั้งค่า</h3>
            <p className="text-gray-600">ไม่สามารถโหลดการตั้งค่าการแจ้งเตือนได้</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">การตั้งค่าการแจ้งเตือน</h1>
            <p className="text-gray-600 mt-1">จัดการการแจ้งเตือนรายงานประจำวัน</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {/* การตั้งค่าทั่วไป */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                การตั้งค่าทั่วไป
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-report">เปิดใช้งานรายงานประจำวัน</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    ส่งรายงานสรุปยอดขายทุกวันในเวลาที่กำหนด
                  </p>
                </div>
                <Switch
                  id="daily-report"
                  checked={settings.is_enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ is_enabled: checked })
                  }
                />
              </div>

              {settings.is_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">เวลาส่งรายงาน</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={settings.schedule_time}
                    onChange={(e) => 
                      updateSettings({ schedule_time: e.target.value })
                    }
                    className="w-fit"
                  />
                  <p className="text-sm text-gray-600">
                    รายงานจะถูกส่งทุกวันในเวลาที่กำหนด
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* การตั้งค่า LINE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                LINE Notify
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="line-webhook">LINE Webhook URL</Label>
                <Input
                  id="line-webhook"
                  value={settings.line_webhook_url || ''}
                  onChange={(e) => 
                    updateSettings({ line_webhook_url: e.target.value })
                  }
                  placeholder="https://notify-api.line.me/api/notify"
                />
                <p className="text-sm text-gray-600">
                  ได้รับ Token จาก LINE Notify และใส่ในรูปแบบ URL
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => sendTestNotification('line')}
                disabled={!settings.line_webhook_url || sending}
              >
                <Send className="w-4 h-4 mr-2" />
                ทดสอบส่ง LINE
              </Button>
            </CardContent>
          </Card>

          {/* การตั้งค่า Telegram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Telegram Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-token">Bot Token</Label>
                  <Input
                    id="telegram-token"
                    type="password"
                    value={settings.telegram_bot_token || ''}
                    onChange={(e) => 
                      updateSettings({ telegram_bot_token: e.target.value })
                    }
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram-chat">Chat ID</Label>
                  <Input
                    id="telegram-chat"
                    value={settings.telegram_chat_id || ''}
                    onChange={(e) => 
                      updateSettings({ telegram_chat_id: e.target.value })
                    }
                    placeholder="-1001234567890"
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => sendTestNotification('telegram')}
                disabled={!settings.telegram_bot_token || !settings.telegram_chat_id || sending}
              >
                <Send className="w-4 h-4 mr-2" />
                ทดสอบส่ง Telegram
              </Button>
            </CardContent>
          </Card>

          {/* การตั้งค่า Discord */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Discord Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discord-webhook">Discord Webhook URL</Label>
                <Input
                  id="discord-webhook"
                  value={settings.discord_webhook_url || ''}
                  onChange={(e) => 
                    updateSettings({ discord_webhook_url: e.target.value })
                  }
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <p className="text-sm text-gray-600">
                  สร้าง Webhook จากการตั้งค่า Channel ใน Discord
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => sendTestNotification('discord')}
                disabled={!settings.discord_webhook_url || sending}
              >
                <Send className="w-4 h-4 mr-2" />
                ทดสอบส่ง Discord
              </Button>
            </CardContent>
          </Card>

          {/* ตัวอย่างรายงาน */}
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างรายงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {generateSampleReport()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
