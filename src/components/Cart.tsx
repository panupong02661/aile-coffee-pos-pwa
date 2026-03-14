
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Percent, Clock, Tag, QrCode, ShoppingCart, CreditCard, UtensilsCrossed, FileText, Merge, ArrowRightLeft } from 'lucide-react';
import { CartItem, PaymentMethod } from '@/types';
import PaymentModal from './PaymentModal';
import DiscountModal from './DiscountModal';
import HoldBillModal from './HoldBillModal';
import ItemDiscountModal from './ItemDiscountModal';
import CodeModal from './CodeModal';
import TableBillPreview from './TableBillPreview';
import { useToast } from '@/hooks/use-toast';
import { usePromotions } from '@/hooks/usePromotions';
import { calculatePromotionDiscount, calculateBillPromotionDiscount } from '@/utils/promotionUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoundOrder {
  id: string;
  table_id: string;
  table_number: string;
  cart_items: CartItem[];
  bill_discount: number;
  bill_discount_type: 'percent' | 'amount';
  round_number: number;
  created_at: string;
  status: string;
}

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
  onMemberUpdate?: (updatedMember: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    total_spent: number;
  }) => void;
  selectedMember?: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    total_spent: number;
  } | null;
  // Table management
  tables?: { id: string; table_number: string; capacity: number; status: string }[];
  selectedTableId?: string | null;
  onSelectTable?: (tableId: string | null) => void;
  tablesWithOrders?: string[];
  onSaveToTable?: () => void;
  onLoadFromTable?: (tableId: string) => void;
  selectedTableNumber?: string;
  // Round-based ordering
  tableRounds?: RoundOrder[];
  onLoadRound?: (roundNumber: number) => void;
  onDeleteRound?: (roundOrderId: string, tableId: string) => void;
  onUpdateRoundItem?: (roundOrderId: string, items: CartItem[], discount: number, discountType: 'percent' | 'amount') => void;
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
  onMemberUpdate,
  selectedMember,
  tables = [],
  selectedTableId,
  onSelectTable,
  tablesWithOrders = [],
  onSaveToTable,
  onLoadFromTable,
  selectedTableNumber,
  tableRounds = [],
  onLoadRound,
  onDeleteRound,
  onUpdateRoundItem,
}: CartProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isHoldBillModalOpen, setIsHoldBillModalOpen] = useState(false);
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [isItemDiscountModalOpen, setIsItemDiscountModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<CartItem | null>(null);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [mergeFrom, setMergeFrom] = useState('');
  const [mergeTo, setMergeTo] = useState('');
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState('');
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const { toast } = useToast();

  const { data: promotions = [] } = usePromotions();
  const [appliedBillPromotion, setAppliedBillPromotion] = useState<string | null>(null);

  useEffect(() => {
    if (promotions.length > 0 && cartItems.length > 0) {
      cartItems.forEach((item) => {
        const promotionResult = calculatePromotionDiscount(item, promotions, cartItems);
        if (promotionResult.discount > 0 && promotionResult.applyType === 'item') {
          const currentDiscount = item.item_discount || 0;
          if (Math.abs(promotionResult.discount - currentDiscount) > 0.01) {
            onUpdateDiscount(item.id, promotionResult.discount, promotionResult.discountType);
            toast({
              title: 'ใช้โปรโมชั่น',
              description: `ใช้โปรโมชั่น "${promotionResult.promotionName}" กับ ${item.menu_item.name}`,
            });
          }
        } else if (promotionResult.discount === 0 || promotionResult.applyType === 'item') {
          if (item.item_discount > 0 && promotionResult.applyType !== 'bill') {
            onUpdateDiscount(item.id, 0, 'amount');
          }
        }
      });

      const billPromotion = calculateBillPromotionDiscount(cartItems, promotions);
      if (billPromotion) {
        if (appliedBillPromotion !== billPromotion.promotionName) {
          onUpdateBillDiscount(billPromotion.discount);
          onUpdateBillDiscountType(billPromotion.discountType);
          setAppliedBillPromotion(billPromotion.promotionName);
          toast({
            title: 'ใช้โปรโมชั่นท้ายบิล',
            description: `ใช้โปรโมชั่น "${billPromotion.promotionName}" ลด ${billPromotion.discount.toFixed(0)} บาท`,
          });
        }
      } else {
        if (appliedBillPromotion) {
          onUpdateBillDiscount(0);
          setAppliedBillPromotion(null);
        }
      }
    } else {
      if (appliedBillPromotion) {
        setAppliedBillPromotion(null);
      }
    }
  }, [cartItems, promotions, onUpdateDiscount, onUpdateBillDiscount, onUpdateBillDiscountType, toast, appliedBillPromotion]);

  // Sync cart to customer display
  const syncCartToDisplay = useCallback(async (showPayment: boolean = false) => {
    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const currentBillDiscountAmount = billDiscountType === 'percent'
      ? Math.min(currentSubtotal * billDiscount / 100, currentSubtotal)
      : Math.min(billDiscount, currentSubtotal);
    const currentTotal = Math.max(0, currentSubtotal - currentBillDiscountAmount);
    
    const displayData = {
      cartItems: cartItems.map(item => {
        const addonsTotal = Array.isArray(item.selected_addons) ? item.selected_addons.reduce((s, addon) => s + addon.price, 0) : 0;
        return {
          id: item.id,
          name: item.menu_item.name,
          price: item.menu_item.price,
          quantity: item.quantity,
          addons: Array.isArray(item.selected_addons) ? item.selected_addons.map(addon => ({
            name: addon.name,
            price: addon.price
          })) : [],
          discount: item.item_discount,
          discountType: item.item_discount_type,
          totalPrice: item.total_price
        };
      }),
      totalAmount: currentTotal,
      subtotal: currentSubtotal,
      billDiscount,
      billDiscountType,
      showPayment,
      timestamp: Date.now()
    };
    
    try {
      const { error } = await supabase
        .from('cart_display_sync' as any)
        .upsert({
          id: 'current-cart',
          cart_data: displayData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) console.error('Cart sync error:', error);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  }, [cartItems, billDiscount, billDiscountType]);

  useEffect(() => {
    syncCartToDisplay(false);
  }, [syncCartToDisplay]);

  useEffect(() => {
    syncCartToDisplay(isPaymentModalOpen);
  }, [isPaymentModalOpen, syncCartToDisplay]);

  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.total_price, 0), 
    [cartItems]
  );
  
  const calculateBillDiscountFn = useCallback(() => {
    if (billDiscountType === 'percent') {
      return Math.min(subtotal * billDiscount / 100, subtotal);
    }
    return Math.min(billDiscount, subtotal);
  }, [billDiscountType, billDiscount, subtotal]);

  const billDiscountAmount = useMemo(() => calculateBillDiscountFn(), [calculateBillDiscountFn]);
  const total = useMemo(() => Math.max(0, subtotal - billDiscountAmount), [subtotal, billDiscountAmount]);

  const hasItemDiscounts = useMemo(() => 
    cartItems.some(item => item.item_discount > 0), 
    [cartItems]
  );

  const totalItemCount = useMemo(() =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handlePayment = useCallback((paymentMethod: PaymentMethod, cashReceived?: number) => {
    if (onPaymentComplete) onPaymentComplete();
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

  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const availableTables = tables.filter(t => t.status === 'available');

  const handleMergeTables = async () => {
    if (!mergeFrom || !mergeTo || mergeFrom === mergeTo) {
      toast({ title: 'กรุณาเลือกโต๊ะที่ต่างกัน', variant: 'destructive' });
      return;
    }
    const targetTable = tables.find(t => t.id === mergeTo);
    await supabase.from('table_orders' as any).update({ table_id: mergeTo, table_number: targetTable?.table_number || '' }).eq('table_id', mergeFrom).eq('status', 'active');
    await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', mergeFrom);
    await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', mergeTo);
    toast({ title: 'รวมโต๊ะสำเร็จ' });
    setIsMergeDialogOpen(false);
    setMergeFrom('');
    setMergeTo('');
  };

  const handleMoveTables = async () => {
    if (!moveFrom || !moveTo || moveFrom === moveTo) {
      toast({ title: 'กรุณาเลือกโต๊ะที่ต่างกัน', variant: 'destructive' });
      return;
    }
    const targetTable = tables.find(t => t.id === moveTo);
    await supabase.from('table_orders' as any).update({ table_id: moveTo, table_number: targetTable?.table_number || '' }).eq('table_id', moveFrom).eq('status', 'active');
    await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', moveFrom);
    await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', moveTo);
    toast({ title: 'ย้ายโต๊ะสำเร็จ' });
    setIsMoveDialogOpen(false);
    setMoveFrom('');
    setMoveTo('');
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden bg-card border-border">
        {/* Header with icon + badge + table selector */}
        <CardHeader className="py-2 px-3 flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-primary" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-pos-badge-pop" key={totalItemCount}>
                    {totalItemCount}
                  </span>
                )}
              </div>
              <h3 className="text-foreground text-sm font-bold truncate font-sans">
                {selectedTableNumber ? `โต๊ะ ${selectedTableNumber}` : 'ตะกร้าสินค้า'}
              </h3>

              {/* Table merge/move popover */}
              {tables.length > 0 && occupiedTables.length > 0 && (
                <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="start">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => { setTablePopoverOpen(false); setIsMoveDialogOpen(true); }}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> ย้ายโต๊ะ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => { setTablePopoverOpen(false); setIsMergeDialogOpen(true); }}
                    >
                      <Merge className="w-3.5 h-3.5" /> รวมโต๊ะ
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Table selector */}
            {tables.length > 0 && onSelectTable && (
              <Select
                value={selectedTableId || 'none'}
                onValueChange={(val) => {
                  if (val === 'none') {
                    onSelectTable(null);
                  } else {
                    onSelectTable(val);
                    if (onLoadFromTable) onLoadFromTable(val);
                  }
                }}
              >
                <SelectTrigger className="w-[90px] h-7 text-xs border-primary/30">
                  <UtensilsCrossed className="w-3 h-3 mr-1 flex-shrink-0" />
                  <SelectValue placeholder="โต๊ะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่เลือก</SelectItem>
                  {tables.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-1">
                        {t.table_number}
                        {tablesWithOrders.includes(t.id) && (
                          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {/* Save to table & Bill preview buttons */}
          {selectedTableId && (
            <div className="flex gap-1.5 mt-1.5">
              {onSaveToTable && cartItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveToTable}
                  className="flex-1 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <UtensilsCrossed className="w-3 h-3 mr-1" />
                  บันทึกโต๊ะ
                </Button>
              )}
              {tableRounds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBillPreviewOpen(true)}
                  className="flex-1 h-7 text-xs border-accent/40 text-accent-foreground hover:bg-accent/10"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  ดูบิล ({tableRounds.length} รอบ)
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0 p-3 pt-0 overflow-hidden">
          {/* Payment Summary */}
          <div className="border border-border rounded-xl p-3 my-3 bg-muted/50 flex-shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ยอดรวมย่อย:</span>
                <span className="font-medium text-foreground">฿{subtotal.toLocaleString()}</span>
              </div>

              {hasItemDiscounts && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>ส่วนลดรายการ:</span>
                  <span>-฿{cartItems.reduce((sum, item) => {
                    const basePrice = item.menu_item.price + (Array.isArray(item.selected_addons) ? item.selected_addons.reduce((s, addon) => s + addon.price, 0) : 0);
                    const totalBasePrice = basePrice * item.quantity;
                    return sum + (totalBasePrice - item.total_price);
                  }, 0).toLocaleString()}</span>
                </div>
              )}

              {billDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>ส่วนลดบิล:</span>
                  <span>-฿{billDiscountAmount.toLocaleString()}</span>
                </div>
              )}

              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-base">
                <span className="text-foreground">ยอดชำระสุทธิ:</span>
                <span className="text-primary text-lg">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {/* Main payment button — bigger with CreditCard icon */}
              <Button 
                className="w-full h-12 text-base font-bold gap-2 rounded-xl"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cartItems.length === 0}
              >
                <CreditCard className="w-5 h-5" />
                ชำระเงิน
              </Button>
              
              {/* Action buttons — semantic tokens */}
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  variant="outline" 
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="h-9 p-1.5 rounded-lg"
                  title="ส่วนลด"
                >
                  <Percent className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsHoldBillModalOpen(true)}
                  className="h-9 p-1.5 rounded-lg"
                  title="พักบิล"
                >
                  <Clock className="w-4 h-4" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setIsCodeModalOpen(true)}
                  className="h-9 p-1.5 rounded-lg"
                  title="โค้ด"
                >
                  <QrCode className="w-4 h-4" />
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={onClearCart}
                  className="h-9 p-1.5 text-sm rounded-lg"
                >
                  เคลียร์
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-sm">
                  ไม่มีสินค้าในตะกร้า
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="border border-border rounded-xl p-3 space-y-2 bg-card animate-pos-pop-in">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-foreground truncate">
                          {item.menu_item.name}
                        </h4>
                        {Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-0.5 truncate">
                            {item.selected_addons.map(addon => addon.name).join(', ')}
                          </div>
                        )}
                        {item.item_discount > 0 && (
                          <div className="text-sm text-destructive mt-0.5">
                            ส่วนลด: {item.item_discount_type === 'percent' ? `${item.item_discount}%` : `฿${item.item_discount}`}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 p-0 rounded-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 p-0 rounded-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemDiscountClick(item)}
                          className={cn(
                            'ml-1 w-7 h-7 p-0 rounded-lg',
                            item.item_discount > 0 && 'border-primary/50 text-primary bg-primary/5'
                          )}
                          title={item.item_discount > 0 
                            ? `ส่วนลด ${item.item_discount_type === 'percent' ? item.item_discount + '%' : '฿' + item.item_discount}`
                            : 'ส่วนลด'
                          }
                        >
                          <Tag className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary text-sm">
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
        onMemberUpdate={onMemberUpdate}
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

      {selectedTableId && selectedTableNumber && (
        <TableBillPreview
          isOpen={isBillPreviewOpen}
          onClose={() => setIsBillPreviewOpen(false)}
          tableNumber={selectedTableNumber}
          rounds={tableRounds}
          onLoadRound={onLoadRound || (() => {})}
          onDeleteRound={onDeleteRound || (() => {})}
          onUpdateRoundItem={onUpdateRoundItem || (() => {})}
        />
      )}
    </>
  );
};

export default memo(Cart);
