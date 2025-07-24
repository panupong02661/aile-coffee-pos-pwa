import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MessageSquare, Instagram, Music, Volume2, Upload } from 'lucide-react';

interface NotificationSettings {
  online_orders: {
    enabled: boolean;
    platforms: {
      line: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
      discord: { enabled: boolean; token: string };
      telegram: { enabled: boolean; token: string };
    };
    instantNotification: boolean;
    message: string;
  };
  daily_reports: {
    enabled: boolean;
    time: string;
    message: string;
    platforms: {
      line: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
      discord: { enabled: boolean; token: string };
      telegram: { enabled: boolean; token: string };
    };
  };
  monthly_reports: {
    enabled: boolean;
    time: string;
    dayOfMonth: number;
    message: string;
    platforms: {
      line: { enabled: boolean; token: string };
      instagram: { enabled: boolean; token: string };
      discord: { enabled: boolean; token: string };
      telegram: { enabled: boolean; token: string };
    };
  };
  sound_enabled: boolean;
  volume: number;
  duration: number;
  selected_sound_id: string;
}

interface NotificationSound {
  id: string;
  name: string;
  file_url: string;
  is_active: boolean;
}

const NotificationPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    online_orders: {
      enabled: true,
      platforms: {
        line: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      },
      instantNotification: true,
      message: 'มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท'
    },
    daily_reports: {
      enabled: true,
      time: '18:00',
      message: 'สรุปยอดขายประจำวัน {{date}}\nยอดขายรวม: {{totalSales}} บาท\nจำนวนออเดอร์: {{orderCount}} รายการ',
      platforms: {
        line: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      }
    },
    monthly_reports: {
      enabled: true,
      time: '09:00',
      dayOfMonth: 1,
      message: 'สรุปยอดขายประจำเดือน {{month}}\nยอดขายรวม: {{totalSales}} บาท\nเป้าหมาย: {{target}} บาท\nอัตราการเติบโต: {{growth}}%',
      platforms: {
        line: { enabled: false, token: '' },
        instagram: { enabled: false, token: '' },
        discord: { enabled: false, token: '' },
        telegram: { enabled: false, token: '' }
      }
    },
    sound_enabled: true,
    volume: 0.8,
    duration: 2,
    selected_sound_id: ''
  });

  const [sounds, setSounds] = useState<NotificationSound[]>([]);
  const [newSoundFile, setNewSoundFile] = useState<File | null>(null);
  const [uploadingSounds, setUploadingSounds] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
    fetchNotificationSounds();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return;
      }

      if (data) {
        // Parse JSONB data and map to settings state
        const parsedSettings = {
          online_orders: data.online_orders || settings.online_orders,
          daily_reports: data.daily_reports || settings.daily_reports,
          monthly_reports: data.monthly_reports || settings.monthly_reports,
          sound_enabled: data.sound_enabled ?? settings.sound_enabled,
          volume: data.volume ?? settings.volume,
          duration: data.duration ?? settings.duration,
          selected_sound_id: data.selected_sound_id || settings.selected_sound_id
        };

        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSounds = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching sounds:', error);
        return;
      }

      setSounds(data || []);
    } catch (error) {
      console.error('Error fetching sounds:', error);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      // Prepare data for update
      const updateData = {
        online_orders: settings.online_orders,
        daily_reports: settings.daily_reports,
        monthly_reports: settings.monthly_reports,
        sound_enabled: settings.sound_enabled,
        volume: settings.volume,
        duration: settings.duration,
        selected_sound_id: settings.selected_sound_id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notification_settings')
        .upsert(updateData, { onConflict: 'id' });

      if (error) {
        console.error('Error saving notification settings:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถบันทึกการตั้งค่าได้',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'สำเร็จ',
        description: 'บันทึกการตั้งค่าเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า',
        variant: 'destructive'
      });
    }
  };

  const updatePlatformToken = (type: 'online_orders' | 'daily_reports' | 'monthly_reports', platform: string, token: string) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        platforms: {
          ...prev[type].platforms,
          [platform]: {
            ...prev[type].platforms[platform as keyof typeof prev[type].platforms],
            token
          }
        }
      }
    }));
  };

  const updatePlatformEnabled = (type: 'online_orders' | 'daily_reports' | 'monthly_reports', platform: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        platforms: {
          ...prev[type].platforms,
          [platform]: {
            ...prev[type].platforms[platform as keyof typeof prev[type].platforms],
            enabled
          }
        }
      }
    }));
  };

  const uploadSoundFile = async () => {
    if (!newSoundFile) return;

    setUploadingSounds(true);
    try {
      const fileName = `${Date.now()}_${newSoundFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notification-sounds')
        .upload(fileName, newSoundFile);

      if (uploadError) {
        console.error('Error uploading sound:', uploadError);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถอัปโหลดไฟล์เสียงได้',
          variant: 'destructive'
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('notification-sounds')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('notification_sounds')
        .insert({
          name: newSoundFile.name.replace(/\.[^/.]+$/, ''),
          file_url: urlData.publicUrl,
          is_active: true
        });

      if (dbError) {
        console.error('Error saving sound to database:', dbError);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถบันทึกข้อมูลเสียงได้',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'สำเร็จ',
        description: 'อัปโหลดเสียงแจ้งเตือนแล้ว'
      });

      setNewSoundFile(null);
      fetchNotificationSounds();
    } catch (error) {
      console.error('Error uploading sound:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
        variant: 'destructive'
      });
    } finally {
      setUploadingSounds(false);
    }
  };

  const testNotification = async (platform: string, token: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          platform,
          token,
          message: 'ทดสอบการแจ้งเตือน - ระบบทำงานปกติ'
        }
      });

      if (error) {
        console.error('Test notification error:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: `ไม่สามารถส่งการแจ้งเตือนไปยัง ${platform} ได้`,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'สำเร็จ',
        description: `ส่งการแจ้งเตือนไปยัง ${platform} แล้ว`
      });
    } catch (error) {
      console.error('Test notification error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: `เกิดข้อผิดพลาดในการส่งการแจ้งเตือนไปยัง ${platform}`,
        variant: 'destructive'
      });
    }
  };

  const playTestSound = (soundUrl: string) => {
    try {
      const audio = new Audio(soundUrl);
      audio.volume = settings.volume;
      audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถเล่นเสียงได้',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-center mt-2">กำลังโหลดการตั้งค่า...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ระบบแจ้งเตือน</h1>
        <Button onClick={saveNotificationSettings} className="bg-orange-500 hover:bg-orange-600">
          บันทึกการตั้งค่า
        </Button>
      </div>

      {/* Online Orders Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            แจ้งเตือนออเดอร์ออนไลน์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.online_orders.enabled}
              onCheckedChange={(enabled) => 
                setSettings(prev => ({ ...prev, online_orders: { ...prev.online_orders, enabled } }))
              }
            />
            <Label>เปิดการแจ้งเตือน</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.online_orders.instantNotification}
              onCheckedChange={(instantNotification) => 
                setSettings(prev => ({ ...prev, online_orders: { ...prev.online_orders, instantNotification } }))
              }
            />
            <Label>แจ้งเตือนทันทีเมื่อมีออเดอร์ใหม่</Label>
          </div>

          <div>
            <Label>ข้อความแจ้งเตือน</Label>
            <Textarea
              value={settings.online_orders.message}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, online_orders: { ...prev.online_orders, message: e.target.value } }))
              }
              placeholder="มีออเดอร์ออนไลน์ใหม่เข้ามา! ออเดอร์ #{{orderNumber}} จำนวน {{amount}} บาท"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">แพลตฟอร์มการแจ้งเตือน</h3>
            
            {/* LINE */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <Label>LINE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.online_orders.platforms.line.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('online_orders', 'line', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('line', settings.online_orders.platforms.line.token)}
                    disabled={!settings.online_orders.platforms.line.enabled || !settings.online_orders.platforms.line.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="LINE Bot Token"
                value={settings.online_orders.platforms.line.token}
                onChange={(e) => updatePlatformToken('online_orders', 'line', e.target.value)}
              />
            </div>

            {/* Instagram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Instagram className="w-5 h-5 text-purple-500" />
                  <Label>Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.online_orders.platforms.instagram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('online_orders', 'instagram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('instagram', settings.online_orders.platforms.instagram.token)}
                    disabled={!settings.online_orders.platforms.instagram.enabled || !settings.online_orders.platforms.instagram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Instagram Access Token"
                value={settings.online_orders.platforms.instagram.token}
                onChange={(e) => updatePlatformToken('online_orders', 'instagram', e.target.value)}
              />
            </div>

            {/* Discord */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <Label>Discord</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.online_orders.platforms.discord.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('online_orders', 'discord', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('discord', settings.online_orders.platforms.discord.token)}
                    disabled={!settings.online_orders.platforms.discord.enabled || !settings.online_orders.platforms.discord.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Discord Webhook URL"
                value={settings.online_orders.platforms.discord.token}
                onChange={(e) => updatePlatformToken('online_orders', 'discord', e.target.value)}
              />
            </div>

            {/* Telegram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <Label>Telegram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.online_orders.platforms.telegram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('online_orders', 'telegram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('telegram', settings.online_orders.platforms.telegram.token)}
                    disabled={!settings.online_orders.platforms.telegram.enabled || !settings.online_orders.platforms.telegram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Telegram Bot Token"
                value={settings.online_orders.platforms.telegram.token}
                onChange={(e) => updatePlatformToken('online_orders', 'telegram', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            การตั้งค่าเสียง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(sound_enabled) => setSettings(prev => ({ ...prev, sound_enabled }))}
            />
            <Label>เปิดเสียงแจ้งเตือน</Label>
          </div>

          <div>
            <Label>ระดับเสียง: {Math.round(settings.volume * 100)}%</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div>
            <Label>ระยะเวลาเล่น (วินาที)</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={settings.duration}
              onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <Label>เสียงแจ้งเตือน</Label>
            <Select value={settings.selected_sound_id} onValueChange={(selected_sound_id) => setSettings(prev => ({ ...prev, selected_sound_id }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกเสียงแจ้งเตือน" />
              </SelectTrigger>
              <SelectContent>
                {sounds.map(sound => (
                  <SelectItem key={sound.id} value={sound.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{sound.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          playTestSound(sound.file_url);
                        }}
                      >
                        เล่น
                      </Button>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <Label>อัปโหลดเสียงแจ้งเตือนใหม่</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => setNewSoundFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={uploadSoundFile}
                disabled={!newSoundFile || uploadingSounds}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingSounds ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reports Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            การตั้งค่าสรุปยอดขายรายวัน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.daily_reports.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, daily_reports: { ...prev.daily_reports, enabled } }))}
            />
            <Label>เปิดการแจ้งเตือนรายวัน</Label>
          </div>

          <div>
            <Label>เวลาส่งรายงาน</Label>
            <Input
              type="time"
              value={settings.daily_reports.time}
              onChange={(e) => setSettings(prev => ({ ...prev, daily_reports: { ...prev.daily_reports, time: e.target.value } }))}
            />
          </div>

          <div>
            <Label>ข้อความรายงาน</Label>
            <Textarea
              value={settings.daily_reports.message}
              onChange={(e) => setSettings(prev => ({ ...prev, daily_reports: { ...prev.daily_reports, message: e.target.value } }))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">แพลตฟอร์มการแจ้งเตือน</h3>
            
            {/* LINE */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <Label>LINE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.daily_reports.platforms.line.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('daily_reports', 'line', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('line', settings.daily_reports.platforms.line.token)}
                    disabled={!settings.daily_reports.platforms.line.enabled || !settings.daily_reports.platforms.line.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="LINE Bot Token"
                value={settings.daily_reports.platforms.line.token}
                onChange={(e) => updatePlatformToken('daily_reports', 'line', e.target.value)}
              />
            </div>

            {/* Instagram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Instagram className="w-5 h-5 text-purple-500" />
                  <Label>Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.daily_reports.platforms.instagram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('daily_reports', 'instagram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('instagram', settings.daily_reports.platforms.instagram.token)}
                    disabled={!settings.daily_reports.platforms.instagram.enabled || !settings.daily_reports.platforms.instagram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Instagram Access Token"
                value={settings.daily_reports.platforms.instagram.token}
                onChange={(e) => updatePlatformToken('daily_reports', 'instagram', e.target.value)}
              />
            </div>

            {/* Discord */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <Label>Discord</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.daily_reports.platforms.discord.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('daily_reports', 'discord', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('discord', settings.daily_reports.platforms.discord.token)}
                    disabled={!settings.daily_reports.platforms.discord.enabled || !settings.daily_reports.platforms.discord.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Discord Webhook URL"
                value={settings.daily_reports.platforms.discord.token}
                onChange={(e) => updatePlatformToken('daily_reports', 'discord', e.target.value)}
              />
            </div>

            {/* Telegram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <Label>Telegram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.daily_reports.platforms.telegram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('daily_reports', 'telegram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('telegram', settings.daily_reports.platforms.telegram.token)}
                    disabled={!settings.daily_reports.platforms.telegram.enabled || !settings.daily_reports.platforms.telegram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Telegram Bot Token"
                value={settings.daily_reports.platforms.telegram.token}
                onChange={(e) => updatePlatformToken('daily_reports', 'telegram', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            การตั้งค่าสรุปยอดขายรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.monthly_reports.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, monthly_reports: { ...prev.monthly_reports, enabled } }))}
            />
            <Label>เปิดการแจ้งเตือนรายเดือน</Label>
          </div>

          <div>
            <Label>เวลาส่งรายงาน</Label>
            <Input
              type="time"
              value={settings.monthly_reports.time}
              onChange={(e) => setSettings(prev => ({ ...prev, monthly_reports: { ...prev.monthly_reports, time: e.target.value } }))}
            />
          </div>

          <div>
            <Label>วันที่ส่งรายงาน (วันในเดือน)</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={settings.monthly_reports.dayOfMonth}
              onChange={(e) => setSettings(prev => ({ ...prev, monthly_reports: { ...prev.monthly_reports, dayOfMonth: parseInt(e.target.value) } }))}
            />
          </div>

          <div>
            <Label>ข้อความรายงาน</Label>
            <Textarea
              value={settings.monthly_reports.message}
              onChange={(e) => setSettings(prev => ({ ...prev, monthly_reports: { ...prev.monthly_reports, message: e.target.value } }))}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">แพลตฟอร์มการแจ้งเตือน</h3>
            
            {/* LINE */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <Label>LINE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.monthly_reports.platforms.line.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('monthly_reports', 'line', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('line', settings.monthly_reports.platforms.line.token)}
                    disabled={!settings.monthly_reports.platforms.line.enabled || !settings.monthly_reports.platforms.line.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="LINE Bot Token"
                value={settings.monthly_reports.platforms.line.token}
                onChange={(e) => updatePlatformToken('monthly_reports', 'line', e.target.value)}
              />
            </div>

            {/* Instagram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Instagram className="w-5 h-5 text-purple-500" />
                  <Label>Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.monthly_reports.platforms.instagram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('monthly_reports', 'instagram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('instagram', settings.monthly_reports.platforms.instagram.token)}
                    disabled={!settings.monthly_reports.platforms.instagram.enabled || !settings.monthly_reports.platforms.instagram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Instagram Access Token"
                value={settings.monthly_reports.platforms.instagram.token}
                onChange={(e) => updatePlatformToken('monthly_reports', 'instagram', e.target.value)}
              />
            </div>

            {/* Discord */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <Label>Discord</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.monthly_reports.platforms.discord.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('monthly_reports', 'discord', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('discord', settings.monthly_reports.platforms.discord.token)}
                    disabled={!settings.monthly_reports.platforms.discord.enabled || !settings.monthly_reports.platforms.discord.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Discord Webhook URL"
                value={settings.monthly_reports.platforms.discord.token}
                onChange={(e) => updatePlatformToken('monthly_reports', 'discord', e.target.value)}
              />
            </div>

            {/* Telegram */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <Label>Telegram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.monthly_reports.platforms.telegram.enabled}
                    onCheckedChange={(enabled) => updatePlatformEnabled('monthly_reports', 'telegram', enabled)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('telegram', settings.monthly_reports.platforms.telegram.token)}
                    disabled={!settings.monthly_reports.platforms.telegram.enabled || !settings.monthly_reports.platforms.telegram.token}
                  >
                    ทดสอบ
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Telegram Bot Token"
                value={settings.monthly_reports.platforms.telegram.token}
                onChange={(e) => updatePlatformToken('monthly_reports', 'telegram', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;
