
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shell } from '@/components/Shell';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const platformConfigs = {
    LINE_MAN: {
      name: 'LINE MAN',
      color: 'bg-green-500',
      icon: '🛵',
      description: 'เชื่อมต่อกับ LINE MAN สำหรับรับออเดอร์อาหาร'
    },
    GRAB_FOOD: {
      name: 'Grab Food',
      color: 'bg-green-600',
      icon: '🥘',
      description: 'เชื่อมต่อกับ Grab Food สำหรับรับออเดอร์อาหาร'
    },
    FOODPANDA: {
      name: 'foodpanda',
      color: 'bg-pink-500',
      icon: '🐼',
      description: 'เชื่อมต่อกับ foodpanda สำหรับรับออเดอร์อาหาร'
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_integrations')
        .select('*')
        .order('platform_name');

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error: any) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลแพลตฟอร์มได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlatform = async (platformId: string, updates: Partial<DeliveryPlatform>) => {
    setSaving(platformId);
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
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าได้รับการบันทึกแล้ว'
      });
    } catch (error: any) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (platform: DeliveryPlatform) => {
    if (!platform.api_key) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาใส่ API Key ก่อนทดสอบการเชื่อมต่อ',
        variant: 'destructive'
      });
      return;
    }

    setTesting(platform.id);
    try {
      // Simulate API test - ในการใช้งานจริงจะเรียก API ของแต่ละแพลตฟอร์ม
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // Simulate 70% success rate
      
      await updatePlatform(platform.id, {
        is_connected: isConnected,
        connection_status: isConnected ? 'connected' : 'error'
      });

      toast({
        title: isConnected ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อไม่สำเร็จ',
        description: isConnected 
          ? `เชื่อมต่อกับ ${platformConfigs[platform.platform_name as keyof typeof platformConfigs]?.name} สำเร็จ`
          : 'กรุณาตรวจสอบ API Key และลองใหม่อีกครั้ง',
        variant: isConnected ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
        variant: 'destructive'
      });
    } finally {
      setTesting(null);
    }
  };

  const syncOrders = async (platform: DeliveryPlatform) => {
    if (!platform.is_connected) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาเชื่อมต่อกับแพลตฟอร์มก่อนซิงค์ออเดอร์',
        variant: 'destructive'
      });
      return;
    }

    setSyncing(platform.id);
    try {
      // Simulate order sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const orderCount = Math.floor(Math.random() * 10) + 1;
      
      await updatePlatform(platform.id, {
        last_sync_at: new Date().toISOString()
      });

      toast({
        title: 'ซิงค์ออเดอร์สำเร็จ',
        description: `ซิงค์ออเดอร์ ${orderCount} รายการจาก ${platformConfigs[platform.platform_name as keyof typeof platformConfigs]?.name}`
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถซิงค์ออเดอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const toggleApiKeyVisibility = (platformId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
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
        <div className="flex items-center space-x-2">
          <Truck className="w-8 h-8 text-coffee-600" />
          <div>
            <h1 className="text-3xl font-bold text-coffee-900">ผูกระบบ Delivery</h1>
            <p className="text-coffee-600">จัดการการเชื่อมต่อกับแพลตฟอร์มจัดส่งอาหาร</p>
          </div>
        </div>

        <div className="grid gap-6">
          {platforms.map((platform) => {
            const config = platformConfigs[platform.platform_name as keyof typeof platformConfigs];
            if (!config) return null;

            return (
              <Card key={platform.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                        {config.icon}
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{config.name}</span>
                          <Badge variant={platform.is_connected ? 'default' : 'secondary'}>
                            {platform.is_connected ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> เชื่อมต่อแล้ว</>
                            ) : (
                              <><AlertCircle className="w-3 h-3 mr-1" /> ยังไม่เชื่อมต่อ</>
                            )}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={platform.is_enabled}
                      onCheckedChange={(checked) => updatePlatform(platform.id, { is_enabled: checked })}
                    />
                  </div>
                </CardHeader>

                {platform.is_enabled && (
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="connection" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="connection">การเชื่อมต่อ</TabsTrigger>
                        <TabsTrigger value="sync">ซิงค์ออเดอร์</TabsTrigger>
                        <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
                      </TabsList>

                      <TabsContent value="connection" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`api-key-${platform.id}`}>API Key</Label>
                            <div className="flex space-x-2">
                              <Input
                                id={`api-key-${platform.id}`}
                                type={showApiKey[platform.id] ? 'text' : 'password'}
                                value={platform.api_key || ''}
                                onChange={(e) => updatePlatform(platform.id, { api_key: e.target.value })}
                                placeholder="ใส่ API Key ของแพลตฟอร์ม"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => toggleApiKeyVisibility(platform.id)}
                              >
                                {showApiKey[platform.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`webhook-${platform.id}`}>Webhook URL</Label>
                            <Input
                              id={`webhook-${platform.id}`}
                              value={platform.webhook_url || ''}
                              onChange={(e) => updatePlatform(platform.id, { webhook_url: e.target.value })}
                              placeholder="https://your-domain.com/webhook"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => testConnection(platform)}
                            disabled={testing === platform.id || !platform.api_key}
                            variant="outline"
                          >
                            {testing === platform.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                กำลังทดสอบ...
                              </>
                            ) : (
                              <>
                                <Wifi className="w-4 h-4 mr-2" />
                                ทดสอบการเชื่อมต่อ
                              </>
                            )}
                          </Button>
                        </div>

                        {platform.connection_status === 'error' && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              การเชื่อมต่อล้มเหลว กรุณาตรวจสอบ API Key และลองใหม่อีกครั้ง
                            </AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>

                      <TabsContent value="sync" className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">ซิงค์ออเดอร์</h4>
                            <p className="text-sm text-gray-600">
                              {platform.last_sync_at 
                                ? `ซิงค์ล่าสุด: ${new Date(platform.last_sync_at).toLocaleString('th-TH')}`
                                : 'ยังไม่เคยซิงค์'
                              }
                            </p>
                          </div>
                          <Button
                            onClick={() => syncOrders(platform)}
                            disabled={syncing === platform.id || !platform.is_connected}
                          >
                            {syncing === platform.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                กำลังซิงค์...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                ซิงค์ออเดอร์
                              </>
                            )}
                          </Button>
                        </div>

                        {!platform.is_connected && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              กรุณาเชื่อมต่อกับแพลตฟอร์มก่อนซิงค์ออเดอร์
                            </AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>ซิงค์อัตโนมัติ</Label>
                              <p className="text-sm text-gray-600">
                                ซิงค์ออเดอร์โดยอัตโนมัติทุก 15 นาที
                              </p>
                            </div>
                            <Switch
                              checked={platform.auto_sync_enabled}
                              onCheckedChange={(checked) => updatePlatform(platform.id, { auto_sync_enabled: checked })}
                            />
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>แจ้งเตือนอัตโนมัติ</Label>
                              <p className="text-sm text-gray-600">
                                แจ้งเตือนเมื่อมีออเดอร์ใหม่เข้ามา
                              </p>
                            </div>
                            <Switch
                              checked={platform.auto_notification_enabled}
                              onCheckedChange={(checked) => updatePlatform(platform.id, { auto_notification_enabled: checked })}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                )}

                {saving === platform.id && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>คำแนะนำการตั้งค่า</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>LINE MAN:</strong> ติดต่อ LINE MAN for Business เพื่อขอ API Key และ Webhook URL
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Grab Food:</strong> สมัครเป็น Grab Partner และขอ API credentials ผ่าน Grab Partner Portal
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>foodpanda:</strong> ติดต่อ foodpanda Partner Support เพื่อขอ API integration
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

export default DeliveryIntegration;
