
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Gift, ArrowLeft } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;

  // Banknote values
  const banknotes = [20, 50, 100, 500, 1000];

  const saveOrderToDatabase = async (method: PaymentMethod) => {
    try {
      console.log('=== Starting Order Save Process ===');
      console.log('Payment method:', method);
      console.log('Cart items:', JSON.stringify(cartItems, null, 2));
      console.log('Total amount:', total);
      console.log('Selected member:', selectedMember);
      console.log('Bill discount:', billDiscount, 'Type:', billDiscountType);
      
      // Validate cart items first
      if (!cartItems || cartItems.length === 0) {
        console.error('No cart items found');
        throw new Error('ไม่มีสินค้าในตะกร้า');
      }

      // Validate required fields for each cart item
      cartItems.forEach((item, index) => {
        console.log(`Validating cart item ${index}:`, item);
        if (!item.menu_item || !item.menu_item.id || !item.menu_item.name) {
          console.error(`Invalid menu item at index ${index}:`, item);
          throw new Error(`ข้อมูลสินค้าไม่ถูกต้องที่รายการที่ ${index + 1}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          console.error(`Invalid quantity at index ${index}:`, item.quantity);
          throw new Error(`จำนวนสินค้าไม่ถูกต้องที่รายการที่ ${index + 1}`);
        }
        if (typeof item.total_price !== 'number' || item.total_price < 0) {
          console.error(`Invalid total_price at index ${index}:`, item.total_price);
          throw new Error(`ราคาสินค้าไม่ถูกต้องที่รายการที่ ${index + 1}`);
        }
      });

      // Generate order number
      console.log('Generating order number...');
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw new Error('ไม่สามารถสร้างเลขที่คำสั่งซื้อได้');
      }

      const orderNumber = orderNumberData;
      console.log('Generated order number:', orderNumber);

      // Prepare order data
      const orderData = {
        order_number: orderNumber,
        member_id: selectedMember?.id || null,
        total_amount: Number(total),
        items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        payment_method: method,
        bill_discount: Number(billDiscount) || 0,
        bill_discount_type: billDiscountType || 'amount'
      };

      console.log('Order data to insert:', JSON.stringify(orderData, null, 2));

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        console.error('Error details:', JSON.stringify(orderError, null, 2));
        throw new Error('ไม่สามารถบันทึกคำสั่งซื้อได้');
      }

      console.log('Order created successfully:', order);

      // Prepare order items
      const orderItems = cartItems.map((item, index) => {
        console.log(`Preparing order item ${index}:`, item);
        
        const orderItem = {
          order_id: order.id,
          menu_item_id: item.menu_item.id,
          menu_item_name: item.menu_item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.menu_item.price),
          item_discount: Number(item.item_discount) || 0,
          item_discount_type: item.item_discount_type || 'amount',
          total_price: Number(item.total_price),
          selected_addons: JSON.stringify(item.selected_addons?.map(addon => ({
            id: addon.id,
            name: addon.name,
            price: Number(addon.price)
          })) || [])
        };
        
        console.log(`Prepared order item ${index}:`, orderItem);
        return orderItem;
      });

      console.log('All order items to insert:', JSON.stringify(orderItems, null, 2));

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        console.error('Items error details:', JSON.stringify(itemsError, null, 2));
        throw new Error('ไม่สามารถบันทึกรายการสินค้าได้');
      }

      console.log('Order items created successfully');

      // Update member points and total spent if member is selected
      if (selectedMember && method !== 'points') {
        console.log('Updating member points for member:', selectedMember.id);
        const pointsEarned = Math.floor(total);
        const newPoints = selectedMember.points + pointsEarned;
        const newTotalSpent = selectedMember.total_spent + total;

        console.log('Points calculation:', {
          currentPoints: selectedMember.points,
          pointsEarned,
          newPoints,
          currentTotalSpent: selectedMember.total_spent,
          newTotalSpent
        });

        const { error: memberError } = await supabase
          .from('members')
          .update({
            points: newPoints,
            total_spent: newTotalSpent
          })
          .eq('id', selectedMember.id);

        if (memberError) {
          console.error('Error updating member points:', memberError);
          // Don't throw here, just log the error
        } else {
          console.log('Member points updated successfully');

          // Create point transaction record
          const { error: pointTransactionError } = await supabase
            .from('point_transactions')
            .insert({
              member_id: selectedMember.id,
              order_id: order.id,
              points_change: pointsEarned,
              transaction_type: 'earn',
              description: `รับแต้มจากการซื้อสินค้า ออเดอร์ ${orderNumber}`
            });

          if (pointTransactionError) {
            console.error('Error creating point transaction:', pointTransactionError);
          }
        }
      } else if (selectedMember && method === 'points') {
        console.log('Deducting points for points payment');
        const pointsToDeduct = Math.ceil(total);
        const newPoints = selectedMember.points - pointsToDeduct;

        console.log('Points deduction:', {
          currentPoints: selectedMember.points,
          pointsToDeduct,
          newPoints
        });

        const { error: memberError } = await supabase
          .from('members')
          .update({
            points: newPoints,
            total_spent: selectedMember.total_spent + total
          })
          .eq('id', selectedMember.id);

        if (memberError) {
          console.error('Error deducting member points:', memberError);
          throw new Error('ไม่สามารถหักแต้มสมาชิกได้');
        }

        // Create point transaction record for redemption
        const { error: pointTransactionError } = await supabase
          .from('point_transactions')
          .insert({
            member_id: selectedMember.id,
            order_id: order.id,
            points_change: -pointsToDeduct,
            transaction_type: 'redeem',
            description: `ใช้แต้มชำระเงิน ออเดอร์ ${orderNumber}`
          });

        if (pointTransactionError) {
          console.error('Error creating point transaction for redemption:', pointTransactionError);
        }
      }

      console.log('=== Order Save Process Completed Successfully ===');

      toast({
        title: "บันทึกการสั่งซื้อสำเร็จ",
        description: `ออเดอร์ ${orderNumber} ถูกบันทึกเรียบร้อยแล้ว`,
      });

      return order;
    } catch (error) {
      console.error('=== Error in saveOrderToDatabase ===');
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลการสั่งซื้อได้';
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handlePayment = async () => {
    console.log('=== Payment Process Started ===');
    console.log('Payment method:', paymentMethod);
    console.log('Total amount:', total);
    console.log('Cart items count:', cartItems?.length || 0);
    console.log('Selected member:', selectedMember);
    
    setIsProcessing(true);

    try {
      // Basic validation
      if (!cartItems || cartItems.length === 0) {
        console.log('Validation failed: No items in cart');
        toast({
          title: "ไม่มีสินค้าในตะกร้า",
          description: "กรุณาเพิ่มสินค้าก่อนชำระเงิน",
          variant: "destructive"
        });
        return;
      }

      if (total <= 0) {
        console.log('Validation failed: Invalid total amount');
        toast({
          title: "ยอดเงินไม่ถูกต้อง",
          description: "ยอดเงินต้องมากกว่า 0",
          variant: "destructive"
        });
        return;
      }

      // Payment method specific validation
      if (paymentMethod === 'cash') {
        const receivedAmount = parseFloat(cashReceived || '0');
        console.log('Cash validation - received:', receivedAmount, 'total:', total);
        
        if (isNaN(receivedAmount) || receivedAmount < total) {
          console.log('Cash validation failed');
          toast({
            title: "จำนวนเงินไม่เพียงพอ",
            description: `กรุณากรอกจำนวนเงินที่รับมา (ขั้นต่ำ ฿${total})`,
            variant: "destructive"
          });
          return;
        }
      } else if (paymentMethod === 'points') {
        if (!selectedMember) {
          console.log('Points validation failed: No member selected');
          toast({
            title: "กรุณาเลือกสมาชิก",
            description: "การชำระด้วยแต้มต้องเป็นสมาชิกเท่านั้น",
            variant: "destructive"
          });
          return;
        }

        const requiredPoints = Math.ceil(total);
        console.log('Points validation - required:', requiredPoints, 'available:', selectedMember.points);
        
        if (selectedMember.points < requiredPoints) {
          console.log('Points validation failed: Insufficient points');
          toast({
            title: "แต้มไม่เพียงพอ",
            description: `ต้องการ ${requiredPoints} แต้ม แต่มีเพียง ${selectedMember.points} แต้ม`,
            variant: "destructive"
          });
          return;
        }
      }

      console.log('All validations passed, saving order...');
      
      // Save order to database
      await saveOrderToDatabase(paymentMethod);
      
      console.log('Order saved successfully, calling onPayment callback...');
      
      // Call the payment callback
      const cashAmount = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') : undefined;
      onPayment(paymentMethod, cashAmount);
      
      console.log('Payment process completed successfully');
      onClose();
      
    } catch (error) {
      console.error('=== Payment Process Failed ===');
      console.error('Payment error:', error);
      // Error already handled in saveOrderToDatabase
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodChange = (value: string) => {
    console.log('Payment method changed to:', value);
    setPaymentMethod(value as PaymentMethod);
    if (value !== 'cash') {
      setCashReceived(total.toString());
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            ชำระเงิน
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>ยอดชำระทั้งหมด:</span>
              <span className="text-green-600">฿{total.toLocaleString()}</span>
            </div>
            {selectedMember && (
              <div className="mt-2 text-sm text-gray-600">
                สมาชิก: {selectedMember.name} ({selectedMember.phone})
                {paymentMethod === 'points' && (
                  <div className="text-blue-600">
                    แต้มปัจจุบัน: {selectedMember.points} แต้ม
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-medium">เลือกวิธีการชำระเงิน</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={handleMethodChange}
              className="mt-3"
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
                    <DollarSign className="w-4 h-4" />
                    เงินสด
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="qr" id="qr" />
                  <Label htmlFor="qr" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
                    <CreditCard className="w-4 h-4" />
                    QR Code
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="points" id="points" />
                  <Label htmlFor="points" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
                    <Gift className="w-4 h-4" />
                    แต้มสะสม
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Input and Banknotes */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cash-received">จำนวนเงินที่รับ (บาท)</Label>
                <Input
                  id="cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  min={total}
                  step="0.01"
                  className="mt-1"
                />
              </div>

              {/* Banknote Buttons */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">ธนบัตร</Label>
                <div className="grid grid-cols-2 gap-2 mb-3">
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
                
                {/* Exact Payment and Change display in same row */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleExactPayment}
                    className="flex-1 h-12 text-base font-medium border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  >
                    จ่ายพอดี (฿{total.toLocaleString()})
                  </Button>
                  
                  {change > 0 && (
                    <div className="flex-1 flex items-center justify-center p-3 bg-blue-50 rounded border">
                      <span className="text-blue-700 font-medium">
                        เงินทอน: ฿{change.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Points Payment Info */}
          {paymentMethod === 'points' && (
            <div className="space-y-2">
              <div className="p-3 bg-purple-50 rounded border">
                <div className="text-sm text-purple-700">
                  <div>ต้องใช้แต้ม: {Math.ceil(total)} แต้ม</div>
                  {selectedMember && (
                    <div>แต้มคงเหลือหลังใช้: {selectedMember.points - Math.ceil(total)} แต้ม</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* QR Code Payment Info */}
          {paymentMethod === 'qr' && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded border text-center">
                <div className="text-sm text-blue-700">
                  แสดง QR Code สำหรับการชำระเงิน
                </div>
                <div className="text-lg font-semibold text-blue-800 mt-1">
                  ฿{total.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
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
