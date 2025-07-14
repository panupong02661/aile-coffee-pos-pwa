
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orderTotal: number;
  itemCount: number;
}

const OrderConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderTotal,
  itemCount
}: OrderConfirmationModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    try {
      await onConfirm();
      setIsConfirmed(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsConfirmed(false);
        setIsProcessing(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Order confirmation failed:', error);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsConfirmed(false);
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-coffee-800">
            {isConfirmed ? '✅ สั่งซื้อสำเร็จ!' : '🛒 ยืนยันการสั่งซื้อ'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isConfirmed ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-800">
                  ออเดอร์ของคุณได้รับการยืนยันแล้ว
                </p>
                <p className="text-sm text-gray-600">
                  ทางร้านได้รับแจ้งแล้ว กรุณารอสักครู่...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-coffee-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-coffee-800">สรุปออเดอร์</h3>
                <div className="flex justify-between text-sm">
                  <span>จำนวนรายการ:</span>
                  <span>{itemCount} รายการ</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>ยอดรวมทั้งหมด:</span>
                  <span className="text-coffee-600">฿{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="text-center space-y-2">
                <p className="text-gray-700">
                  กดยืนยันเพื่อส่งออเดอร์ไปยังร้านค้า
                </p>
                <p className="text-sm text-gray-500">
                  ร้านค้าจะได้รับแจ้งเตือนทันที
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 bg-coffee-600 hover:bg-coffee-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    'ยืนยันการสั่งซื้อ'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmationModal;
