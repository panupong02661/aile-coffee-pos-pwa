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
  const [promptPayPhone, setPromptPayPhone] = useState<string>('0969365265'); // Default fallback
  const [shopLogoUrl, setShopLogoUrl] = useState<string>('');
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
      loadPromptPayPhone();
    }
  }, [isOpen]);

  // Load PromptPay phone from shop_settings via edge function
  const loadPromptPayPhone = async () => {
    try {
      const res = await fetch('https://mzvzbxflwvksohrmxbsy.supabase.co/functions/v1/get-promptpay-phone');
      if (!res.ok) throw new Error(`Edge function HTTP ${res.status}`);
      const json = await res.json();
      if (json?.phone) {
        console.log('📱 Loaded PromptPay phone for payment:', json.phone);
        // ใช้เบอร์จากฐานข้อมูลถ้าเป็นเบอร์มือถือ (08x หรือ 09x)
        const digits = json.phone.replace(/\D/g, '');
        if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
          setPromptPayPhone(json.phone);
        } else {
          console.log('⚠️ Phone from DB is not mobile, using default: 0969365265');
          setPromptPayPhone('0969365265');
        }
      } else {
        console.log('⚠️ No phone number returned, using default: 0969365265');
        setPromptPayPhone('0969365265');
      }
      
      // Load shop logo
      if (json?.logo_url) {
        console.log('🏪 Loaded shop logo:', json.logo_url);
        setShopLogoUrl(json.logo_url);
      }
    } catch (err) {
      console.error('Error loading PromptPay phone via edge:', err);
      console.log('Using default phone: 0969365265');
      setPromptPayPhone('0969365265');
    }
  };

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
        // ใช้ค่า fallback ที่ตรงกับฐานข้อมูล
        setMembershipSettings([
          { tier: 'silver', points_to_redeem: 110, redeem_value: 10, points_per_baht: 1.2, discount_percentage: 5, minimum_spend_for_upgrade: 0 },
          { tier: 'gold', points_to_redeem: 80, redeem_value: 10, points_per_baht: 1.5, discount_percentage: 10, minimum_spend_for_upgrade: 5000 },
          { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2, discount_percentage: 15, minimum_spend_for_upgrade: 15000 }
        ]);
      } else {
        console.log('[PaymentModal] Loaded membership settings from database:', data);
        setMembershipSettings(data);
      }
    } catch (error) {
      console.warn('[PaymentModal] Error loading membership settings, using defaults:', error);
      // ใช้ค่า fallback ที่ตรงกับฐานข้อมูล
      setMembershipSettings([
        { tier: 'silver', points_to_redeem: 110, redeem_value: 10, points_per_baht: 1.2, discount_percentage: 5, minimum_spend_for_upgrade: 0 },
        { tier: 'gold', points_to_redeem: 80, redeem_value: 10, points_per_baht: 1.5, discount_percentage: 10, minimum_spend_for_upgrade: 5000 },
        { tier: 'platinum', points_to_redeem: 60, redeem_value: 20, points_per_baht: 2, discount_percentage: 15, minimum_spend_for_upgrade: 15000 }
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

      // Get random unused WiFi voucher
      let wifiVoucher = null;
      try {
        const { data: voucherData } = await supabase
          .from('wifi_vouchers')
          .select('id, username, password, qr_code_url')
          .eq('is_used', false)
          .limit(1)
          .maybeSingle();

        if (voucherData) {
          // Mark as used
          await supabase
            .from('wifi_vouchers')
            .update({ 
              is_used: true, 
              used_at: new Date().toISOString(),
              order_id: order.id 
            })
            .eq('id', voucherData.id);

          wifiVoucher = voucherData;
          console.log(`[PaymentModal] WiFi voucher assigned:`, voucherData.username);
        }
      } catch (voucherError) {
        console.warn(`[PaymentModal] WiFi voucher assignment failed (non-critical):`, voucherError);
      }

      console.log(`[PaymentModal] Order processing completed successfully`);
      
      // Return both order and order items for notification
      return {
        ...order,
        order_items: orderItems,
        member_name: selectedMember?.name || null,
        member_phone: selectedMember?.phone || null,
        wifi_voucher: wifiVoucher
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

    // แสดง toast โดยไม่รอ (ปิดเสียงแจ้งเตือนตามคำขอ)
    // playPaymentSuccessBell().catch(err => console.log('เสียงกระดิ่งเล่นไม่ได้:', err));
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
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[92vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <div className="bg-gradient-to-br from-primary to-primary/70 p-1.5 rounded-xl">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            ชำระเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5">
          {/* Order Summary - Enhanced with gradient */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-2.5 rounded-2xl border-2 border-primary/20 shadow-sm">
            <div className="flex justify-between items-center text-base font-semibold">
              <span className="text-foreground">ยอดชำระ:</span>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ฿{total.toLocaleString()}
              </span>
            </div>
            {selectedMember && (
              <div className="mt-1.5 text-xs">
                <div className="font-medium text-foreground">{selectedMember.name} ({selectedMember.phone})</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] font-medium">
                    {getTierDisplayName(selectedMember.tier)}
                  </span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-medium">
                    {selectedMember.points.toLocaleString()} แต้ม
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Order Type Selection - Enhanced with colorful buttons */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block text-foreground">ประเภทการสั่ง</Label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  orderType === 'dine_in'
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md scale-105'
                    : 'border-border bg-card hover:border-orange-300'
                }`}
              >
                <svg className={`w-5 h-5 mb-0.5 ${orderType === 'dine_in' ? 'text-orange-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                <span className={`text-[10px] font-semibold ${orderType === 'dine_in' ? 'text-orange-700' : 'text-muted-foreground'}`}>ทานที่ร้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  orderType === 'takeaway'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md scale-105'
                    : 'border-border bg-card hover:border-blue-300'
                }`}
              >
                <svg className={`w-5 h-5 mb-0.5 ${orderType === 'takeaway' ? 'text-blue-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
                <span className={`text-[10px] font-semibold ${orderType === 'takeaway' ? 'text-blue-700' : 'text-muted-foreground'}`}>นำกลับบ้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  orderType === 'delivery'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md scale-105'
                    : 'border-border bg-card hover:border-purple-300'
                }`}
              >
                <svg className={`w-5 h-5 mb-0.5 ${orderType === 'delivery' ? 'text-purple-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h5l3 3v5h-2m-4 0H3M7 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span className={`text-[10px] font-semibold ${orderType === 'delivery' ? 'text-purple-700' : 'text-muted-foreground'}`}>จัดส่ง</span>
              </button>
            </div>
          </div>

          {/* Payment Method Selection - Enhanced with colorful cards */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block text-foreground">วิธีการชำระเงิน</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={handleMethodChange}
              className="mt-0.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  paymentMethod === 'cash' 
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md' 
                    : 'border-border bg-card hover:border-emerald-300'
                }`}>
                  <RadioGroupItem value="cash" id="cash" className="w-4 h-4" />
                  <Label htmlFor="cash" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${paymentMethod === 'cash' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <span className={paymentMethod === 'cash' ? 'text-emerald-700' : 'text-foreground'}>เงินสด</span>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  paymentMethod === 'qr' 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md' 
                    : 'border-border bg-card hover:border-blue-300'
                }`}>
                  <RadioGroupItem value="qr" id="qr" className="w-4 h-4" />
                  <Label htmlFor="qr" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${paymentMethod === 'qr' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className={paymentMethod === 'qr' ? 'text-blue-700' : 'text-foreground'}>QR Code</span>
                  </Label>
                </div>

                {/* Only show points payment option when a customer is selected */}
                {selectedMember && (
                  <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                    paymentMethod === 'points' 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md' 
                      : 'border-border bg-card hover:border-purple-300'
                  }`}>
                    <RadioGroupItem value="points" id="points" className="w-4 h-4" />
                    <Label htmlFor="points" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                      <div className={`p-1.5 rounded-lg ${paymentMethod === 'points' ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className={paymentMethod === 'points' ? 'text-purple-700' : 'text-foreground'}>แต้มสะสม</span>
                    </Label>
                  </div>
                )}

                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  paymentMethod === 'promptpay' 
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 shadow-md' 
                    : 'border-border bg-card hover:border-pink-300'
                }`}>
                  <RadioGroupItem value="promptpay" id="promptpay" className="w-4 h-4" />
                  <Label htmlFor="promptpay" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${paymentMethod === 'promptpay' ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className={paymentMethod === 'promptpay' ? 'text-pink-700' : 'text-foreground'}>PromptPay</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Input and Banknotes - Compact */}
          {paymentMethod === 'cash' && (
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="cash-received" className="text-sm">จำนวนเงินที่รับ (บาท)</Label>
                <Input
                  id="cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  min={total}
                  step="0.01"
                  className="mt-0.5 h-9 text-sm"
                />
              </div>

              {/* Banknote Buttons - Compact */}
              <div>
                <Label className="text-sm font-semibold mb-1 block text-foreground">ธนบัตร</Label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {banknotes.map((amount, index) => {
                    const colors = [
                      'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
                      'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                      'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                      'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                      'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
                    ];
                    return (
                      <Button
                        key={amount}
                        onClick={() => handleBanknoteClick(amount)}
                        className={`h-10 text-sm font-bold bg-gradient-to-br ${colors[index]} text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl`}
                      >
                        ฿{amount}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Exact Payment and Change display */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExactPayment}
                    className="flex-1 h-10 text-sm font-bold bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl"
                  >
                    จ่ายพอดี (฿{total.toLocaleString()})
                  </Button>
                  
                  {change > 0 && (
                    <div className="flex-1 flex items-center justify-center p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-300 shadow-sm">
                      <span className="text-cyan-700 font-bold text-sm">
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

              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300 shadow-sm">
                  <div className="text-sm space-y-2">
                    <div className="font-bold text-purple-900 text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      สมาชิกระดับ{getTierDisplayName(selectedMember.tier)}
                    </div>
                    <div className="text-purple-700 font-medium">แต้มที่มี: {selectedMember.points.toLocaleString()} แต้ม</div>
                    <div className="font-semibold text-purple-800 bg-white/50 p-2 rounded-xl">
                      อัตราแลกแต้ม: {currentTierSettings.points_to_redeem} แต้ม = ฿{currentTierSettings.redeem_value}
                    </div>
                    <div className="text-purple-700">ขั้นต่ำการแลก: {getMinimumPoints()} แต้ม = ฿{currentTierSettings.redeem_value}</div>
                    <div className="text-purple-700">สามารถใช้ได้สูงสุด: {getMaximumPoints().toLocaleString()} แต้ม</div>
                    {pointsToUse && (
                      <>
                        <div className="font-bold text-purple-900 bg-white/70 p-2 rounded-xl">แต้มที่ใช้: {parseInt(pointsToUse).toLocaleString()} แต้ม = ฿{pointsValue.toLocaleString()}</div>
                        {remainingAmount > 0 && (
                          <div className="text-orange-700 font-bold bg-orange-100 p-2 rounded-xl">ยอดคงเหลือ: ฿{remainingAmount.toLocaleString()}</div>
                        )}
                        <div className="text-purple-700">แต้มคงเหลือ: {(selectedMember.points - parseInt(pointsToUse)).toLocaleString()} แต้ม</div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleUseAllPoints}
                  className="w-full h-14 text-base font-bold bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-2xl"
                >
                  ใช้แต้มสูงสุด ({getMaximumPoints().toLocaleString()} แต้ม)
                </Button>
              </div>
            </div>
          )}

          {/* QR Code Payment Info - Enhanced design */}
          {paymentMethod === 'qr' && (
            <div className="space-y-2">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-300 text-center shadow-sm">
                <div className="text-base text-blue-700 font-semibold">
                  แสดง QR Code สำหรับการชำระเงิน
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
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
                defaultPhoneNumber={promptPayPhone}
                shopLogoUrl={shopLogoUrl}
                compact={true}
              />
            </div>
          )}

          <Separator />

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 pt-1">
            <Button 
              onClick={onClose}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all rounded-xl"
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
