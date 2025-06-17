
import { useState, useEffect } from 'react';
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
  const [pointsToUse, setPointsToUse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  const { toast } = useToast();

  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;

  // Banknote values
  const banknotes = [20, 50, 100, 500, 1000];

  // Load membership settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembershipSettings();
    }
  }, [isOpen]);

  // Set default points when switching to points payment
  useEffect(() => {
    if (paymentMethod === 'points' && selectedMember && membershipSettings) {
      const maxPointsCanUse = Math.min(
        selectedMember.points,
        Math.floor(total / membershipSettings.redeem_value * membershipSettings.points_to_redeem)
      );
      setPointsToUse(maxPointsCanUse.toString());
    }
  }, [paymentMethod, selectedMember, membershipSettings, total]);

  const loadMembershipSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading membership settings:', error);
        // Set default values if no settings found
        setMembershipSettings({
          points_to_redeem: 100,
          redeem_value: 10,
          points_per_baht: 1
        });
      } else {
        setMembershipSettings(data);
      }
    } catch (error) {
      console.error('Error loading membership settings:', error);
      setMembershipSettings({
        points_to_redeem: 100,
        redeem_value: 10,
        points_per_baht: 1
      });
    }
  };

  const calculatePointsValue = (points: number) => {
    if (!membershipSettings) return 0;
    return (points / membershipSettings.points_to_redeem) * membershipSettings.redeem_value;
  };

  const calculateRequiredPoints = (amount: number) => {
    if (!membershipSettings) return 0;
    return Math.ceil((amount / membershipSettings.redeem_value) * membershipSettings.points_to_redeem);
  };

  const getMinimumPoints = () => {
    if (!membershipSettings) return 0;
    return membershipSettings.points_to_redeem;
  };

  const getMaximumPoints = () => {
    if (!selectedMember || !membershipSettings) return 0;
    return Math.min(
      selectedMember.points,
      calculateRequiredPoints(total)
    );
  };

  const validateCartData = () => {
    console.log('=== Starting Cart Data Validation ===');
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    cartItems.forEach((item, index) => {
      console.log(`Validating item ${index + 1}:`, {
        id: item.id,
        menu_item: item.menu_item,
        quantity: item.quantity,
        total_price: item.total_price,
        selected_addons: item.selected_addons
      });

      if (!item.menu_item) {
        throw new Error(`Menu item is missing for cart item ${index + 1}`);
      }

      if (!item.menu_item.id) {
        throw new Error(`Menu item ID is missing for cart item ${index + 1}`);
      }

      if (!item.menu_item.name) {
        throw new Error(`Menu item name is missing for cart item ${index + 1}`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for cart item ${index + 1}: ${item.quantity}`);
      }

      if (typeof item.total_price !== 'number' || item.total_price < 0) {
        throw new Error(`Invalid total price for cart item ${index + 1}: ${item.total_price}`);
      }

      if (typeof item.menu_item.price !== 'number' || item.menu_item.price < 0) {
        throw new Error(`Invalid menu item price for cart item ${index + 1}: ${item.menu_item.price}`);
      }
    });

    console.log('✅ Cart data validation passed');
    return true;
  };

  const saveOrderToDatabase = async (method: PaymentMethod) => {
    try {
      console.log('=== Starting Database Save Process ===');
      console.log('Payment method:', method);
      console.log('Total amount:', total);
      console.log('Cart items count:', cartItems.length);
      console.log('Selected member:', selectedMember);
      console.log('Bill discount:', billDiscount, 'Type:', billDiscountType);

      // Validate cart data first
      validateCartData();

      // Test database connection
      console.log('Testing database connection...');
      const { data: testConnection, error: connectionError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (connectionError) {
        console.error('Database connection failed:', connectionError);
        throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      }
      console.log('✅ Database connection successful');

      // Generate order number
      console.log('Generating order number...');
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw new Error(`ไม่สามารถสร้างเลขที่คำสั่งซื้อได้: ${orderNumberError.message}`);
      }

      const orderNumber = orderNumberData;
      console.log('✅ Generated order number:', orderNumber);

      // Calculate actual payment amount for points
      let actualTotal = total;
      let pointsUsed = 0;
      
      if (method === 'points' && pointsToUse) {
        pointsUsed = parseInt(pointsToUse);
        const pointsValue = calculatePointsValue(pointsUsed);
        actualTotal = Math.max(0, total - pointsValue);
      }

      // Prepare order data with explicit type conversion
      const orderData = {
        order_number: String(orderNumber),
        member_id: selectedMember?.id || null,
        total_amount: Number(actualTotal),
        items_count: cartItems.reduce((sum, item) => sum + Number(item.quantity), 0),
        payment_method: String(method),
        bill_discount: Number(billDiscount) || 0,
        bill_discount_type: String(billDiscountType) || 'amount'
      };

      console.log('Order data prepared:', orderData);

      // Validate order data
      if (!orderData.order_number) {
        throw new Error('Order number is required');
      }
      if (orderData.total_amount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }
      if (orderData.items_count <= 0) {
        throw new Error('Items count must be greater than 0');
      }

      // Create order
      console.log('Creating order in database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order creation failed:', orderError);
        console.error('Order error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw new Error(`ไม่สามารถบันทึกคำสั่งซื้อได้: ${orderError.message}`);
      }

      if (!order || !order.id) {
        console.error('❌ Order created but no ID returned');
        throw new Error('ไม่สามารถรับ ID ของคำสั่งซื้อได้');
      }

      console.log('✅ Order created successfully:', order);

      // Prepare order items with detailed validation
      console.log('Preparing order items...');
      const orderItems = cartItems.map((item, index) => {
        const orderItem = {
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
        };

        console.log(`Order item ${index + 1} prepared:`, orderItem);
        return orderItem;
      });

      // Validate order items
      orderItems.forEach((item, index) => {
        if (!item.order_id) throw new Error(`Order ID missing for item ${index + 1}`);
        if (!item.menu_item_id) throw new Error(`Menu item ID missing for item ${index + 1}`);
        if (!item.menu_item_name) throw new Error(`Menu item name missing for item ${index + 1}`);
        if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${index + 1}`);
        if (item.unit_price < 0) throw new Error(`Invalid unit price for item ${index + 1}`);
        if (item.total_price < 0) throw new Error(`Invalid total price for item ${index + 1}`);
      });

      console.log('Creating order items in database...');
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items creation failed:', itemsError);
        console.error('Items error details:', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
          code: itemsError.code
        });
        throw new Error(`ไม่สามารถบันทึกรายการสินค้าได้: ${itemsError.message}`);
      }

      console.log('✅ Order items created successfully');

      // Handle member points
      if (selectedMember) {
        console.log('Processing member points...');
        
        if (method === 'points' && pointsUsed > 0) {
          const newPoints = selectedMember.points - pointsUsed;

          console.log(`Deducting ${pointsUsed} points from member`);
          
          const { error: memberError } = await supabase
            .from('members')
            .update({
              points: newPoints,
              total_spent: selectedMember.total_spent + actualTotal
            })
            .eq('id', selectedMember.id);

          if (memberError) {
            console.error('❌ Member points deduction failed:', memberError);
            throw new Error(`ไม่สามารถหักแต้มสมาชิกได้: ${memberError.message}`);
          }

          // Create point transaction
          const { error: pointTransactionError } = await supabase
            .from('point_transactions')
            .insert({
              member_id: selectedMember.id,
              order_id: order.id,
              points_change: -pointsUsed,
              transaction_type: 'redeem',
              description: `ใช้แต้มชำระเงิน ${pointsUsed} แต้ม ออเดอร์ ${orderNumber}`
            });

          if (pointTransactionError) {
            console.error('Point transaction error:', pointTransactionError);
          }

          console.log('✅ Points deducted successfully');
        } else {
          // Award points for non-points payment
          const pointsEarned = Math.floor(actualTotal * (membershipSettings?.points_per_baht || 1));
          const newPoints = selectedMember.points + pointsEarned;
          const newTotalSpent = selectedMember.total_spent + actualTotal;

          console.log(`Awarding ${pointsEarned} points to member`);

          const { error: memberError } = await supabase
            .from('members')
            .update({
              points: newPoints,
              total_spent: newTotalSpent
            })
            .eq('id', selectedMember.id);

          if (memberError) {
            console.error('Member points update error:', memberError);
            // Don't throw error for points awarding failure
          } else {
            // Create point transaction
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
              console.error('Point transaction error:', pointTransactionError);
            }

            console.log('✅ Points awarded successfully');
          }
        }
      }

      console.log('=== Order Save Process Completed Successfully ===');

      toast({
        title: "ชำระเงินสำเร็จ",
        description: `ออเดอร์ ${orderNumber} ถูกบันทึกเรียบร้อยแล้ว`,
      });

      return order;
    } catch (error) {
      console.error('=== PAYMENT ERROR DETAILS ===');
      console.error('Error type:', typeof error);
      console.error('Error instanceof Error:', error instanceof Error);
      console.error('Error object:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      
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
    console.log('Cash received:', cashReceived);
    console.log('Points to use:', pointsToUse);
    console.log('Cart items:', cartItems);
    console.log('Selected member:', selectedMember);
    
    if (isProcessing) {
      console.log('Payment already in progress, ignoring');
      return;
    }

    setIsProcessing(true);

    try {
      // Basic validation
      console.log('Performing basic validations...');
      
      if (!cartItems || cartItems.length === 0) {
        console.log('❌ Validation failed: No items in cart');
        toast({
          title: "ไม่มีสินค้าในตะกร้า",
          description: "กรุณาเพิ่มสินค้าก่อนชำระเงิน",
          variant: "destructive"
        });
        return;
      }

      if (total <= 0) {
        console.log('❌ Validation failed: Invalid total amount');
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
          console.log('❌ Cash validation failed');
          toast({
            title: "จำนวนเงินไม่เพียงพอ",
            description: `กรุณากรอกจำนวนเงินที่รับมา (ขั้นต่ำ ฿${total})`,
            variant: "destructive"
          });
          return;
        }
      } else if (paymentMethod === 'points') {
        if (!selectedMember) {
          console.log('❌ Points validation failed: No member selected');
          toast({
            title: "กรุณาเลือกสมาชิก",
            description: "การชำระด้วยแต้มต้องเป็นสมาชิกเท่านั้น",
            variant: "destructive"
          });
          return;
        }

        if (!membershipSettings) {
          console.log('❌ Points validation failed: No membership settings');
          toast({
            title: "ไม่พบการตั้งค่าระบบแต้ม",
            description: "กรุณาตั้งค่าระบบแต้มในเมนูจัดการสมาชิก",
            variant: "destructive"
          });
          return;
        }

        const pointsValue = parseInt(pointsToUse || '0');
        const minimumPoints = getMinimumPoints();
        const maximumPoints = getMaximumPoints();

        if (pointsValue < minimumPoints) {
          console.log('❌ Points validation failed: Below minimum');
          toast({
            title: "แต้มไม่เพียงพอ",
            description: `ต้องใช้แต้มขั้นต่ำ ${minimumPoints} แต้ม`,
            variant: "destructive"
          });
          return;
        }

        if (pointsValue > maximumPoints) {
          console.log('❌ Points validation failed: Exceeds maximum');
          toast({
            title: "แต้มเกินจำนวนที่มี",
            description: `สามารถใช้แต้มได้สูงสุด ${maximumPoints} แต้ม`,
            variant: "destructive"
          });
          return;
        }

        if (selectedMember.points < pointsValue) {
          console.log('❌ Points validation failed: Insufficient points');
          toast({
            title: "แต้มไม่เพียงพอ",
            description: `ต้องการ ${pointsValue} แต้ม แต่มีเพียง ${selectedMember.points} แต้ม`,
            variant: "destructive"
          });
          return;
        }
      }

      console.log('✅ All validations passed');
      
      // Save order to database
      console.log('Calling saveOrderToDatabase...');
      await saveOrderToDatabase(paymentMethod);
      
      console.log('Order saved successfully, calling onPayment callback...');
      
      // Call the payment callback
      const cashAmount = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') : undefined;
      onPayment(paymentMethod, cashAmount);
      
      console.log('✅ Payment process completed successfully');
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
    if (selectedMember && membershipSettings) {
      const maxPoints = getMaximumPoints();
      setPointsToUse(maxPoints.toString());
    }
  };

  const pointsValue = pointsToUse ? calculatePointsValue(parseInt(pointsToUse)) : 0;
  const remainingAmount = Math.max(0, total - pointsValue);

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
                <div className="text-blue-600">
                  แต้มปัจจุบัน: {selectedMember.points.toLocaleString()} แต้ม
                </div>
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

          {/* Points Payment Input */}
          {paymentMethod === 'points' && selectedMember && membershipSettings && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="points-input">จำนวนแต้มที่ต้องการใช้</Label>
                <Input
                  id="points-input"
                  type="number"
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(e.target.value)}
                  min={getMinimumPoints()}
                  max={getMaximumPoints()}
                  className="mt-1"
                  placeholder={`ขั้นต่ำ ${getMinimumPoints()} แต้ม`}
                />
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded border">
                  <div className="text-sm text-purple-700 space-y-1">
                    <div>แต้มที่มี: {selectedMember.points.toLocaleString()} แต้ม</div>
                    <div>ขั้นต่ำการแลก: {getMinimumPoints()} แต้ม = ฿{membershipSettings.redeem_value}</div>
                    <div>สามารถใช้ได้สูงสุด: {getMaximumPoints().toLocaleString()} แต้ม</div>
                    {pointsToUse && (
                      <>
                        <div className="font-medium">แต้มที่ใช้: {parseInt(pointsToUse).toLocaleString()} แต้ม = ฿{pointsValue.toLocaleString()}</div>
                        {remainingAmount > 0 && (
                          <div className="text-orange-700">ยอดคงเหลือ: ฿{remainingAmount.toLocaleString()}</div>
                        )}
                        <div>แต้มคงเหลือ: {(selectedMember.points - parseInt(pointsToUse)).toLocaleString()} แต้ม</div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleUseAllPoints}
                  className="w-full border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700"
                >
                  ใช้แต้มสูงสุด ({getMaximumPoints().toLocaleString()} แต้ม)
                </Button>
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
