
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Percent, Clock } from 'lucide-react';
import { CartItem, PaymentMethod } from '@/types';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import HoldBillModal from './HoldBillModal';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateDiscount: (itemId: string, discount: number, discountType: 'percent' | 'amount') => void;
  onClearCart: () => void;
  billDiscount: number;
  billDiscountType: 'percent' | 'amount';
  onUpdateBillDiscount: (discount: number) => void;
  onUpdateBillDiscountType: (type: 'percent' | 'amount') => void;
  onRestoreCart: (items: CartItem[], discount: number, discountType: 'percent' | 'amount') => void;
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
  onRestoreCart
}: CartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  
  const calculateBillDiscount = () => {
    if (billDiscountType === 'percent') {
      return Math.min(subtotal * billDiscount / 100, subtotal);
    }
    return Math.min(billDiscount, subtotal);
  };

  const billDiscountAmount = calculateBillDiscount();
  const total = Math.max(0, subtotal - billDiscountAmount);

  const handlePayment = (paymentMethod: PaymentMethod, cashReceived?: number) => {
    console.log('Payment processed:', { paymentMethod, total, cashReceived });
    onClearCart();
    setIsPaymentModalOpen(false);
    onUpdateBillDiscount(0);
  };

  const handleApplyDiscount = (discount: number, type: 'percent' | 'amount') => {
    onUpdateBillDiscount(discount);
    onUpdateBillDiscountType(type);
  };

  const handleHoldBill = () => {
    onClearCart();
    onUpdateBillDiscount(0);
  };

  const handleRestoreBill = (bill: any) => {
    onRestoreCart(bill.items, bill.discount, bill.discountType);
  };

  return (
    <>
      <Card className="h-full flex flex-col border-coffee-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-coffee-800">ตะกร้าสินค้า</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                ไม่มีสินค้าในตะกร้า
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="border border-coffee-100 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-coffee-800">
                        {item.menu_item.name}
                      </h4>
                      {item.selected_addons.length > 0 && (
                        <div className="text-xs text-coffee-600 mt-1">
                          {item.selected_addons.map(addon => addon.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
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
                      <span className="w-8 text-center font-medium">
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
                    <div className="text-right">
                      <div className="font-medium text-coffee-600">
                        ฿{item.total_price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="ส่วนลด"
                      value={item.item_discount || ''}
                      onChange={(e) => onUpdateDiscount(
                        item.id, 
                        Number(e.target.value) || 0, 
                        item.item_discount_type
                      )}
                      className="flex-1 h-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateDiscount(
                        item.id,
                        item.item_discount,
                        item.item_discount_type === 'percent' ? 'amount' : 'percent'
                      )}
                      className="text-xs"
                    >
                      {item.item_discount_type === 'percent' ? '%' : '฿'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-coffee-200 pt-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ยอดรวมย่อย:</span>
                  <span>฿{subtotal}</span>
                </div>

                {billDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>ส่วนลด ({billDiscountType === 'percent' ? billDiscount + '%' : '฿' + billDiscount}):</span>
                    <span>-฿{billDiscountAmount}</span>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-coffee-600">฿{total}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-coffee-600 hover:bg-coffee-700"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={total <= 0}
                >
                  ชำระเงิน
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    ส่วนลด
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsHoldBillModalOpen(true)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    พักบิล
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClearCart}
                >
                  เคลียร์ตะกร้า
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onPayment={handlePayment}
      />

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApplyDiscount={handleApplyDiscount}
        currentDiscount={billDiscount}
        currentType={billDiscountType}
      />

      <HoldBillModal
        isOpen={isHoldBillModalOpen}
        onClose={() => setIsHoldBillModalOpen(false)}
        currentCart={cartItems}
        currentDiscount={billDiscount}
        currentDiscountType={billDiscountType}
        currentTotal={total}
        onHoldBill={handleHoldBill}
        onRestoreBill={handleRestoreBill}
      />
    </>
  );
};

export default Cart;
