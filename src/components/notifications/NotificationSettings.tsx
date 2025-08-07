
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, Smartphone, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';

interface NotificationSettingsProps {
  settings: {
    orders: boolean;
    promotions: boolean;
    inventory: boolean;
    system: boolean;
    marketing: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [advancedSettings, setAdvancedSettings] = useState({
    sound: true,
    vibration: true,
    lockScreen: true,
    quietHours: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('notificationAdvancedSettings');
    if (stored) {
      setAdvancedSettings(JSON.parse(stored));
    }
  }, []);

  const toggleSetting = (key: string, isAdvanced: boolean = false) => {
    if (isAdvanced) {
      const newSettings = {
        ...advancedSettings,
        [key]: !advancedSettings[key as keyof typeof advancedSettings]
      };
      setAdvancedSettings(newSettings);
      localStorage.setItem('notificationAdvancedSettings', JSON.stringify(newSettings));
    } else {
      const newSettings = {
        ...settings,
        [key]: !settings[key as keyof typeof settings]
      };
      onSettingsChange(newSettings);
    }
    
    toast({
      title: "บันทึกการตั้งค่าแล้ว! ⚙️",
      description: "การเปลี่ยนแปลงจะมีผลทันที",
    });
  };

  const resetToDefault = () => {
    const defaultSettings = {
      orders: true,
      promotions: true,
      inventory: false,
      system: true,
      marketing: false
    };
    
    const defaultAdvanced = {
      sound: true,
      vibration: true,
      lockScreen: true,
      quietHours: false
    };

    onSettingsChange(defaultSettings);
    setAdvancedSettings(defaultAdvanced);
    localStorage.setItem('notificationAdvancedSettings', JSON.stringify(defaultAdvanced));
    
    toast({
      title: "รีเซ็ตการตั้งค่าแล้ว! 🔄",
      description: "กลับสู่การตั้งค่าเริ่มต้น",
    });
  };

  const settingsConfig = [
    { 
      key: 'orders', 
      label: 'ออเดอร์และการสั่งซื้อ', 
      desc: 'แจ้งเตือนเกี่ยวกับสถานะออเดอร์', 
      icon: Bell 
    },
    { 
      key: 'promotions', 
      label: 'โปรโมชั่นและส่วนลด', 
      desc: 'ข้อเสนอพิเศษและส่วนลด', 
      icon: Bell 
    },
    { 
      key: 'inventory', 
      label: 'สินค้าคงคลัง', 
      desc: 'แจ้งเตือนสต็อกสินค้า', 
      icon: Bell 
    },
    { 
      key: 'system', 
      label: 'ระบบและการบำรุงรักษา', 
      desc: 'อัพเดทระบบและการแจ้งเตือนสำคัญ', 
      icon: Bell 
    },
    { 
      key: 'marketing', 
      label: 'การตลาดและกิจกรรม', 
      desc: 'กิจกรรมพิเศษและข่าวสาร', 
      icon: Bell 
    }
  ];

  const advancedConfig = [
    { 
      key: 'sound', 
      label: 'เสียงการแจ้งเตือน', 
      desc: 'เปิด/ปิดเสียงการแจ้งเตือน',
      icon: Volume2
    },
    { 
      key: 'vibration', 
      label: 'การสั่นของเครื่อง', 
      desc: 'สั่นเครื่องเมื่อได้รับการแจ้งเตือน',
      icon: Smartphone
    },
    { 
      key: 'lockScreen', 
      label: 'แสดงบนหน้าจอล็อก', 
      desc: 'แสดงการแจ้งเตือนบนหน้าจอล็อก',
      icon: Bell
    },
    { 
      key: 'quietHours', 
      label: 'โหมดไม่รบกวน', 
      desc: 'หยุดการแจ้งเตือนเวลา 22:00-08:00',
      icon: BellOff
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">ประเภทการแจ้งเตือน</h4>
        <div className="space-y-4">
          {settingsConfig.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch 
                checked={settings[key as keyof typeof settings]}
                onCheckedChange={() => toggleSetting(key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">การตั้งค่าขั้นสูง</h4>
        <div className="space-y-4">
          {advancedConfig.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch 
                checked={advancedSettings[key as keyof typeof advancedSettings]}
                onCheckedChange={() => toggleSetting(key, true)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={resetToDefault} variant="outline" className="w-full">
          รีเซ็ตการตั้งค่าเริ่มต้น
        </Button>
      </div>
    </div>
  );
};
