
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดรายการสินค้าได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // iOS-specific alert function
  const showIOSAlert = (message: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // สร้าง custom alert modal
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
        ">
          <div style="
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          ">
            <p style="margin: 0; font-size: 16px;">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #007AFF;
              color: white;
              border: none;
              border-radius: 5px;
            ">ตกลง</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Auto remove หลัง 3 วินาที
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 3000);
    } else {
      alert(message);
    }
  };

  // iOS-compatible notification function
  const playOrderSuccessNotification = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      if (isIOS) {
        // iOS ต้องใช้ user interaction เพื่อเล่นเสียง
        // สร้าง audio context หลังจาก user กดปุ่ม
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume audio context (จำเป็นสำหรับ iOS)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // สร้างเสียง beep ด้วย Web Audio API
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // ความถี่เสียง
        gainNode.gain.value = 0.3; // ความดัง
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
        }, 500); // เล่น 0.5 วินาที

        // iOS Safari ไม่รองรับ Navigator.vibrate()
        // ใช้ visual feedback แทน
        // แสดง animation แทนการสั่น
        document.body.style.transform = 'translateX(2px)';
        setTimeout(() => {
          document.body.style.transform = 'translateX(-2px)';
        }, 50);
        setTimeout(() => {
          document.body.style.transform = 'translateX(0)';
        }, 100);
        
      } else {
        // สำหรับอุปกรณ์อื่นๆ ใช้วิธีเดิม
        // ใช้การสั่นเครื่อง
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // เล่นเสียงด้วย Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Audio failed:', error);
      // Fallback - visual feedback
      document.body.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    }
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'ไม่มีสินค้าในตะกร้า',
        description: 'กรุณาเลือกสินค้าก่อนสั่งซื้อ',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'กรุณาเข้าสู่ระบบ',
        description: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast({
        title: 'กรุณาระบุที่อยู่จัดส่ง',
        description: 'กรุณาใส่ที่อยู่สำหรับการจัดส่ง',
        variant: 'destructive',
      });
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // แสดง alert ที่รองรับ iOS
    if (isIOS) {
      showIOSAlert('🔔 กำลังดำเนินการสั่งซื้อ... กรุณารอสักครู่');
    } else {
      alert('🔔 กำลังดำเนินการสั่งซื้อ... กรุณารอสักครู่');
    }
    
    setIsProcessing(true);
    
    try {
      // เล่นเสียงแจ้งเตือนทันที (ต้องอยู่ใน user interaction)
      await playOrderSuccessNotification();

      // Generate order number
      const orderNumber = `ONL${Date.now().toString().slice(-8)}`;
      const subtotal = getTotalAmount();
      const totalAmount = subtotal;

      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('customer_orders')
        .insert({
          customer_id: currentUser.id,
          items: JSON.stringify(cart),
          subtotal,
          total_amount: totalAmount,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'delivery' ? deliveryAddress : '',
          notes: orderNotes,
          order_number: orderNumber,
          order_status: 'pending',
          payment_method: 'cash',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart
      setCart([]);
      setDeliveryAddress('');
      setOrderNotes('');

      toast({
        title: 'สั่งซื้อสำเร็จ!',
        description: `หมายเลขออเดอร์: ${orderNumber}`,
      });

      // Additional success notification
      setTimeout(() => {
        toast({
          title: '✅ ขอบคุณครับ!',
          description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว กรุณารอรับสินค้าตามเวลาที่กำหนด'
        });
      }, 1000);

    } catch (error) {
      console.error('Order failed:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดเมนู...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">สั่งซื้อออนไลน์</h2>
        <p className="text-muted-foreground">เลือกเมนูที่ต้องการและสั่งซื้อได้เลย</p>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl">🍕</div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">฿{item.price}</span>
                <Button
                  onClick={() => addToCart(item)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่ม
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ตะกร้าสินค้า ({cart.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">฿{item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ลบ
                  </Button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="text-right text-xl font-bold mb-4">
                รวมทั้งสิ้น: ฿{getTotalAmount()}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">วิธีรับสินค้า</Label>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value: 'pickup' | 'delivery') => setDeliveryType(value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">รับที่ร้าน</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">จัดส่ง</Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryType === 'delivery' && (
                  <div>
                    <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                    <Textarea
                      id="address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="กรุณาระบุที่อยู่สำหรับการจัดส่ง"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
                  <Textarea
                    id="notes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={submitOrder}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnlineShopSection;
