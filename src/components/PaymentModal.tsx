import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Gift, ArrowLeft, QrCode, Users, Layers } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types';
import { reduceStockForOrder } from '@/utils/stockUtils';
import { createQueueFromOrder } from '@/hooks/useQueueSystem';
import QRCodePromptPay from './QRCodePromptPay';
import ReceiptPreview from './ReceiptPreview';
import KitchenReceiptPreview from './KitchenReceiptPreview';
import StickerPreview from './StickerPreview';
import TaxInvoicePreview from './TaxInvoicePreview';
import SplitBillModal from './SplitBillModal';
import { saveReceiptToAlbum } from '@/utils/receiptSaver';

// POS order notifications removed - only online orders should trigger notifications

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
  onMemberUpdate?: (updatedMember: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tier: 'silver' | 'gold' | 'platinum';
    points: number;
    total_spent: number;
  }) => void;
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
  appliedGiftCode = null,
  onMemberUpdate
}: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>(total.toString());
  const [pointsToUse, setPointsToUse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  const [currentTierSettings, setCurrentTierSettings] = useState<any>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [receiptTab, setReceiptTab] = useState<'receipt' | 'kitchen' | 'sticker' | 'tax'>('receipt');
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [splitBillResult, setSplitBillResult] = useState<number[] | null>(null);
  const [isMultiPay, setIsMultiPay] = useState(false);
  const [multiPayCash, setMultiPayCash] = useState('');
  const [multiPayPromptPay, setMultiPayPromptPay] = useState('');
  const [promptPayPhone, setPromptPayPhone] = useState<string>('0969365265'); // Default fallback
  const [shopLogoUrl, setShopLogoUrl] = useState<string>('');
  const [wifiVoucherPreview, setWifiVoucherPreview] = useState<{ id: string; username: string; password: string; qr_code_url: string | null } | null>(null);
  const [soundPopupSettings, setSoundPopupSettings] = useState<{
    pos: { soundEnabled: boolean; popupEnabled: boolean; volume: number };
    online: { soundEnabled: boolean; popupEnabled: boolean; volume: number };
  } | null>(null);
  const { toast } = useToast();
  const { shopId } = useCurrentShop();

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

  // Track reserved voucher IDs to exclude from preview (persists across modal opens)
  const [reservedVoucherIds, setReservedVoucherIds] = useState<string[]>([]);

  // รีเซ็ต state ทุกครั้งที่ modal เปิด/ปิด
  useEffect(() => {
    if (isOpen) {
      // รีเซ็ตจำนวนเงินที่รับเป็นค่าว่างเมื่อเปิด modal
      setCashReceived('');
      setWifiVoucherPreview(null);
      loadMembershipSettings();
      loadPromptPayPhone();
      loadSoundPopupSettings();
      // โหลด WiFi voucher preview ทันที (ไม่ต้อง delay เพราะใช้ reservedVoucherIds แทน)
      loadWifiVoucherPreview();
    } else {
      // รีเซ็ตจำนวนเงินที่รับเป็นค่าว่างเมื่อปิด modal
      setCashReceived('');
      setWifiVoucherPreview(null);
    }
  }, [isOpen, reservedVoucherIds]);

  // Load sound popup settings
  const loadSoundPopupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .maybeSingle();
      
      if (data) {
        const rawData = data as any;
        if (rawData.sound_popup) {
          const settings = rawData.sound_popup;
          setSoundPopupSettings({
            pos: settings.pos || { soundEnabled: false, popupEnabled: false, volume: 80 },
            online: settings.online || { soundEnabled: true, popupEnabled: true, volume: 80 }
          });
          console.log('[PaymentModal] Loaded sound popup settings:', settings);
        } else {
          // Default: POS sound disabled
          setSoundPopupSettings({
            pos: { soundEnabled: false, popupEnabled: false, volume: 80 },
            online: { soundEnabled: true, popupEnabled: true, volume: 80 }
          });
        }
      } else {
        // Default: POS sound disabled
        setSoundPopupSettings({
          pos: { soundEnabled: false, popupEnabled: false, volume: 80 },
          online: { soundEnabled: true, popupEnabled: true, volume: 80 }
        });
      }
    } catch (error) {
      console.error('[PaymentModal] Error loading sound popup settings:', error);
      setSoundPopupSettings({
        pos: { soundEnabled: false, popupEnabled: false, volume: 80 },
        online: { soundEnabled: true, popupEnabled: true, volume: 80 }
      });
    }
  };

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

  const loadWifiVoucherPreview = async () => {
    setWifiVoucherPreview(null);
    
    try {
      console.log('[PaymentModal] Loading WiFi voucher preview, excluding reserved:', reservedVoucherIds);
      
      // Query vouchers ที่ยังไม่ได้ใช้ และไม่อยู่ใน reservedVoucherIds
      const { data: vouchers, error } = await supabase
        .from('wifi_vouchers')
        .select('id, username, password, qr_code_url, is_used, duration_hours')
        .eq('is_used', false)
        .order('created_at', { ascending: true })
        .limit(10); // ดึงมาหลายอันเผื่อ filter
      
      if (error) {
        console.error('[PaymentModal] Error loading WiFi voucher:', error);
        return;
      }
      
      if (vouchers && vouchers.length > 0) {
        // Filter out reserved vouchers ที่ยังไม่ได้บันทึกลง DB
        const availableVoucher = vouchers.find(v => !reservedVoucherIds.includes(v.id));
        
        if (availableVoucher) {
          setWifiVoucherPreview({
            id: availableVoucher.id,
            username: availableVoucher.username,
            password: availableVoucher.password,
            qr_code_url: availableVoucher.qr_code_url
          });
          console.log('[PaymentModal] WiFi voucher preview loaded:', availableVoucher.username);
        } else {
          console.log('[PaymentModal] All vouchers are reserved, none available');
        }
      } else {
        console.log('[PaymentModal] No WiFi voucher available');
      }
    } catch (error) {
      console.error('Error in WiFi voucher preview:', error);
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

  const generateUniqueOrderNumber = () => {
    // 🚀 INSTANT: ใช้ timestamp + random ทันที ไม่ต้องรอ RPC
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const orderNumber = `ORD-${dateStr}-${timeStr}${ms}${random}`;
    console.log(`[PaymentModal] Generated instant order number: ${orderNumber}`);
    return orderNumber;
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

      // Generate order number - INSTANT (no async)
      const orderNumber = generateUniqueOrderNumber();
      
      // Prepare order data
      const orderData: any = {
        order_number: String(orderNumber),
        member_id: selectedMember?.id || null,
        total_amount: Number(actualTotal),
        items_count: cartItems.reduce((sum, item) => sum + Number(item.quantity), 0),
        payment_method: String(method),
        bill_discount: Number(billDiscount) || 0,
        bill_discount_type: String(billDiscountType) || 'amount',
        order_type: String(orderType),
        shop_id: shopId || null,
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

      // 🚫 POS notification removed - only ONLINE orders should trigger notifications

      // 🚀 FAST: Fire-and-forget ทุกอย่าง - ไม่รอเลย!
      console.log(`[PaymentModal] 🚀 Starting fire-and-forget background tasks...`);
      
      let wifiVoucher: { id: string; username: string; password: string; qr_code_url: string | null } | null = null;
      
      // 1. Stock reduction (fire-and-forget - ไม่บล็อก)
      reduceStockForOrder(orderItems)
        .then(r => r.success && console.log(`[PaymentModal] ✅ Stock reduced`))
        .catch(err => console.warn('[PaymentModal] Stock error:', err));
      
      // 2. Member points update - MUST await to trigger realtime
      if (selectedMember) {
        (async () => {
          try {
            let newPoints = selectedMember.points;
            let newTotalSpent = selectedMember.total_spent + actualTotal;
            
            if (method === 'points' && pointsUsed > 0) {
              newPoints = selectedMember.points - pointsUsed;
              // ⚡ CRITICAL: await to ensure DB update triggers realtime
              const { error: updateError } = await supabase
                .from('members')
                .update({ points: newPoints, total_spent: newTotalSpent })
                .eq('id', selectedMember.id);
              
              if (updateError) {
                console.error('[PaymentModal] Member points update failed:', updateError);
              } else {
                console.log(`[PaymentModal] ✅ Member points updated in DB: ${newPoints} points`);
              }
              
              await supabase.from('point_transactions').insert({
                member_id: selectedMember.id,
                order_id: order.id,
                points_change: -pointsUsed,
                transaction_type: 'redeem',
                description: `ใช้แต้มชำระเงิน ${pointsUsed} แต้ม ออเดอร์ ${orderNumber}`
              });
            } else {
              const pointsEarned = Math.floor(actualTotal * (currentTierSettings?.points_per_baht || 1));
              newPoints = selectedMember.points + pointsEarned;
              // ⚡ CRITICAL: await to ensure DB update triggers realtime
              const { error: updateError } = await supabase
                .from('members')
                .update({ points: newPoints, total_spent: newTotalSpent })
                .eq('id', selectedMember.id);
              
              if (updateError) {
                console.error('[PaymentModal] Member points update failed:', updateError);
              } else {
                console.log(`[PaymentModal] ✅ Member points updated in DB: ${newPoints} points`);
              }
              
              if (pointsEarned > 0) {
                await supabase.from('point_transactions').insert({
                  member_id: selectedMember.id,
                  order_id: order.id,
                  points_change: pointsEarned,
                  transaction_type: 'earn',
                  description: `รับแต้มจากการซื้อสินค้า ออเดอร์ ${orderNumber}`
                });
              }
            }
            
            // Notify UI immediately with new values
            if (onMemberUpdate) {
              onMemberUpdate({ ...selectedMember, points: newPoints, total_spent: newTotalSpent });
            }
            console.log(`[PaymentModal] ✅ Member points update complete: ${newPoints} points, ฿${newTotalSpent} spent`);
          } catch (err) {
            console.warn('[PaymentModal] Points error:', err);
          }
        })();
      }
      
      // 3. WiFi voucher assignment (fire-and-forget - ไม่บล็อก)
      (async () => {
        try {
          const { getWiFiVoucherByAmount } = await import('@/utils/wifiVoucherUtils');
          const voucher = await getWiFiVoucherByAmount(actualTotal);
          if (voucher) {
            wifiVoucher = { id: voucher.id, username: voucher.username, password: voucher.password, qr_code_url: voucher.qr_code_url };
            supabase.from('orders').update({ wifi_voucher_id: voucher.id, wifi_voucher_username: voucher.username, wifi_voucher_password: voucher.password }).eq('id', order.id);
            console.log('[PaymentModal] ✅ WiFi voucher assigned');
          }
        } catch (err) {
          console.warn('[PaymentModal] WiFi error:', err);
        }
      })();
      
      console.log(`[PaymentModal] 🚀 Background tasks started (not waiting)`);
      
      // 4. Create queue ticket (fire-and-forget)
      let queueNumber: number | null = null;
      try {
        queueNumber = await createQueueFromOrder(
          order.id,
          shopId || null,
          selectedMember?.name || null,
          selectedMember?.phone || null
        );
        if (queueNumber) {
          console.log(`[PaymentModal] ✅ Queue ticket #${queueNumber} created`);
        }
      } catch (err) {
        console.warn('[PaymentModal] Queue error:', err);
      }

      console.log('[PaymentModal] Order processing completed successfully');
      
      // Return order data
      return {
        ...order,
        order_items: orderItems,
        member_name: selectedMember?.name || null,
        member_phone: selectedMember?.phone || null,
        wifi_voucher: wifiVoucher,
        queue_number: queueNumber,
      };

    } catch (error) {
      console.error(`[PaymentModal] Save order failed:`, error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (isProcessing) {
      console.log('[PaymentModal] ⚠️ Already processing, skipping...');
      return;
    }

    // ✅ Set processing state
    setIsProcessing(true);
    console.log('[PaymentModal] 🚀 Starting payment process...');

    // ✅ Validate ก่อน (sync - เร็วมาก)
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "คำเตือน",
        description: "ไม่มีสินค้าในตะกร้า กรุณาตรวจสอบ",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    if (isMultiPay) {
      const cashPart = parseFloat(multiPayCash || '0');
      const ppPart = parseFloat(multiPayPromptPay || '0');
      if (Math.abs(cashPart + ppPart - total) > 0.5) {
        toast({ title: "คำเตือน", description: "ยอดรวมการชำระผสมไม่ตรงกับยอดที่ต้องชำระ", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
    } else if (paymentMethod === 'cash') {
      const receivedAmount = parseFloat(cashReceived || '0');
      if (isNaN(receivedAmount) || receivedAmount < total) {
        toast({
          title: "คำเตือน",
          description: "จำนวนเงินไม่เพียงพอ กรุณาตรวจสอบ",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
    } else if (paymentMethod === 'points' && selectedMember) {
      const pointsVal = parseInt(pointsToUse || '0');
      const minimumPoints = getMinimumPoints();
      const maximumPoints = getMaximumPoints();

      if (pointsVal < minimumPoints || pointsVal > maximumPoints) {
        toast({
          title: "คำเตือน",
          description: "จำนวนแต้มไม่ถูกต้อง กรุณาตรวจสอบ",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
    }

    // 🔒 จอง WiFi voucher
    let reservedVoucherId: string | null = null;
    if (wifiVoucherPreview?.id) {
      reservedVoucherId = wifiVoucherPreview.id;
      setReservedVoucherIds(prev => [...prev, reservedVoucherId!]);
    }

    const startTime = Date.now();

    try {
      // 📦 บันทึก DB ทันที (BLOCKING - ต้องเสร็จก่อนปิด modal)
      console.log('[PaymentModal] 📦 Saving to database...');
      const actualMethod = isMultiPay ? 'cash' as PaymentMethod : paymentMethod;
      const savedOrder = await saveOrderToDatabase(actualMethod);
      
      const dbTime = Date.now() - startTime;
      console.log(`[PaymentModal] ✅ DB saved in ${dbTime}ms`);

      // ✅ เล่นเสียงหลังจาก save สำเร็จ (ถ้าเปิดการตั้งค่า POS sound)
      if (soundPopupSettings?.pos?.soundEnabled) {
        playPaymentSuccessBell();
      } else {
        console.log('[PaymentModal] 🔇 POS sound disabled, skipping bell');
      }

      // ✅ ปิด modal หลังจาก DB เสร็จ
      const cashAmount = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') : undefined;
      onPayment(paymentMethod, cashAmount);
      
      // รีเซ็ตค่าเริ่มต้นหลังชำระเงินสำเร็จ
      setPaymentMethod('cash');
      setOrderType('dine_in');
      
      onClose();

      // แสดง toast สำเร็จ
      const queueInfo = savedOrder?.queue_number ? ` | คิว #${String(savedOrder.queue_number).padStart(3, '0')}` : '';
      toast({
        title: "✅ ชำระเงินสำเร็จ",
        description: `ออเดอร์ #${savedOrder?.order_number || ''} - ฿${total.toLocaleString()}${queueInfo}`,
      });

      if (savedOrder?.wifi_voucher?.id) {
        setReservedVoucherIds(prev => prev.filter(id => id !== savedOrder.wifi_voucher.id));
      }

      console.log(`[PaymentModal] ✅ Total payment time: ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('[PaymentModal] ❌ Payment failed:', error);
      
      // คืน voucher ที่จองไว้
      if (reservedVoucherId) {
        setReservedVoucherIds(prev => prev.filter(id => id !== reservedVoucherId));
      }
      
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกออเดอร์ได้ กรุณาลองใหม่",
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
    // เมื่อกดธนบัตร จะแทนที่ค่าเดิมทั้งหมด (ไม่รวมกับค่าก่อนหน้า)
    setCashReceived(amount.toString());
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-3">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-md">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            ชำระเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3 overflow-hidden">
          {/* Left Column - Payment Form */}
          <div className="space-y-2 overflow-y-auto max-h-[calc(85vh-80px)] pr-1">
            {/* Order Summary - Enhanced with gradient */}
            {/* ยอดชำระ, เงินทอน และจำนวนเงินที่รับ แยกกัน 3 ช่อง */}
            <div className={`grid gap-2 mb-2 ${paymentMethod === 'cash' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {/* ช่องยอดชำระ */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-2.5 rounded-2xl border-2 border-primary/20 shadow-sm">
                <div className="flex flex-col items-center text-base font-semibold">
                  <span className="text-foreground text-xs">ยอดชำระ:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* ช่องเงินทอน */}
              <div className={`p-2.5 rounded-2xl border-2 shadow-sm ${
                paymentMethod === 'cash' && change > 0
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
                  : 'bg-gradient-to-br from-muted/30 to-muted/10 border-muted/30'
              }`}>
                <div className="flex flex-col items-center text-base font-semibold">
                  <span className="text-foreground text-xs">เงินทอน:</span>
                  <span className={`text-xl font-bold ${
                    paymentMethod === 'cash' && change > 0
                      ? 'text-orange-600'
                      : 'text-muted-foreground'
                  }`}>
                    ฿{paymentMethod === 'cash' ? change.toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {/* ช่องจำนวนเงินที่ได้รับ - แสดงเฉพาะเมื่อเลือกเงินสด */}
              {paymentMethod === 'cash' && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2.5 rounded-2xl border-2 border-blue-300 shadow-sm">
                  <div className="flex flex-col items-center text-base font-semibold">
                    <span className="text-foreground text-xs">รับเงิน:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ฿{cashReceived ? parseFloat(cashReceived).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* ข้อมูลสมาชิก - แสดงในบรรทัดเดียว */}
            {selectedMember && (
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-2 rounded-xl border-2 border-primary/20 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{selectedMember.name}</span>
                    <span className="text-xs text-muted-foreground">({selectedMember.phone})</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-[10px] font-medium">
                      {getTierDisplayName(selectedMember.tier)}
                    </span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-medium">
                      {selectedMember.points.toLocaleString()} แต้ม
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Order Type Selection - Enhanced with colorful buttons */}
          <div className="min-w-0">
            <Label className="text-xs font-semibold mb-1 block text-foreground">ประเภทการสั่ง</Label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all min-w-0 ${
                  orderType === 'dine_in'
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm'
                    : 'border-border bg-card hover:border-orange-300'
                }`}
              >
                <svg className={`w-4 h-4 ${orderType === 'dine_in' ? 'text-orange-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                <span className={`text-[9px] font-medium truncate ${orderType === 'dine_in' ? 'text-orange-700' : 'text-muted-foreground'}`}>ทานที่ร้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all min-w-0 ${
                  orderType === 'takeaway'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                    : 'border-border bg-card hover:border-blue-300'
                }`}
              >
                <svg className={`w-4 h-4 ${orderType === 'takeaway' ? 'text-blue-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
                <span className={`text-[9px] font-medium truncate ${orderType === 'takeaway' ? 'text-blue-700' : 'text-muted-foreground'}`}>นำกลับบ้าน</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all min-w-0 ${
                  orderType === 'delivery'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm'
                    : 'border-border bg-card hover:border-purple-300'
                }`}
              >
                <svg className={`w-4 h-4 ${orderType === 'delivery' ? 'text-purple-600' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h5l3 3v5h-2m-4 0H3M7 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span className={`text-[9px] font-medium truncate ${orderType === 'delivery' ? 'text-purple-700' : 'text-muted-foreground'}`}>จัดส่ง</span>
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-sm font-semibold text-foreground">วิธีการชำระเงิน</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSplitBillOpen(true)}
                className="h-7 text-[10px] gap-1 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
              >
                <Users className="w-3 h-3" />
                แยกบิล
              </Button>
            </div>

            {/* Split bill result */}
            {splitBillResult && (
              <div className="mb-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary">แยกบิล {splitBillResult.length} คน</span>
                  <button onClick={() => setSplitBillResult(null)} className="text-[10px] text-destructive hover:underline">ยกเลิก</button>
                </div>
                <div className="space-y-0.5">
                  {splitBillResult.map((amt, i) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span>คนที่ {i + 1}</span>
                      <span className="font-medium">฿{amt.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <RadioGroup 
              value={isMultiPay ? 'multi' : paymentMethod} 
              onValueChange={(val) => {
                if (val === 'multi') {
                  setIsMultiPay(true);
                  setMultiPayCash('');
                  setMultiPayPromptPay('');
                } else {
                  setIsMultiPay(false);
                  handleMethodChange(val);
                }
              }}
              className="mt-0.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  !isMultiPay && paymentMethod === 'cash' 
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md' 
                    : 'border-border bg-card hover:border-emerald-300'
                }`}>
                  <RadioGroupItem value="cash" id="cash" className="w-4 h-4" />
                  <Label htmlFor="cash" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${!isMultiPay && paymentMethod === 'cash' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <span className={!isMultiPay && paymentMethod === 'cash' ? 'text-emerald-700' : 'text-foreground'}>เงินสด</span>
                  </Label>
                </div>

                {selectedMember && (
                  <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                    !isMultiPay && paymentMethod === 'points' 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md' 
                      : 'border-border bg-card hover:border-purple-300'
                  }`}>
                    <RadioGroupItem value="points" id="points" className="w-4 h-4" />
                    <Label htmlFor="points" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                      <div className={`p-1.5 rounded-lg ${!isMultiPay && paymentMethod === 'points' ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className={!isMultiPay && paymentMethod === 'points' ? 'text-purple-700' : 'text-foreground'}>แต้มสะสม</span>
                    </Label>
                  </div>
                )}

                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  !isMultiPay && paymentMethod === 'promptpay' 
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 shadow-md' 
                    : 'border-border bg-card hover:border-pink-300'
                }`}>
                  <RadioGroupItem value="promptpay" id="promptpay" className="w-4 h-4" />
                  <Label htmlFor="promptpay" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${!isMultiPay && paymentMethod === 'promptpay' ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className={!isMultiPay && paymentMethod === 'promptpay' ? 'text-pink-700' : 'text-foreground'}>PromptPay</span>
                  </Label>
                </div>

                {/* Multi-method payment */}
                <div className={`flex items-center space-x-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                  isMultiPay
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md' 
                    : 'border-border bg-card hover:border-indigo-300'
                }`}>
                  <RadioGroupItem value="multi" id="multi" className="w-4 h-4" />
                  <Label htmlFor="multi" className="flex items-center gap-1.5 cursor-pointer flex-1 text-sm font-semibold">
                    <div className={`p-1.5 rounded-lg ${isMultiPay ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className={isMultiPay ? 'text-indigo-700' : 'text-foreground'}>ผสม</span>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Multi-method payment inputs */}
          {isMultiPay && (
            <div className="space-y-2 p-2.5 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <p className="text-xs font-semibold text-indigo-700">ชำระหลายวิธี (รวม = ฿{total.toLocaleString()})</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">เงินสด</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={multiPayCash}
                    onChange={e => {
                      setMultiPayCash(e.target.value);
                      const cash = parseFloat(e.target.value) || 0;
                      setMultiPayPromptPay(Math.max(0, total - cash).toString());
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">PromptPay</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={multiPayPromptPay}
                    onChange={e => {
                      setMultiPayPromptPay(e.target.value);
                      const pp = parseFloat(e.target.value) || 0;
                      setMultiPayCash(Math.max(0, total - pp).toString());
                    }}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              {(parseFloat(multiPayCash || '0') + parseFloat(multiPayPromptPay || '0')) !== total && (
                <p className="text-[10px] text-destructive font-medium">
                  ยอดรวม ฿{(parseFloat(multiPayCash || '0') + parseFloat(multiPayPromptPay || '0')).toLocaleString()} ≠ ฿{total.toLocaleString()}
                </p>
              )}
              {parseFloat(multiPayPromptPay || '0') > 0 && (
                <div className="mt-1">
                  <QRCodePromptPay 
                    amount={parseFloat(multiPayPromptPay || '0')}
                    defaultPhoneNumber={promptPayPhone}
                    shopLogoUrl={shopLogoUrl}
                    compact={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Cash Input and Banknotes - Compact */}
          {paymentMethod === 'cash' && (
            <div className="space-y-1.5">

              {/* Banknote Buttons - Compact */}
              <div>
                <Label className="text-sm font-semibold mb-1 block text-foreground">ธนบัตร</Label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {banknotes.map((amount, index) => {
                    const colors = [
                      'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300',
                      'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300',
                      'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300',
                      'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300',
                      'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-300'
                    ];
                    return (
                      <Button
                        key={amount}
                        onClick={() => handleBanknoteClick(amount)}
                        variant="outline"
                        className={`h-10 text-sm font-bold ${colors[index]} border-2 shadow-sm hover:shadow-md hover:scale-105 transition-all rounded-xl`}
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
                    className="flex-1 h-14 text-lg font-bold bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all rounded-xl"
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

        {/* Right Column - Receipt Preview with Tabs */}
        <div className="hidden lg:flex lg:flex-col overflow-hidden max-h-[calc(85vh-80px)] border-l pl-2">
          {/* Receipt Type Tabs */}
          <div className="flex gap-1 mb-2 flex-shrink-0">
            {[
              { id: 'receipt' as const, label: 'ใบเสร็จ' },
              { id: 'kitchen' as const, label: 'ครัว' },
              { id: 'sticker' as const, label: 'สติ๊กเกอร์' },
              { id: 'tax' as const, label: 'ใบกำกับภาษี' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReceiptTab(tab.id)}
                className={`flex-1 px-1.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${
                  receiptTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview Content */}
          <div className="overflow-y-auto flex-1">
            {receiptTab === 'receipt' && (
              <ReceiptPreview 
                cartItems={cartItems}
                totalAmount={total}
                discountAmount={billDiscount}
                itemDiscountAmount={cartItems.reduce((sum, item) => {
                  if (item.item_discount > 0) {
                    if (item.item_discount_type === 'percent') {
                      const itemTotal = (item.menu_item.price + (item.selected_addons?.reduce((a, addon) => a + addon.price, 0) || 0)) * item.quantity;
                      return sum + Math.round(itemTotal * item.item_discount / 100);
                    }
                    return sum + item.item_discount;
                  }
                  return sum;
                }, 0)}
                paymentMethod={isMultiPay ? 'cash' : paymentMethod}
                memberName={selectedMember?.name}
                memberPhone={selectedMember?.phone}
                wifiVoucher={wifiVoucherPreview}
                compact={true}
              />
            )}
            {receiptTab === 'kitchen' && (
              <KitchenReceiptPreview cartItems={cartItems} orderType={orderType} />
            )}
            {receiptTab === 'sticker' && (
              <StickerPreview cartItems={cartItems} />
            )}
            {receiptTab === 'tax' && (
              <TaxInvoicePreview cartItems={cartItems} totalAmount={total} discountAmount={billDiscount} />
            )}
          </div>
        </div>
      </div>

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        total={total}
        onConfirm={(splits) => setSplitBillResult(splits)}
      />
    </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
