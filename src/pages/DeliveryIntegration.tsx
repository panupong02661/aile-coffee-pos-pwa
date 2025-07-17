
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Truck, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Bell,
  Globe,
  Key,
  TestTube,
  Download,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

interface DeliveryIntegration {
  id: string;
  platform_name: string;
  api_key: string;
  webhook_url: string;
  is_enabled: boolean;
  is_connected: boolean;
  last_sync_at: string;
  auto_sync_enabled: boolean;
  auto_notification_enabled: boolean;
  connection_status: string;
}

interface DeliveryOrder {
  id: string;
  platform_order_id: string;
  platform_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_status: string;
  total_amount: number;
  delivery_fee: number;
  order_date: string;
  synced_at: string;
}

interface SyncLog {
  id: string;
  platform_name: string;
  sync_type: string;
  status: string;
  orders_synced: number;
  error_message: string;
  created_at: string;
}

const platforms = [
  {
    id: 'line_man',
    name: 'LINE MAN',
    color: 'bg-green-500',
    description: 'เชื่อมต่อกับ LINE MAN สำหรับรับออเดอร์อาหาร'
  },
  {
    id: 'grab_food',
    name: 'Grab Food',
    color: 'bg-emerald-500',
    description: 'เชื่อมต่อกับ Grab Food สำหรับรับออเดอร์อาหาร'
  },
  {
    id: 'foodpanda',
    name: 'foodpanda',
    color: 'bg-pink-500',
    description: 'เชื่อมต่อกับ foodpanda สำหรับรับออเดอร์อาหาร'
  }
];

const DeliveryIntegration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [integrations, setIntegrations] = useState<DeliveryIntegration[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncingOrders, setSyncingOrders] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load integrations
      const { data: integrationsData } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      // Load orders
      const { data: ordersData } = await supabase
        .from('delivery_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load sync logs
      const { data: logsData } = await supabase
        .from('delivery_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setIntegrations(integrationsData || []);
      setOrders(ordersData || []);
      setSyncLogs(logsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIntegration = async (platformName: string, updates: Partial<DeliveryIntegration>) => {
    try {
      const existingIntegration = integrations.find(i => i.platform_name === platformName);
      
      if (existingIntegration) {
        const { error } = await supabase
          .from('delivery_integrations')
          .update(updates)
          .eq('platform_name', platformName);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('delivery_integrations')
          .insert({
            platform_name: platformName,
            ...updates
          });

        if (error) throw error;
      }

      await loadData();
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตการตั้งค่าเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    }
  };

  const testConnection = async (platformName: string) => {
    setTestingConnection(platformName);
    
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      await updateIntegration(platformName, {
        is_connected: success,
        connection_status: success ? 'connected' : 'failed'
      });

      // Log the test
      await supabase
        .from('delivery_sync_logs')
        .insert({
          platform_name: platformName,
          sync_type: 'test',
          status: success ? 'success' : 'error',
          error_message: success ? null : 'Connection timeout or invalid credentials'
        });

      toast({
        title: success ? "เชื่อมต่อสำเร็จ" : "เชื่อมต่อไม่สำเร็จ",
        description: success ? `เชื่อมต่อกับ ${platformName} สำเร็จ` : "กรุณาตรวจสอบ API Key และ Webhook URL",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทดสอบการเชื่อมต่อได้",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(null);
      await loadData();
    }
  };

  const syncOrders = async (platformName: string) => {
    setSyncingOrders(platformName);
    
    try {
      const startTime = Date.now();
      
      // Simulate order sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const ordersCount = Math.floor(Math.random() * 10) + 1;
      const mockOrders = Array.from({ length: ordersCount }, (_, i) => ({
        platform_order_id: `${platformName.toUpperCase()}-${Date.now()}-${i}`,
        platform_name: platformName,
        order_data: {
          items: [
            { name: 'กาแฟอเมริกาโน', quantity: 1, price: 60 },
            { name: 'คุกกี้ช็อกโกแลต', quantity: 2, price: 40 }
          ]
        },
        customer_name: `ลูกค้า ${i + 1}`,
        customer_phone: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        delivery_address: `123/45 ซอย${i + 1} ถนนสุขุมวิท กรุงเทพฯ`,
        order_status: 'pending',
        total_amount: 140,
        delivery_fee: 25,
        order_date: new Date().toISOString()
      }));

      // Insert mock orders
      const { error } = await supabase
        .from('delivery_orders')
        .insert(mockOrders);

      if (error) throw error;

      // Log the sync
      await supabase
        .from('delivery_sync_logs')
        .insert({
          platform_name: platformName,
          sync_type: 'manual',
          status: 'success',
          orders_synced: ordersCount,
          sync_duration_ms: Date.now() - startTime
        });

      // Update last sync time
      await updateIntegration(platformName, {
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: "ซิงค์สำเร็จ",
        description: `ซิงค์ออเดอร์ ${ordersCount} รายการจาก ${platformName} เรียบร้อยแล้ว`
      });
    } catch (error) {
      console.error('Error syncing orders:', error);
      
      await supabase
        .from('delivery_sync_logs')
        .insert({
          platform_name: platformName,
          sync_type: 'manual',
          status: 'error',
          orders_synced: 0,
          error_message: 'Sync failed: ' + (error as Error).message
        });

      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถซิงค์ออเดอร์ได้",
        variant: "destructive"
      });
    } finally {
      setSyncingOrders(null);
      await loadData();
    }
  };

  const getIntegration = (platformName: string) => {
    return integrations.find(i => i.platform_name === platformName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-500';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <MainSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-coffee-800 mb-2">
                ระบบ Delivery Integration
              </h1>
              <p className="text-coffee-600">
                เชื่อมต่อและจัดการออเดอร์จากแพลตฟอร์มส่งอาหารต่างๆ
              </p>
            </div>

            <Tabs defaultValue="platforms" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="platforms">แพลตฟอร์ม</TabsTrigger>
                <TabsTrigger value="orders">ออเดอร์</TabsTrigger>
                <TabsTrigger value="logs">ประวัติการซิงค์</TabsTrigger>
                <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
              </TabsList>

              <TabsContent value="platforms" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                  {platforms.map((platform) => {
                    const integration = getIntegration(platform.id);
                    return (
                      <Card key={platform.id} className="border-coffee-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                              <div>
                                <CardTitle className="text-coffee-800">{platform.name}</CardTitle>
                                <CardDescription>{platform.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {integration?.connection_status && getStatusIcon(integration.connection_status)}
                              <Badge variant={integration?.is_enabled ? "default" : "secondary"}>
                                {integration?.is_enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`${platform.id}-api-key`}>
                                <Key className="w-4 h-4 inline mr-2" />
                                API Key
                              </Label>
                              <Input
                                id={`${platform.id}-api-key`}
                                type="password"
                                placeholder="ใส่ API Key"
                                value={integration?.api_key || ''}
                                onChange={(e) => updateIntegration(platform.id, { api_key: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`${platform.id}-webhook`}>
                                <Globe className="w-4 h-4 inline mr-2" />
                                Webhook URL
                              </Label>
                              <Input
                                id={`${platform.id}-webhook`}
                                placeholder="https://your-domain.com/webhook"
                                value={integration?.webhook_url || ''}
                                onChange={(e) => updateIntegration(platform.id, { webhook_url: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={integration?.is_enabled || false}
                                  onCheckedChange={(checked) => updateIntegration(platform.id, { is_enabled: checked })}
                                />
                                <span className="text-sm font-medium">เปิดใช้งานแพลตฟอร์ม</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={integration?.auto_sync_enabled || false}
                                  onCheckedChange={(checked) => updateIntegration(platform.id, { auto_sync_enabled: checked })}
                                />
                                <span className="text-sm font-medium">ซิงค์อัตโนมัติ</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={integration?.auto_notification_enabled || false}
                                  onCheckedChange={(checked) => updateIntegration(platform.id, { auto_notification_enabled: checked })}
                                />
                                <span className="text-sm font-medium">แจ้งเตือนอัตโนมัติ</span>
                              </div>
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(platform.id)}
                                disabled={testingConnection === platform.id || !integration?.api_key}
                              >
                                {testingConnection === platform.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <TestTube className="w-4 h-4 mr-2" />
                                )}
                                ทดสอบการเชื่อมต่อ
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => syncOrders(platform.id)}
                                disabled={
                                  syncingOrders === platform.id || 
                                  !integration?.is_connected || 
                                  !integration?.is_enabled
                                }
                              >
                                {syncingOrders === platform.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <Download className="w-4 h-4 mr-2" />
                                )}
                                ซิงค์ออเดอร์
                              </Button>
                            </div>
                          </div>

                          {integration?.last_sync_at && (
                            <div className="text-xs text-coffee-600">
                              ซิงค์ล่าสุด: {new Date(integration.last_sync_at).toLocaleString('th-TH')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card className="border-coffee-200">
                  <CardHeader>
                    <CardTitle className="text-coffee-800">ออเดอร์ที่ซิงค์แล้ว</CardTitle>
                    <CardDescription>รายการออเดอร์ที่ได้รับจากแพลตฟอร์มต่างๆ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center py-8 text-coffee-600">
                          <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>ยังไม่มีออเดอร์ที่ซิงค์</p>
                          <p className="text-sm">ลองซิงค์ออเดอร์จากแพลตฟอร์มต่างๆ</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border border-coffee-200 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Badge variant="outline">{order.platform_name.toUpperCase()}</Badge>
                                  <span className="font-medium">{order.customer_name}</span>
                                  <span className="text-sm text-coffee-600">{order.platform_order_id}</span>
                                </div>
                                <div className="text-sm text-coffee-600">
                                  <p>{order.delivery_address}</p>
                                  <p>โทร: {order.customer_phone}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">฿{order.total_amount?.toFixed(2)}</div>
                                <div className="text-sm text-coffee-600">
                                  ค่าส่ง: ฿{order.delivery_fee?.toFixed(2)}
                                </div>
                                <Badge 
                                  variant={order.order_status === 'pending' ? 'secondary' : 'default'}
                                  className="mt-1"
                                >
                                  {order.order_status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="space-y-6">
                <Card className="border-coffee-200">
                  <CardHeader>
                    <CardTitle className="text-coffee-800">ประวัติการซิงค์</CardTitle>
                    <CardDescription>บันทึกการซิงค์และการทดสอบการเชื่อมต่อ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {syncLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border border-coffee-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <div className="font-medium">
                                {log.platform_name.toUpperCase()} - {log.sync_type}
                              </div>
                              <div className="text-sm text-coffee-600">
                                {log.error_message || `ซิงค์ ${log.orders_synced} ออเดอร์`}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-coffee-600">
                            {new Date(log.created_at).toLocaleString('th-TH')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="border-coffee-200">
                  <CardHeader>
                    <CardTitle className="text-coffee-800">ตั้งค่าทั่วไป</CardTitle>
                    <CardDescription>การตั้งค่าระบบ Delivery Integration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>ความถี่ในการซิงค์อัตโนมัติ</Label>
                        <select className="w-full p-2 border border-coffee-200 rounded-md">
                          <option value="5">ทุก 5 นาที</option>
                          <option value="10">ทุก 10 นาที</option>
                          <option value="15">ทุก 15 นาที</option>
                          <option value="30">ทุก 30 นาที</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>รูปแบบการแจ้งเตือน</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch />
                            <span className="text-sm">แจ้งเตือนเมื่อมีออเดอร์ใหม่</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch />
                            <span className="text-sm">แจ้งเตือนเมื่อการซิงค์ล้มเหลว</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryIntegration;
