
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (discount: number, type: 'percent' | 'amount') => void;
  currentDiscount: number;
  currentType: 'percent' | 'amount';
}

const DiscountModal = ({
  isOpen,
  onClose,
  onApplyDiscount,
  currentDiscount,
  currentType
}: DiscountModalProps) => {
  const [discount, setDiscount] = useState(currentDiscount);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(currentType);

  const handleApply = () => {
    onApplyDiscount(discount, discountType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ส่วนลดทั้งบิล</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="จำนวนส่วนลด"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setDiscountType(discountType === 'percent' ? 'amount' : 'percent')}
              className="min-w-[60px]"
            >
              {discountType === 'percent' ? '%' : '฿'}
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleApply}
              className="flex-1 bg-coffee-600 hover:bg-coffee-700"
            >
              ใช้ส่วนลด
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;
