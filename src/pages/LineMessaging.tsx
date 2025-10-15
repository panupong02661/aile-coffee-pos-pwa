import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Send, Copy, CheckCircle2, MessageSquare, Users, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LineMessaging = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Get webhook URL
  useState(() => {
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${projectUrl}/functions/v1/line-messaging`;
    setWebhookUrl(url);
  });

  const handleSendMessage = async () => {
    if (!userId.trim() || !message.trim()) {
      toast.error("กรุณากรอก User ID และข้อความ");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('line-messaging', {
        body: {
          action: 'send',
          userId: userId.trim(),
          message: message.trim()
        }
      });

      if (error) throw error;

      toast.success("ส่งข้อความสำเร็จ! ✨");
      setMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`ส่งข้อความไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error("กรุณากรอกข้อความ");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('line-messaging', {
        body: {
          action: 'broadcast',
          message: message.trim()
        }
      });

      if (error) throw error;

      toast.success("ส่งข้อความไปยังทุกคนสำเร็จ! 🎉");
      setMessage("");
    } catch (error: any) {
      console.error('Error broadcasting message:', error);
      toast.error(`ส่งข้อความไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleGetProfile = async () => {
    if (!userId.trim()) {
      toast.error("กรุณากรอก User ID");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('line-messaging', {
        body: {
          action: 'getProfile',
          userId: userId.trim()
        }
      });

      if (error) throw error;

      console.log('Profile:', data);
      toast.success(`ชื่อ: ${data.profile.displayName}\nสถานะ: ${data.profile.statusMessage || 'ไม่มี'}`);
    } catch (error: any) {
      console.error('Error getting profile:', error);
      toast.error(`ไม่สามารถดึงข้อมูลได้: ${error.message}`);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("คัดลอก Webhook URL แล้ว");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">LINE Messaging API</h1>
        <p className="text-muted-foreground">
          ส่งข้อความและจัดการ LINE Official Account
        </p>
      </div>

      {/* Webhook URL Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Webhook URL
          </CardTitle>
          <CardDescription>
            นำ URL นี้ไปตั้งค่าใน LINE Developers Console
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              value={webhookUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              onClick={copyWebhookUrl}
              variant="outline"
              size="icon"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-sm font-semibold mb-2">📝 วิธีตั้งค่า Webhook:</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>ไปที่ <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LINE Developers Console</a></li>
              <li>เลือก Channel ของคุณ → แท็บ "Messaging API"</li>
              <li>หา "Webhook settings" → กด "Edit"</li>
              <li>วาง Webhook URL ด้านบน</li>
              <li>เปิด "Use webhook" → กด "Verify" → "Update"</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            ส่งข้อความเฉพาะบุคคล
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            ส่งข้อความหมู่
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>ส่งข้อความถึงผู้ใช้</CardTitle>
              <CardDescription>
                ส่งข้อความไปยังผู้ใช้คนใดคนหนึ่ง
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">LINE User ID</Label>
                <Input
                  id="userId"
                  placeholder="ใส่ LINE User ID ที่ต้องการส่งข้อความ"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 คุณจะได้รับ User ID จาก webhook เมื่อผู้ใช้ส่งข้อความมาหาคุณ
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">ข้อความ</Label>
                <Textarea
                  id="message"
                  placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? "กำลังส่ง..." : "ส่งข้อความ"}
                </Button>
                <Button
                  onClick={handleGetProfile}
                  variant="outline"
                  disabled={!userId.trim()}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  ดูโปรไฟล์
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>ส่งข้อความหมู่ (Broadcast)</CardTitle>
              <CardDescription>
                ส่งข้อความไปยังผู้ใช้ทุกคนที่เพิ่มเพื่อนกับ Bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-message">ข้อความ</Label>
                <Textarea
                  id="broadcast-message"
                  placeholder="พิมพ์ข้อความที่ต้องการส่งหาทุกคน..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <p className="text-sm font-semibold mb-1">⚠️ คำเตือน</p>
                <p className="text-sm">
                  การส่งข้อความแบบ Broadcast จะส่งไปยังผู้ใช้ทุกคนที่เพิ่มเพื่อนกับ Bot ของคุณ
                  กรุณาตรวจสอบข้อความก่อนส่ง
                </p>
              </div>

              <Button
                onClick={handleBroadcast}
                disabled={isSending}
                className="w-full"
                variant="default"
              >
                <Users className="w-4 h-4 mr-2" />
                {isSending ? "กำลังส่ง..." : "ส่งข้อความหมู่"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">💡 เคล็ดลับการใช้งาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>รับ User ID:</strong> เมื่อผู้ใช้ส่งข้อความมาหา Bot ระบบจะแสดง User ID ใน console logs</p>
          <p>• <strong>ทดสอบ Webhook:</strong> ส่งข้อความไปหา Bot และตรวจสอบ logs ใน Supabase Edge Function</p>
          <p>• <strong>Rich Message:</strong> LINE รองรับข้อความหลายรูปแบบ เช่น รูปภาพ, ปุ่มกด, Flex Message</p>
          <p>• <strong>Broadcast Limit:</strong> LINE มีข้อจำกัดจำนวนข้อความ broadcast ตามแพลนที่ใช้</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LineMessaging;
