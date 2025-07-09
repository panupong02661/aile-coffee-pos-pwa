
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingCart, Receipt, Users, Gift } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import DiscountModal from '@/components/DiscountModal'; 
import HoldBillModal from '@/components/HoldBillModal';
import CodeModal from '@/components/CodeModal';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { CartItem } from '@/types';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateDiscount: (itemId: string, discount: number) => void;
  onClearCart: () => void;
  billDiscount: number;
  billDiscountType: 'amount' | 'percent';
  onUpdateBillDiscount: (discount: number) => void;
  onUpdateBillDiscountType: (type: 'amount' | 'percent') => void;
  onRestoreCart: (cartData: { items: CartItem[], discount: number, discountType: 'amount' | 'percent' }) => void;
  selectedMember: Member | null;
  onCodeApply: (giftData: any) => void;
  appliedGiftCode: any;
  onPaymentComplete: () => void;
}

const Cart: React.FC<CartProps> = ({
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
    const itemPrice = item.total_price || (item.menu_item.price * item.quantity);
    return sum + itemPrice;
  }, 0);

  const calculateDiscountedTotal = () => {
    let discountedTotal = subtotal;
    if (billDiscountType === 'amount') {
      discountedTotal -= billDiscount;
    } else if (billDiscountType === 'percent') {
      discountedTotal *= (1 - (billDiscount / 100));
    }
    return Math.max(0, discountedTotal);
  };

  const discountedTotal = calculateDiscountedTotal();

  const handleIncreaseQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      onUpdateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      onUpdateQuantity(itemId, item.quantity - 1);
    }
  };

  const handleOpenDiscountModal = (item: CartItem) => {
    setSelectedItem(item);
    setIsDiscountModalOpen(true);
  };

  const handleUpdateItemDiscount = (discount: number) => {
    if (selectedItem) {
      onUpdateDiscount(selectedItem.id, discount);
      setIsDiscountModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleClearDiscount = (itemId: string) => {
    onUpdateDiscount(itemId, 0);
  };

  const handleApplyBillDiscount = (discount: number) => {
    onUpdateBillDiscount(discount);
  };

  const handleApplyBillDiscountType = (type: 'amount' | 'percent') => {
    onUpdateBillDiscountType(type);
  };

  const handleCodeApplyModal = () => {
    setIsCodeModalOpen(true);
  };

  const handlePaymentComplete = async () => {
    console.log('🔔 Cart: Payment completed, playing notification...');
    
    // Play notification sound
    try {
      await playBellSound();
      console.log('🎵 Cart: Bell sound played successfully');
    } catch (error) {
      console.log('⚠️ Cart: Failed to play bell sound:', error);
    }
    
    // Call parent handler
    console.log('🔄 Cart: Calling parent payment complete handler...');
    onPaymentComplete();
  };

  const handleRestoreCart = (cartData: { items: CartItem[], discount: number, discountType: 'amount' | 'percent' }) => {
    onRestoreCart(cartData);
  };

  return (
    <Card className="h-full flex flex-col bg-white border-coffee-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <ShoppingCart className="mr-2 h-4 w-4 inline-block align-middle" />
          รายการ
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1 p-4">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">ไม่มีสินค้าในรายการ</div>
        ) : (
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.menu_item.name}
                      </div>
                      {item.item_discount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          -{item.item_discount_type === 'percent' ? `${item.item_discount}%` : `฿${item.item_discount}`}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} x ฿{item.menu_item.price.toFixed(2)}
                    </div>
                    {item.selected_addons && item.selected_addons.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.selected_addons.map(addon => (
                          <div key={addon.id} className="flex items-center justify-between">
                            <span>+ {addon.name}</span>
                            <span>฿{addon.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="mr-2"
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleIncreaseQuantity(item.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="ml-2"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDiscountModal(item)}
                  >
                    {item.item_discount > 0 ? 'แก้ไขส่วนลด' : 'เพิ่มส่วนลด'}
                  </Button>
                  {item.item_discount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleClearDiscount(item.id)}
                    >
                      ล้างส่วนลด
                    </Button>
                  )}
                </div>
                <Separator className="my-2" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold">รวมทั้งหมด:</div>
          <div className="text-lg font-semibold">฿{subtotal.toFixed(2)}</div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <div>ส่วนลดบิล:</div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => {
                handleApplyBillDiscountType(billDiscountType === 'amount' ? 'percent' : 'amount');
              }}
            >
              {billDiscountType === 'amount' ? '฿' : '%'}
            </Button>
            <Input
              type="number"
              className="w-24 text-right"
              value={billDiscount.toString()}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  handleApplyBillDiscount(value);
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">ยอดสุทธิ:</div>
          <div className="text-xl font-bold">฿{discountedTotal.toFixed(2)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => setIsHoldBillModalOpen(true)} variant="secondary">พักบิล</Button>
          <Button onClick={handleCodeApplyModal} variant="secondary">
            <Gift className="mr-2 h-4 w-4" />
            ใส่รหัสส่วนลด
          </Button>
          <Button onClick={onClearCart} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            ล้างรายการ
          </Button>
          <Button onClick={() => setIsPaymentModalOpen(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            ชำระเงิน
          </Button>
        </div>
      </div>
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cartItems.map(item => ({
          id: item.id,
          name: item.menu_item.name,
          price: item.menu_item.price,
          quantity: item.quantity,
          discount: item.item_discount,
          category: 'other' as const,
          image: item.menu_item.image,
          calculated_cost: item.menu_item.calculated_cost,
          is_free: item.item_discount === item.menu_item.price,
          free_item_name: item.item_discount === item.menu_item.price ? item.menu_item.name : undefined
        }))}
        subtotal={subtotal}
        billDiscount={billDiscount}
        billDiscountType={billDiscountType === 'percent' ? 'percentage' : 'amount'}
        selectedMember={selectedMember}
        onPaymentComplete={handlePaymentComplete}
        appliedGiftCode={appliedGiftCode}
      />
      
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApplyDiscount={handleUpdateItemDiscount}
        onClearDiscount={() => {
          if (selectedItem) {
            handleClearDiscount(selectedItem.id);
            setIsDiscountModalOpen(false);
            setSelectedItem(null);
          }
        }}
        currentDiscount={selectedItem?.item_discount || 0}
        currentType="amount"
      />
      
      <HoldBillModal
        isOpen={isHoldBillModalOpen}
        onClose={() => setIsHoldBillModalOpen(false)}
        onRestore={handleRestoreCart}
      />
      
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onApplyCode={onCodeApply}
      />
    </Card>
  );
};

export default Cart;
