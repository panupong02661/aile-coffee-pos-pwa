
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Truck, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const DeliveryIntegration = () => {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const platformLabels = {
    'LINE_MAN': 'LINE MAN',
    'GRAB_FOOD': 'Grab Food',
    'FOODPANDA': 'foodpanda'
  };

  const platformColors = {
    'LINE_MAN': 'bg-green-500',
    'GRAB_FOOD': 'bg-blue-500',
    'FOODPANDA': 'bg-pink-500'
  };

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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlatform = async (platformId: string, updates: Partial<DeliveryPlatform>) => {
    try {
      const { error } = await supabase
        .from('delivery_integrations')
        .update(updates)
        .eq('id', platformId);

      if (error) throw error;

      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, ...updates } : p
      ));

      toast({
        title: "บันทึกสำเร็จ",
        description: "การตั้งค่าถูกบันทึกแล้ว",
      });
    } catch (error) {
      console.error('Error updating platform:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive",
      });
    }
  };

  const testConnection = async (platform: DeliveryPlatform) => {
    if (!platform.api_key) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ API Key ก่อนทดสอบการเชื่อมต่อ",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(platform.id);
    
    try {
      // จำลองการทดสอบการเชื่อมต่อ
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // 70% chance of success
      
      await updatePlatform(platform.id, {
        is_connected: isConnected,
        connection_status: isConnected ? 'connected' : 'error'
      });

      toast({
        title: isConnected ? "เชื่อมต่อสำเร็จ" : "เชื่อมต่อไม่สำเร็จ",
        description: isConnected 
          ? `เชื่อมต่อกับ ${platformLabels[platform.platform_name as keyof typeof platformLabels]} สำเร็จ`
          : "กรุณาตรวจสอบ API Key และลองใหม่อีกครั้ง",
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทดสอบการเชื่อมต่อได้",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const syncOrders = async (platform: DeliveryPlatform) => {
    if (!platform.is_connected) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเชื่อมต่อแพลตฟอร์มก่อนซิงค์ออเดอร์",
        variant: "destructive",
      });
      return;
    }

    try {
      // จำลองการซิงค์ออเดอร์
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await updatePlatform(platform.id, {
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: "ซิงค์สำเร็จ",
        description: `ซิงค์ออเดอร์จาก ${platformLabels[platform.platform_name as keyof typeof platformLabels]} สำเร็จ`,
      });
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถซิงค์ออเดอร์ได้",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'เชื่อมต่อแล้ว';
      case 'error':
        return 'เชื่อมต่อไม่สำเร็จ';
      default:
        return 'ยังไม่ได้เชื่อมต่อ';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b p-6">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ผูกระบบ Delivery</h1>
            <p className="text-gray-600 mt-1">จัดการการเชื่อมต่อกับแพลตฟอร์ม Delivery</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {platforms.map((platform) => (
            <Card key={platform.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${platformColors[platform.platform_name as keyof typeof platformColors]}`} />
                    <CardTitle className="text-xl">
                      {platformLabels[platform.platform_name as keyof typeof platformLabels]}
                    </CardTitle>
                    <Badge variant={platform.is_enabled ? "default" : "secondary"}>
                      {platform.is_enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(platform.connection_status)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(platform.connection_status)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`enabled-${platform.id}`}>เปิดใช้งานแพลตฟอร์ม</Label>
                  <Switch
                    id={`enabled-${platform.id}`}
                    checked={platform.is_enabled}
                    onCheckedChange={(checked) => 
                      updatePlatform(platform.id, { is_enabled: checked })
                    }
                  />
                </div>

                {platform.is_enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`api-key-${platform.id}`}>API Key</Label>
                        <Input
                          id={`api-key-${platform.id}`}
                          type="password"
                          value={platform.api_key || ''}
                          onChange={(e) => 
                            updatePlatform(platform.id, { api_key: e.target.value })
                          }
                          placeholder="ใส่ API Key"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`webhook-${platform.id}`}>Webhook URL</Label>
                        <Input
                          id={`webhook-${platform.id}`}
                          value={platform.webhook_url || ''}
                          onChange={(e) => 
                            updatePlatform(platform.id, { webhook_url: e.target.value })
                          }
                          placeholder="ใส่ Webhook URL"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button 
                        onClick={() => testConnection(platform)}
                        disabled={testingConnection === platform.id}
                        variant="outline"
                      >
                        {testingConnection === platform.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            กำลังทดสอบ...
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            ทดสอบการเชื่อมต่อ
                          </>
                        )}
                      </Button>

                      {platform.is_connected && (
                        <Button 
                          onClick={() => syncOrders(platform)}
                          variant="default"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          ซิงค์ออเดอร์
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`auto-sync-${platform.id}`}>ซิงค์อัตโนมัติ</Label>
                        <Switch
                          id={`auto-sync-${platform.id}`}
                          checked={platform.auto_sync_enabled}
                          onCheckedChange={(checked) => 
                            updatePlatform(platform.id, { auto_sync_enabled: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor={`auto-notify-${platform.id}`}>แจ้งเตือนอัตโนมัติ</Label>
                        <Switch
                          id={`auto-notify-${platform.id}`}
                          checked={platform.auto_notification_enabled}
                          onCheckedChange={(checked) => 
                            updatePlatform(platform.id, { auto_notification_enabled: checked })
                          }
                        />
                      </div>
                    </div>

                    {platform.last_sync_at && (
                      <div className="text-sm text-gray-500">
                        ซิงค์ครั้งล่าสุด: {new Date(platform.last_sync_at).toLocaleString('th-TH')}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryIntegration;
