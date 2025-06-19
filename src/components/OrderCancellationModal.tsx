
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Package, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
  member_id?: string;
  created_at: string;
}

interface OrderCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderCancelled: () => void;
}

const OrderCancellationModal = ({ isOpen, onClose, order, onOrderCancelled }: OrderCancellationModalProps) => {
  const [reason, setReason] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!order) return;

    if (!reason.trim()) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาระบุเหตุผลในการยกเลิก',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // บันทึกข้อมูลการยกเลิกลงตาราง cancelled_orders
      const { error: cancelError } = await supabase
        .from('cancelled_orders')
        .insert({
          original_order_id: order.id,
          original_order_number: order.order_number,
          cancelled_by: 'admin', // หรือ user id ของผู้ใช้ปัจจุบัน
          reason: reason.trim(),
          original_total_amount: order.total_amount,
          original_items_count: order.items_count,
          original_payment_method: order.payment_method,
          original_member_id: order.member_id,
          stock_restored: restoreStock
        });

      if (cancelError) {
        console.error('Error inserting cancelled order:', cancelError);
        throw cancelError;
      }

      // คืนสต็อกถ้าเลือกไว้
      if (restoreStock) {
        const { data: stockResult, error: stockError } = await supabase
          .rpc('restore_stock_for_cancelled_order', {
            order_id_param: order.id
          });

        if (stockError) {
          console.error('Error restoring stock:', stockError);
          toast({
            title: 'คำเตือน',
            description: 'ยกเลิกออเดอร์สำเร็จ แต่ไม่สามารถคืนสต็อกได้',
            variant: 'destructive'
          });
        } else {
          console.log('Stock restoration result:', stockResult);
        }
      }

      // ลบออเดอร์ออกจากตาราง orders
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (deleteError) {
        console.error('Error deleting order:', deleteError);
        throw deleteError;
      }

      // ลบ order items ที่เกี่ยวข้อง
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (deleteItemsError) {
        console.error('Error deleting order items:', deleteItemsError);
        // ไม่ throw error เพราะอาจจะมี cascade delete
      }

      toast({
        title: 'สำเร็จ',
        description: `ยกเลิกออเดอร์ ${order.order_number} เรียบร้อยแล้ว${restoreStock ? ' และคืนสต็อกแล้ว' : ''}`,
        variant: 'default'
      });

      onOrderCancelled();
      onClose();
      setReason('');
      setRestoreStock(true);

    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถยกเลิกออเดอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason('');
      setRestoreStock(true);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            ยกเลิกออเดอร์
          </DialogTitle>
          <DialogDescription>
            คุณกำลังจะยกเลิกออเดอร์ {order.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ข้อมูลออเดอร์ */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">หมายเลขออเดอร์:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ยอดรวม:</span>
              <span className="font-medium">{order.total_amount.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">จำนวนรายการ:</span>
              <span className="font-medium">{order.items_count} รายการ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">วิธีการชำระเงิน:</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
          </div>

          {/* เหตุผลในการยกเลิก */}
          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผลในการยกเลิก *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="กรุณาระบุเหตุผลในการยกเลิกออเดอร์"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* ตัวเลือกคืนสต็อก */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="restore-stock"
              checked={restoreStock}
              onCheckedChange={(checked) => setRestoreStock(!!checked)}
              disabled={loading}
            />
            <Label htmlFor="restore-stock" className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              คืนสต็อกวัตถุดิบ
            </Label>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading || !reason.trim()}
              className="flex-1"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยันยกเลิก'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancellationModal;
