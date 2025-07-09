
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Percent, DollarSign } from 'lucide-react';
import { CartItem } from '@/types';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import ItemDiscountModal from './ItemDiscountModal';
import HoldBillModal from './HoldBillModal';
import CodeModal from './CodeModal';

// Define the interface that HoldBillModal expects
interface HoldBillCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  category: string;
}

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateDiscount: (itemId: string, discount: number, discountType: 'amount' | 'percent') => void;
  onClearCart: () => void;
  billDiscount: number;
  billDiscountType: 'amount' | 'percent';
  onUpdateBillDiscount: (discount: number) => void;
  onUpdateBillDiscountType: (type: 'amount' | 'percent') => void;
  onRestoreCart: (cartData: { items: CartItem[], discount: number, discountType: 'amount' | 'percent' }) => void;
  selectedMember?: any;
  onCodeApply?: (giftData: any) => void;
  appliedGiftCode?: any;
  onPaymentComplete?: () => void;
}

const Cart = ({
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
}: CartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isItemDiscountModalOpen, setIsItemDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const calculateBillDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (billDiscountType === 'percent') {
      return subtotal * (billDiscount / 100);
    }
    return billDiscount;
  };

  const discountedTotal = Math.max(0, calculateSubtotal() - calculateBillDiscountAmount());

  const handleUpdateItemDiscount = (discount: number) => {
    if (selectedItem) {
      onUpdateDiscount(selectedItem.id, discount, 'amount');
      setIsDiscountModalOpen(false);
      setSelectedItem(null);
    }
  };

  const handleItemDiscountClick = (item: CartItem) => {
    setSelectedItem(item);
    setIsItemDiscountModalOpen(true);
  };

  const handleBillDiscountClick = () => {
    setIsDiscountModalOpen(true);
  };

  if (cartItems.length === 0) {
    return (
      <Card className="w-full h-full p-6 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-lg font-semibold text-coffee-800 mb-2">ตะกร้าสินค้าว่าง</h3>
        <p className="text-coffee-600 mb-6">เลือกสินค้าเพื่อเริ่มต้นการขาย</p>
        
        <div className="space-y-2 w-full">
          <Button
            onClick={() => setIsHoldBillModalOpen(true)}
            variant="outline"
            className="w-full"
          >
            ดูบิลที่พักไว้
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-coffee-200">
        <h2 className="text-lg font-semibold text-coffee-800 flex items-center">
          <span>ตะกร้าสินค้า ({cartItems.length} รายการ)</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-cream-50 rounded-lg p-3 border border-coffee-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-coffee-800 text-sm leading-tight">
                  {item.menu_item.name}
                </h4>
                {item.selected_addons && item.selected_addons.length > 0 && (
                  <p className="text-coffee-600 text-xs mt-1">
                    + {item.selected_addons.map(addon => addon.name).join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto min-w-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="font-medium text-coffee-800 w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {item.item_discount > 0 && (
                  <span className="text-red-500 text-xs font-medium">
                    -{item.item_discount}฿
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemDiscountClick(item)}
                  className="text-coffee-600 hover:text-coffee-800 p-1 h-auto min-w-0"
                >
                  <Percent className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-coffee-800 text-sm min-w-12 text-right">
                  ฿{item.total_price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-coffee-200 space-y-3">
        {appliedGiftCode && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-green-800 font-medium text-sm">
                🎁 ใช้โค้ด: {appliedGiftCode.gift_name}
              </span>
              <span className="text-green-600 font-semibold">
                -{appliedGiftCode.gift_value}฿
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-coffee-700">
            <span>รวม</span>
            <span>฿{calculateSubtotal().toFixed(2)}</span>
          </div>
          
          {billDiscount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>ส่วนลด</span>
              <span>-฿{calculateBillDiscountAmount().toFixed(2)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold text-coffee-800">
            <span>ยอดรวมสุทธิ</span>
            <span>฿{discountedTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={() => setIsCodeModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🎁 โค้ด
          </Button>
          
          <Button
            onClick={handleBillDiscountClick}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            ส่วนลด
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setIsHoldBillModalOpen(true)}
            variant="outline"
          >
            พักบิล
          </Button>
          
          <Button
            onClick={onClearCart}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            ล้างบิล
          </Button>
        </div>

        <Button
          onClick={() => setIsPaymentModalOpen(true)}
          className="w-full bg-coffee-600 hover:bg-coffee-700 text-white font-semibold py-3"
          disabled={cartItems.length === 0}
        >
          ชำระเงิน ฿{discountedTotal.toFixed(2)}
        </Button>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={discountedTotal}
        cartItems={cartItems}
        billDiscount={billDiscount}
        billDiscountType={billDiscountType}
        onClearCart={onClearCart}
        selectedMember={selectedMember}
        appliedGiftCode={appliedGiftCode}
        onPaymentComplete={onPaymentComplete}
      />

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApplyDiscount={handleUpdateItemDiscount}
        currentDiscount={selectedItem?.item_discount || 0}
        currentType="amount"
      />

      <ItemDiscountModal
        isOpen={isItemDiscountModalOpen}
        onClose={() => setIsItemDiscountModalOpen(false)}
        item={selectedItem}
        onApplyDiscount={(discount, type) => {
          if (selectedItem) {
            onUpdateDiscount(selectedItem.id, discount, type);
            setIsItemDiscountModalOpen(false);
            setSelectedItem(null);
          }
        }}
      />

      <HoldBillModal
        isOpen={isHoldBillModalOpen}
        onClose={() => setIsHoldBillModalOpen(false)}
        currentCart={cartItems.map(item => ({
          id: item.id,
          name: item.menu_item.name,
          price: item.total_price,
          quantity: item.quantity,
          discount: item.item_discount,
          category: item.menu_item.category_id || 'other'
        }) as HoldBillCartItem)}
        currentDiscount={billDiscount}
        currentDiscountType={billDiscountType}
        currentTotal={discountedTotal}
        onHoldBill={onClearCart}
        onRestoreBill={(bill) => {
          const restoredItems: CartItem[] = bill.items.map(item => ({
            id: item.id,
            menu_item: {
              id: item.id,
              name: item.name,
              price: item.price / item.quantity,
              category_id: item.category,
              image: '',
              is_available: true,
              description: '',
              calculated_cost: 0
            },
            quantity: item.quantity,
            selected_addons: [],
            item_discount: item.discount,
            item_discount_type: 'amount',
            total_price: item.price
          }));
          
          onRestoreCart({
            items: restoredItems,
            discount: bill.discount,
            discountType: bill.discountType
          });
        }}
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
