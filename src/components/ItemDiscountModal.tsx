
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/types';

interface ItemDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onApplyDiscount: (discount: number, type: 'percent' | 'amount') => void;
}

const ItemDiscountModal = ({
  isOpen,
  onClose,
  item,
  onApplyDiscount
}: ItemDiscountModalProps) => {
  const [discount, setDiscount] = useState(item?.item_discount || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(item?.item_discount_type || 'amount');

  const handleApply = () => {
    onApplyDiscount(discount, discountType);
    onClose();
  };

  const handleClear = () => {
    onApplyDiscount(0, discountType);
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ส่วนลดรายการ: {item.menu_item.name}</DialogTitle>
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
              onClick={handleClear}
              className="flex-1"
            >
              ลบส่วนลด
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

export default ItemDiscountModal;
