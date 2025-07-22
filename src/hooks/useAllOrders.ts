
import { useState, useEffect } from 'react';
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
  member_name?: string;
  status: string;
  bill_discount?: number;
  bill_discount_type?: string;
}

export const useAllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          members (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setError('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลออเดอร์ได้',
          variant: 'destructive'
        });
        return;
      }

      // Transform data to include member_name and ensure status exists
      const transformedData = data?.map(order => ({
        ...order,
        member_name: order.members?.name || null,
        status: order.status || 'completed'
      })) || [];

      setOrders(transformedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      setError(errorMessage);
      toast({
        title: 'ข้อผิดพลาด',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refreshOrders
  };
};
