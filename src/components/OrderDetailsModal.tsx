
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Package, DollarSign } from 'lucide-react';

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
    setLoading(true);
    
    // Mock implementation since we don't have actual order items table yet
    const mockOrderDetails: OrderDetails = {
      id: orderId,
      order_number: orderNumber,
      total_amount: orderId === '1' ? 150 : orderId === '2' ? 85 : 200,
      items_count: orderId === '1' ? 3 : orderId === '2' ? 2 : 4,
      created_at: new Date().toISOString(),
      payment_method: orderId === '1' ? 'cash' : orderId === '2' ? 'qr' : 'points',
      items: [
        {
          id: '1',
          name: 'กาแฟอเมริกาโน่',
          quantity: 1,
          unit_price: 45,
          total_price: 45,
          addons: ['เพิ่มช็อต']
        },
        {
          id: '2',
          name: 'กาแฟลาเต้',
          quantity: 2,
          unit_price: 55,
          total_price: 110,
          addons: ['นมอัลมอนด์', 'ไซรัปวานิลลา']
        },
        ...(orderId === '1' ? [{
          id: '3',
          name: 'คุกกี้',
          quantity: 1,
          unit_price: 25,
          total_price: 25,
          addons: []
        }] : []),
        ...(orderId === '3' ? [
          {
            id: '4',
            name: 'กาแฟคาปูชิโน่',
            quantity: 1,
            unit_price: 50,
            total_price: 50,
            addons: []
          },
          {
            id: '5',
            name: 'เค้กช็อกโกแลต',
            quantity: 1,
            unit_price: 65,
            total_price: 65,
            addons: []
          }
        ] : [])
      ]
    };
    
    // Simulate API delay
    setTimeout(() => {
      setOrderDetails(mockOrderDetails);
      setLoading(false);
    }, 500);
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
