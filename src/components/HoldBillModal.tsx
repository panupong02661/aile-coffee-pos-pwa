
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { CartItem } from '@/types';

interface HeldBill {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  discountType: 'percent' | 'amount';
  timestamp: Date;
}

interface HoldBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCart: CartItem[];
  currentDiscount: number;
  currentDiscountType: 'percent' | 'amount';
  currentTotal: number;
  onHoldBill: () => void;
  onRestoreBill: (bill: HeldBill) => void;
}

const HoldBillModal = ({
  isOpen,
  onClose,
  currentCart,
  currentDiscount,
  currentDiscountType,
  currentTotal,
  onHoldBill,
  onRestoreBill
}: HoldBillModalProps) => {
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('heldBills');
    if (stored) {
      const bills = JSON.parse(stored).map((bill: any) => ({
        ...bill,
        timestamp: new Date(bill.timestamp)
      }));
      setHeldBills(bills);
    }
  }, [isOpen]);

  const handleHoldCurrentBill = () => {
    if (currentCart.length === 0) return;
    
    const newBill: HeldBill = {
      id: `bill_${Date.now()}`,
      items: currentCart,
      total: currentTotal,
      discount: currentDiscount,
      discountType: currentDiscountType,
      timestamp: new Date()
    };

    const updatedBills = [...heldBills, newBill];
    setHeldBills(updatedBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedBills));
    
    onHoldBill();
    onClose();
  };

  const handleRestoreBill = (bill: HeldBill) => {
    const updatedBills = heldBills.filter(b => b.id !== bill.id);
    setHeldBills(updatedBills);
    localStorage.setItem('heldBills', JSON.stringify(updatedBills));
    
    onRestoreBill(bill);
    onClose();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>พักบิล</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentCart.length > 0 && (
            <Button 
              onClick={handleHoldCurrentBill}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              พักบิลปัจจุบัน ({currentCart.length} รายการ)
            </Button>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">บิลที่พักไว้ ({heldBills.length})</h4>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {heldBills.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    ไม่มีบิลที่พักไว้
                  </p>
                ) : (
                  heldBills.map((bill) => (
                    <Card key={bill.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">บิล {bill.id.slice(-6)}</div>
                          <div className="text-sm text-muted-foreground">
                            {bill.items.length} รายการ - ฿{bill.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(bill.timestamp)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRestoreBill(bill)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          เรียกคืน
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HoldBillModal;
