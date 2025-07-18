
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Key, Webhook, TestTube, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  order_status: string | null;
  order_date: string | null;
  delivery_address: string | null;
}

const DeliveryIntegration = () => {
  const [integrations, setIntegrations] = useState<DeliveryIntegration[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const platforms = [
    { id: 'line-man', name: 'LINE MAN', color: 'bg-green-500' },
    { id: 'grab-food', name: 'Grab Food', color: 'bg-green-600' },
    { id: 'foodpanda', name: 'foodpanda', color: 'bg-pink-500' }
  ];

  useEffect(() => {
    fetchIntegrations();
    fetchOrders();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      if (error) throw error;

      // Initialize missing platforms
      const existingPlatforms = data?.map(d => d.platform_name) || [];
      const missingPlatforms = platforms.filter(p => !existingPlatforms.includes(p.name));

      for (const platform of missingPlatforms) {
        const { error: insertError } = await supabase
          .from('delivery_integrations')
          .insert({
            platform_name: platform.name,
            is_enabled: false,
            is_connected: false,
            auto_sync_enabled: false,
            auto_notification_enabled: false,
            connection_status: 'disconnected'
          });

        if (insertError) console.error('Error creating platform:', insertError);
      }

      // Fetch again after initialization
      const { data: updatedData, error: fetchError } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      if (fetchError) throw fetchError;
      setIntegrations(updatedData || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลการเชื่อมต่อได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateIntegration = async (id: string, updates: Partial<DeliveryIntegration>) => {
    try {
      const { error } = await supabase
        .from('delivery_integrations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id ? { ...integration, ...updates } : integration
        )
      );

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าได้รับการบันทึกแล้ว'
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    }
  };

  const testConnection = async (integration: DeliveryIntegration) => {
    if (!integration.api_key || !integration.webhook_url) {
      toast({
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอก API Key และ Webhook URL',
        variant: 'destructive'
      });
      return;
    }

    setTestingConnection(integration.id);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // 70% success rate for demo
      
      await updateIntegration(integration.id, {
        is_connected: isConnected,
        connection_status: isConnected ? 'connected' : 'failed'
      });

      toast({
        title: isConnected ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อไม่สำเร็จ',
        description: isConnected 
          ? `เชื่อมต่อกับ ${integration.platform_name} สำเร็จ` 
          : `ไม่สามารถเชื่อมต่อกับ ${integration.platform_name} ได้`,
        variant: isConnected ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'ทดสอบการเชื่อมต่อไม่สำเร็จ',
        description: 'เกิดข้อผิดพลาดในการทดสอบ',
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const syncOrders = async (integration: DeliveryIntegration) => {
    setSyncing(integration.id);
    try {
      // Simulate order sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await updateIntegration(integration.id, {
        last_sync_at: new Date().toISOString()
      });

      // Refresh orders
      await fetchOrders();

      toast({
        title: 'ซิงค์ออเดอร์สำเร็จ',
        description: `ซิงค์ออเดอร์จาก ${integration.platform_name} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Order sync failed:', error);
      toast({
        title: 'ซิงค์ออเดอร์ไม่สำเร็จ',
        description: 'เกิดข้อผิดพลาดในการซิงค์ออเดอร์',
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const getStatusBadge = (status: string | null, isConnected: boolean) => {
    if (!isConnected || status === 'disconnected' || status === 'failed') {
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />ไม่เชื่อมต่อ</Badge>;
    }
    if (status === 'connected') {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" />เชื่อมต่อแล้ว</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />รอการเชื่อมต่อ</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Delivery Integration</h1>
          <p className="text-muted-foreground">เชื่อมต่อกับแพลตฟอร์มการส่งอาหารออนไลน์</p>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">แพลตฟอร์ม</TabsTrigger>
          <TabsTrigger value="orders">ออเดอร์</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {integrations.map((integration) => {
              const platform = platforms.find(p => p.name === integration.platform_name);
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${platform?.color || 'bg-gray-400'}`}></div>
                        {integration.platform_name}
                      </CardTitle>
                      {getStatusBadge(integration.connection_status, integration.is_connected)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Enable Platform */}
                    <div className="flex items-center justify-between">
                      <Label>เปิดใช้งาน</Label>
                      <Switch
                        checked={integration.is_enabled}
                        onCheckedChange={(checked) =>
                          updateIntegration(integration.id, { is_enabled: checked })
                        }
                      />
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        API Key
                      </Label>
                      <Input
                        type="password"
                        placeholder="กรอก API Key จาก platform"
                        value={integration.api_key || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setIntegrations(prev =>
                            prev.map(int =>
                              int.id === integration.id ? { ...int, api_key: newValue } : int
                            )
                          );
                        }}
                        onBlur={(e) => {
                          updateIntegration(integration.id, { api_key: e.target.value });
                        }}
                      />
                    </div>

                    {/* Webhook URL */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Webhook className="w-4 h-4" />
                        Webhook URL
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://your-webhook-url.com"
                        value={integration.webhook_url || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setIntegrations(prev =>
                            prev.map(int =>
                              int.id === integration.id ? { ...int, webhook_url: newValue } : int
                            )
                          );
                        }}
                        onBlur={(e) => {
                          updateIntegration(integration.id, { webhook_url: e.target.value });
                        }}
                      />
                    </div>

                    {/* Auto Sync */}
                    <div className="flex items-center justify-between">
                      <Label>ซิงค์อัตโนมัติ</Label>
                      <Switch
                        checked={integration.auto_sync_enabled}
                        onCheckedChange={(checked) =>
                          updateIntegration(integration.id, { auto_sync_enabled: checked })
                        }
                      />
                    </div>

                    {/* Auto Notification */}
                    <div className="flex items-center justify-between">
                      <Label>แจ้งเตือนอัตโนมัติ</Label>
                      <Switch
                        checked={integration.auto_notification_enabled}
                        onCheckedChange={(checked) =>
                          updateIntegration(integration.id, { auto_notification_enabled: checked })
                        }
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(integration)}
                        disabled={testingConnection === integration.id}
                        className="flex-1"
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        {testingConnection === integration.id ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncOrders(integration)}
                        disabled={syncing === integration.id || !integration.is_connected}
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {syncing === integration.id ? 'กำลังซิงค์...' : 'ซิงค์ออเดอร์'}
                      </Button>
                    </div>

                    {integration.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        ซิงค์ล่าสุด: {new Date(integration.last_sync_at).toLocaleString('th-TH')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ออเดอร์ล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีออเดอร์</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{order.platform_name}</Badge>
                            <span className="text-sm text-muted-foreground">#{order.platform_order_id}</span>
                          </div>
                          <p className="font-medium">{order.customer_name || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">฿{order.total_amount?.toLocaleString() || '0'}</p>
                          <Badge variant={order.order_status === 'completed' ? 'default' : 'secondary'}>
                            {order.order_status || 'pending'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.order_date ? new Date(order.order_date).toLocaleString('th-TH') : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ความถี่ในการซิงค์ (นาที)</Label>
                  <Input type="number" placeholder="5" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Timeout การเชื่อมต่อ (วินาที)</Label>
                  <Input type="number" placeholder="30" defaultValue="30" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>เปิดใช้ log การซิงค์</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>แจ้งเตือนเมื่อการเชื่อมต่อขัดข้อง</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryIntegration;
