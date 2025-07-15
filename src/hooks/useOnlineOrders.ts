
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
      console.log('Fetching online orders...');
      setLoading(true);
      
      // ลองดึงข้อมูลจาก customer_orders ก่อน
      const { data: customerOrders, error: customerError } = await supabase
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

      console.log('Customer orders query result:', { customerOrders, customerError });

      // ถ้าไม่มีข้อมูลใน customer_orders ให้ลองดึงจาก online_orders
      let onlineOrders = null;
      let onlineError = null;
      
      if (!customerOrders || customerOrders.length === 0) {
        console.log('No customer orders found, trying online_orders table...');
        const { data, error } = await supabase
          .from('online_orders')
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
        
        onlineOrders = data;
        onlineError = error;
        console.log('Online orders query result:', { onlineOrders, onlineError });
      }

      // เลือกข้อมูลที่มี
      const ordersData = customerOrders && customerOrders.length > 0 ? customerOrders : onlineOrders;
      const queryError = customerOrders && customerOrders.length > 0 ? customerError : onlineError;

      if (queryError) {
        console.error('Error fetching orders:', queryError);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found in any table');
        setOrders([]);
        return;
      }

      // แปลงข้อมูลให้ตรงกับ interface
      const formattedOrders: OnlineOrder[] = ordersData.map(order => {
        console.log('Processing order:', order);
        
        const items = Array.isArray(order.items) 
          ? order.items.map((item: any) => ({
              id: item.id || Math.random().toString(),
              name: item.name || 'ไม่ระบุชื่อ',
              quantity: item.quantity || 1,
              price: item.price || 0,
              addons: item.addons || []
            }))
          : [];

        const orderTime = new Date(order.created_at);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
        const isNew = diffInMinutes <= 30;

        return {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_profiles?.full_name || 'ไม่ระบุชื่อ',
          customer_phone: order.customer_profiles?.phone || 'ไม่ระบุเบอร์',
          customer_address: order.delivery_address || undefined,
          items,
          total_amount: order.total_amount || 0,
          order_status: order.order_status as any || 'pending',
          delivery_type: order.delivery_type as 'pickup' | 'delivery' || 'pickup',
          payment_status: order.payment_status as 'pending' | 'completed' || 'pending',
          payment_method: order.payment_method || 'online',
          created_at: orderTime.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          estimated_time: getEstimatedTime(orderTime),
          isNew
        };
      });

      console.log('Formatted orders:', formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = (orderTime: Date) => {
    const estimated = new Date(orderTime.getTime() + 30 * 60000);
    return estimated.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: OnlineOrder['order_status']) => {
    try {
      // ลองอัปเดตใน customer_orders ก่อน
      let { error } = await supabase
        .from('customer_orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // ถ้าไม่สำเร็จ ลองใน online_orders
      if (error) {
        const { error: onlineError } = await supabase
          .from('online_orders')
          .update({ 
            order_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        if (onlineError) {
          console.error('Error updating order status:', onlineError);
          return false;
        }
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
