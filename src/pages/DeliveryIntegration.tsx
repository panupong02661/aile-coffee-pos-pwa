
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Smartphone,
  Globe,
  RefreshCw,
  AlertCircle,
  Eye,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainSidebar from '@/components/MainSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface IntegrationConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  webhookUrl: string;
  lastSync: Date | null;
  status: 'connected' | 'disconnected' | 'error';
  orderCount: number;
}

const DeliveryIntegration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: 'lineman',
      name: 'LINE MAN',
      enabled: false,
      apiKey: '',
      webhookUrl: '',
      lastSync: null,
      status: 'disconnected',
      orderCount: 0
    },
    {
      id: 'grab',
      name: 'Grab Food',
      enabled: false,
      apiKey: '',
      webhookUrl: '',
      lastSync: null,
      status: 'disconnected',
      orderCount: 0
    },
    {
      id: 'foodpanda',
      name: 'foodpanda',
      enabled: false,
      apiKey: '',
      webhookUrl: '',
      lastSync: null,
      status: 'disconnected',
      orderCount: 0
    }
  ]);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const updateIntegration = (id: string, updates: Partial<IntegrationConfig>) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id ? { ...integration, ...updates } : integration
    ));
  };

  const handleTestConnection = async (id: string) => {
    setIsLoading(true);
    const integration = integrations.find(i => i.id === id);
    
    if (!integration?.apiKey) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ API Key ก่อนทดสอบการเชื่อมต่อ",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateIntegration(id, {
        status: 'connected',
        lastSync: new Date()
      });

      toast({
        title: "เชื่อมต่อสำเร็จ",
        description: `เชื่อมต่อกับ ${integration.name} สำเร็จแล้ว`,
      });
    } catch (error) {
      updateIntegration(id, { status: 'error' });
      toast({
        title: "เชื่อมต่อล้มเหลว",
        description: "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบ API Key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncOrders = async (id: string) => {
    setIsLoading(true);
    const integration = integrations.find(i => i.id === id);

    try {
      // Simulate order sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newOrderCount = Math.floor(Math.random() * 5) + 1;
      updateIntegration(id, {
        orderCount: integration!.orderCount + newOrderCount,
        lastSync: new Date()
      });

      toast({
        title: "ซิงค์ออเดอร์สำเร็จ",
        description: `ซิงค์ออเดอร์จาก ${integration?.name} ได้ ${newOrderCount} รายการ`,
      });
    } catch (error) {
      toast({
        title: "ซิงค์ล้มเหลว",
        description: "ไม่สามารถซิงค์ออเดอร์ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">เชื่อมต่อแล้ว</Badge>;
      case 'error':
        return <Badge variant="destructive">ข้อผิดพลาด</Badge>;
      default:
        return <Badge variant="secondary">ยังไม่เชื่อมต่อ</Badge>;
    }
  };

  const IntegrationCard = ({ integration }: { integration: IntegrationConfig }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-coffee-600 to-coffee-700 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{integration.name}</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon(integration.status)}
              {getStatusBadge(integration.status)}
            </div>
          </div>
        </div>
        <Switch
          checked={integration.enabled}
          onCheckedChange={(checked) => 
            updateIntegration(integration.id, { enabled: checked })
          }
        />
      </div>

      {integration.enabled && (
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${integration.id}-api-key`}>API Key</Label>
            <Input
              id={`${integration.id}-api-key`}
              type="password"
              placeholder="ใส่ API Key"
              value={integration.apiKey}
              onChange={(e) => 
                updateIntegration(integration.id, { apiKey: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor={`${integration.id}-webhook`}>Webhook URL</Label>
            <Input
              id={`${integration.id}-webhook`}
              placeholder="ใส่ Webhook URL"
              value={integration.webhookUrl}
              onChange={(e) => 
                updateIntegration(integration.id, { webhookUrl: e.target.value })
              }
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleTestConnection(integration.id)}
              disabled={isLoading || !integration.apiKey}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              ทดสอบการเชื่อมต่อ
            </Button>

            {integration.status === 'connected' && (
              <Button
                onClick={() => handleSyncOrders(integration.id)}
                disabled={isLoading}
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ซิงค์ออเดอร์
              </Button>
            )}
          </div>

          {integration.lastSync && (
            <div className="text-sm text-gray-600">
              ซิงค์ล่าสุด: {integration.lastSync.toLocaleString('th-TH')}
            </div>
          )}

          {integration.orderCount > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>ออเดอร์ที่ซิงค์: {integration.orderCount} รายการ</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-coffee-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSidebar}
                className="text-coffee-600"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-coffee-800">ผูกระบบ Delivery</h1>
                <p className="text-coffee-600">จัดการการเชื่อมต่อกับแพลตฟอร์มส่งอาหาร</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="integrations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="integrations">การเชื่อมต่อ</TabsTrigger>
              <TabsTrigger value="orders">ออเดอร์ที่ซิงค์</TabsTrigger>
              <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {integrations.map((integration) => (
                  <IntegrationCard 
                    key={integration.id} 
                    integration={integration} 
                  />
                ))}
              </div>

              <Card className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-coffee-800 mb-2">วิธีการตั้งค่า</h3>
                    <ul className="text-sm text-coffee-600 space-y-1">
                      <li>• ติดต่อแต่ละแพลตฟอร์มเพื่อขอ API Key และ Webhook URL</li>
                      <li>• เปิดใช้งานการเชื่อมต่อและใส่ข้อมูลที่ได้รับ</li>
                      <li>• ทดสอบการเชื่อมต่อเพื่อยืนยันว่าทำงานได้ถูกต้อง</li>
                      <li>• ซิงค์ออเดอร์เพื่อดึงข้อมูลมาแสดงในระบบ POS</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ออเดอร์ที่ซิงค์ล่าสุด</h3>
                <div className="text-center py-12 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีออเดอร์ที่ซิงค์</p>
                  <p className="text-sm">เมื่อเชื่อมต่อสำเร็จ ออเดอร์จะแสดงที่นี่</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ตั้งค่าทั่วไป</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>ซิงค์อัตโนมัติ</Label>
                      <p className="text-sm text-gray-600">ซิงค์ออเดอร์ใหม่ทุก 5 นาที</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>แจ้งเตือนออเดอร์ใหม่</Label>
                      <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีออเดอร์ใหม่</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>อัปเดตสถานะอัตโนมัติ</Label>
                      <p className="text-sm text-gray-600">อัปเดตสถานะกลับไปยังแพลตฟอร์ม</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DeliveryIntegration;
