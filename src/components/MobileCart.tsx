import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Percent, Clock, Tag, X, QrCode } from 'lucide-react';
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
  selectedMember
}: MobileCartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [isItemDiscountModalOpen, setIsItemDiscountModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null);
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
              <DrawerTitle className="text-coffee-800">ตะกร้าสินค้า</DrawerTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-hidden">
            {/* Payment Summary Section */}
            {cartItems.length > 0 && (
              <div className="border border-coffee-200 rounded-lg p-4 mb-4 bg-coffee-50 flex-shrink-0">
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
                    <span className="text-coffee-600">฿{total}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Button 
                    className="w-full bg-coffee-600 hover:bg-coffee-700 h-10"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={total <= 0}
                  >
                    ชำระเงิน
                  </Button>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDiscountModalOpen(true)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 h-10"
                      size="sm"
                    >
                      <Percent className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setIsHoldBillModalOpen(true)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 h-10"
                      size="sm"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => setIsCodeModalOpen(true)}
                      className="border-green-300 text-green-700 hover:bg-green-50 h-10"
                      size="sm"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={onClearCart}
                      className="h-10"
                      size="sm"
                    >
                      เคลียร์
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items Section */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto overflow-x-hidden space-y-3" style={{ scrollbarWidth: 'thin' }}>
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
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
                            className="w-10 h-10 p-0 touch-manipulation"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 p-0 touch-manipulation"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleItemDiscountClick(item)}
                            className={`ml-2 w-10 h-10 p-0 touch-manipulation ${item.item_discount > 0 ? 'border-orange-300 text-orange-700 bg-orange-50' : ''}`}
                            title={item.item_discount > 0 
                              ? `ส่วนลด ${item.item_discount_type === 'percent' ? item.item_discount + '%' : '฿' + item.item_discount}`
                              : 'ส่วนลด'
                            }
                          >
                            <Tag className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-coffee-600">
                            ฿{item.total_price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
          // Handle applying the code
          if (giftData.gift_type === 'menu_item') {
            toast({ title: 'สำเร็จ', description: `เพิ่ม ${giftData.gift_name} แล้ว` });
          } else if (giftData.gift_type === 'promotion') {
            onUpdateBillDiscount(giftData.gift_value);
            onUpdateBillDiscountType('amount');
            toast({ title: 'สำเร็จ', description: `ใช้โปรโมชั่น ${giftData.gift_name} แล้ว` });
          }
        }}
      />
    </>
  );
};

export default MobileCart;
