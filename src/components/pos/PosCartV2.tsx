import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Plus, Minus, Trash2, Percent, Clock, Tag, QrCode, ShoppingBag,
  UtensilsCrossed, FileText, Merge, ArrowRightLeft, CalendarIcon,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { CartItem, PaymentMethod } from '@/types';
import PaymentModal from '@/components/PaymentModal';
import DiscountModal from '@/components/DiscountModal';
import HoldBillModal from '@/components/HoldBillModal';
import ItemDiscountModal from '@/components/ItemDiscountModal';
import CodeModal from '@/components/CodeModal';
import TableBillPreview from '@/components/TableBillPreview';
import { useToast } from '@/hooks/use-toast';
import { usePromotions } from '@/hooks/usePromotions';
import { calculatePromotionDiscount, calculateBillPromotionDiscount } from '@/utils/promotionUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

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

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface Props {
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
  onMemberUpdate?: (updatedMember: Member) => void;
  selectedMember?: Member | null;
  tables?: { id: string; table_number: string; capacity: number; status: string }[];
  selectedTableId?: string | null;
  onSelectTable?: (tableId: string | null) => void;
  tablesWithOrders?: string[];
  onSaveToTable?: () => void;
  onLoadFromTable?: (tableId: string) => void;
  selectedTableNumber?: string;
  tableRounds?: RoundOrder[];
  onLoadRound?: (roundNumber: number) => void;
  onDeleteRound?: (roundOrderId: string, tableId: string) => void;
  onUpdateRoundItem?: (roundOrderId: string, items: CartItem[], discount: number, discountType: 'percent' | 'amount') => void;
  backdatedAt?: Date | null;
  onChangeBackdatedAt?: (date: Date | null) => void;
}

const PosCartV2 = ({
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
  backdatedAt = null,
  onChangeBackdatedAt,
}: Props) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  // ---- Promotions (same logic as classic Cart) ----
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
      } else if (appliedBillPromotion) {
        onUpdateBillDiscount(0);
        setAppliedBillPromotion(null);
      }
    } else if (appliedBillPromotion) {
      setAppliedBillPromotion(null);
    }
  }, [cartItems, promotions, onUpdateDiscount, onUpdateBillDiscount, onUpdateBillDiscountType, toast, appliedBillPromotion]);

  // ---- Customer display sync ----
  const syncCartToDisplay = useCallback(async (showPayment: boolean = false) => {
    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const currentBillDiscountAmount = billDiscountType === 'percent'
      ? Math.min(currentSubtotal * billDiscount / 100, currentSubtotal)
      : Math.min(billDiscount, currentSubtotal);
    const currentTotal = Math.max(0, currentSubtotal - currentBillDiscountAmount);

    const displayData = {
      cartItems: cartItems.map((item) => ({
        id: item.id,
        name: item.menu_item.name,
        price: item.menu_item.price,
        quantity: item.quantity,
        addons: Array.isArray(item.selected_addons)
          ? item.selected_addons.map((addon) => ({ name: addon.name, price: addon.price }))
          : [],
        discount: item.item_discount,
        discountType: item.item_discount_type,
        totalPrice: item.total_price,
      })),
      totalAmount: currentTotal,
      subtotal: currentSubtotal,
      billDiscount,
      billDiscountType,
      showPayment,
      timestamp: Date.now(),
    };

    try {
      const { error } = await supabase
        .from('cart_display_sync' as any)
        .upsert({
          id: 'current-cart',
          cart_data: displayData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      if (error) console.error('Cart sync error:', error);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  }, [cartItems, billDiscount, billDiscountType]);

  useEffect(() => { syncCartToDisplay(false); }, [syncCartToDisplay]);
  useEffect(() => { syncCartToDisplay(isPaymentModalOpen); }, [isPaymentModalOpen, syncCartToDisplay]);

  // ---- Totals ----
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.total_price, 0),
    [cartItems]
  );

  const billDiscountAmount = useMemo(() => {
    if (billDiscountType === 'percent') return Math.min(subtotal * billDiscount / 100, subtotal);
    return Math.min(billDiscount, subtotal);
  }, [billDiscountType, billDiscount, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - billDiscountAmount), [subtotal, billDiscountAmount]);

  const itemDiscountTotal = useMemo(() =>
    cartItems.reduce((sum, item) => {
      const basePrice = item.menu_item.price +
        (Array.isArray(item.selected_addons) ? item.selected_addons.reduce((s, a) => s + a.price, 0) : 0);
      return sum + (basePrice * item.quantity - item.total_price);
    }, 0),
    [cartItems]
  );

  const totalItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // ---- Handlers ----
  const handlePayment = useCallback((_pm: PaymentMethod, _cash?: number) => {
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
    if (selectedItemForDiscount) onUpdateDiscount(selectedItemForDiscount.id, discount, type);
  }, [selectedItemForDiscount, onUpdateDiscount]);

  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const availableTables = tables.filter((t) => t.status === 'available');

  const handleMergeTables = async () => {
    if (!mergeFrom || !mergeTo || mergeFrom === mergeTo) {
      toast({ title: 'กรุณาเลือกโต๊ะที่ต่างกัน', variant: 'destructive' });
      return;
    }
    const targetTable = tables.find((t) => t.id === mergeTo);
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
    const targetTable = tables.find((t) => t.id === moveTo);
    await supabase.from('table_orders' as any).update({ table_id: moveTo, table_number: targetTable?.table_number || '' }).eq('table_id', moveFrom).eq('status', 'active');
    await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', moveFrom);
    await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', moveTo);
    toast({ title: 'ย้ายโต๊ะสำเร็จ' });
    setIsMoveDialogOpen(false);
    setMoveFrom('');
    setMoveTo('');
  };

  const shortcuts = [
    { icon: Percent, label: 'ส่วนลดบิล', onClick: () => setIsDiscountModalOpen(true), active: billDiscountAmount > 0 },
    { icon: Clock, label: 'พักบิล', onClick: () => setIsHoldBillModalOpen(true) },
    { icon: QrCode, label: 'โค้ด', onClick: () => setIsCodeModalOpen(true), active: !!appliedGiftCode },
    { icon: Trash2, label: 'เคลียร์', onClick: onClearCart, danger: true },
  ];

  return (
    <>
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-[hsl(var(--posv2-card))] border border-[hsl(var(--posv2-line))] shadow-[var(--posv2-shadow-lift)]">
        {/* Head — fixed */}
        <div className="shrink-0 space-y-1 px-3 pb-2 pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-[hsl(var(--posv2-ink))]">
                {selectedTableNumber ? `โต๊ะ ${selectedTableNumber}` : 'ตะกร้าสินค้า'}
              </h2>
              {selectedMember && (
                <p className="truncate text-xs text-[hsl(var(--posv2-ink-soft))]">
                  {selectedMember.name} · {selectedMember.points} แต้ม
                </p>
              )}
            </div>
            <span className="flex h-8 items-center gap-1.5 rounded-full bg-[hsl(var(--posv2-surface))] px-3 text-sm font-bold text-[hsl(var(--posv2-ink))]">
              <ShoppingBag className="h-4 w-4" />
              {totalItemCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onSelectTable && (
              <Select
                value={selectedTableId || 'none'}
                disabled={tables.length === 0}
                onValueChange={(val) => {
                  if (val === 'none') {
                    onSelectTable(null);
                  } else {
                    onSelectTable(val);
                    if (onLoadFromTable) onLoadFromTable(val);
                  }
                }}
              >
                <SelectTrigger className="h-8 flex-1 rounded-xl border-0 bg-[hsl(var(--posv2-surface))] text-xs text-[hsl(var(--posv2-ink))] disabled:opacity-60">
                  <UtensilsCrossed className="mr-1 h-3 w-3 shrink-0" />
                  <SelectValue placeholder={tables.length === 0 ? 'ยังไม่มีโต๊ะ' : 'โต๊ะ'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่เลือก</SelectItem>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-1">
                        {t.table_number}
                        {tablesWithOrders.includes(t.id) && (
                          <span className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--posv2-accent))]" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}


            {onChangeBackdatedAt && (
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    title="เลือกวันที่บันทึกออเดอร์"
                    className={cn(
                      'flex h-8 items-center gap-1 rounded-xl bg-[hsl(var(--posv2-surface))] px-2.5 text-xs font-semibold text-[hsl(var(--posv2-ink-soft))] active:scale-95',
                      backdatedAt && !isSameDay(backdatedAt, new Date()) &&
                        'bg-[hsl(var(--posv2-danger)/0.12)] text-[hsl(var(--posv2-danger))]'
                    )}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {backdatedAt && !isSameDay(backdatedAt, new Date()) ? format(backdatedAt, 'dd/MM') : 'วันนี้'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="flex items-center justify-between gap-2 border-b p-2">
                    <span className="text-xs text-muted-foreground">วันที่บันทึกออเดอร์</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => { onChangeBackdatedAt(null); setIsDatePickerOpen(false); }}
                    >
                      รีเซ็ตเป็นวันนี้
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={backdatedAt || new Date()}
                    onSelect={(date) => {
                      if (date) {
                        const now = new Date();
                        const merged = new Date(date);
                        merged.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                        onChangeBackdatedAt(isSameDay(merged, new Date()) ? null : merged);
                      }
                      setIsDatePickerOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                    locale={th}
                    formatters={{
                      formatCaption: (date) => `${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`,
                      formatWeekdayName: (date) => ['อา','จ','อ','พ','พฤ','ศ','ส'][date.getDay()],
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}

            {tables.length > 0 && (
              <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--posv2-surface))] text-[hsl(var(--posv2-ink-soft))] active:scale-95">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs"
                    onClick={() => { setTablePopoverOpen(false); setIsMoveDialogOpen(true); }}>
                    <ArrowRightLeft className="h-3.5 w-3.5" /> ย้ายโต๊ะ
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs"
                    onClick={() => { setTablePopoverOpen(false); setIsMergeDialogOpen(true); }}>
                    <Merge className="h-3.5 w-3.5" /> รวมโต๊ะ
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {selectedTableId && (
            <div className="flex gap-1.5">
              {onSaveToTable && cartItems.length > 0 && (
                <button
                  onClick={onSaveToTable}
                  className="flex-1 rounded-xl bg-[hsl(var(--posv2-accent)/0.12)] py-1.5 text-xs font-bold text-[hsl(var(--posv2-accent))] active:scale-95"
                >
                  บันทึกโต๊ะ
                </button>
              )}
              {tableRounds.length > 0 && (
                <button
                  onClick={() => setIsBillPreviewOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[hsl(var(--posv2-surface))] py-1.5 text-xs font-bold text-[hsl(var(--posv2-ink))] active:scale-95"
                >
                  <FileText className="h-3 w-3" /> ดูบิล ({tableRounds.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scroll body */}
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2.5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--posv2-surface))]">
                <ShoppingBag className="h-6 w-6 text-[hsl(var(--posv2-ink-soft))]" />
              </div>
              <p className="text-sm text-[hsl(var(--posv2-ink-soft))]">ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="rounded-xl bg-[hsl(var(--posv2-surface))] border border-[hsl(var(--posv2-line))] px-2 py-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[hsl(var(--posv2-ink))]">
                      {item.menu_item.name}
                    </p>
                    {Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                      <p className="truncate text-[11px] text-[hsl(var(--posv2-ink-soft))]">
                        {item.selected_addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                    {item.item_discount > 0 && (
                      <p className="text-[11px] font-semibold text-[hsl(var(--posv2-danger))]">
                        ส่วนลด {item.item_discount_type === 'percent' ? `${item.item_discount}%` : `฿${item.item_discount}`}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-[hsl(var(--posv2-accent))]">
                    ฿{item.total_price.toLocaleString()}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-lg bg-[hsl(var(--posv2-card))] p-0.5 shadow-[var(--posv2-shadow-soft)]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--posv2-ink-soft))] active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-[hsl(var(--posv2-ink))]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--posv2-ink))] text-[hsl(var(--posv2-card))] active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleItemDiscountClick(item)}
                      title="ส่วนลดรายการ"
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-ink-soft))] shadow-[var(--posv2-shadow-soft)] active:scale-90',
                        item.item_discount > 0 && 'bg-[hsl(var(--posv2-accent))] text-[hsl(var(--posv2-accent-fg))]'
                      )}
                    >
                      <Tag className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--posv2-danger)/0.12)] text-[hsl(var(--posv2-danger))] active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed footer */}
        <div className="mt-auto shrink-0 rounded-t-2xl bg-[hsl(var(--posv2-surface))] border-t border-[hsl(var(--posv2-line))] px-3 pb-2.5 pt-2">
          <div className="mb-2 space-y-0.5">
            <div className="flex justify-between text-xs text-[hsl(var(--posv2-ink-soft))]">
              <span>ยอดรวมย่อย</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {itemDiscountTotal > 0 && (
              <div className="flex justify-between text-xs text-[hsl(var(--posv2-danger))]">
                <span>ส่วนลดรายการ</span>
                <span>-฿{itemDiscountTotal.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="flex w-full items-center justify-between text-xs text-[hsl(var(--posv2-danger))]"
            >
              <span className="underline-offset-2 hover:underline">
                ส่วนลดทั้งบิล{billDiscountType === 'percent' && billDiscount > 0 ? ` (${billDiscount}%)` : ''}
              </span>
              <span>-฿{billDiscountAmount.toLocaleString()}</span>
            </button>
            <div className="flex items-end justify-between border-t border-dashed border-[hsl(var(--posv2-line))] pt-1">
              <span className="text-sm font-bold text-[hsl(var(--posv2-ink))]">ยอดสุทธิ</span>
              <span className="text-xl font-black tracking-tight text-[hsl(var(--posv2-accent))]">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-4 gap-1">
            {shortcuts.map(({ icon: Icon, label, onClick, danger, active }) => (
              <button
                key={label}
                onClick={onClick}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-all active:scale-95 border',
                  danger
                    ? 'bg-[hsl(var(--posv2-danger)/0.12)] text-[hsl(var(--posv2-danger))] border-[hsl(var(--posv2-danger)/0.25)]'
                    : active
                      ? 'bg-[hsl(var(--posv2-accent))] text-[hsl(var(--posv2-accent-fg))] border-[hsl(var(--posv2-accent))]'
                      : 'bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-ink))] border-[hsl(var(--posv2-line))] shadow-[var(--posv2-shadow-soft)]'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <button
            disabled={cartItems.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full rounded-xl bg-[hsl(var(--posv2-ink))] py-2.5 text-base font-extrabold text-[hsl(var(--posv2-card))] shadow-[var(--posv2-shadow-lift)] transition-all active:scale-[0.98] disabled:opacity-40"
          >
            ชำระเงิน
          </button>
        </div>
      </aside>

      {/* Modals — identical to classic cart */}
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
        backdatedAt={backdatedAt}
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
          onClose={() => { setIsItemDiscountModalOpen(false); setSelectedItemForDiscount(null); }}
          onApplyDiscount={handleApplyItemDiscount}
          currentDiscount={selectedItemForDiscount.item_discount}
          currentType={selectedItemForDiscount.item_discount_type}
          itemName={selectedItemForDiscount.menu_item.name}
        />
      )}

      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        onApplyCode={(giftData) => { if (onCodeApply) onCodeApply(giftData); }}
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

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>ย้ายโต๊ะ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">ย้ายลูกค้าและออเดอร์ทั้งหมดไปโต๊ะอื่น</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">จากโต๊ะ</label>
              <Select value={moveFrom} onValueChange={setMoveFrom}>
                <SelectTrigger><SelectValue placeholder="เลือกโต๊ะต้นทาง" /></SelectTrigger>
                <SelectContent>
                  {occupiedTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>โต๊ะ {t.table_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">ไปโต๊ะ</label>
              <Select value={moveTo} onValueChange={setMoveTo}>
                <SelectTrigger><SelectValue placeholder="เลือกโต๊ะปลายทาง" /></SelectTrigger>
                <SelectContent>
                  {availableTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>โต๊ะ {t.table_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleMoveTables}>ย้ายโต๊ะ</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>รวมโต๊ะ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">ย้ายออเดอร์ทั้งหมดจากโต๊ะต้นทางไปรวมที่โต๊ะปลายทาง</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">จากโต๊ะ</label>
              <Select value={mergeFrom} onValueChange={setMergeFrom}>
                <SelectTrigger><SelectValue placeholder="เลือกโต๊ะต้นทาง" /></SelectTrigger>
                <SelectContent>
                  {occupiedTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>โต๊ะ {t.table_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">ไปรวมที่โต๊ะ</label>
              <Select value={mergeTo} onValueChange={setMergeTo}>
                <SelectTrigger><SelectValue placeholder="เลือกโต๊ะปลายทาง" /></SelectTrigger>
                <SelectContent>
                  {occupiedTables.filter((t) => t.id !== mergeFrom).map((t) => (
                    <SelectItem key={t.id} value={t.id}>โต๊ะ {t.table_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleMergeTables}>รวมโต๊ะ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(PosCartV2);
