import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, CreditCard, Star, ShoppingBag, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
}

interface OrderHistory {
  id: string;
  order_number: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
  created_at: string;
  order_items?: Array<{
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    selected_addons?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
}

interface HistorySectionProps {
  currentUser: CustomerProfile;
}

const HistorySection: React.FC<HistorySectionProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchOrderHistory();
    }
  }, [currentUser]);

  // Real-time subscription for new orders
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order detected:', payload);
          // Refetch orders when a new one is inserted
          fetchOrderHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลจากตาราง orders แทนที่จะดึงจาก customers_orders
      // ใช้ phone จาก currentUser เพื่อเชื่อมกับตาราง members
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('phone', currentUser.phone)
        .maybeSingle();

      if (memberError) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'ไม่สามารถค้นหาข้อมูลสมาชิก', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      if (!memberData) {
        // ถ้าไม่พบ member ที่ตรงกับ phone ที่ส่งมา
        setOrders([]);
        setLoading(false);
        return;
      }

      // ดึงข้อมูลออเดอร์จากตาราง orders โดยใช้ member_id จากที่ค้นหาได้ รวมถึง selected_addons
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          items_count,
          payment_method,
          created_at,
          order_items (
            menu_item_name,
            quantity,
            unit_price,
            total_price,
            selected_addons
          )
        `)
        .eq('member_id', memberData.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'ไม่สามารถโหลดประวัติการสั่งซื้อได้', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      // แปลง selected_addons จาก JSON เป็น array
      const ordersWithParsedAddons = (data || []).map(order => ({
        ...order,
        order_items: order.order_items?.map(item => ({
          ...item,
          selected_addons: Array.isArray(item.selected_addons) 
            ? item.selected_addons as Array<{ id: string; name: string; price: number }> 
            : []
        }))
      }));

      setOrders(ordersWithParsedAddons);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'credit_card': return 'บัตรเครดิต';
      case 'promptpay': return 'พร้อมเพย์';
      case 'online': return 'ออนไลน์';
      default: return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          ประวัติการสั่งซื้อ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    #{order.order_number}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ฿{order.total_amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items_count} รายการ
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {getPaymentMethodText(order.payment_method)}
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    สำเร็จ
                  </Badge>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      รายละเอียด
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>รายละเอียดออเดอร์ #{order.order_number}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                      <div className="space-y-4">
                        {/* Order Info */}
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">วันที่สั่ง:</span>
                            <span>{formatDate(selectedOrder.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">เวลา:</span>
                            <span>{formatTime(selectedOrder.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">การชำระเงิน:</span>
                            <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium mb-3">รายการสินค้า</h4>
                          <div className="space-y-2">
                            {selectedOrder.order_items?.map((item, index) => (
                              <div key={index} className="p-3 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.menu_item_name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      ฿{item.unit_price} x {item.quantity}
                                    </p>
                                    
                                    {/* แสดงแอดออน */}
                                    {item.selected_addons && item.selected_addons.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        <p className="text-xs font-medium text-gray-500">ตัวเลือกเพิ่มเติม:</p>
                                        {item.selected_addons.map((addon, addonIndex) => (
                                          <div key={addonIndex} className="flex items-center gap-2 text-sm text-gray-600 ml-3">
                                            <span className="text-orange-500">+</span>
                                            <span>{addon.name}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-green-600">฿{addon.price}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <p className="font-bold text-green-600">฿{item.total_price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>ยอดรวม</span>
                              <span className="text-green-600">฿{selectedOrder.total_amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default HistorySection;
