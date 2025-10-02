import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Minus, Trash2, Tag, X, Clock, QrCode, Gift } from 'lucide-react';
import { CartItem, PaymentMethod } from '@/types';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import HoldBillModal from './HoldBillModal';
import ItemDiscountModal from './ItemDiscountModal';
import CodeModal from './CodeModal';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface MobileCartProps {
  isOpen: boolean;
  onClose: () => void;
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
  onProceedToPayment?: () => void;
}

const MobileCart = ({ 
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
  onCodeApply,
  appliedGiftCode,
  onPaymentComplete,
  selectedMember,
  onProceedToPayment
}: MobileCartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isItemDiscountModalOpen, setIsItemDiscountModalOpen] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null);
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  
  const calculateBillDiscount = () => {
    if (billDiscountType === 'percent') {
      return Math.min(subtotal * billDiscount / 100, subtotal);
    }
    return Math.min(billDiscount, subtotal);
  };

  const billDiscountAmount = calculateBillDiscount();
  const total = Math.max(0, subtotal - billDiscountAmount);

  const hasItemDiscounts = cartItems.some(item => item.item_discount > 0);

  const handlePayment = (paymentMethod: PaymentMethod, cashReceived?: number) => {
    console.log('Payment processed:', { paymentMethod, total, cashReceived });
    
    // Mark gift code as used when payment is completed
    if (onPaymentComplete) {
      onPaymentComplete();
    }
    
    onClearCart();
    setIsPaymentModalOpen(false);
    onUpdateBillDiscount(0);
    onClose();
  };

  const handleApplyDiscount = (discount: number, type: 'percent' | 'amount') => {
    onUpdateBillDiscount(discount);
    onUpdateBillDiscountType(type);
  };

  const handleHoldBill = () => {
    onClearCart();
    onUpdateBillDiscount(0);
    onClose();
  };

  const handleRestoreBill = (bill: any) => {
    onRestoreCart(bill.items, bill.discount, bill.discountType);
  };

  const handleItemDiscountClick = (item: CartItem) => {
    setSelectedItemForDiscount(item);
    setIsItemDiscountModalOpen(true);
  };

  const handleApplyItemDiscount = (discount: number, type: 'percent' | 'amount') => {
    if (selectedItemForDiscount) {
      onUpdateDiscount(selectedItemForDiscount.id, discount, type);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-coffee-800">
                ตะกร้าสินค้า
              </DrawerTitle>
              <div className="flex items-center space-x-2">
                <span className="text-coffee-600 text-sm">
                  ({cartItems.length} รายการ)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-hidden">
            {/* Cart Items Section - Show first */}
            <div className="flex-1 min-h-0 overflow-hidden mb-4">
              <h3 className="font-medium text-coffee-800 mb-3">รายการสินค้า</h3>
              <div className="h-full overflow-y-auto overflow-x-hidden space-y-3" style={{ scrollbarWidth: 'thin' }}>
                {cartItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    ไม่มีสินค้าในตะกร้า
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="border border-coffee-100 rounded-lg p-3 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-base text-coffee-800">
                            {item.menu_item.name}
                          </h4>
                          <div className="text-sm text-coffee-500 mt-1">
                            ราคา: ฿{item.menu_item.price}
                          </div>
                          {item.selected_addons.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs font-medium text-coffee-700">เพิ่มเติม:</div>
                              {item.selected_addons.map((addon, index) => (
                                <div key={index} className="text-xs text-coffee-600 ml-2 flex justify-between">
                                  <span>• {addon.name}</span>
                                  <span>+฿{addon.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 p-0 flex items-center justify-center"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="w-10 text-center font-medium text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 p-0 flex items-center justify-center"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-base text-coffee-600">
                            ฿{item.total_price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Summary Section */}
            <div className="border border-coffee-200 rounded-lg p-4 mb-4 bg-coffee-50 flex-shrink-0">
              <h3 className="font-medium text-coffee-800 mb-3">สรุปยอดชำระ</h3>
              <div className="space-y-2">
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
                
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-orange-600">฿{total}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex-shrink-0">
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 h-14 text-white font-semibold text-lg"
                onClick={() => {
                  if (onProceedToPayment) {
                    onProceedToPayment();
                  } else {
                    setIsPaymentModalOpen(true);
                  }
                }}
                disabled={total <= 0}
              >
                ชำระเงิน (฿{total})
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
    </>
  );
};

export default MobileCart;
