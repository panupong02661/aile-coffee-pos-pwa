
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DiscordWebhookGuide = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'คัดลอกแล้ว',
      description: 'คัดลอกข้อความลงคลิปบอร์ดแล้ว',
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          วิธีการตั้งค่า Discord Webhook
        </CardTitle>
        <CardDescription>
          ขั้นตอนการสร้าง Discord Webhook สำหรับรับการแจ้งเตือน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <Badge className="mt-1">1</Badge>
            <div className="flex-1">
              <h4 className="font-medium">เปิด Discord Server Settings</h4>
              <p className="text-sm text-gray-600 mt-1">
                คลิกขวาที่ชื่อเซิร์ฟเวอร์ Discord ของคุณ → เลือก "Server Settings"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1">2</Badge>
            <div className="flex-1">
              <h4 className="font-medium">ไปที่ Integrations</h4>
              <p className="text-sm text-gray-600 mt-1">
                ในเมนูด้านซ้าย เลือก "Integrations" → คลิก "Webhooks"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1">3</Badge>
            <div className="flex-1">
              <h4 className="font-medium">สร้าง Webhook ใหม่</h4>
              <p className="text-sm text-gray-600 mt-1">
                คลิก "New Webhook" → ตั้งชื่อ (เช่น "ระบบแจ้งเตือนร้านอาหาร")
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1">4</Badge>
            <div className="flex-1">
              <h4 className="font-medium">เลือกช่องสำหรับส่งข้อความ</h4>
              <p className="text-sm text-gray-600 mt-1">
                เลือกช่อง (Channel) ที่ต้องการให้ส่งการแจ้งเตือน
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1">5</Badge>
            <div className="flex-1">
              <h4 className="font-medium">คัดลอก Webhook URL</h4>
              <p className="text-sm text-gray-600 mt-1 mb-2">
                คลิก "Copy Webhook URL" และนำ URL มาใส่ในช่อง API Token
              </p>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs font-mono text-gray-700 mb-2">
                  รูปแบบ URL ที่ถูกต้อง:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1">
                    https://discord.com/api/webhooks/[ID]/[TOKEN]
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('https://discord.com/api/webhooks/[ID]/[TOKEN]')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            ตัวอย่างข้อความที่จะส่ง
          </h4>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm">
              <div className="font-medium text-blue-600 mb-1">🔔 แจ้งเตือนออเดอร์ใหม่</div>
              <div>มีออเดอร์ออนไลน์ใหม่เข้ามา!</div>
              <div>ออเดอร์ #12345 จำนวน 450 บาท</div>
              <div className="text-gray-500 text-xs mt-1">จาก: ระบบร้านอาหาร</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            คู่มือ Discord
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://discord.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            เปิด Discord
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscordWebhookGuide;
