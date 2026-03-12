import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentShop } from '@/hooks/useCurrentShop';
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
  const { shopId, loading: shopLoading } = useCurrentShop();

  const fetchPurchaseHistory = async () => {
    if (!shopId) {
      setPurchases([]);
      return;
    }

    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('member_id', memberId)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการซื้อได้', variant: 'destructive' });
        return;
      }

      setPurchases((orders || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        total_amount: Number(order.total_amount),
        items_count: order.items_count,
        created_at: order.created_at,
        payment_method: order.payment_method,
      })));
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการซื้อได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopLoading) return;
    if (isOpen && memberId && shopId) {
      fetchPurchaseHistory();
      return;
    }
    if (!shopId) setPurchases([]);
  }, [isOpen, memberId, shopId, shopLoading]);

  const getPaymentMethodName = (method: string) => method === 'cash' ? 'เงินสด' : method === 'qr' ? 'QR Code' : method === 'points' ? 'แต้มสะสม' : method;
  const getPaymentMethodColor = (method: string) => method === 'cash' ? 'bg-green-100 text-green-800' : method === 'qr' ? 'bg-blue-100 text-blue-800' : method === 'points' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" />ประวัติการซื้อสินค้า - {memberName}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading ? <div className="text-center py-8 text-gray-500">กำลังโหลดประวัติการซื้อ...</div> : (
              <>
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-blue-200" onClick={() => setSelectedOrder({ id: purchase.id, orderNumber: purchase.order_number })}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2"><Receipt className="w-4 h-4" />{purchase.order_number}</CardTitle>
                        <Badge className={getPaymentMethodColor(purchase.payment_method)}>{getPaymentMethodName(purchase.payment_method)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /><div><p className="text-sm text-gray-600">ยอดรวม</p><p className="font-medium">฿{purchase.total_amount.toLocaleString()}</p></div></div>
                        <div className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /><div><p className="text-sm text-gray-600">จำนวนรายการ</p><p className="font-medium">{purchase.items_count} รายการ</p></div></div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600" /><div><p className="text-sm text-gray-600">วันที่</p><p className="font-medium">{new Date(purchase.created_at).toLocaleDateString('th-TH')}</p></div></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {purchases.length === 0 && !loading && <div className="text-center py-8 text-gray-500">ไม่มีประวัติการซื้อสินค้า</div>}
              </>
            )}
          </div>
          <div className="pt-4 border-t"><Button variant="outline" onClick={onClose} className="w-full">ปิด</Button></div>
        </DialogContent>
      </Dialog>
      <OrderDetailsModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} orderId={selectedOrder?.id || ''} />
    </>
  );
};

export default MemberPurchaseHistoryModal;
