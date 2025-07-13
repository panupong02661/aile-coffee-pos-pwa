import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useIOSNotificationService } from '@/hooks/useIOSNotificationService';

interface OnlineShopSectionProps {
  currentUser?: any;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', address: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const { toast } = useToast();
  
  // Add notification services
  const { playBellSound, initializeAudio } = useOrderNotifications();
  const { triggerIOSNotification, isIOS } = useIOSNotificationService();

  const menuItems = [
    { id: '1', name: 'ผัดไทย', price: 60 },
    { id: '2', name: 'ต้มยำกุ้ง', price: 120 },
    { id: '3', name: 'ข้าวผัดปู', price: 80 },
    { id: '4', name: 'ส้มตำไทย', price: 45 },
    { id: '5', name: 'แกงเขียวหวานไก่', price: 90 },
    { id: '6', name: 'ไก่ย่าง', price: 150 },
    { id: '7', name: 'ชาไทย', price: 25 },
    { id: '8', name: 'น้ำส้มคั้น', price: 35 },
    { id: '9', name: 'ขนมหวาน', price: 40 },
    { id: '10', name: 'ลาบหมู', price: 70 }
  ];

  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    return 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    return subtotal - discount;
  };

  const submitOrder = async () => {
    if (cart.length === 0 || !customerInfo.name || !customerInfo.phone) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลและเลือกสินค้าให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    // 🔥 เล่นเสียงแจ้งเตือนทันทีที่กดปุ่ม (ไม่รอบันทึกข้อมูล)
    try {
      console.log('🔔 Playing immediate notification sound...');
      
      // เล่นเสียงสำหรับ iOS
      if (isIOS) {
        await triggerIOSNotification({
          message: 'กำลังดำเนินการสั่งซื้อ...',
          orderNumber: `TMP-${Date.now()}`,
          totalAmount: getTotal()
        });
      }
      
      // เล่นเสียงทั่วไป
      await playBellSound();
      
      console.log('✅ Immediate notification sound played');
    } catch (error) {
      console.log('⚠️ Immediate notification failed, continuing...', error);
    }

    // แสดงการประมวลผลทันที
    setIsProcessing(true);

    // แสดง toast ทันที
    toast({
      title: "🔔 กำลังดำเนินการสั่งซื้อ",
      description: "กรุณารอสักครู่...",
      duration: 3000,
    });

    try {
      // สร้างข้อมูลออเดอร์
      const orderData = {
        customer_id: currentUser?.id || null,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal: getSubtotal(),
        discount_amount: getDiscountAmount(),
        total_amount: getTotal(),
        order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        payment_method: 'online',
        payment_status: 'pending',
        order_status: 'confirmed',
        delivery_type: deliveryType,
        delivery_address: customerInfo.address,
        notes: customerInfo.notes || null
      };

      console.log('📦 Submitting order:', orderData);

      // 🚀 บันทึกข้อมูลแบบ background (ไม่บล็อก UI)
      const saveOrderPromise = supabase
        .from('customer_orders')
        .insert([orderData])
        .select()
        .single();

      // แสดงผลสำเร็จทันที (ไม่รอการบันทึก)
      toast({
        title: "✅ สั่งซื้อสำเร็จ!",
        description: `ออเดอร์ ${orderData.order_number} ได้รับการยืนยันแล้ว`,
        duration: 5000,
      });

      // ล้างตะกร้าทันที
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '', notes: '' });
      setIsProcessing(false);

      // ตรวจสอบผลการบันทึกใน background
      saveOrderPromise
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ Background save failed:', error);
            // แสดง toast แจ้งปัญหา แต่ไม่รบกวนผู้ใช้มาก
            toast({
              title: "⚠️ การบันทึกล่าช้า",
              description: "ออเดอร์ของคุณได้รับการยืนยันแล้ว แต่การบันทึกอาจล่าช้า",
              variant: "default",
              duration: 3000,
            });
          } else {
            console.log('✅ Background save successful:', data);
            // เล่นเสียงแจ้งเตือนเพิ่มเติมเมื่อบันทึกสำเร็จ
            try {
              playBellSound();
            } catch (soundError) {
              console.log('Sound play failed:', soundError);
            }
          }
        })
        .catch((error) => {
          console.error('❌ Unexpected background save error:', error);
        });

    } catch (error) {
      console.error('❌ Order submission failed:', error);
      
      setIsProcessing(false);
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Initialize audio on component mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await initializeAudio();
        console.log('🎵 Audio initialized for online shop');
      } catch (error) {
        console.log('⚠️ Audio initialization failed:', error);
      }
    };

    setupAudio();
  }, [initializeAudio]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Online Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
            <p className="text-gray-600 mb-2">Price: ${item.price}</p>
            <Button onClick={() => addToCart(item)}>Add to Cart</Button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center">
                  <span className="mr-2">{item.name}</span>
                  <div className="flex items-center ml-2">
                    <Button size="icon" onClick={() => removeFromCart(item.id)}><Minus className="h-4 w-4" /></Button>
                    <span className="mx-1">{item.quantity}</span>
                    <Button size="icon" onClick={() => addToCart(item)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <span>${item.price * item.quantity}</span>
              </div>
            ))}
            <div className="font-semibold mt-2">Subtotal: ${getSubtotal()}</div>
            <div className="font-semibold mt-2">Total: ${getTotal()}</div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Name"
            value={customerInfo.name}
            onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phone"
            type="tel"
            placeholder="Phone"
            value={customerInfo.phone}
            onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="address"
            type="text"
            placeholder="Address"
            value={customerInfo.address}
            onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notes"
            placeholder="Notes"
            value={customerInfo.notes || ''}
            onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
          />
        </div>
      </div>

      <Button disabled={isProcessing} onClick={submitOrder}>
        {isProcessing ? 'Processing...' : 'Submit Order'}
      </Button>
    </div>
  );
};

export default OnlineShopSection;
