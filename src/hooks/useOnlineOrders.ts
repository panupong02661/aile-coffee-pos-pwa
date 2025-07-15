
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnlineOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  addons?: string[];
}

export interface OnlineOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: OnlineOrderItem[];
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  delivery_type: 'pickup' | 'delivery';
  payment_status: 'pending' | 'completed';
  payment_method: string;
  created_at: string;
  estimated_time?: string;
  isNew?: boolean;
}

export const useOnlineOrders = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลออเดอร์จาก customer_orders table
      const { data: customerOrders, error } = await supabase
        .from('customer_orders')
        .select(`
          id,
          order_number,
          items,
          total_amount,
          order_status,
          delivery_type,
          payment_status,
          payment_method,
          delivery_address,
          created_at,
          customer_profiles (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching online orders:', error);
        return;
      }

      // แปลงข้อมูลให้ตรงกับ interface
      const formattedOrders: OnlineOrder[] = customerOrders?.map(order => {
        const items = Array.isArray(order.items) 
          ? order.items.map((item: any) => ({
              id: item.id || '',
              name: item.name || '',
              quantity: item.quantity || 1,
              price: item.price || 0,
              addons: item.addons || []
            }))
          : [];

        const orderTime = new Date(order.created_at);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
        const isNew = diffInMinutes <= 30; // ถือว่าเป็นออเดอร์ใหม่ถ้าสั่งมาไม่เกิน 30 นาที

        return {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_profiles?.full_name || 'ไม่ระบุชื่อ',
          customer_phone: order.customer_profiles?.phone || 'ไม่ระบุเบอร์',
          customer_address: order.delivery_address || undefined,
          items,
          total_amount: order.total_amount,
          order_status: order.order_status as any,
          delivery_type: order.delivery_type as 'pickup' | 'delivery',
          payment_status: order.payment_status as 'pending' | 'completed',
          payment_method: order.payment_method,
          created_at: orderTime.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          estimated_time: getEstimatedTime(orderTime),
          isNew
        };
      }) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = (orderTime: Date) => {
    const estimated = new Date(orderTime.getTime() + 30 * 60000); // เพิ่ม 30 นาที
    return estimated.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: OnlineOrder['order_status']) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      // อัปเดต state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_status: newStatus, isNew: false }
            : order
        )
      );

      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // ตั้งเวลาให้รีเฟรชทุก 30 วินาที
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    updateOrderStatus
  };
};
