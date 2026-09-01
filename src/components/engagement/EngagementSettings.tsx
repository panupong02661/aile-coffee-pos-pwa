
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Settings, Stamp, PartyPopper, RotateCcw, Gift, Calendar, Palette, Bell, Crown } from 'lucide-react';

const EngagementSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('engagement_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (data) setSettings(data);
    setLoading(false);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('engagement_settings')
      .update({
        loyalty_mode: settings.loyalty_mode,
        stamp_card_enabled: settings.stamp_card_enabled,
        festival_events_enabled: settings.festival_events_enabled,
        spin_wheel_enabled: settings.spin_wheel_enabled,
        advent_calendar_enabled: settings.advent_calendar_enabled,
        gift_box_enabled: settings.gift_box_enabled,
        tier_rewards_enabled: settings.tier_rewards_enabled,
        festival_themes_enabled: settings.festival_themes_enabled,
        push_notifications_enabled: settings.push_notifications_enabled,
      })
      .eq('id', settings.id);
    
    setSaving(false);
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'บันทึกสำเร็จ', description: 'อัปเดตการตั้งค่าเรียบร้อยแล้ว' });
    }
  };

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;
  if (!settings) return <div className="text-center py-8">ไม่พบข้อมูลการตั้งค่า</div>;

  const featureToggles = [
    { key: 'stamp_card_enabled', label: 'บัตรสะสมแสตมป์', icon: Stamp, description: 'เปิดใช้ระบบบัตรสะสมแสตมป์สำหรับลูกค้า' },
    { key: 'festival_events_enabled', label: 'กิจกรรมเทศกาล (อั่งเปา)', icon: PartyPopper, description: 'เปิดใช้กิจกรรมสุ่มรางวัลตามเทศกาล' },
    { key: 'spin_wheel_enabled', label: 'วงล้อนำโชค', icon: RotateCcw, description: 'เปิดใช้วงล้อหมุนสุ่มรางวัล' },
    { key: 'advent_calendar_enabled', label: 'Advent Calendar', icon: Calendar, description: 'เปิดใช้ปฏิทินเปิดช่องรับรางวัลรายวัน' },
    { key: 'gift_box_enabled', label: 'สุ่มกล่องของขวัญ', icon: Gift, description: 'เปิดใช้การสุ่มเลือกกล่องรับรางวัล' },
    { key: 'tier_rewards_enabled', label: 'รางวัลพิเศษตาม Tier', icon: Crown, description: 'แสดงรางวัลพิเศษเฉพาะระดับสมาชิก' },
    { key: 'festival_themes_enabled', label: 'ธีมเทศกาล', icon: Palette, description: 'เปลี่ยนหน้าตาแอปตามเทศกาล' },
    { key: 'push_notifications_enabled', label: 'แจ้งเตือนลูกค้า', icon: Bell, description: 'ส่งการแจ้งเตือนเมื่อมีกิจกรรมใหม่' },
  ];

  return (
    <div className="space-y-6">
      {/* Loyalty Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            โหมด Loyalty
          </CardTitle>
          <CardDescription>
            เลือกระบบสะสมที่ต้องการใช้ — ถ้าเลือก "บัตรแสตมป์" ระบบแต้มสะสมจะถูกปิดเพื่อไม่ให้ซ้ำซ้อน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.loyalty_mode} onValueChange={(v) => updateSetting('loyalty_mode', v)}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">🔢 ระบบแต้มสะสม (Points) อย่างเดียว</SelectItem>
              <SelectItem value="stamp_card">🎫 บัตรสะสมแสตมป์ อย่างเดียว</SelectItem>
              <SelectItem value="both_separate">🔢🎫 ใช้ทั้งสองระบบ (แยกกัน)</SelectItem>
            </SelectContent>
          </Select>
          
          {settings.loyalty_mode === 'stamp_card' && (
            <p className="mt-2 text-sm text-amber-600">
              ⚠️ เมื่อเลือกโหมด "บัตรแสตมป์อย่างเดียว" ระบบแต้มสะสมจะไม่ทำงาน
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>เปิด/ปิด ฟีเจอร์</CardTitle>
          <CardDescription>ควบคุมฟีเจอร์ Engagement ที่ต้องการเปิดใช้งาน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureToggles.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">{feature.label}</Label>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[feature.key]}
                    onCheckedChange={(v) => updateSetting(feature.key, v)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </div>
  );
};

export default EngagementSettings;
