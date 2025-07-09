import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  category: 'food' | 'beverage' | 'other';
  image?: string;
  calculated_cost?: number;
  is_free?: boolean;
  free_item_name?: string;
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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  billDiscount: number;
  billDiscountType: 'amount' | 'percentage';
  selectedMember?: Member | null;
  onPaymentComplete: () => void;
  appliedGiftCode?: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  billDiscount,
  billDiscountType,
  selectedMember,
  onPaymentComplete,
  appliedGiftCode
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add notification sound hook
  const { playBellSound } = useOrderNotifications();
  const { toast } = useToast();

  const calculateDiscountedPrice = () => {
    let discountAmount = 0;
    if (billDiscountType === 'amount') {
      discountAmount = billDiscount;
    } else if (billDiscountType === 'percentage') {
      discountAmount = (subtotal * billDiscount) / 100;
    }
    return Math.max(0, subtotal - discountAmount); // Ensure the price doesn't go below 0
  };

  const discountedPrice = calculateDiscountedPrice();

  const calculateTotalPrice = () => {
    return discountedPrice;
  };

  const totalPrice = calculateTotalPrice();

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return received - totalPrice;
  };

  const change = calculateChange();

  const handlePaymentConfirm = async () => {
    console.log('🔔 Payment confirmation started...');
    
    // Play notification sound immediately when user confirms payment
    try {
      console.log('🎵 Playing confirmation bell sound...');
      await playBellSound();
    } catch (error) {
      console.log('⚠️ Failed to play confirmation sound:', error);
    }

    setIsProcessing(true);
    
    try {
      const orderNumber = `ORD-${Date.now()}`;

      // Prepare order details
      const orderDetails = {
        order_number: orderNumber,
        customer_id: selectedMember ? selectedMember.id : null,
        total_amount: totalPrice,
        discount_amount: billDiscountType === 'amount' ? billDiscount : (subtotal * billDiscount) / 100,
        payment_method: paymentMethod,
        cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) || 0 : 0,
        change_amount: paymentMethod === 'cash' ? change : 0,
        order_items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          item_discount: item.discount,
          is_free: item.is_free || false,
          free_item_name: item.free_item_name || null
        })),
        gift_code_id: appliedGiftCode ? appliedGiftCode.id : null,
        gift_code_value: appliedGiftCode ? appliedGiftCode.gift_value : 0,
        gift_code_type: appliedGiftCode ? appliedGiftCode.gift_type : null,
        created_at: new Date().toISOString(),
      };

      // Insert order into database
      const { data, error } = await supabase
        .from('customer_orders')
        .insert([orderDetails])
        .select();

      if (error) {
        console.error('❌ Error inserting order:', error);
        throw new Error('Failed to save order');
      }

      console.log('✅ Order saved successfully:', data);
      
      // Show success toast
      toast({
        title: '✅ ชำระเงินสำเร็จ',
        description: `บันทึกออเดอร์ #${orderNumber} เรียบร้อยแล้ว`,
        duration: 3000,
      });

      // Call parent payment complete handler
      console.log('🔄 Calling parent payment complete handler...');
      onPaymentComplete();
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการชำระเงินได้',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการชำระเงิน</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="total">ยอดรวม</Label>
            <Input id="total" value={totalPrice.toFixed(2)} className="text-right" readOnly />
            <Badge variant="secondary">บาท</Badge>
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="payment-method">ช่องทางการชำระเงิน</Label>
            <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">เงินสด</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit">เครดิต</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'cash' && (
            <div className="grid gap-2">
              <Label htmlFor="cash-received">รับเงินสด</Label>
              <Input
                id="cash-received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                type="number"
              />
              {change > 0 && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="change">เงินทอน</Label>
                  <Input id="change" value={change.toFixed(2)} className="text-right" readOnly />
                  <Badge variant="secondary">บาท</Badge>
                </div>
              )}
            </div>
          )}
        </div>

        <Button onClick={handlePaymentConfirm} disabled={isProcessing} className="w-full">
          {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
