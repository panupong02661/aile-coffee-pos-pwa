
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import OrderConfirmationModal from './OrderConfirmationModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

const CustomerOrderingInterface = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [menuItems] = useState([
    { id: '1', name: 'กาแฟอเมริกาโน่', price: 45, image: '☕' },
    { id: '2', name: 'กาแฟลาเต้', price: 55, image: '🥛' },
    { id: '3', name: 'กาแฟคาปูชิโน่', price: 60, image: '☕' },
    { id: '4', name: 'ชาเขียวเย็น', price: 40, image: '🍵' },
    { id: '5', name: 'เค้กช็อกโกแลต', price: 80, image: '🍰' },
    { id: '6', name: 'แซนด์วิชแฮม', price: 75, image: '🥪' }
  ]);

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
    if (existingItem && existingItem.quantity === 1) {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    } else {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `ORD-${timestamp}`;
  };

  const handleOrderSubmit = async () => {
    if (cart.length === 0) {
      toast({
        title: "ตะกร้าว่าง",
        description: "กรุณาเลือกสินค้าก่อนสั่งซื้อ",
        variant: "destructive"
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกชื่อและเบอร์โทรศัพท์",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    try {
      const orderData = {
        order_number: generateOrderNumber(),
        customer_id: null, // For guest orders
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        subtotal: getTotal(),
        total_amount: getTotal(),
        payment_method: 'online',
        payment_status: 'pending',
        order_status: 'pending',
        delivery_type: 'pickup',
        delivery_address: customerInfo.address,
        notes: `ลูกค้า: ${customerInfo.name}, เบอร์: ${customerInfo.phone}${customerInfo.notes ? `, หมายเหตุ: ${customerInfo.notes}` : ''}`
      };

      // Insert into customer_orders table (this will trigger real-time notification)
      const { error } = await supabase
        .from('customer_orders')
        .insert(orderData);

      if (error) {
        throw error;
      }

      // Clear cart and form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });

      toast({
        title: "✅ สั่งซื้อสำเร็จ!",
        description: "ร้านค้าได้รับออเดอร์ของคุณแล้ว",
      });

    } catch (error) {
      console.error('Order submission failed:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-coffee-800">☕ ร้านกาแฟแสนดี</h1>
            <div className="flex items-center space-x-2 bg-coffee-100 px-3 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-coffee-600" />
              <span className="font-semibold text-coffee-800">{getTotalItems()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-coffee-800 mb-6">🍽️ เมนูของเรา</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4 text-center">
                    <div className="text-4xl mb-2">{item.image}</div>
                    <h3 className="font-semibold text-coffee-800 mb-2">{item.name}</h3>
                    <p className="text-coffee-600 font-bold mb-3">฿{item.price}</p>
                    <Button
                      onClick={() => addToCart(item)}
                      className="w-full bg-coffee-600 hover:bg-coffee-700"
                      size="sm"
                    >
                      เพิ่มลงตะกร้า
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Customer Info Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-coffee-800 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                ตะกร้าสินค้า
              </h3>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีสินค้าในตะกร้า</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-coffee-800">{item.name}</h4>
                        <p className="text-sm text-coffee-600">฿{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          onClick={() => addToCart(item)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {cart.length > 0 && (
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold text-coffee-800">
                    <span>ยอดรวม:</span>
                    <span>฿{getTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Customer Info Form */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-coffee-800">ข้อมูลลูกค้า</h4>
                <div>
                  <Label htmlFor="customer-name">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="customer-name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="0XX-XXX-XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address">ที่อยู่</Label>
                  <Textarea
                    id="customer-address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="ที่อยู่สำหรับจัดส่ง (ถ้ามี)"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="customer-notes">หมายเหตุ</Label>
                  <Textarea
                    id="customer-notes"
                    value={customerInfo.notes || ''}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    placeholder="หมายเหตุเพิ่มเติม"
                    rows={2}
                  />
                </div>
              </div>

              {/* Order Button */}
              <Button
                onClick={handleOrderSubmit}
                className="w-full bg-coffee-600 hover:bg-coffee-700 text-lg py-3"
                disabled={cart.length === 0}
              >
                🛒 สั่งซื้อ ({getTotalItems()} รายการ)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOrder}
        orderTotal={getTotal()}
        itemCount={getTotalItems()}
      />
    </div>
  );
};

export default CustomerOrderingInterface;
