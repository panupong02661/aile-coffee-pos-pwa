
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  addons?: string[];
}

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  payment_method: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
}

const OrderDetailsModal = ({ isOpen, onClose, orderId, orderNumber }: OrderDetailsModalProps) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    console.log('Fetching order details for:', orderId, orderNumber);
    
    try {
      // Fetch order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        throw orderError;
      }

      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      console.log('Order fetched:', order);
      console.log('Order items fetched:', orderItems);

      // Transform the data
      const transformedItems: OrderItem[] = orderItems?.map(item => {
        let addons: string[] = [];
        try {
          if (item.selected_addons) {
            const parsedAddons = JSON.parse(item.selected_addons);
            addons = Array.isArray(parsedAddons) ? parsedAddons.map((addon: any) => addon.name || addon) : [];
          }
        } catch (e) {
          console.warn('Failed to parse addons for item:', item.id);
        }

        return {
          id: item.id,
          name: item.menu_item_name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
          addons
        };
      }) || [];

      const orderDetailsData: OrderDetails = {
        id: order.id,
        order_number: order.order_number,
        total_amount: Number(order.total_amount),
        items_count: order.items_count,
        created_at: order.created_at,
        payment_method: order.payment_method,
        items: transformedItems
      };

      console.log('Order details loaded:', orderDetailsData);
      setOrderDetails(orderDetailsData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายละเอียดออเดอร์ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'qr': return 'QR Code';
      case 'points': return 'แต้มสะสม';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'qr': return 'bg-blue-100 text-blue-800';
      case 'points': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            รายละเอียดออเดอร์ {orderNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลดรายละเอียดออเดอร์...</div>
          ) : orderDetails ? (
            <>
              {/* Order Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{orderDetails.order_number}</CardTitle>
                    <Badge className={getPaymentMethodColor(orderDetails.payment_method)}>
                      {getPaymentMethodName(orderDetails.payment_method)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">วันที่</p>
                      <p className="font-medium">
                        {new Date(orderDetails.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">เวลา</p>
                      <p className="font-medium">
                        {new Date(orderDetails.created_at).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    รายการสินค้า
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-sm text-gray-600">
                              + {item.addons.join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            ฿{item.unit_price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">฿{item.total_price.toLocaleString()}</p>
                        </div>
                      </div>
                      {index < orderDetails.items.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Total */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      ยอดรวมทั้งหมด
                    </span>
                    <span>฿{orderDetails.total_amount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบรายละเอียดออเดอร์
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
