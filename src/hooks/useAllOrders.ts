
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
  member_id?: string;
  bill_discount?: number;
  bill_discount_type?: string;
}

export const useAllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      console.log('📦 Fetching all orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลออเดอร์ได้',
          variant: 'destructive'
        });
        return;
      }

      console.log('📦 Orders fetched:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshOrders = useCallback(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const setupRealtimeSubscription = useCallback(() => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `orders-realtime-${Date.now()}`;
    console.log('📡 Setting up realtime subscription:', channelName);

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🆕 New order inserted:', payload.new);
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📝 Order updated:', payload.new);
          const updatedOrder = payload.new as Order;
          setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🗑️ Order deleted:', payload.old);
          const deletedOrder = payload.old as { id: string };
          setOrders(prev => prev.filter(order => order.id !== deletedOrder.id));
        }
      )
      .subscribe((status) => {
        console.log('📡 Orders subscription status:', status);
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.log('🔄 Reconnecting realtime...');
          setTimeout(() => {
            setupRealtimeSubscription();
          }, 2000);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Orders realtime connected!');
        }
      });
  }, []);

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();

    // 🔧 Polling ทุก 10 วินาที เป็น backup (realtime จะ handle ทันที)
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 10000);

    // Handle visibility change - refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Tab visible, refreshing orders...');
        fetchOrders();
        setupRealtimeSubscription();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrders, setupRealtimeSubscription]);

  return {
    orders,
    loading,
    refreshOrders
  };
};
