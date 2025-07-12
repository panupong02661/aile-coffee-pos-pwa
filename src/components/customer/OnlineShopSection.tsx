import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, ShoppingBag, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OnlineShopSectionProps {
  customer: {
    id: string;
    name: string;
  };
  menuItems: MenuItem[];
}

const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 35 },
  { id: '2', name: 'Latte', price: 45 },
  { id: '3', name: 'Cappuccino', price: 45 },
  { id: '4', name: 'Mocha', price: 50 },
  { id: '5', name: 'Iced Coffee', price: 40 },
  { id: '6', name: 'Americano', price: 35 },
];

const OnlineShopSection = ({ customer }: OnlineShopSectionProps) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.id === menuItem.id);
    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalAmount = () => {
    let total = getSubtotal();
    if (deliveryType === 'delivery') {
      total += 30; // Delivery fee
    }
    return total;
  };

  const playOrderSuccessNotification = async () => {
    try {
      console.log('🔔 เริ่มเล่นเสียงแจ้งเตือนการสั่งซื้อสำเร็จ...');
      
      // Method 1: Show immediate browser alert popup
      alert('🎉 ยืนยันการสั่งซื้อสำเร็จ!\n\nออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว');
      
      // Method 2: Enhanced Audio Context for iOS
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Create multiple notification sounds for 7 seconds
        const playNotificationBeep = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const compressor = audioContext.createDynamicsCompressor();
          
          oscillator.connect(gainNode);
          gainNode.connect(compressor);
          compressor.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };
        
        const currentTime = audioContext.currentTime;
        const beepPattern = [
          { freq: 800, start: 0, duration: 0.5 },
          { freq: 1000, start: 0.8, duration: 0.5 },
          { freq: 1200, start: 1.6, duration: 0.5 },
          { freq: 800, start: 2.4, duration: 0.5 },
          { freq: 1000, start: 3.2, duration: 0.5 },
          { freq: 1200, start: 4.0, duration: 0.5 },
          { freq: 800, start: 4.8, duration: 0.5 },
          { freq: 1000, start: 5.6, duration: 0.5 },
          { freq: 1200, start: 6.4, duration: 0.5 }
        ];
        
        beepPattern.forEach(({ freq, start, duration }) => {
          playNotificationBeep(freq, currentTime + start, duration, 0.4);
        });
        
        console.log('✅ AudioContext notification sounds started');
      }

      // Method 3: iOS Visual and Haptic Feedback
      try {
        // iOS Haptic Feedback using navigator.vibrate()
        if ('vibrate' in navigator) {
          // Continuous vibration pattern for 7 seconds
          const vibrationPattern = [];
          for (let i = 0; i < 7; i++) {
            vibrationPattern.push(500, 200); // 500ms vibrate, 200ms pause
          }
          navigator.vibrate(vibrationPattern);
          console.log('✅ iOS vibration started');
        }
        
        // Visual notification with screen flash
        let flashCount = 0;
        const maxFlashes = 14;
        
        const flashScreen = () => {
          if (flashCount < maxFlashes) {
            const flashColor = flashCount % 2 === 0 ? '#10b981' : '#ffffff';
            document.body.style.backgroundColor = flashColor;
            setTimeout(() => {
              document.body.style.backgroundColor = '';
              flashCount++;
              if (flashCount < maxFlashes) {
                setTimeout(flashScreen, 250);
              }
            }, 250);
          }
        };
        
        flashScreen();
        
        // Title notification
        const originalTitle = document.title;
        let titleCount = 0;
        
        const updateTitle = () => {
          if (titleCount < 7) {
            document.title = `🎉 สั่งซื้อสำเร็จ! (${titleCount + 1}/7)`;
            titleCount++;
            setTimeout(updateTitle, 1000);
          } else {
            document.title = originalTitle;
          }
        };
        
        updateTitle();
        
      } catch (error) {
        console.log('⚠️ Visual/haptic feedback failed:', error);
      }

      // Method 4: Browser Notification API
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const notification = new Notification('🎉 ยืนยันการสั่งซื้อสำเร็จ!', {
            body: `ออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว จำนวน ฿${getTotalAmount()}`,
            icon: '/favicon.ico',
            requireInteraction: true,
            silent: false
          });

          // Use navigator.vibrate() separately from Notification
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }

          // Auto-close after 7 seconds
          setTimeout(() => notification.close(), 7000);
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('🎉 ยืนยันการสั่งซื้อสำเร็จ!', {
              body: `ออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว จำนวน ฿${getTotalAmount()}`,
              icon: '/favicon.ico',
              requireInteraction: true,
              silent: false
            });
          }
        }
      }

      // Method 5: Toast Notification
      toast({
        title: '🎉 ยืนยันการสั่งซื้อสำเร็จ!',
        description: `ออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว จำนวน ฿${getTotalAmount()}`,
        duration: 7000,
      });

      console.log('✅ เสียงแจ้งเตือนการสั่งซื้อสำเร็จเล่นเสร็จสิ้น');
      
    } catch (error) {
      console.error('❌ เสียงแจ้งเตือนการสั่งซื้อล้มเหลว:', error);
      
      // Ultimate fallback - show alert
      alert('🎉 ยืนยันการสั่งซื้อสำเร็จ!\n\nออเดอร์ของคุณได้รับการยืนยันเรียบร้อยแล้ว');
    }
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'ไม่มีสินค้าในตะกร้า',
        description: 'กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'กรุณากรอกที่อยู่จัดส่ง',
        description: 'กรุณากรอกที่อยู่สำหรับการจัดส่ง',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Play notification sound and show popup immediately when button is clicked
      await playOrderSuccessNotification();

      const orderData = {
        customer_id: customer.id,
        items: cart,
        subtotal: getSubtotal(),
        total_amount: getTotalAmount(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
        notes: notes.trim() || null,
        order_number: `ON${Date.now()}`,
        order_status: 'pending',
        payment_method: 'online',
        payment_status: 'pending'
      };

      const { data, error } = await supabase
        .from('customer_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Order created successfully:', data);

      // Clear cart after successful order
      setCart([]);
      setDeliveryAddress('');
      setNotes('');
      
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Menu Section */}
      <Card>
        <CardHeader>
          <CardTitle>เมนู</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {mockMenuItems.map((menuItem) => (
            <div key={menuItem.id} className="space-y-2">
              <div className="text-lg font-medium">{menuItem.name}</div>
              <div className="text-sm text-muted-foreground">฿{menuItem.price}</div>
              <Button onClick={() => addToCart(menuItem)} className="w-full">
                เพิ่มใส่ตะกร้า
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cart Section */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              ตะกร้าสินค้า ({cart.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>{item.name}</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      className="w-16 text-center border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity)) {
                          updateQuantity(item.id, newQuantity);
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="font-medium">฿{item.price * item.quantity}</div>
                <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                  ลบ
                </Button>
              </div>
            ))}

            <Separator />

            {/* Delivery Options */}
            <div className="space-y-4">
              <h3 className="font-medium">ประเภทการจัดส่ง</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={deliveryType === 'pickup' ? 'default' : 'outline'}
                  onClick={() => setDeliveryType('pickup')}
                  className="justify-start gap-2"
                >
                  <Clock className="w-4 h-4" />
                  มารับเอง
                </Button>
                <Button
                  variant={deliveryType === 'delivery' ? 'default' : 'outline'}
                  onClick={() => setDeliveryType('delivery')}
                  className="justify-start gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  จัดส่ง
                </Button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">ที่อยู่จัดส่ง</label>
                  <Textarea
                    placeholder="กรุณากรอกที่อยู่สำหรับการจัดส่ง..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หมายเหตุ (ถ้ามี)</label>
              <Textarea
                placeholder="หมายเหตุเพิ่มเติม..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>ยอดรวม</span>
                <span>฿{getSubtotal()}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>฿30</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>฿{getTotalAmount()}</span>
              </div>
            </div>

            {/* Confirm Order Button */}
            <Button 
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isSubmitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งซื้อ'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnlineShopSection;
