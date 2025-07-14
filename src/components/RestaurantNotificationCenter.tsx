
import { useEffect, useState } from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Volume2, VolumeX, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  items: Json;
  order_status: string;
  created_at: string;
  notes?: string;
}

const RestaurantNotificationCenter = () => {
  const { playBellSound, initializeAudio, volume, setVolume } = useOrderNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch initial orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const testNotification = async () => {
    await initializeAudio();
    if (soundEnabled) {
      await playBellSound();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมรับ';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  const parseItems = (items: Json): any[] => {
    if (Array.isArray(items)) {
      return items;
    }
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-coffee-800 flex items-center">
          <Bell className="w-6 h-6 mr-2" />
          ศูนย์แจ้งเตือนร้านค้า
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? 'text-green-600' : 'text-gray-400'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Test Sound */}
          <Button
            variant="outline"
            size="sm"
            onClick={testNotification}
          >
            🔔 ทดสอบเสียง
          </Button>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>การตั้งค่าแจ้งเตือน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ระดับเสียง: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sound-enabled"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sound-enabled" className="text-sm">
                เปิดใช้งานเสียงแจ้งเตือน
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-coffee-800">ออเดอร์ล่าสุด</h2>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">ยังไม่มีออเดอร์</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => {
            const orderItems = parseItems(order.items);
            return (
              <Card key={order.id} className="border-l-4 border-coffee-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        ออเดอร์ #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.order_status)} text-white`}>
                      {getStatusText(order.order_status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">รายการสินค้า:</h4>
                      <div className="space-y-1 text-sm">
                        {orderItems.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <h4 className="font-medium mb-1">หมายเหตุ:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>ยอดรวม:</span>
                      <span className="text-coffee-600">฿{order.total_amount.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {order.order_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          เริ่มเตรียม
                        </Button>
                      )}
                      {order.order_status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          พร้อมรับ
                        </Button>
                      )}
                      {order.order_status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          เสร็จสิ้น
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RestaurantNotificationCenter;
