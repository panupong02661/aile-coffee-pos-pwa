
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Phone } from 'lucide-react';
import type { OnlineOrder } from '@/pages/OnlineOrderManagement';

interface OrderDetailModalProps {
  selectedOrder: OnlineOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  selectedOrder,
  isOpen,
  onClose
}) => {
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'credit_card': return 'บัตรเครดิต';
      case 'promptpay': return 'พร้อมเพย์';
      case 'online': return 'ออนไลน์';
      default: return method;
    }
  };

  if (!selectedOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดออเดอร์ #{selectedOrder.order_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">ข้อมูลลูกค้า</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{selectedOrder.members?.name || 'ไม่ระบุชื่อ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{selectedOrder.members?.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">ข้อมูลออเดอร์</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">การชำระเงิน: </span>
                  <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">รายการสินค้า</h3>
            <div className="space-y-3">
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.menu_item_name}</p>
                      {item.order_addons && item.order_addons.length > 0 && (
                        <p className="text-sm text-gray-600">
                          + {item.order_addons.map(addon => addon.addon_name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">฿{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">ไม่มีรายการสินค้า</p>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>ยอดสุทธิ:</span>
              <span>฿{selectedOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>
          
          {selectedOrder.customer_notes && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">หมายเหตุ</h3>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {selectedOrder.customer_notes}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
