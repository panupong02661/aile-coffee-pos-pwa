
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { useState } from 'react';

const NotificationPage = () => {
  const [lineToken, setLineToken] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [lineEnabled, setLineEnabled] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-800 flex items-center gap-3">
            <Bell className="h-8 w-8" />
            แจ้งเตือน
          </h1>
          <p className="text-coffee-600 mt-2">
            จัดการการแจ้งเตือนสำหรับออเดอร์ใหม่และกิจกรรมสำคัญ
          </p>
        </div>

        <div className="grid gap-6">
          {/* LINE Notify */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-green-600" />
                LINE Notify
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="line-enabled">เปิดใช้งาน LINE Notify</Label>
                  <p className="text-sm text-gray-600">รับแจ้งเตือนผ่าน LINE เมื่อมีออเดอร์ใหม่</p>
                </div>
                <Switch
                  id="line-enabled"
                  checked={lineEnabled}
                  onCheckedChange={setLineEnabled}
                />
              </div>
              
              {lineEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="line-token">LINE Notify Token</Label>
                    <Input
                      id="line-token"
                      type="password"
                      placeholder="กรอก LINE Notify Token"
                      value={lineToken}
                      onChange={(e) => setLineToken(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      สามารถสร้าง Token ได้ที่ notify-bot.line.me
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      ทดสอบการแจ้งเตือน
                    </Button>
                    <Button size="sm">
                      บันทึก
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                การแจ้งเตือนทางอีเมล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled">เปิดใช้งานการแจ้งเตือนทางอีเมล</Label>
                  <p className="text-sm text-gray-600">รับแจ้งเตือนผ่านอีเมลเมื่อมีออเดอร์ใหม่</p>
                </div>
                <Switch
                  id="email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-purple-600" />
                การแจ้งเตือนทาง SMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-enabled">เปิดใช้งานการแจ้งเตือนทาง SMS</Label>
                  <p className="text-sm text-gray-600">รับแจ้งเตือนผ่าน SMS เมื่อมีออเดอร์ใหม่</p>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
