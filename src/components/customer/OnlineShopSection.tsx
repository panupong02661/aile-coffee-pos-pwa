import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity?: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [menu, setMenu] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Espresso',
      price: 3.50,
      image: '/espresso.jpg',
      description: 'Classic espresso shot'
    },
    {
      id: '2',
      name: 'Latte',
      price: 4.50,
      image: '/latte.jpg',
      description: 'Latte with steamed milk'
    },
    {
      id: '3',
      name: 'Cappuccino',
      price: 4.50,
      image: '/cappuccino.jpg',
      description: 'Cappuccino with foamed milk'
    },
    {
      id: '4',
      name: 'Mocha',
      price: 5.00,
      image: '/mocha.jpg',
      description: 'Mocha with chocolate and milk'
    },
    {
      id: '5',
      name: 'Iced Coffee',
      price: 4.00,
      image: '/icedcoffee.jpg',
      description: 'Iced coffee with milk'
    },
    {
      id: '6',
      name: 'Americano',
      price: 3.00,
      image: '/americano.jpg',
      description: 'Americano with hot water'
    },
    {
      id: '7',
      name: 'Cold Brew',
      price: 4.50,
      image: '/coldbrew.jpg',
      description: 'Cold brew coffee'
    },
    {
      id: '8',
      name: 'Macchiato',
      price: 4.00,
      image: '/macchiato.jpg',
      description: 'Macchiato with milk foam'
    },
    {
      id: '9',
      name: 'Espresso',
      price: 3.50,
      image: '/espresso.jpg',
      description: 'Classic espresso shot'
    },
    {
      id: '10',
      name: 'Latte',
      price: 4.50,
      image: '/latte.jpg',
      description: 'Latte with steamed milk'
    },
    {
      id: '11',
      name: 'Cappuccino',
      price: 4.50,
      image: '/cappuccino.jpg',
      description: 'Cappuccino with foamed milk'
    },
    {
      id: '12',
      name: 'Mocha',
      price: 5.00,
      image: '/mocha.jpg',
      description: 'Mocha with chocolate and milk'
    },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // iOS Alert Modal Function
  const showIOSAlert = (message: string) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Create custom alert modal for iOS
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
            max-width: 300px;
            margin: 20px;
          ">
            <p style="margin: 0; font-size: 16px; color: #333;">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #007AFF;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            ">ตกลง</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        if (document.body.contains(modal)) {
          modal.remove();
        }
      }, 3000);
    } else {
      alert(message);
    }
  };

  // Enhanced iOS-compatible notification function
  const playOrderSuccessNotification = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      console.log('🔔 Playing order notification, iOS:', isIOS);
      
      if (isIOS) {
        // iOS-specific audio handling
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          
          // Resume audio context (required for iOS)
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          // Create multiple beeps for iOS
          const frequencies = [800, 1000, 1200];
          const beepCount = 5;
          
          for (let i = 0; i < beepCount; i++) {
            setTimeout(() => {
              frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                gainNode.gain.value = 0.2 / (index + 1); // Decreasing volume for harmonics
                
                oscillator.start();
                setTimeout(() => {
                  try {
                    oscillator.stop();
                  } catch (e) {
                    // Oscillator already stopped
                  }
                }, 300);
              });
            }, i * 600);
          }
          
          console.log('✅ iOS Web Audio API notification started');
        } catch (audioError) {
          console.log('⚠️ iOS Web Audio API failed:', audioError);
        }
        
        // iOS Visual feedback instead of vibration
        const originalTransform = document.body.style.transform;
        document.body.style.transition = 'transform 0.05s ease-in-out';
        
        const shakeSequence = [2, -2, 1, -1, 0];
        shakeSequence.forEach((offset, index) => {
          setTimeout(() => {
            document.body.style.transform = `translateX(${offset}px)`;
            if (index === shakeSequence.length - 1) {
              setTimeout(() => {
                document.body.style.transform = originalTransform;
                document.body.style.transition = '';
              }, 50);
            }
          }, index * 50);
        });
        
      } else {
        // Non-iOS devices - use original methods
        try {
          // Web Audio API for other devices
          const AudioContext = window.AudioContext || (window as any as any).webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            
            // Create notification sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => {
              try {
                oscillator.stop();
              } catch (e) {
                // Oscillator already stopped
              }
            }, 500);
          }
          
          // Vibration for non-iOS devices
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }
          
          console.log('✅ Non-iOS notification methods executed');
        } catch (error) {
          console.log('⚠️ Non-iOS notification failed:', error);
        }
      }
      
      // Universal visual feedback
      const originalBg = document.body.style.backgroundColor;
      const flashColors = ['#4CAF50', '#ffffff'];
      
      flashColors.forEach((color, index) => {
        setTimeout(() => {
          document.body.style.backgroundColor = color;
          if (index === flashColors.length - 1) {
            setTimeout(() => {
              document.body.style.backgroundColor = originalBg;
            }, 200);
          }
        }, index * 200);
      });
      
    } catch (error) {
      console.error('❌ All notification methods failed:', error);
      // Ultimate fallback - simple visual feedback
      const originalBg = document.body.style.backgroundColor;
      document.body.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        document.body.style.backgroundColor = originalBg;
      }, 200);
    }
  };

  useEffect(() => {
    // Load cart data from local storage on component mount
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart data to local storage whenever the cart changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex !== -1) {
      // If item already exists in cart, update the quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity! += 1;
      setCart(updatedCart);
    } else {
      // If item doesn't exist in cart, add it with quantity 1
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const incrementQuantity = (itemId: string) => {
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: item.quantity! + 1 } : item
    );
    setCart(updatedCart);
  };

  const decrementQuantity = (itemId: string) => {
    const updatedCart = cart.map(item =>
      item.id === itemId && item.quantity! > 1 ? { ...item, quantity: item.quantity! - 1 } : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
  };

  const submitOrder = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Show iOS-compatible alert
    if (isIOS) {
      showIOSAlert('🔔 กำลังดำเนินการสั่งซื้อ... กรุณารอสักครู่');
    } else {
      alert('🔔 กำลังดำเนินการสั่งซื้อ... กรุณารอสักครู่');
    }
    
    setIsProcessing(true);
    
    try {
      // Play notification sound immediately (must be within user interaction)
      console.log('🔔 Playing immediate notification sound...');
      await playOrderSuccessNotification();

      if (!currentUser?.id) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
      }

      if (cart.length === 0) {
        throw new Error('กรุณาเลือกสินค้าก่อนสั่งซื้อ');
      }

      // Generate order number
      const orderNumber = `ON${Date.now().toString().slice(-8)}`;
      
      // Calculate totals
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity!), 0);
      const total = subtotal; // No additional charges for now

      // Prepare order data
      const orderData = {
        customer_id: currentUser.id,
        items: JSON.stringify(cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity!
        }))),
        subtotal: subtotal,
        total_amount: total,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : '',
        notes: notes,
        order_number: orderNumber,
        order_status: 'pending',
        payment_method: 'pending',
        payment_status: 'pending'
      };

      console.log('📝 Submitting order:', orderData);

      // Insert order into database
      const { data, error } = await supabase
        .from('customer_orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Order submitted successfully:', data);

      // Show success notifications
      toast({ 
        title: 'สั่งซื้อสำเร็จ!', 
        description: `หมายเลขออเดอร์: ${orderNumber}`,
        duration: 5000
      });

      // Additional success notification after delay
      setTimeout(() => {
        toast({ 
          title: '✅ ขอบคุณครับ!', 
          description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว กรุณารอรับสินค้าตามเวลาที่กำหนด',
          duration: 10000
        });
      }, 1000);

      // Clear the cart after successful order
      setCart([]);
      setNotes('');
      
      // Show iOS-compatible success alert
      setTimeout(() => {
        if (isIOS) {
          showIOSAlert(`✅ สั่งซื้อสำเร็จ! หมายเลขออเดอร์: ${orderNumber}`);
        } else {
          alert(`✅ สั่งซื้อสำเร็จ! หมายเลขออเดอร์: ${orderNumber}`);
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Order submission failed:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
        duration: 5000
      });

      // Show iOS-compatible error alert
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      if (isIOS) {
        showIOSAlert(`❌ ${errorMessage}`);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Online Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {menu.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-md mb-2" />
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-xl font-bold text-coffee-700 mt-2">฿{item.price.toFixed(2)}</p>
                <Button onClick={() => addToCart(item)} className="w-full mt-4">
                  <ShoppingCart className="mr-2" size={16} />
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
          <Separator className="my-6" />
          <CardTitle>Your Cart</CardTitle>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600">฿{(item.price * item.quantity!).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => decrementQuantity(item.id)}>
                      <Minus size={16} />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => incrementQuantity(item.id)}>
                      <Plus size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-xl font-bold">
                Subtotal: ฿{cart.reduce((sum, item) => sum + (item.price * item.quantity!), 0).toFixed(2)}
              </div>
            </div>
          )}
          <Separator className="my-6" />
          <div>
            <CardTitle>Delivery Options</CardTitle>
            <RadioGroup defaultValue="pickup" className="flex flex-col space-y-2" onValueChange={setDeliveryType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup">Pickup</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Delivery</Label>
              </div>
            </RadioGroup>
            {deliveryType === 'delivery' && (
              <div className="mt-4">
                <Label htmlFor="address">Delivery Address</Label>
                <Input type="text" id="address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
              </div>
            )}
          </div>
          <Separator className="my-6" />
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" placeholder="Any special requests?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button className="w-full mt-6" disabled={isProcessing} onClick={submitOrder}>
            {isProcessing ? (
              <>
                <Clock className="mr-2 animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2" size={16} />
                Submit Order
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineShopSection;
