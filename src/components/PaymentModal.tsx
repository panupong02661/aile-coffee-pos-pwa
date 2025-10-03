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

// Function to send POS order notification with complete details
const sendPosOrderNotification = async (order: any, orderItems: any[] = [], discountCode?: string) => {
  try {
    console.log('🏪 Sending POS order notification for:', order.order_number);
    
    // Format order items for notification with COMPLETE addon details (including item-level discounts)
    const formattedOrderItems = orderItems.map((item: any) => ({
      id: item.id || null,
      menu_item_name: item.menu_item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      // include item discount fields so notifications can show them
      item_discount: item.item_discount || 0,
      item_discount_type: item.item_discount_type || 'amount',
      selected_addons: item.selected_addons ? 
        (typeof item.selected_addons === 'string' ? 
          JSON.parse(item.selected_addons) : 
          item.selected_addons) : []
    }));

    // Prepare complete order data for notification with POS source
    const orderData = {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      items_count: formattedOrderItems.reduce((sum, item) => sum + item.quantity, 0),
      member_id: order.member_id,
      payment_method: order.payment_method,
      order_source: 'pos', // Mark as POS order
      status: 'completed',
      created_at: order.created_at || new Date().toISOString(),
      customer_notes: '',
      customer_name: order.member_name || order.customer_name || 'ลูกค้า',
      customer_phone: order.member_phone || order.customer_phone || '',
      bill_discount: order.bill_discount || 0,
      bill_discount_type: order.bill_discount_type || 'amount',
      discount_code: discountCode || null,
      order_items: formattedOrderItems // Include complete order items
    };

    console.log('🏪 POS order data with items:', orderData);

    // Call the notification edge function
    const response = await supabase.functions.invoke('send-order-notification', {
      body: { orderData }
    });

    if (response.error) {
      console.error('POS notification failed:', response.error);
    } else {
      console.log('✅ POS notification sent successfully:', response.data);
    }
  } catch (error) {
    console.error('Error sending POS notification:', error);
  }
};

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
  appliedGiftCode?: any;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  total, 
  onPayment, 
  cartItems = [], 
  billDiscount = 0, 
  billDiscountType = 'amount',
  selectedMember = null,
  appliedGiftCode = null
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>(total.toString());
  const [pointsToUse, setPointsToUse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  const [currentTierSettings, setCurrentTierSettings] = useState<any>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [promptPayPhone, setPromptPayPhone] = useState<string>(() => {
    // Load saved phone numbers
    const saved = localStorage.getItem('promptpay-phone-numbers');
    const phones = saved ? JSON.parse(saved) : [];
    return phones.length > 0 ? phones[0] : '';
  });
  const { toast } = useToast();

  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;
  const banknotes = [20, 50, 100, 500, 1000];

  // ฟังก์ชันเล่นเสียงกระดิ่งเป็นเวลา 7 วินาที
  const playPaymentSuccessBell = async () => {
    try {
      console.log('🔔 Playing payment success bell for 7 seconds...');
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const totalDuration = 7; // 7 วินาที
      const bellInterval = 0.8; // ช่วงระหว่างเสียงกระดิ่ง
      const volume = 0.4; // ความดังพอดี
      
      let currentTime = audioContext.currentTime;
      const endTime = currentTime + totalDuration;
      
      console.log(`🔔 Playing bell sound for ${totalDuration} seconds`);
      
      // สร้างเสียงกระดิ่งต่อเนื่องเป็นเวลา 7 วินาที
      while (currentTime < endTime) {
        // สร้างเสียงกระดิ่งที่ไพเราะ - 3 โน้ต
        const bellFrequencies = [
          { freq: 523.25, delay: 0.0, duration: 0.6 },   // C5
          { freq: 659.25, delay: 0.15, duration: 0.5 },  // E5  
          { freq: 783.99, delay: 0.3, duration: 0.4 }    // G5
        ];
        
        bellFrequencies.forEach((note) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          // เพิ่มเอฟเฟค reverb ให้เสียงไพเราะ
          const lowPassFilter = audioContext.createBiquadFilter();
          lowPassFilter.type = 'lowpass';
          lowPassFilter.frequency.value = 2000;
          
          oscillator.connect(lowPassFilter);
          lowPassFilter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = note.freq;
          oscillator.type = 'sine';
          
          const noteStartTime = currentTime + note.delay;
          const noteEndTime = noteStartTime + note.duration;
          
          // สร้างเสน่ห์ของเสียงกระดิ่ง
          gainNode.gain.setValueAtTime(0, noteStartTime);
          gainNode.gain.linearRampToValueAtTime(volume, noteStartTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, noteEndTime);
          
          oscillator.start(noteStartTime);
          oscillator.stop(noteEndTime);
        });
        
        currentTime += bellInterval;
      }
      
      console.log(`✅ Payment success bell played for ${totalDuration} seconds`);
    } catch (error) {
      console.error('Payment success bell failed:', error);
    }
  };

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

  // Reset payment method to cash if points is selected but no member is selected
  useEffect(() => {
    if (paymentMethod === 'points' && !selectedMember) {
      setPaymentMethod('cash');
    }
  }, [paymentMethod, selectedMember]);

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
        bill_discount_type: String(billDiscountType) || 'amount',
        order_type: String(orderType)
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
      
      // Return both order and order items for notification
      return {
        ...order,
        order_items: orderItems,
        member_name: selectedMember?.name || null,
        member_phone: selectedMember?.phone || null
      };

    } catch (error) {
      console.error(`[PaymentModal] Save order failed:`, error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (isProcessing) {
      return;
    }

    // ปิด modal และอัปเดต UI ทันทีเพื่อความเร็วสูงสุด
    setIsProcessing(true);
    
    // ทำ UI updates ทันทีก่อนการ validation
    const cashAmount = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') : undefined;
    onPayment(paymentMethod, cashAmount);
    
    // ปิด modal ทันที
    setIsProcessing(false);
    onClose();

    // เล่นเสียงและแสดง toast โดยไม่รอ
    playPaymentSuccessBell().catch(err => console.log('เสียงกระดิ่งเล่นไม่ได้:', err));
    toast({
      title: "✅ ชำระเงินสำเร็จ",
      description: `ยอดชำระ ฿${total.toLocaleString()}`,
    });

    // ทำทุกอย่างในพื้นหลัง - validation และบันทึกข้อมูล
    setTimeout(async () => {
      try {
        console.log(`[PaymentModal] Background processing for payment method: ${paymentMethod}`);
        
        // Basic validation in background
        if (!cartItems || cartItems.length === 0) {
          toast({
            title: "คำเตือน",
            description: "ไม่มีสินค้าในตะกร้า กรุณาตรวจสอบ",
            variant: "destructive"
          });
          return;
        }

        // Quick validation for critical cases
        if (paymentMethod === 'cash') {
          const receivedAmount = parseFloat(cashReceived || '0');
          if (isNaN(receivedAmount) || receivedAmount < total) {
            toast({
              title: "คำเตือน",
              description: "จำนวนเงินไม่เพียงพอ กรุณาตรวจสอบ",
              variant: "destructive"
            });
            return;
          }
        } else if (paymentMethod === 'points' && selectedMember) {
          const pointsValue = parseInt(pointsToUse || '0');
          const minimumPoints = getMinimumPoints();
          const maximumPoints = getMaximumPoints();

          if (pointsValue < minimumPoints || pointsValue > maximumPoints) {
            toast({
              title: "คำเตือน",
              description: "จำนวนแต้มไม่ถูกต้อง กรุณาตรวจสอบ",
              variant: "destructive"
            });
            return;
          }
        }

        // บันทึกข้อมูลในฐานข้อมูล
        const savedOrder = await saveOrderToDatabase(paymentMethod);
        
        if (savedOrder) {
          console.log('Background database save completed successfully');
          toast({
            title: "บันทึกข้อมูลสำเร็จ",
            description: "ข้อมูลออเดอร์ถูกบันทึกเรียบร้อยแล้ว",
          });

          // Send POS order notification with complete order items data
          sendPosOrderNotification(
            savedOrder,
            savedOrder.order_items,
            appliedGiftCode?.gift_code || appliedGiftCode?.promo_code || appliedGiftCode?.gift_name || undefined
          ).catch(error => {
            console.error('POS notification error:', error);
          });
        }
        
      } catch (error) {
        console.error('Background processing error:', error);
        toast({
          title: "เกิดข้อผิดพลาดในการบันทึก",
          description: "การชำระเงินสำเร็จแล้ว แต่มีปัญหาในการบันทึกข้อมูล",
          variant: "destructive"
        });
      }
    }, 0); // Execute immediately but in next tick
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
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-5 h-5" />
            ชำระเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Order Summary - Reduced padding */}
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>ยอดชำระ:</span>
              <span className="text-green-600">฿{total.toLocaleString()}</span>
            </div>
            {selectedMember && (
              <div className="mt-1 text-sm text-gray-600">
                {selectedMember.name} ({selectedMember.phone})
                <div className="text-blue-600">
                  {getTierDisplayName(selectedMember.tier)} | {selectedMember.points.toLocaleString()} แต้ม
                </div>
              </div>
            )}
          </div>

          {/* Order Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-1 block">ประเภทการสั่ง</Label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  orderType === 'dine_in'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                <span className="text-xs font-medium">ทานที่ร้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  orderType === 'takeaway'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
                <span className="text-xs font-medium">นำกลับบ้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  orderType === 'delivery'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h5l3 3v5h-2m-4 0H3M7 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span className="text-xs font-medium">จัดส่ง</span>
              </button>
            </div>
          </div>

          {/* Payment Method Selection - Larger buttons */}
          <div>
            <Label className="text-base font-medium">วิธีการชำระเงิน</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={handleMethodChange}
              className="mt-1"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 p-4 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="cash" id="cash" className="w-5 h-5" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1 text-base">
                    <DollarSign className="w-5 h-5" />
                    เงินสด
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="qr" id="qr" className="w-5 h-5" />
                  <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer flex-1 text-base">
                    <CreditCard className="w-5 h-5" />
                    QR Code
                  </Label>
                </div>

                {/* Only show points payment option when a customer is selected */}
                {selectedMember && (
                  <div className="flex items-center space-x-2 p-4 border rounded hover:bg-gray-50">
                    <RadioGroupItem value="points" id="points" className="w-5 h-5" />
                    <Label htmlFor="points" className="flex items-center gap-2 cursor-pointer flex-1 text-base">
                      <Gift className="w-5 h-5" />
                      แต้มสะสม
                    </Label>
                  </div>
                )}

                <div className="flex items-center space-x-2 p-4 border rounded hover:bg-gray-50">
                  <RadioGroupItem value="promptpay" id="promptpay" className="w-5 h-5" />
                  <Label htmlFor="promptpay" className="flex items-center gap-2 cursor-pointer flex-1 text-base">
                    <QrCode className="w-5 h-5" />
                    PromptPay
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Input and Banknotes - Larger buttons */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="cash-received" className="text-base">จำนวนเงินที่รับ (บาท)</Label>
                <Input
                  id="cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  min={total}
                  step="0.01"
                  className="mt-1 h-12 text-base"
                />
              </div>

              {/* Banknote Buttons - Larger size */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">ธนบัตร</Label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {banknotes.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleBanknoteClick(amount)}
                      className="h-12 text-base font-medium"
                    >
                      ฿{amount}
                    </Button>
                  ))}
                </div>
                
                {/* Exact Payment and Change display */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExactPayment}
                    className="flex-1 h-12 text-base font-medium border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  >
                    จ่ายพอดี (฿{total.toLocaleString()})
                  </Button>
                  
                  {change > 0 && (
                    <div className="flex-1 flex items-center justify-center p-2 bg-blue-50 rounded border">
                      <span className="text-blue-700 font-medium text-base">
                        เงินทอน: ฿{change.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Points Payment Input - Larger buttons */}
          {paymentMethod === 'points' && selectedMember && currentTierSettings && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="points-input" className="text-base">จำนวนแต้มที่ต้องการใช้</Label>
                <Input
                  id="points-input"
                  type="number"
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(e.target.value)}
                  min={getMinimumPoints()}
                  max={getMaximumPoints()}
                  className="mt-1 h-12 text-base"
                  placeholder={`ขั้นต่ำ ${getMinimumPoints()} แต้ม`}
                />
              </div>

              <div className="space-y-2">
                <div className="p-2 bg-purple-50 rounded border">
                  <div className="text-sm text-purple-700 space-y-1">
                    <div className="font-medium text-purple-800 text-base">
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
                  className="w-full h-12 text-base border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700"
                >
                  ใช้แต้มสูงสุด ({getMaximumPoints().toLocaleString()} แต้ม)
                </Button>
              </div>
            </div>
          )}

          {/* QR Code Payment Info - Reduced padding */}
          {paymentMethod === 'qr' && (
            <div className="space-y-1">
              <div className="p-2 bg-blue-50 rounded border text-center">
                <div className="text-base text-blue-700">
                  แสดง QR Code สำหรับการชำระเงิน
                </div>
                <div className="text-xl font-semibold text-blue-800 mt-1">
                  ฿{total.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* PromptPay QR Code - Show only QR Code */}
          {paymentMethod === 'promptpay' && (
            <div className="text-center">
              <QRCodePromptPay 
                amount={total}
                defaultPhoneNumber={promptPayPhone || '0969365265'}
                compact={true}
                onQRGenerated={(qrData) => {
                  // Save phone number to localStorage
                  const saved = localStorage.getItem('promptpay-phone-numbers');
                  const phones = saved ? JSON.parse(saved) : [];
                  const phoneToSave = promptPayPhone || '0969365265';
                  if (!phones.includes(phoneToSave.trim())) {
                    phones.unshift(phoneToSave.trim());
                    localStorage.setItem('promptpay-phone-numbers', JSON.stringify(phones.slice(0, 5))); // Keep only 5 recent numbers
                  }
                }}
              />
            </div>
          )}

          <Separator />

          {/* Action Buttons - Larger size */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-14 text-lg"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700"
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
