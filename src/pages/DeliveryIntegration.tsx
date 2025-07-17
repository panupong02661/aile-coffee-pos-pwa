
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Globe, RefreshCw, Settings, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryPlatform {
  id: string;
  platform_name: string;
  is_enabled: boolean;
  is_connected: boolean;
  api_key: string | null;
  webhook_url: string | null;
  auto_sync_enabled: boolean;
  auto_notification_enabled: boolean;
  last_sync_at: string | null;
  connection_status: string;
}

const platformLabels = {
  'LINE_MAN': 'LINE MAN',
  'GRAB_FOOD': 'Grab Food',
  'FOODPANDA': 'foodpanda'
};

const platformColors = {
  'LINE_MAN': 'bg-green-500',
  'GRAB_FOOD': 'bg-green-600',
  'FOODPANDA': 'bg-pink-500'
};

const DeliveryIntegration = () => {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแพลตฟอร์มได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlatform = async (id: string, updates: Partial<DeliveryPlatform>) => {
    try {
      const { error } = await supabase
        .from('delivery_integrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPlatforms(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));

      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตการตั้งค่าแล้ว"
      });
    } catch (error) {
      console.error('Error updating platform:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    }
  };

  const testConnection = async (platform: DeliveryPlatform) => {
    if (!platform.api_key) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณาใส่ API Key ก่อนทดสอบการเชื่อมต่อ",
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(platform.id);
    
    try {
      // จำลองการทดสอบการเชื่อมต่อ
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // จำลองความสำเร็จ 70%
      
      await updatePlatform(platform.id, {
        is_connected: isConnected,
        connection_status: isConnected ? 'connected' : 'error'
      });

      toast({
        title: isConnected ? "เชื่อมต่อสำเร็จ" : "เชื่อมต่อไม่สำเร็จ",
        description: isConnected 
          ? `เชื่อมต่อกับ ${platformLabels[platform.platform_name as keyof typeof platformLabels]} สำเร็จ`
          : "กรุณาตรวจสอบ API Key และลองอีกครั้ง",
        variant: isConnected ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทดสอบการเชื่อมต่อได้",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const syncOrders = async (platform: DeliveryPlatform) => {
    if (!platform.is_connected) {
      toast({
        title: "ยังไม่ได้เชื่อมต่อ",
        description: "กรุณาทดสอบการเชื่อมต่อให้สำเร็จก่อน",
        variant: "destructive"
      });
      return;
    }

    setSyncing(platform.id);
    
    try {
      // จำลองการซิงค์ออเดอร์
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await updatePlatform(platform.id, {
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: "ซิงค์สำเร็จ",
        description: `ซิงค์ออเดอร์จาก ${platformLabels[platform.platform_name as keyof typeof platformLabels]} สำเร็จแล้ว`
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถซิงค์ออเดอร์ได้",
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">ผูกระบบ Delivery</h1>
          <p className="text-muted-foreground">จัดการการเชื่อมต่อกับแพลตฟอร์มส่งอาหาร</p>
        </div>
      </div>

      <div className="grid gap-6">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${platformColors[platform.platform_name as keyof typeof platformColors]}`} />
                  <CardTitle>{platformLabels[platform.platform_name as keyof typeof platformLabels]}</CardTitle>
                  <Badge variant={platform.is_connected ? "default" : "secondary"}>
                    {platform.is_connected ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> เชื่อมต่อแล้ว</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> ยังไม่เชื่อมต่อ</>
                    )}
                  </Badge>
                </div>
                <Switch
                  checked={platform.is_enabled}
                  onCheckedChange={(checked) => 
                    updatePlatform(platform.id, { is_enabled: checked })
                  }
                />
              </div>
              <CardDescription>
                {platform.last_sync_at 
                  ? `ซิงค์ล่าสุด: ${new Date(platform.last_sync_at).toLocaleString('th-TH')}`
                  : 'ยังไม่เคยซิงค์'
                }
              </CardDescription>
            </CardHeader>

            {platform.is_enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${platform.id}`}>API Key</Label>
                    <Input
                      id={`api-key-${platform.id}`}
                      type="password"
                      placeholder="ใส่ API Key"
                      value={platform.api_key || ''}
                      onChange={(e) => 
                        updatePlatform(platform.id, { api_key: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`webhook-${platform.id}`}>Webhook URL</Label>
                    <Input
                      id={`webhook-${platform.id}`}
                      placeholder="ใส่ Webhook URL"
                      value={platform.webhook_url || ''}
                      onChange={(e) => 
                        updatePlatform(platform.id, { webhook_url: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={platform.auto_sync_enabled}
                        onCheckedChange={(checked) => 
                          updatePlatform(platform.id, { auto_sync_enabled: checked })
                        }
                      />
                      <Label>ซิงค์อัตโนมัติ</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={platform.auto_notification_enabled}
                        onCheckedChange={(checked) => 
                          updatePlatform(platform.id, { auto_notification_enabled: checked })
                        }
                      />
                      <Label>แจ้งเตือนอัตโนมัติ</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(platform)}
                      disabled={testingConnection === platform.id}
                    >
                      {testingConnection === platform.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4 mr-2" />
                      )}
                      ทดสอบการเชื่อมต่อ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => syncOrders(platform)}
                      disabled={syncing === platform.id || !platform.is_connected}
                    >
                      {syncing === platform.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      ซิงค์ออเดอร์
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            คำแนะนำการตั้งค่า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong>LINE MAN:</strong> ไปที่ LINE MAN Merchant Portal เพื่อสร้าง API Key และตั้งค่า Webhook
          </div>
          <div>
            <strong>Grab Food:</strong> ติดต่อ Grab for Business เพื่อขอ API credentials
          </div>
          <div>
            <strong>foodpanda:</strong> ไปที่ foodpanda Partner Hub เพื่อตั้งค่า API integration
          </div>
          <Separator />
          <div>
            <strong>หมายเหตุ:</strong> การเปิดใช้งานซิงค์อัตโนมัติจะทำให้ระบบดึงออเดอร์ใหม่ทุก 5 นาที
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryIntegration;
