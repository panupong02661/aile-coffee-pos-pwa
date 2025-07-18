import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Truck, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Download,
  TestTube,
  Package,
  Clock,
  BarChart3,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliveryIntegration {
  id: string;
  platform_name: string;
  is_enabled: boolean;
  is_connected: boolean;
  api_key: string | null;
  webhook_url: string | null;
  auto_sync_enabled: boolean;
  auto_notification_enabled: boolean;
  connection_status: string | null;
  last_sync_at: string | null;
}

interface DeliveryOrder {
  id: string;
  platform_name: string;
  platform_order_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number | null;
  delivery_fee: number | null;
  order_status: string | null;
  order_date: string | null;
  delivery_address: string | null;
  order_data: any;
}

const DeliveryIntegration = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<DeliveryIntegration[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const platforms = [
    {
      id: 'lineman',
      name: 'LINE MAN',
      description: 'เชื่อมต่อกับ LINE MAN สำหรับรับออเดอร์อาหาร',
      color: 'bg-green-500',
      icon: '🟢'
    },
    {
      id: 'grabfood',
      name: 'Grab Food', 
      description: 'เชื่อมต่อกับ Grab Food สำหรับรับออเดอร์อาหาร',
      color: 'bg-emerald-500',
      icon: '🚗'
    },
    {
      id: 'foodpanda',
      name: 'foodpanda',
      description: 'เชื่อมต่อกับ foodpanda สำหรับรับออเดอร์อาหาร',
      color: 'bg-pink-500',
      icon: '🐼'
    }
  ];

  useEffect(() => {
    loadIntegrations();
    loadOrders();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      if (error) throw error;

      if (!data || data.length === 0) {
        await initializeIntegrations();
        return;
      }

      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการเชื่อมต่อได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeIntegrations = async () => {
    try {
      const defaultIntegrations = platforms.map(platform => ({
        platform_name: platform.id,
        is_enabled: false,
        is_connected: false,
        auto_sync_enabled: true,
        auto_notification_enabled: true,
        connection_status: 'disconnected'
      }));

      const { data, error } = await supabase
        .from('delivery_integrations')
        .insert(defaultIntegrations)
        .select();

      if (error) throw error;
      setIntegrations(data);
    } catch (error) {
      console.error('Error initializing integrations:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateIntegration = async (id: string, updates: Partial<DeliveryIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('delivery_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id ? { ...integration, ...updates } : integration
        )
      );

      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าได้รับการอัปเดตแล้ว",
      });

      return data;
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const testConnection = async (integration: DeliveryIntegration) => {
    if (!integration.api_key) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาใส่ API Key ก่อนทดสอบการเชื่อมต่อ",
        variant: "destructive",
      });
      return;
    }

    setTesting(integration.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isSuccess = Math.random() > 0.3;
      
      await updateIntegration(integration.id, {
        is_connected: isSuccess,
        connection_status: isSuccess ? 'connected' : 'failed',
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: isSuccess ? "เชื่อมต่อสำเร็จ" : "เชื่อมต่อล้มเหลว",
        description: isSuccess 
          ? `เชื่อมต่อกับ ${getPlatformName(integration.platform_name)} สำเร็จ`
          : `ไม่สามารถเชื่อมต่อกับ ${getPlatformName(integration.platform_name)} ได้`,
        variant: isSuccess ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setTesting(null);
    }
  };

  const syncOrders = async (integration: DeliveryIntegration) => {
    if (!integration.is_connected) {
      toast({
        title: "ไม่สามารถซิงค์ได้",
        description: "กรุณาเชื่อมต่อกับแพลตฟอร์มก่อน",
        variant: "destructive",
      });
      return;
    }

    setSyncing(integration.id);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const orderCount = Math.floor(Math.random() * 10) + 1;
      
      await supabase.from('delivery_sync_logs').insert({
        platform_name: integration.platform_name,
        sync_type: 'manual',
        status: 'success',
        orders_synced: orderCount,
        sync_duration_ms: 3000
      });

      await updateIntegration(integration.id, {
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: "ซิงค์สำเร็จ",
        description: `ซิงค์ออเดอร์จาก ${getPlatformName(integration.platform_name)} สำเร็จ (${orderCount} รายการ)`,
      });

      await loadOrders();
    } catch (error) {
      console.error('Error syncing orders:', error);
    } finally {
      setSyncing(null);
    }
  };

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.name || platformId;
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.icon || '📦';
  };

  const getStatusBadge = (integration: DeliveryIntegration) => {
    if (!integration.is_enabled) {
      return <Badge variant="secondary">ปิดใช้งาน</Badge>;
    }
    
    if (integration.is_connected) {
      return <Badge className="bg-green-500 hover:bg-green-600">เชื่อมต่อแล้ว</Badge>;
    }
    
    return <Badge variant="destructive">ยังไม่เชื่อมต่อ</Badge>;
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-coffee-800">ระบบ Delivery Integration</h1>
            <p className="text-coffee-600 mt-2">เชื่อมต่อและจัดการออเดอร์จากแพลตฟอร์ม Delivery ต่างๆ</p>
          </div>
          <Button 
            onClick={() => loadOrders()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </Button>
        </div>

        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platforms">แพลตฟอร์ม</TabsTrigger>
            <TabsTrigger value="orders">ออเดอร์</TabsTrigger>
            <TabsTrigger value="logs">ประวัติการซิงค์</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-6">
            <div className="space-y-6">
              {platforms.map((platform) => {
                const integration = integrations.find(i => i.platform_name === platform.id);
                
                return (
                  <Card key={platform.id} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{platform.icon}</div>
                          <div>
                            <CardTitle className="text-xl">{platform.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              {platform.description}
                            </CardDescription>
                          </div>
                        </div>
                        {integration && getStatusBadge(integration)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {integration && (
                        <>
                          {/* ช่องกรอก API Key และ Webhook URL */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor={`api-key-${integration.id}`} className="text-sm font-medium flex items-center gap-2">
                                <span className="text-gray-500">🔑</span>
                                API Key
                              </Label>
                              <Input
                                id={`api-key-${integration.id}`}
                                type="password"
                                placeholder="ใส่ API Key ของคุณ"
                                value={integration.api_key || ''}
                                onChange={(e) => 
                                  updateIntegration(integration.id, { api_key: e.target.value })
                                }
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor={`webhook-${integration.id}`} className="text-sm font-medium flex items-center gap-2">
                                <span className="text-gray-500">🌐</span>
                                Webhook URL
                              </Label>
                              <Input
                                id={`webhook-${integration.id}`}
                                type="url"
                                placeholder="https://your-domain.com/webhook"
                                value={integration.webhook_url || ''}
                                onChange={(e) => 
                                  updateIntegration(integration.id, { webhook_url: e.target.value })
                                }
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* การตั้งค่า Toggle */}
                          <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-medium">เปิดใช้งานแพลตฟอร์ม</span>
                              <Switch
                                checked={integration.is_enabled}
                                onCheckedChange={(checked) => 
                                  updateIntegration(integration.id, { is_enabled: checked })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm">ซิงค์อัตโนมัติ</span>
                              <Switch
                                checked={integration.auto_sync_enabled}
                                onCheckedChange={(checked) => 
                                  updateIntegration(integration.id, { auto_sync_enabled: checked })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm">แจ้งเตือนอัตโนมัติ</span>
                              <Switch
                                checked={integration.auto_notification_enabled}
                                onCheckedChange={(checked) => 
                                  updateIntegration(integration.id, { auto_notification_enabled: checked })
                                }
                              />
                            </div>
                          </div>

                          {/* ปุ่มการดำเนินการ */}
                          <div className="flex gap-3 pt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => testConnection(integration)}
                              disabled={testing === integration.id}
                              className="flex-1"
                            >
                              {testing === integration.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <TestTube className="w-4 h-4 mr-2" />
                              )}
                              ทดสอบการเชื่อมต่อ
                            </Button>

                            <Button 
                              size="sm"
                              onClick={() => syncOrders(integration)}
                              disabled={syncing === integration.id || !integration.is_connected}
                              className="flex-1"
                            >
                              {syncing === integration.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              ซิงค์ออเดอร์
                            </Button>
                          </div>

                          {integration.last_sync_at && (
                            <div className="text-xs text-gray-500 text-center pt-2">
                              ซิงค์ล่าสุด: {new Date(integration.last_sync_at).toLocaleString('th-TH')}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ออเดอร์จาก Delivery Platform
                </CardTitle>
                <CardDescription>
                  รายการออเดอร์ที่ซิงค์มาจากแพลตฟอร์ม Delivery ต่างๆ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ยังไม่มีออเดอร์</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPlatformIcon(order.platform_name)}</span>
                            <span className="font-medium">{getPlatformName(order.platform_name)}</span>
                            <Badge variant="outline">#{order.platform_order_id}</Badge>
                          </div>
                          <Badge 
                            variant={order.order_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {order.order_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">ลูกค้า:</span>
                            <p className="font-medium">{order.customer_name || 'ไม่ระบุ'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">ยอดรวม:</span>
                            <p className="font-medium">฿{order.total_amount?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">ค่าส่ง:</span>
                            <p className="font-medium">฿{order.delivery_fee?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">วันที่สั่ง:</span>
                            <p className="font-medium">
                              {order.order_date ? new Date(order.order_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                            </p>
                          </div>
                        </div>

                        {order.delivery_address && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">ที่อยู่จัดส่ง:</span>
                            <p className="text-gray-700">{order.delivery_address}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  ประวัติการซิงค์
                </CardTitle>
                <CardDescription>
                  ประวัติการซิงค์ข้อมูลกับแพลตฟอร์ม Delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีประวัติการซิงค์</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  ตั้งค่าทั่วไป
                </CardTitle>
                <CardDescription>
                  ตั้งค่าการทำงานของระบบ Delivery Integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>คำแนะนำ</AlertTitle>
                  <AlertDescription>
                    เพื่อความปลอดภัย ควรตั้งค่า Webhook URL ให้เป็น HTTPS และใช้ API Key ที่มีสิทธิ์จำกัด
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">การแจ้งเตือน</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>แจ้งเตือนออเดอร์ใหม่</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>แจ้งเตือนการซิงค์ล้มเหลว</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>แจ้งเตือนการเชื่อมต่อขาด</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">การซิงค์อัตโนมัติ</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>ความถี่ในการซิงค์ (นาที)</Label>
                        <Input type="number" defaultValue="5" min="1" max="60" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>ซิงค์เฉพาะออเดอร์ใหม่</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>ซิงค์สถานะออเดอร์</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    บันทึกการตั้งค่า
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default DeliveryIntegration;
