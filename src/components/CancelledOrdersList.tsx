
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, DollarSign, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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

const CancelledOrdersList = () => {
  const [cancelledOrders, setCancelledOrders] = useState<CancelledOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  const fetchCancelledOrders = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = cancelledOrders.filter(order =>
    order.original_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ออเดอร์ที่ยกเลิก</CardTitle>
        <CardDescription>
          รายการออเดอร์ที่ถูกยกเลิกแล้ว
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ช่องค้นหา */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาหมายเลขออเดอร์หรือเหตุผล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* รายการออเดอร์ที่ยกเลิก */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'ไม่พบออเดอร์ที่ตรงกับการค้นหา' : 'ยังไม่มีออเดอร์ที่ยกเลิก'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-red-600">
                          {order.original_order_number}
                        </h3>
                        <Badge variant={order.stock_restored ? "default" : "secondary"}>
                          {order.stock_restored ? 'คืนสต็อกแล้ว' : 'ไม่คืนสต็อก'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(order.cancelled_at), 'dd MMM yyyy HH:mm', { locale: th })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>ยกเลิกโดย: {order.cancelled_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{order.original_total_amount.toLocaleString()} บาท</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{order.original_items_count} รายการ</span>
                        </div>
                      </div>

                      {order.reason && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">เหตุผล: </span>
                          <span className="text-sm text-gray-600">{order.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CancelledOrdersList;
