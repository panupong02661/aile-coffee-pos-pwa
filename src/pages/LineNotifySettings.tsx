
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSetting {
  id?: string;
  platform: 'line' | 'telegram' | 'discord' | 'instagram';
  webhook_url: string;
  daily_enabled: boolean;
  daily_time: string;
  monthly_enabled: boolean;
  monthly_date: number;
  monthly_time: string;
  report_types: string[];
  is_active: boolean;
}

const LineNotifySettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultSetting: NotificationSetting = {
    platform: 'line',
    webhook_url: '',
    daily_enabled: false,
    daily_time: '09:00',
    monthly_enabled: false,
    monthly_date: 1,
    monthly_time: '09:00',
    report_types: ['sales'],
    is_active: true
  };

  const [currentSetting, setCurrentSetting] = useState<NotificationSetting>(defaultSetting);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedSettings = data.map(item => ({
          id: item.id,
          platform: item.platform as 'line' | 'telegram' | 'discord' | 'instagram',
          webhook_url: item.webhook_url,
          daily_enabled: item.daily_enabled,
          daily_time: item.daily_time,
          monthly_enabled: item.monthly_enabled,
          monthly_date: item.monthly_date,
          monthly_time: item.monthly_time,
          report_types: item.report_types || ['sales'],
          is_active: item.is_active
        }));
        setSettings(formattedSettings);
        setCurrentSetting(formattedSettings[0]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async () => {
    setLoading(true);
    try {
      const settingData = {
        platform: currentSetting.platform,
        webhook_url: currentSetting.webhook_url,
        daily_enabled: currentSetting.daily_enabled,
        daily_time: currentSetting.daily_time,
        monthly_enabled: currentSetting.monthly_enabled,
        monthly_date: currentSetting.monthly_date,
        monthly_time: currentSetting.monthly_time,
        report_types: currentSetting.report_types,
        is_active: currentSetting.is_active
      };

      if (currentSetting.id) {
        // อัปเดตการตั้งค่าที่มีอยู่
        const { error } = await supabase
          .from('notification_schedules')
          .update(settingData)
          .eq('id', currentSetting.id);

        if (error) throw error;
      } else {
        // สร้างการตั้งค่าใหม่
        const { data, error } = await supabase
          .from('notification_schedules')
          .insert(settingData)
          .select()
          .single();

        if (error) throw error;
        
        setCurrentSetting({ ...currentSetting, id: data.id });
      }

      await loadSettings();
      toast.success('บันทึกการตั้งค่าสำเร็จ');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-line-notification', {
        body: {
          webhook_url: currentSetting.webhook_url,
          message: `ทดสอบการส่งแจ้งเตือนจาก ${currentSetting.platform.toUpperCase()}\nเวลา: ${new Date().toLocaleString('th-TH')}`,
          platform: currentSetting.platform
        }
      });

      if (error) throw error;
      toast.success('ส่งการทดสอบสำเร็จ');
    } catch (error) {
      console.error('Error testing notification:', error);
      toast.error('ไม่สามารถส่งการทดสอบได้');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleReportTypeChange = (reportType: string, checked: boolean) => {
    const newReportTypes = checked
      ? [...currentSetting.report_types, reportType]
      : currentSetting.report_types.filter(type => type !== reportType);
    
    setCurrentSetting({
      ...currentSetting,
      report_types: newReportTypes
    });
  };

  const handlePlatformChange = (platform: 'line' | 'telegram' | 'discord' | 'instagram') => {
    // หาการตั้งค่าที่มีอยู่สำหรับแพลตฟอร์มนี้
    const existingSetting = settings.find(s => s.platform === platform);
    if (existingSetting) {
      setCurrentSetting(existingSetting);
    } else {
      setCurrentSetting({
        ...defaultSetting,
        platform: platform
      });
    }
  };

  const getPlatformPlaceholder = (platform: string) => {
    switch (platform) {
      case 'line':
        return 'ใส่ LINE Notify Token';
      case 'telegram':
        return 'ใส่ Telegram Bot Token และ Chat ID (format: BOT_TOKEN:CHAT_ID)';
      case 'discord':
        return 'ใส่ Discord Webhook URL';
      case 'instagram':
        return 'ใส่ Instagram API Token';
      default:
        return 'ใส่ Token หรือ URL';
    }
  };

  const getPlatformInstructions = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return (
          <div className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">วิธีตั้งค่า Telegram Bot:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>ค้นหา @BotFather ใน Telegram</li>
              <li>พิมพ์ /newbot และตั้งชื่อ bot</li>
              <li>คัดลอก API Token ที่ได้รับ</li>
              <li>เพิ่ม bot เข้า channel/group หรือหา Chat ID ของตัวเอง</li>
              <li>รูปแบบ: BOT_TOKEN:CHAT_ID</li>
            </ol>
          </div>
        );
      case 'line':
        return (
          <div className="text-sm text-gray-600 mt-2 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">วิธีตั้งค่า LINE Notify:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>เข้าไป notify-bot.line.me</li>
              <li>เลือก "My page" และ "Generate token"</li>
              <li>เลือกห้องที่ต้องการส่งแจ้งเตือน</li>
              <li>คัดลอก Token ที่ได้รับ</li>
            </ol>
          </div>
        );
      case 'discord':
        return (
          <div className="text-sm text-gray-600 mt-2 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium mb-2">วิธีตั้งค่า Discord Webhook:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>เข้า Server Settings > Integrations</li>
              <li>สร้าง Webhook ใหม่</li>
              <li>เลือก channel ที่ต้องการ</li>
              <li>คัดลอก Webhook URL</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-4xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-coffee-800">การแจ้งเตือน</h1>
            <p className="text-coffee-600 mt-2">ตั้งค่าการแจ้งเตือนรายงานประจำวันและประจำเดือนผ่านหลายแพลตฟอร์ม</p>
          </div>

          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">ตั้งค่าการแจ้งเตือน</TabsTrigger>
              <TabsTrigger value="history">ประวัติการส่ง</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="platform">แพลตฟอร์ม</Label>
                    <Select
                      value={currentSetting.platform}
                      onValueChange={handlePlatformChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">LINE Notify</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Webhook URL */}
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Token / Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={currentSetting.webhook_url}
                      onChange={(e) => setCurrentSetting({...currentSetting, webhook_url: e.target.value})}
                      placeholder={getPlatformPlaceholder(currentSetting.platform)}
                    />
                    {getPlatformInstructions(currentSetting.platform)}
                  </div>

                  {/* Daily Reports */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">รายงานประจำวัน</CardTitle>
                        <Switch
                          checked={currentSetting.daily_enabled}
                          onCheckedChange={(checked) => 
                            setCurrentSetting({...currentSetting, daily_enabled: checked})
                          }
                        />
                      </div>
                    </CardHeader>
                    {currentSetting.daily_enabled && (
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="daily_time">เวลาส่งรายงาน</Label>
                            <Input
                              id="daily_time"
                              type="time"
                              value={currentSetting.daily_time}
                              onChange={(e) => setCurrentSetting({...currentSetting, daily_time: e.target.value})}
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Monthly Reports */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">รายงานประจำเดือน</CardTitle>
                        <Switch
                          checked={currentSetting.monthly_enabled}
                          onCheckedChange={(checked) => 
                            setCurrentSetting({...currentSetting, monthly_enabled: checked})
                          }
                        />
                      </div>
                    </CardHeader>
                    {currentSetting.monthly_enabled && (
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="monthly_date">วันที่ส่งรายงาน</Label>
                            <Select
                              value={currentSetting.monthly_date.toString()}
                              onValueChange={(value) => 
                                setCurrentSetting({...currentSetting, monthly_date: parseInt(value)})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                                  <SelectItem key={day} value={day.toString()}>
                                    วันที่ {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monthly_time">เวลาส่งรายงาน</Label>
                            <Input
                              id="monthly_time"
                              type="time"
                              value={currentSetting.monthly_time}
                              onChange={(e) => setCurrentSetting({...currentSetting, monthly_time: e.target.value})}
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Report Types */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ประเภทรายงาน</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { id: 'sales', label: 'รายงานยอดขาย' },
                          { id: 'inventory', label: 'รายงานสต็อค' },
                          { id: 'customers', label: 'รายงานลูกค้า' },
                          { id: 'profit', label: 'รายงานกำไร-ขาดทุน' }
                        ].map(reportType => (
                          <div key={reportType.id} className="flex items-center space-x-2">
                            <Switch
                              checked={currentSetting.report_types.includes(reportType.id)}
                              onCheckedChange={(checked) => 
                                handleReportTypeChange(reportType.id, checked)
                              }
                            />
                            <Label>{reportType.label}</Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button onClick={saveSetting} disabled={loading}>
                      {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={testNotification} 
                      disabled={loading || !currentSetting.webhook_url}
                    >
                      ทดสอบการส่ง
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>ประวัติการส่งแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-coffee-600">
                    ประวัติการส่งแจ้งเตือนจะแสดงที่นี่
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LineNotifySettings;
