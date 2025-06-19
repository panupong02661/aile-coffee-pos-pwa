
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancelledOrder {
  id: string;
  original_order_number: string;
  cancelled_at: string;
  cancelled_by: string;
  reason: string;
  original_total_amount: number;
  original_items_count: number;
  original_payment_method: string;
  stock_restored: boolean;
}

export const useCancelledOrders = () => {
  const [cancelledOrders, setCancelledOrders] = useState<CancelledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCancelledOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cancelled_orders')
        .select('*')
        .order('cancelled_at', { ascending: false });

      if (error) {
        console.error('Error fetching cancelled orders:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลออเดอร์ที่ยกเลิกได้',
          variant: 'destructive'
        });
        return;
      }

      setCancelledOrders(data || []);
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCancelledOrders = () => {
    fetchCancelledOrders();
  };

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  return {
    cancelledOrders,
    loading,
    refreshCancelledOrders
  };
};
