
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  MessageSquare, 
  Send, 
  Settings,
  Clock,
  ShoppingCart,
  TrendingUp,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [orderNotifications, setOrderNotifications] = useState({
    line: { enabled: false, token: '' },
    telegram: { enabled: false, token: '', chatId: '' },
    discord: { enabled: false, webhook: '' }
  });

  const [salesReports, setSalesReports] = useState({
    line: { enabled: false, token: '', time: '09:00' },
    telegram: { enabled: false, token: '', chatId: '', time: '09:00' },
    discord: { enabled: false, webhook: '', time: '09:00' }
  });

  const handleTestNotification = async (platform: string, type: 'order' | 'sales') => {
    toast({
      title: "กำลังทดสอบการแจ้งเตือน",
      description: `ส่งข้อความทดสอบไปยัง ${platform} สำหรับ${type === 'order' ? 'ออเดอร์' : 'รายงานยอดขาย'}`,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "การตั้งค่าการแจ้งเตือนถูกบันทึกแล้ว",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            การตั้งค่าการแจ้งเตือน
          </CardTitle>
          <CardDescription>
            จัดการการแจ้งเตือนออเดอร์ออนไลน์และรายงานยอดขายประจำวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">แจ้งเตือนออเดอร์</TabsTrigger>
              <TabsTrigger value="reports">รายงานประจำวัน</TabsTrigger>
            </TabsList>
            
            {/* Order Notifications Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    แจ้งเตือนออเดอร์ออนไลน์เข้าใหม่
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่าการส่งแจ้งเตือนเมื่อมีออเดอร์ใหม่เข้ามา
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* LINE Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <Label className="text-base font-medium">LINE Notify</Label>
                        <Badge variant={orderNotifications.line.enabled ? "default" : "secondary"}>
                          {orderNotifications.line.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={orderNotifications.line.enabled}
                        onCheckedChange={(checked) => 
                          setOrderNotifications(prev => ({
                            ...prev,
                            line: { ...prev.line, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {orderNotifications.line.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="line-token">LINE Notify Token</Label>
                          <Input 
                            id="line-token"
                            placeholder="ใส่ LINE Notify Token"
                            value={orderNotifications.line.token}
                            onChange={(e) => 
                              setOrderNotifications(prev => ({
                                ...prev,
                                line: { ...prev.line, token: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('LINE', 'order')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบการส่ง
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Telegram Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        <Label className="text-base font-medium">Telegram Bot</Label>
                        <Badge variant={orderNotifications.telegram.enabled ? "default" : "secondary"}>
                          {orderNotifications.telegram.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={orderNotifications.telegram.enabled}
                        onCheckedChange={(checked) => 
                          setOrderNotifications(prev => ({
                            ...prev,
                            telegram: { ...prev.telegram, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {orderNotifications.telegram.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="telegram-token">Bot Token</Label>
                          <Input 
                            id="telegram-token"
                            placeholder="ใส่ Telegram Bot Token"
                            value={orderNotifications.telegram.token}
                            onChange={(e) => 
                              setOrderNotifications(prev => ({
                                ...prev,
                                telegram: { ...prev.telegram, token: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="telegram-chat-id">Chat ID</Label>
                          <Input 
                            id="telegram-chat-id"
                            placeholder="ใส่ Chat ID"
                            value={orderNotifications.telegram.chatId}
                            onChange={(e) => 
                              setOrderNotifications(prev => ({
                                ...prev,
                                telegram: { ...prev.telegram, chatId: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('Telegram', 'order')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบการส่ง
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Discord Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <Label className="text-base font-medium">Discord Webhook</Label>
                        <Badge variant={orderNotifications.discord.enabled ? "default" : "secondary"}>
                          {orderNotifications.discord.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={orderNotifications.discord.enabled}
                        onCheckedChange={(checked) => 
                          setOrderNotifications(prev => ({
                            ...prev,
                            discord: { ...prev.discord, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {orderNotifications.discord.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="discord-webhook">Webhook URL</Label>
                          <Input 
                            id="discord-webhook"
                            placeholder="ใส่ Discord Webhook URL"
                            value={orderNotifications.discord.webhook}
                            onChange={(e) => 
                              setOrderNotifications(prev => ({
                                ...prev,
                                discord: { ...prev.discord, webhook: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('Discord', 'order')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบการส่ง
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Daily Reports Tab */}
            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    รายงานสรุปยอดขายประจำวัน
                  </CardTitle>
                  <CardDescription>
                    ตั้งค่าการส่งรายงานยอดขายประจำวันอัตโนมัติ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* LINE Reports */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <Label className="text-base font-medium">LINE Notify</Label>
                        <Badge variant={salesReports.line.enabled ? "default" : "secondary"}>
                          {salesReports.line.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={salesReports.line.enabled}
                        onCheckedChange={(checked) => 
                          setSalesReports(prev => ({
                            ...prev,
                            line: { ...prev.line, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {salesReports.line.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="line-report-token">LINE Notify Token</Label>
                          <Input 
                            id="line-report-token"
                            placeholder="ใส่ LINE Notify Token"
                            value={salesReports.line.token}
                            onChange={(e) => 
                              setSalesReports(prev => ({
                                ...prev,
                                line: { ...prev.line, token: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="line-report-time">เวลาส่งรายงาน</Label>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <Input 
                              id="line-report-time"
                              type="time"
                              value={salesReports.line.time}
                              onChange={(e) => 
                                setSalesReports(prev => ({
                                  ...prev,
                                  line: { ...prev.line, time: e.target.value }
                                }))
                              }
                              className="w-32"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('LINE', 'sales')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบรายงาน
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Telegram Reports */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        <Label className="text-base font-medium">Telegram Bot</Label>
                        <Badge variant={salesReports.telegram.enabled ? "default" : "secondary"}>
                          {salesReports.telegram.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={salesReports.telegram.enabled}
                        onCheckedChange={(checked) => 
                          setSalesReports(prev => ({
                            ...prev,
                            telegram: { ...prev.telegram, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {salesReports.telegram.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="telegram-report-token">Bot Token</Label>
                          <Input 
                            id="telegram-report-token"
                            placeholder="ใส่ Telegram Bot Token"
                            value={salesReports.telegram.token}
                            onChange={(e) => 
                              setSalesReports(prev => ({
                                ...prev,
                                telegram: { ...prev.telegram, token: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="telegram-report-chat-id">Chat ID</Label>
                          <Input 
                            id="telegram-report-chat-id"
                            placeholder="ใส่ Chat ID"
                            value={salesReports.telegram.chatId}
                            onChange={(e) => 
                              setSalesReports(prev => ({
                                ...prev,
                                telegram: { ...prev.telegram, chatId: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="telegram-report-time">เวลาส่งรายงาน</Label>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <Input 
                              id="telegram-report-time"
                              type="time"
                              value={salesReports.telegram.time}
                              onChange={(e) => 
                                setSalesReports(prev => ({
                                  ...prev,
                                  telegram: { ...prev.telegram, time: e.target.value }
                                }))
                              }
                              className="w-32"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('Telegram', 'sales')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบรายงาน
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Discord Reports */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <Label className="text-base font-medium">Discord Webhook</Label>
                        <Badge variant={salesReports.discord.enabled ? "default" : "secondary"}>
                          {salesReports.discord.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <Switch 
                        checked={salesReports.discord.enabled}
                        onCheckedChange={(checked) => 
                          setSalesReports(prev => ({
                            ...prev,
                            discord: { ...prev.discord, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {salesReports.discord.enabled && (
                      <div className="ml-7 space-y-3">
                        <div>
                          <Label htmlFor="discord-report-webhook">Webhook URL</Label>
                          <Input 
                            id="discord-report-webhook"
                            placeholder="ใส่ Discord Webhook URL"
                            value={salesReports.discord.webhook}
                            onChange={(e) => 
                              setSalesReports(prev => ({
                                ...prev,
                                discord: { ...prev.discord, webhook: e.target.value }
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="discord-report-time">เวลาส่งรายงาน</Label>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <Input 
                              id="discord-report-time"
                              type="time"
                              value={salesReports.discord.time}
                              onChange={(e) => 
                                setSalesReports(prev => ({
                                  ...prev,
                                  discord: { ...prev.discord, time: e.target.value }
                                }))
                              }
                              className="w-32"
                            />
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestNotification('Discord', 'sales')}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="w-4 h-4" />
                          ทดสอบรายงาน
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              บันทึกการตั้งค่า
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
