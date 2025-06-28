import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Gift, ArrowLeft, QrCode } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types';
import { reduceStockForOrder } from '@/utils/stockUtils';
import QRCodePromptPay from './QRCodePromptPay';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPayment: (paymentMethod: PaymentMethod, cashReceived?: number) => void;
  cartItems?: CartItem[];
  billDiscount?: number;
  billDiscountType?: 'percent' | 'amount';
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

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  total, 
  onPayment, 
  cartItems = [], 
  billDiscount = 0, 
  billDiscountType = 'amount',
  selectedMember = null 
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>(total.toString());
  const [pointsToUse, setPointsToUse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  const [currentTierSettings, setCurrentTierSettings] = useState<any>(null);
  const [promptPayPhone, setPromptPayPhone] = useState<string>(() => {
    // Load saved phone numbers
    const saved = localStorage.getItem('promptpay-phone-numbers');
    const phones = saved ? JSON.parse(saved) : [];
    return phones.length > 0 ? phones[0] : '';
  });
  const { toast } = useToast();

  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;
  const banknotes = [20, 50, 100, 500, 1000];

  useEffect(() => {
    if (isOpen) {
      loadMembershipSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMember && membershipSettings) {
      const tierSettings = membershipSettings.find((setting: any) => setting.tier === selectedMember.tier);
      setCurrentTierSettings(tierSettings);
    }
  }, [selectedMember, membershipSettings]);

  useEffect(() => {
    if (paymentMethod === 'points' && selectedMember && currentTierSettings) {
      const maxPointsCanUse = Math.min(
        selectedMember.points,
        Math.floor(total / currentTierSettings.redeem_value * currentTierSettings.points_to_redeem)
      );
      setPointsToUse(maxPointsCanUse.toString());
    }
  }, [paymentMethod, selectedMember, currentTierSettings, total]);

  const loadMembershipSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_settings')
        .select('*')
        .order('tier');

      if (error) {
        console.warn('[PaymentModal] Failed to load membership settings, using defaults:', error);
        setMembershipSettings([
          { tier: 'silver', points_to_redeem: 100, redeem_value: 10, points_per_baht: 1 },
          { tier: 'gold', points_to_redeem: 80, redeem_value: 15, points_per_baht: 1.5 },
          { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2 }
        ]);
      } else {
        setMembershipSettings(data);
      }
    } catch (error) {
      console.warn('[PaymentModal] Error loading membership settings, using defaults:', error);
      setMembershipSettings([
        { tier: 'silver', points_to_redeem: 100, redeem_value: 10, points_per_baht: 1 },
        { tier: 'gold', points_to_redeem: 80, redeem_value: 15, points_per_baht: 1.5 },
        { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2 }
      ]);
    }
  };

  const calculatePointsValue = (points: number) => {
    if (!currentTierSettings) return 0;
    return (points / currentTierSettings.points_to_redeem) * currentTierSettings.redeem_value;
  };

  const calculateRequiredPoints = (amount: number) => {
    if (!currentTierSettings) return 0;
    return Math.ceil((amount / currentTierSettings.redeem_value) * currentTierSettings.points_to_redeem);
  };

  const getMinimumPoints = () => {
    if (!currentTierSettings) return 0;
    return currentTierSettings.points_to_redeem;
  };

  const getMaximumPoints = () => {
    if (!selectedMember || !currentTierSettings) return 0;
    return Math.min(
      selectedMember.points,
      calculateRequiredPoints(total)
    );
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'silver': return 'เงิน';
      case 'gold': return 'ทอง';
      case 'platinum': return 'แพลตินัม';
      default: return tier;
    }
  };

  const generateUniqueOrderNumber = async (maxRetries = 10) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[PaymentModal] Generating order number, attempt ${attempt}/${maxRetries}`);
        
        const { data: orderNumber, error } = await supabase.rpc('generate_order_number');
        
        if (error) {
          console.warn(`[PaymentModal] Order number generation failed (attempt ${attempt}):`, error.message);
          
          if (attempt === maxRetries) {
            const fallbackOrderNumber = `ORD-FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            console.log(`[PaymentModal] Using fallback order number: ${fallbackOrderNumber}`);
            return fallbackOrderNumber;
          }
          
          const delay = 50 * Math.pow(2, Math.min(attempt - 1, 5));
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (!orderNumber) {
          throw new Error('No order number returned from database function');
        }
        
        console.log(`[PaymentModal] Generated order number: ${orderNumber}`);
        return orderNumber;
        
      } catch (error) {
        console.warn(`[PaymentModal] Unexpected error generating order number (attempt ${attempt}):`, error);
        
        if (attempt === maxRetries) {
          const fallbackOrderNumber = `ORD-FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          console.log(`[PaymentModal] Using fallback order number: ${fallbackOrderNumber}`);
          return fallbackOrderNumber;
        }
        
        const delay = 50 * Math.pow(2, Math.min(attempt - 1, 5));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const saveOrderToDatabase = async (method: PaymentMethod) => {
    try {
      console.log(`[PaymentModal] Starting order save process`);
      
      // Validate basic data
      if (!cartItems || cartItems.length === 0) {
        throw new Error('ตะกร้าสินค้าว่างเปล่า');
      }

      if (total < 0) {
        throw new Error('ยอดเงินไม่ถูกต้อง');
      }

      // Calculate final amounts
      let actualTotal = total;
      let pointsUsed = 0;
      
      if (method === 'points' && pointsToUse) {
        pointsUsed = parseInt(pointsToUse);
        const pointsValue = calculatePointsValue(pointsUsed);
        actualTotal = Math.max(0.01, total - pointsValue);
        console.log(`[PaymentModal] Points payment: ${pointsUsed} points = ฿${pointsValue}, remaining: ฿${actualTotal}`);
      }

      // Generate order number
      const orderNumber = await generateUniqueOrderNumber();
      
      // Prepare order data
      const orderData = {
        order_number: String(orderNumber),
        member_id: selectedMember?.id || null,
        total_amount: Number(actualTotal),
        items_count: cartItems.reduce((sum, item) => sum + Number(item.quantity), 0),
        payment_method: String(method),
        bill_discount: Number(billDiscount) || 0,
        bill_discount_type: String(billDiscountType) || 'amount'
      };

      console.log(`[PaymentModal] Order data:`, orderData);

      // Save order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error(`[PaymentModal] Order insert failed:`, orderError);
        throw new Error(`ไม่สามารถบันทึกออเดอร์ได้: ${orderError.message}`);
      }

      if (!order || !order.id) {
        throw new Error('ไม่ได้รับ ID ออเดอร์จากฐานข้อมูล');
      }

      console.log(`[PaymentModal] Order saved successfully:`, order);

      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: String(item.menu_item.id),
        menu_item_name: String(item.menu_item.name),
        quantity: Number(item.quantity),
        unit_price: Number(item.menu_item.price),
        item_discount: Number(item.item_discount) || 0,
        item_discount_type: String(item.item_discount_type) || 'amount',
        total_price: Number(item.total_price),
        selected_addons: JSON.stringify(item.selected_addons?.map(addon => ({
          id: String(addon.id),
          name: String(addon.name),
          price: Number(addon.price)
        })) || [])
      }));

      console.log(`[PaymentModal] Saving ${orderItems.length} order items`);

      // Save order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error(`[PaymentModal] Order items insert failed:`, itemsError);
        throw new Error(`ไม่สามารถบันทึกรายการสินค้าได้: ${itemsError.message}`);
      }

      console.log(`[PaymentModal] Order items saved successfully`);

      // Reduce stock for ingredients - wait for this to complete
      console.log(`[PaymentModal] Starting stock reduction...`);
      const stockResult = await reduceStockForOrder(orderItems);
      
      if (stockResult.success) {
        console.log(`[PaymentModal] Stock reduction completed:`, stockResult.message);
        if (stockResult.successCount > 0) {
          toast({
            title: "ปรับปรุงสต็อกสำเร็จ",
            description: `ปรับปรุงสต็อกวัตถุดิบ ${stockResult.successCount} รายการแล้ว`,
          });
        }
      } else {
        console.warn(`[PaymentModal] Stock reduction issues:`, stockResult.error);
        toast({
          title: "คำเตือนเกี่ยวกับสต็อก",
          description: stockResult.error || "มีปัญหาในการปรับปรุงสต็อกบางรายการ",
          variant: "destructive"
        });
      }

      // Handle member points
      if (selectedMember) {
        try {
          if (method === 'points' && pointsUsed > 0) {
            const newPoints = selectedMember.points - pointsUsed;
            console.log(`[PaymentModal] Updating member points: ${selectedMember.points} - ${pointsUsed} = ${newPoints}`);

            await supabase
              .from('members')
              .update({
                points: newPoints,
                total_spent: selectedMember.total_spent + actualTotal
              })
              .eq('id', selectedMember.id);

            // Log point transaction
            await supabase
              .from('point_transactions')
              .insert({
                member_id: selectedMember.id,
                order_id: order.id,
                points_change: -pointsUsed,
                transaction_type: 'redeem',
                description: `ใช้แต้มชำระเงิน ${pointsUsed} แต้ม ออเดอร์ ${orderNumber}`
              });
          } else {
            // Earn points from purchase
            const pointsEarned = Math.floor(actualTotal * (currentTierSettings?.points_per_baht || 1));
            const newPoints = selectedMember.points + pointsEarned;
            console.log(`[PaymentModal] Adding points: ${selectedMember.points} + ${pointsEarned} = ${newPoints}`);

            await supabase
              .from('members')
              .update({
                points: newPoints,
                total_spent: selectedMember.total_spent + actualTotal
              })
              .eq('id', selectedMember.id);

            if (pointsEarned > 0) {
              await supabase
                .from('point_transactions')
                .insert({
                  member_id: selectedMember.id,
                  order_id: order.id,
                  points_change: pointsEarned,
                  transaction_type: 'earn',
                  description: `รับแต้มจากการซื้อสินค้า ออเดอร์ ${orderNumber}`
                });
            }
          }
        } catch (pointError) {
          console.warn(`[PaymentModal] Points handling error (non-critical):`, pointError);
        }
      }

      console.log(`[PaymentModal] Order processing completed successfully`);
      
      // Show success message
      toast({
        title: "ชำระเงินสำเร็จ",
        description: `ออเดอร์ ${orderNumber} ถูกบันทึกเรียบร้อยแล้ว`,
      });

      return order;

    } catch (error) {
      console.error(`[PaymentModal] Save order failed:`, error);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : 'ไม่สามารถบันทึกออเดอร์ได้',
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handlePayment = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    console.log(`[PaymentModal] Starting payment process with method: ${paymentMethod}`);

    try {
      // Validate input - ตรวจสอบว่ามีสินค้าในตะกร้า
      if (!cartItems || cartItems.length === 0) {
        toast({
          title: "ไม่มีสินค้าในตะกร้า",
          description: "กรุณาเพิ่มสินค้าก่อนชำระเงิน",
          variant: "destructive"
        });
        return;
      }

      // ลบการตรวจสอบยอดเงินต้องมากกว่า 0 เพราะอนุญาตให้ชำระ 0 บาทได้

      // Validate payment method specific requirements
      if (paymentMethod === 'cash') {
        const receivedAmount = parseFloat(cashReceived || '0');
        if (isNaN(receivedAmount) || receivedAmount < total) {
          toast({
            title: "จำนวนเงินไม่เพียงพอ",
            description: `กรุณากรอกจำนวนเงินที่รับมา (ขั้นต่ำ ฿${total})`,
            variant: "destructive"
          });
          return;
        }
      } else if (paymentMethod === 'points') {
        if (!selectedMember) {
          toast({
            title: "กรุณาเลือกสมาชิก",
            description: "การชำระด้วยแต้มต้องเป็นสมาชิกเท่านั้น",
            variant: "destructive"
          });
          return;
        }

        const pointsValue = parseInt(pointsToUse || '0');
        const minimumPoints = getMinimumPoints();
        const maximumPoints = getMaximumPoints();

        if (pointsValue < minimumPoints) {
          toast({
            title: "แต้มไม่เพียงพอ",
            description: `ต้องใช้แต้มขั้นต่ำ ${minimumPoints} แต้ม`,
            variant: "destructive"
          });
          return;
        }

        if (pointsValue > maximumPoints) {
          toast({
            title: "แต้มเกินจำนวนที่มี",
            description: `สามารถใช้แต้มได้สูงสุด ${maximumPoints} แต้ม`,
            variant: "destructive"
          });
          return;
        }
      } else if (paymentMethod === 'promptpay') {
        if (!promptPayPhone.trim()) {
          toast({
            title: "กรุณาระบุหมายเลขโทรศัพท์",
            description: "การชำระด้วย PromptPay ต้องระบุหมายเลขโทรศัพท์",
            variant: "destructive"
          });
          return;
        }
      }

      // ทำ payment ทันทีก่อน - ไม่รอการบันทึกฐานข้อมูล
      const cashAmount = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') : undefined;
      onPayment(paymentMethod, cashAmount);
      
      // แสดงข้อความสำเร็จทันที
      toast({
        title: "ชำระเงินสำเร็จ",
        description: `ยอดชำระ ฿${total.toLocaleString()}`,
      });
      
      // ปิด modal ทันที
      onClose();

      // บันทึกข้อมูลในฐานข้อมูลในพื้นหลัง (ไม่ await)
      saveOrderToDatabase(paymentMethod).catch(error => {
        console.error('Background save error:', error);
        // แสดงข้อความแจ้งเตือนถ้าบันทึกไม่สำเร็จ แต่ไม่บล็อก UI
        toast({
          title: "คำเตือน",
          description: "การชำระเงินสำเร็จแล้ว แต่อาจมีปัญหาในการบันทึกข้อมูล",
          variant: "destructive"
        });
      });
      
    } catch (error) {
      console.error(`[PaymentModal] Payment process failed:`, error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลการชำระเงินได้",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    if (value !== 'cash') {
      setCashReceived(total.toString());
    }
    if (value !== 'points') {
      setPointsToUse('');
    }
  };

  const handleBanknoteClick = (amount: number) => {
    const currentAmount = parseFloat(cashReceived || '0');
    const newAmount = currentAmount + amount;
    setCashReceived(newAmount.toString());
  };

  const handleExactPayment = () => {
    setCashReceived(total.toString());
  };

  const handleUseAllPoints = () => {
    if (selectedMember && currentTierSettings) {
      const maxPoints = getMaximumPoints();
      setPointsToUse(maxPoints.toString());
    }
  };

  const pointsValue = pointsToUse ? calculatePointsValue(parseInt(pointsToUse)) : 0;
  const remainingAmount = Math.max(0, total - pointsValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-w-[95vw] max-h-[75vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-4 h-4" />
            ชำระเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Order Summary - Compact */}
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex justify-between items-center text-base font-semibold">
              <span>ยอดชำระ:</span>
              <span className="text-green-600">฿{total.toLocaleString()}</span>
            </div>
            {selectedMember && (
              <div className="mt-1 text-xs text-gray-600">
                {selectedMember.name} ({selectedMember.phone})
                <div className="text-blue-600">
                  {getTierDisplayName(selectedMember.tier)} | {selectedMember.points.toLocaleString()} แต้ม
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection - Compact */}
          <div>
            <Label className="text-sm font-medium">วิธีการชำระเงิน</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={handleMethodChange}
              className="mt-1"
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center space-x-1 p-1.5 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="cash" id="cash" className="w-3 h-3" />
                  <Label htmlFor="cash" className="flex items-center gap-1 cursor-pointer flex-1 text-xs">
                    <DollarSign className="w-3 h-3" />
                    เงินสด
                  </Label>
                </div>
                
                <div className="flex items-center space-x-1 p-1.5 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="qr" id="qr" className="w-3 h-3" />
                  <Label htmlFor="qr" className="flex items-center gap-1 cursor-pointer flex-1 text-xs">
                    <CreditCard className="w-3 h-3" />
                    QR Code
                  </Label>
                </div>

                <div className="flex items-center space-x-1 p-1.5 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="points" id="points" className="w-3 h-3" />
                  <Label htmlFor="points" className="flex items-center gap-1 cursor-pointer flex-1 text-xs">
                    <Gift className="w-3 h-3" />
                    แต้มสะสม
                  </Label>
                </div>

                <div className="flex items-center space-x-1 p-1.5 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="promptpay" id="promptpay" className="w-3 h-3" />
                  <Label htmlFor="promptpay" className="flex items-center gap-1 cursor-pointer flex-1 text-xs">
                    <QrCode className="w-3 h-3" />
                    PromptPay
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Input and Banknotes - Compact */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="cash-received" className="text-sm">จำนวนเงินที่รับ (บาท)</Label>
                <Input
                  id="cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  min={total}
                  step="0.01"
                  className="mt-1 h-8"
                />
              </div>

              {/* Banknote Buttons - Compact */}
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">ธนบัตร</Label>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {banknotes.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleBanknoteClick(amount)}
                      className="h-8 text-xs font-medium"
                    >
                      ฿{amount}
                    </Button>
                  ))}
                </div>
                
                {/* Exact Payment and Change display */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    onClick={handleExactPayment}
                    className="flex-1 h-8 text-xs font-medium border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  >
                    จ่ายพอดี (฿{total.toLocaleString()})
                  </Button>
                  
                  {change > 0 && (
                    <div className="flex-1 flex items-center justify-center p-2 bg-blue-50 rounded border">
                      <span className="text-blue-700 font-medium text-xs">
                        เงินทอน: ฿{change.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Points Payment Input - Compact */}
          {paymentMethod === 'points' && selectedMember && currentTierSettings && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="points-input" className="text-sm">จำนวนแต้มที่ต้องการใช้</Label>
                <Input
                  id="points-input"
                  type="number"
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(e.target.value)}
                  min={getMinimumPoints()}
                  max={getMaximumPoints()}
                  className="mt-1 h-8"
                  placeholder={`ขั้นต่ำ ${getMinimumPoints()} แต้ม`}
                />
              </div>

              <div className="space-y-1">
                <div className="p-2 bg-purple-50 rounded border">
                  <div className="text-xs text-purple-700 space-y-0.5">
                    <div className="font-medium text-purple-800 text-sm">
                      สมาชิกระดับ{getTierDisplayName(selectedMember.tier)}
                    </div>
                    <div>แต้มที่มี: {selectedMember.points.toLocaleString()} แต้ม</div>
                    <div className="font-medium">
                      อัตราแลกแต้ม: {currentTierSettings.points_to_redeem} แต้ม = ฿{currentTierSettings.redeem_value}
                    </div>
                    <div>ขั้นต่ำการแลก: {getMinimumPoints()} แต้ม = ฿{currentTierSettings.redeem_value}</div>
                    <div>สามารถใช้ได้สูงสุด: {getMaximumPoints().toLocaleString()} แต้ม</div>
                    {pointsToUse && (
                      <>
                        <div className="font-medium text-purple-800">แต้มที่ใช้: {parseInt(pointsToUse).toLocaleString()} แต้ม = ฿{pointsValue.toLocaleString()}</div>
                        {remainingAmount > 0 && (
                          <div className="text-orange-700 font-medium">ยอดคงเหลือ: ฿{remainingAmount.toLocaleString()}</div>
                        )}
                        <div>แต้มคงเหลือ: {(selectedMember.points - parseInt(pointsToUse)).toLocaleString()} แต้ม</div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleUseAllPoints}
                  className="w-full h-8 text-xs border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700"
                >
                  ใช้แต้มสูงสุด ({getMaximumPoints().toLocaleString()} แต้ม)
                </Button>
              </div>
            </div>
          )}

          {/* QR Code Payment Info - Compact */}
          {paymentMethod === 'qr' && (
            <div className="space-y-1">
              <div className="p-2 bg-blue-50 rounded border text-center">
                <div className="text-xs text-blue-700">
                  แสดง QR Code สำหรับการชำระเงิน
                </div>
                <div className="text-base font-semibold text-blue-800 mt-1">
                  ฿{total.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* PromptPay QR Code - New */}
          {paymentMethod === 'promptpay' && (
            <div className="space-y-2">
              <div className="p-2 bg-green-50 rounded border">
                <div className="space-y-2">
                  <Label htmlFor="promptpay-phone" className="text-sm">หมายเลขโทรศัพท์ PromptPay</Label>
                  <Input
                    id="promptpay-phone"
                    type="tel"
                    value={promptPayPhone}
                    onChange={(e) => setPromptPayPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="h-8"
                  />
                  <div className="text-xs text-green-700">
                    จำนวนเงิน: ฿{total.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {promptPayPhone.trim() && (
                <div className="max-w-[200px] mx-auto">
                  <QRCodePromptPay 
                    amount={total}
                    defaultPhoneNumber={promptPayPhone}
                  />
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Action Buttons - แก้ไขเงื่อนไข */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-9"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 h-9 bg-green-600 hover:bg-green-700"
              disabled={isProcessing || !cartItems || cartItems.length === 0}
            >
              {isProcessing ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
