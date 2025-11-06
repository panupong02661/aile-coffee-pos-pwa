import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const LineWebhookGuide = () => {
  const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/line-messaging`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกแล้ว!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔗 Webhook URL</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              คัดลอก URL นี้ไปตั้งค่าใน LINE Developers Console
            </p>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                {webhookUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">📋 วิธีตั้งค่า Webhook</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>เข้า <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LINE Developers Console</a></li>
              <li>เลือก Provider และ Channel ของคุณ</li>
              <li>ไปที่แท็บ "Messaging API"</li>
              <li>ในส่วน "Webhook settings" กด "Edit"</li>
              <li>วาง Webhook URL ที่คัดลอกไว้</li>
              <li>เปิด "Use webhook" เป็น Enabled</li>
              <li>กด "Verify" เพื่อทดสอบการเชื่อมต่อ</li>
              <li>กด "Update"</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍 วิธีดู Event ที่เข้ามา</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              เมื่อมีคนส่งข้อความหา Bot หรือเพิ่ม Bot เข้ากลุ่ม ระบบจะบันทึก Event ไว้ใน Logs
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📊 ดู Logs ได้จาก:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>
                  <span className="font-medium text-foreground">Supabase Dashboard</span>
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>เข้า Supabase Dashboard</li>
                    <li>ไปที่ Edge Functions → line-messaging</li>
                    <li>คลิก "Logs" เพื่อดู Event ที่เข้ามา</li>
                  </ul>
                </li>
                <li className="mt-2">
                  <span className="font-medium text-foreground">ทดสอบเลย</span>
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>ส่งข้อความใดก็ได้หา Bot</li>
                    <li>Bot จะตอบกลับพร้อม User ID</li>
                    <li>หรือเพิ่ม Bot เข้ากลุ่ม → Bot จะส่ง Group ID มาให้</li>
                  </ul>
                </li>
              </ol>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">📝 ตัวอย่าง Event ที่จะเห็นใน Logs:</h4>
              
              <div className="space-y-3">
                <div>
                  <Badge className="mb-2">Text Message Event</Badge>
                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`{
  "type": "message",
  "message": {
    "type": "text",
    "text": "สวัสดี"
  },
  "source": {
    "type": "user",
    "userId": "U627aaae70638b1a8d34cfee2f3d33f84"
  }
}`}
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Group Message Event</Badge>
                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`{
  "type": "message",
  "message": {
    "type": "text",
    "text": "สวัสดี"
  },
  "source": {
    "type": "group",
    "groupId": "C1234567890abcdef1234567890abcdef",
    "userId": "U627aaae70638b1a8d34cfee2f3d33f84"
  }
}`}
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Join Event (เพิ่ม Bot เข้ากลุ่ม)</Badge>
                  <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto">
{`{
  "type": "join",
  "source": {
    "type": "group",
    "groupId": "C1234567890abcdef1234567890abcdef"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">💡 เคล็ดลับ</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>ส่งข้อความหา Bot → รับ User ID ทันที</li>
                <li>เพิ่ม Bot เข้ากลุ่ม → รับ Group ID ทันที</li>
                <li>ดู Logs เพื่อดู Event ทั้งหมดที่เข้ามา</li>
                <li>นำ ID ที่ได้ไปใส่ในหน้า Notification</li>
              </ul>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://developers.line.biz/en/docs/messaging-api/receiving-messages/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            ดูเอกสาร LINE Webhook Events
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
