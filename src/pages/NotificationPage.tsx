import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Beat, Blip, DigitalAlarm, Doorbell } from '@/components/icons';

interface NotificationSettings {
  id: string;
  shop_id: string;
  sound_enabled: boolean;
  volume: number;
  duration: number;
  selected_sound_id: string | null;
  online_orders: any;
  daily_reports: any;
  monthly_reports: any;
  created_at: string;
  updated_at: string;
}

const NotificationPage = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationSettings, isLoading, isError } = useQuery(
    ['notificationSettings'],
    async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as NotificationSettings;
    }
  );

  useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings]);

  const updateSettingsMutation = useMutation(
    async (updates: Partial<NotificationSettings>) => {
      if (!settings) {
        throw new Error('Settings not loaded');
      }

      const { data, error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', settings.id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data as NotificationSettings;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notificationSettings']);
        toast({
          title: 'สำเร็จ',
          description: 'บันทึกการตั้งค่าเรียบร้อย',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'ผิดพลาด',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const handleSoundEnabledChange = (checked: boolean) => {
    if (settings) {
      setSettings({ ...settings, sound_enabled: checked });
      updateSettingsMutation.mutate({ sound_enabled: checked });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (settings) {
      const newVolume = value[0];
      setSettings({ ...settings, volume: newVolume });
      updateSettingsMutation.mutate({ volume: newVolume });
    }
  };

  const handleSoundSelection = (soundId: string) => {
    if (settings) {
      setSettings({ ...settings, selected_sound_id: soundId });
      updateSettingsMutation.mutate({ selected_sound_id: soundId });
    }
  };

  if (isLoading) return <div>กำลังโหลด...</div>;
  if (isError) return <div>มีข้อผิดพลาดเกิดขึ้น</div>;
  if (!settings) return <div>ไม่พบการตั้งค่า</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">การตั้งค่าการแจ้งเตือน</h1>
      <div className="space-y-6">
        <div>
          <Label htmlFor="soundEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            เปิด/ปิดเสียง
          </Label>
          <Switch
            id="soundEnabled"
            checked={settings.sound_enabled}
            onCheckedChange={handleSoundEnabledChange}
          />
        </div>
        <div>
          <Label htmlFor="volume" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            ระดับเสียง: {settings.volume}
          </Label>
          <Slider
            id="volume"
            defaultValue={[settings.volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            aria-label="Volume"
          />
        </div>
        <div>
          <Label htmlFor="soundSelection" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            เลือกเสียงแจ้งเตือน
          </Label>
          <Select onValueChange={handleSoundSelection} defaultValue={settings.selected_sound_id || undefined}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกเสียง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beat"><Beat className="mr-2 h-4 w-4" /> Beat</SelectItem>
              <SelectItem value="blip"><Blip className="mr-2 h-4 w-4" /> Blip</SelectItem>
              <SelectItem value="digitalAlarm"><DigitalAlarm className="mr-2 h-4 w-4" /> Digital Alarm</SelectItem>
              <SelectItem value="doorbell"><Doorbell className="mr-2 h-4 w-4" /> Doorbell</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div>
          <h3 className="text-xl font-semibold mb-2">การแจ้งเตือนสำหรับ</h3>
          <div className="grid gap-2">
            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
              <Label htmlFor="onlineOrders">คำสั่งซื้อออนไลน์</Label>
              <Switch id="onlineOrders" defaultChecked={settings.online_orders} />
            </div>
            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
              <Label htmlFor="dailyReports">รายงานประจำวัน</Label>
              <Switch id="dailyReports" defaultChecked={settings.daily_reports} />
            </div>
            <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
              <Label htmlFor="monthlyReports">รายงานประจำเดือน</Label>
              <Switch id="monthlyReports" defaultChecked={settings.monthly_reports} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
