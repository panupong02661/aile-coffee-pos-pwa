import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Percent, Clock, Tag, QrCode } from 'lucide-react';
import { CartItem, PaymentMethod } from '@/types';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import HoldBillModal from './HoldBillModal';
import ItemDiscountModal from './ItemDiscountModal';
import CodeModal from './CodeModal';
import { useToast } from '@/hooks/use-toast';
import { usePromotions } from '@/hooks/usePromotions';
import { calculatePromotionDiscount } from '@/utils/promotionUtils';

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
  onCodeApply?: (giftData: any) => void;
  appliedGiftCode?: any;
  onPaymentComplete?: () => void;
  selectedMember?: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    total_spent: number;
  } | null;
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
  onCodeApply,
  appliedGiftCode,
  onPaymentComplete,
  selectedMember
}: CartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [isItemDiscountModalOpen, setIsItemDiscountModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null);
  const { toast } = useToast();

  // เพิ่ม usePromotions hook
  const { data: promotions = [] } = usePromotions();

  // ใช้ useEffect เพื่อใช้โปรโมชั่นอัตโนมัติเมื่อมีการเปลี่ยนแปลงตะกร้า
  useEffect(() => {
    console.log('🔄 Cart items or promotions changed');
    console.log('Cart items count:', cartItems.length);
    console.log('Promotions count:', promotions.length);
    
    if (promotions.length > 0 && cartItems.length > 0) {
      cartItems.forEach((item, index) => {
        console.log(`\n--- Processing item ${index + 1}: ${item.menu_item.name} ---`);
        const promotionResult = calculatePromotionDiscount(item, promotions);
        console.log('Promotion result for', item.menu_item.name, ':', promotionResult);
        
        // ใช้โปรโมชั่นเฉพาะเมื่อมีส่วนลดและยังไม่ได้ใช้หรือส่วนลดเปลี่ยนแปลง
        if (promotionResult.discount > 0) {
          const currentDiscount = item.item_discount || 0;
          console.log('Current item discount:', currentDiscount);
          console.log('New promotion discount:', promotionResult.discount);
          
          if (Math.abs(promotionResult.discount - currentDiscount) > 0.01) { // ใช้ threshold เล็กน้อยสำหรับการเปรียบเทียบ float
            console.log('🎯 Applying promotion to', item.menu_item.name);
            onUpdateDiscount(item.id, promotionResult.discount, promotionResult.discountType);
            toast({
              title: 'ใช้โปรโมชั่น',
              description: `ใช้โปรโมชั่น "${promotionResult.promotionName}" กับ ${item.menu_item.name}`,
            });
          } else {
            console.log('ℹ️ Promotion already applied to', item.menu_item.name);
          }
        } else {
          // ลบส่วนลดถ้าไม่มีสิทธิ์แล้ว
          if (item.item_discount > 0) {
            console.log('🗑️ Removing promotion from', item.menu_item.name);
            onUpdateDiscount(item.id, 0, 'amount');
          }
        }
      });
    } else {
      console.log('ℹ️ No promotions or cart items to process');
    }
  }, [cartItems, promotions, onUpdateDiscount, toast]);

  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.total_price, 0), 
    [cartItems]
  );
  
  const calculateBillDiscount = useCallback(() => {
    if (billDiscountType === 'percent') {
      return Math.min(subtotal * billDiscount / 100, subtotal);
    }
    return Math.min(billDiscount, subtotal);
  }, [billDiscountType, billDiscount, subtotal]);

  const billDiscountAmount = useMemo(() => calculateBillDiscount(), [calculateBillDiscount]);
  const total = useMemo(() => Math.max(0, subtotal - billDiscountAmount), [subtotal, billDiscountAmount]);

  const hasItemDiscounts = useMemo(() => 
    cartItems.some(item => item.item_discount > 0), 
    [cartItems]
  );

  const handlePayment = useCallback((paymentMethod: PaymentMethod, cashReceived?: number) => {
    console.log('Payment processed:', { paymentMethod, total, cashReceived });
    
    // Mark gift code as used when payment is completed
    if (onPaymentComplete) {
      onPaymentComplete();
    }
    
    onClearCart();
    setIsPaymentModalOpen(false);
    onUpdateBillDiscount(0);
  }, [onPaymentComplete, onClearCart, onUpdateBillDiscount]);

  const handleApplyDiscount = useCallback((discount: number, type: 'percent' | 'amount') => {
    onUpdateBillDiscount(discount);
    onUpdateBillDiscountType(type);
  }, [onUpdateBillDiscount, onUpdateBillDiscountType]);

  const handleHoldBill = useCallback(() => {
    onClearCart();
    onUpdateBillDiscount(0);
  }, [onClearCart, onUpdateBillDiscount]);

  const handleRestoreBill = useCallback((bill: any) => {
    onRestoreCart(bill.items, bill.discount, bill.discountType);
  }, [onRestoreCart]);

  const handleItemDiscountClick = useCallback((item: CartItem) => {
    setSelectedItemForDiscount(item);
    setIsItemDiscountModalOpen(true);
  }, []);

  const handleApplyItemDiscount = useCallback((discount: number, type: 'percent' | 'amount') => {
    if (selectedItemForDiscount) {
      onUpdateDiscount(selectedItemForDiscount.id, discount, type);
    }
  }, [selectedItemForDiscount, onUpdateDiscount]);

  return (
    <>
      <Card className="h-full flex flex-col border-coffee-200 overflow-hidden">
        <CardHeader className="pb-2 pt-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-coffee-800 text-base">
              ตะกร้าสินค้า
            </CardTitle>
            <span className="text-coffee-600 text-sm">
              ({cartItems.length} รายการ)
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0 p-3 pt-0 overflow-hidden">
          {/* Payment Summary Section - Always show */}
          <div className="border border-coffee-200 rounded-lg p-3 mb-3 bg-coffee-50 flex-shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>ยอดรวมย่อย:</span>
                <span>฿{subtotal}</span>
              </div>

              {hasItemDiscounts && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>ส่วนลดรายการ:</span>
                  <span>-฿{cartItems.reduce((sum, item) => {
                    const basePrice = item.menu_item.price + item.selected_addons.reduce((s, addon) => s + addon.price, 0);
                    const totalBasePrice = basePrice * item.quantity;
                    return sum + (totalBasePrice - item.total_price);
                  }, 0)}</span>
                </div>
              )}

              {billDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>ส่วนลดท้ายบิล ({billDiscountType === 'percent' ? billDiscount + '%' : '฿' + billDiscount}):</span>
                  <span>-฿{billDiscountAmount}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between font-bold text-base">
                <span>ยอดชำระสุทธิ:</span>
                <span className="text-coffee-600">฿{total}</span>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Button 
                className="w-full bg-coffee-600 hover:bg-coffee-700 h-8"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cartItems.length === 0}
                size="sm"
              >
                ชำระ
              </Button>
              
              <div className="grid grid-cols-4 gap-1">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 h-7 p-1"
                  size="sm"
                >
                  <Percent className="w-3 h-3" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsHoldBillModalOpen(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 h-7 p-1"
                  size="sm"
                >
                  <Clock className="w-3 h-3" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setIsCodeModalOpen(true)}
                  className="border-green-300 text-green-700 hover:bg-green-50 h-7 p-1"
                  size="sm"
                >
                  <QrCode className="w-3 h-3" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={onClearCart}
                  className="h-7 p-1"
                  size="sm"
                >
                  เคลียร์
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Items Section - Independent scrollbar */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden space-y-2" style={{ scrollbarWidth: 'thin' }}>
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  ไม่มีสินค้าในตะกร้า
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="border border-coffee-100 rounded-lg p-2 space-y-2">
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
                        {item.item_discount > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            ส่วนลด: {item.item_discount_type === 'percent' ? `${item.item_discount}%` : `฿${item.item_discount}`}
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
                          className="w-7 h-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemDiscountClick(item)}
                          className={`ml-2 w-7 h-7 p-0 ${item.item_discount > 0 ? 'border-orange-300 text-orange-700 bg-orange-50' : ''}`}
                          title={item.item_discount > 0 
                            ? `ส่วนลด ${item.item_discount_type === 'percent' ? item.item_discount + '%' : '฿' + item.item_discount}`
                            : 'ส่วนลด'
                          }
                        >
                          <Tag className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-coffee-600 text-sm">
                          ฿{item.total_price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onPayment={handlePayment}
        cartItems={cartItems}
        billDiscount={billDiscount}
        billDiscountType={billDiscountType}
        selectedMember={selectedMember}
        appliedGiftCode={appliedGiftCode}
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

      {selectedItemForDiscount && (
        <ItemDiscountModal
          isOpen={isItemDiscountModalOpen}
          onClose={() => {
            setIsItemDiscountModalOpen(false);
            setSelectedItemForDiscount(null);
          }}
          onApplyDiscount={handleApplyItemDiscount}
          currentDiscount={selectedItemForDiscount.item_discount}
          currentType={selectedItemForDiscount.item_discount_type}
          itemName={selectedItemForDiscount.menu_item.name}
        />
      )}

      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onApplyCode={(giftData) => {
          if (onCodeApply) {
            onCodeApply(giftData);
          }
        }}
      />
    </>
  );
};

export default memo(Cart);
