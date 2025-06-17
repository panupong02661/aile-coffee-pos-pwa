
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Calendar, DollarSign, Package } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

interface PurchaseHistory {
  id: string;
  order_number: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  payment_method: string;
}

interface MemberPurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

const MemberPurchaseHistoryModal = ({ isOpen, onClose, memberId, memberName }: MemberPurchaseHistoryModalProps) => {
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{id: string, orderNumber: string} | null>(null);
  const { toast } = useToast();

  const fetchPurchaseHistory = async () => {
    setLoading(true);
    
    try {
      console.log('Fetching purchase history for member:', memberId);
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดประวัติการซื้อได้",
          variant: "destructive"
        });
        return;
      }

      console.log('Purchase history loaded:', orders);
      
      const formattedPurchases: PurchaseHistory[] = orders?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        total_amount: Number(order.total_amount),
        items_count: order.items_count,
        created_at: order.created_at,
        payment_method: order.payment_method
      })) || [];

      setPurchases(formattedPurchases);
    } catch (error) {
      console.error('Error in fetchPurchaseHistory:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดประวัติการซื้อได้",
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

  const handleOrderClick = (purchase: PurchaseHistory) => {
    console.log('Clicking order:', purchase.id, purchase.order_number);
    setSelectedOrder({
      id: purchase.id,
      orderNumber: purchase.order_number
    });
  };

  const handleCloseOrderDetails = () => {
    console.log('Closing order details modal');
    setSelectedOrder(null);
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchPurchaseHistory();
    }
  }, [isOpen, memberId]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              ประวัติการซื้อสินค้า - {memberName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">กำลังโหลดประวัติการซื้อ...</div>
            ) : (
              <>
                {purchases.map((purchase) => (
                  <Card 
                    key={purchase.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-blue-200"
                    onClick={() => handleOrderClick(purchase)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          {purchase.order_number}
                        </CardTitle>
                        <Badge className={getPaymentMethodColor(purchase.payment_method)}>
                          {getPaymentMethodName(purchase.payment_method)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">ยอดรวม</p>
                            <p className="font-medium">฿{purchase.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">จำนวนรายการ</p>
                            <p className="font-medium">{purchase.items_count} รายการ</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">วันที่</p>
                            <p className="font-medium">
                              {new Date(purchase.created_at).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {purchases.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีประวัติการซื้อสินค้า
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={handleCloseOrderDetails}
        orderId={selectedOrder?.id || ''}
        orderNumber={selectedOrder?.orderNumber || ''}
      />
    </>
  );
};

export default MemberPurchaseHistoryModal;
