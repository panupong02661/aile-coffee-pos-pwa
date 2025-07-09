import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Receipt, Users, Gift, ShoppingCart } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import DiscountModal from '@/components/DiscountModal';
import HoldBillModal from '@/components/HoldBillModal';
import CodeModal from '@/components/CodeModal';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  discount?: number;
  calculated_cost?: number;
  category: 'food' | 'beverage' | 'other';
  addons?: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }[];
}

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface MobileCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateDiscount: (itemId: string, discount: number) => void;
  onClearCart: () => void;
  billDiscount: number;
  billDiscountType: 'amount' | 'percentage';
  onUpdateBillDiscount: (discount: number) => void;
  onUpdateBillDiscountType: (discountType: 'amount' | 'percentage') => void;
  onRestoreCart: (cartData: any) => void;
  selectedMember?: Member | null;
  onCodeApply: (giftData: any) => void;
  appliedGiftCode?: any;
  onPaymentComplete: () => void;
}

const MobileCart: React.FC<MobileCartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateDiscount,
  onClearCart,
  billDiscount,
  billDiscountType,
  onUpdateBillDiscount,
  onUpdateBillDiscountType,
  onRestoreCart,
  selectedMember,
  onCodeApply,
  appliedGiftCode,
  onPaymentComplete
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  // Add notification sound hook
  const { playBellSound } = useOrderNotifications();

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.price * item.quantity;
    const itemDiscount = item.discount || 0;
    return sum + itemPrice - itemDiscount;
  }, 0);

  const calculateDiscountedTotal = () => {
    let discountedTotal = subtotal;

    if (billDiscountType === 'amount') {
      discountedTotal -= billDiscount;
    } else if (billDiscountType === 'percentage') {
      discountedTotal -= (subtotal * billDiscount) / 100;
    }

    return Math.max(0, discountedTotal);
  };

  const discountedTotal = calculateDiscountedTotal();

  const handleIncrement = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      onUpdateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrement = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      onUpdateQuantity(itemId, item.quantity - 1);
    }
  };

  const handleDiscountClick = (item: CartItem) => {
    setSelectedItem(item);
    setIsDiscountModalOpen(true);
  };

  const handleUpdateItemDiscount = (discount: number) => {
    if (selectedItem) {
      onUpdateDiscount(selectedItem.id, discount);
      setSelectedItem(null);
      setIsDiscountModalOpen(false);
    }
  };

  const handleClearItemDiscount = () => {
    if (selectedItem) {
      onUpdateDiscount(selectedItem.id, 0);
      setSelectedItem(null);
      setIsDiscountModalOpen(false);
    }
  };

  const handlePaymentComplete = async () => {
    console.log('🔔 MobileCart: Payment completed, playing notification...');
    
    // Play notification sound
    try {
      await playBellSound();
      console.log('🎵 MobileCart: Bell sound played successfully');
    } catch (error) {
      console.log('⚠️ MobileCart: Failed to play bell sound:', error);
    }
    
    // Call parent handler
    console.log('🔄 MobileCart: Calling parent payment complete handler...');
    onPaymentComplete();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4">
          <SheetTitle>
            <ShoppingCart className="mr-2 h-4 w-4" />
            ตะกร้าสินค้า
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500">ไม่มีสินค้าในตะกร้า</div>
          ) : (
            <ul>
              {cartItems.map(item => (
                <li key={item.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.addons && item.addons.length > 0 && (
                          <>
                            <Badge variant="secondary">
                              {item.addons.length} Addons
                            </Badge>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                          </>
                        )}
                        {item.price.toLocaleString()} บาท
                      </div>
                      {item.discount ? (
                        <div className="text-sm text-red-500">
                          ส่วนลด {item.discount.toLocaleString()} บาท
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrement(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrement(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDiscountClick(item)}
                    >
                      ส่วนลด
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบ
                    </Button>
                  </div>
                  <Separator className="my-2" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between mb-2">
            <div className="text-lg font-semibold">ราคารวม</div>
            <div className="text-lg">{subtotal.toLocaleString()} บาท</div>
          </div>

          {billDiscount > 0 && (
            <div className="flex justify-between mb-2">
              <div className="text-lg font-semibold">ส่วนลดบิล</div>
              <div className="text-lg">
                {billDiscountType === 'amount'
                  ? billDiscount.toLocaleString() + ' บาท'
                  : billDiscount.toLocaleString() + '%'}
              </div>
            </div>
          )}

          <div className="flex justify-between mb-4">
            <div className="text-xl font-bold">ราคาสุทธิ</div>
            <div className="text-xl font-bold">{discountedTotal.toLocaleString()} บาท</div>
          </div>

          <Button className="w-full mb-2" onClick={() => setIsPaymentModalOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            ชำระเงิน
          </Button>
          <Button variant="outline" className="w-full mb-2" onClick={() => setIsCodeModalOpen(true)}>
            <Gift className="mr-2 h-4 w-4" />
            ใช้รหัสส่วนลด
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            ล้างตะกร้า
          </Button>
        </div>
        
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          cartItems={cartItems}
          subtotal={subtotal}
          billDiscount={billDiscount}
          billDiscountType={billDiscountType}
          selectedMember={selectedMember}
          onPaymentComplete={handlePaymentComplete}
          appliedGiftCode={appliedGiftCode}
        />
        
        <DiscountModal
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          onApplyDiscount={handleUpdateItemDiscount}
          currentDiscount={selectedItem?.discount || 0}
          currentType="amount"
        />

        <HoldBillModal
          isOpen={isHoldBillModalOpen}
          onClose={() => setIsHoldBillModalOpen(false)}
          onRestoreCart={onRestoreCart}
        />

        <CodeModal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          onCodeApply={onCodeApply}
        />
      </SheetContent>
    </Sheet>
  );
};

export default MobileCart;
