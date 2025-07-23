
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ShopSectionProps {
  currentUser: any;
  onOrderPlaced?: (orderData: any) => void;
}

const ShopSection: React.FC<ShopSectionProps> = ({ currentUser, onOrderPlaced }) => {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดสินค้าได้',
          variant: 'destructive',
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดสินค้าได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };

  const increaseQuantity = (productId: string) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const decreaseQuantity = (productId: string) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? {
        ...item,
        quantity: item.quantity > 1 ? item.quantity - 1 : 1
      } : item
    );
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${date}${time}${random}`;
  };

  const handlePlaceOrder = async () => {
    try {
      setIsLoading(true);
      
      const orderNumber = generateOrderNumber();
      
      // Create order with correct column names
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          member_id: currentUser?.id,
          total_amount: calculateTotal(),
          items_count: cart.reduce((total, item) => total + item.quantity, 0),
          payment_method: 'online',
          order_source: 'customer_app'
        })
        .select()
        .single();

      if (error) {
        console.error('Error placing order:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถสั่งซื้อได้',
          variant: 'destructive',
        });
        return;
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: data.id,
        menu_item_id: item.id,
        menu_item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      // Clear cart
      setCart([]);
      setOrderData(data);

      // Send notification after successful order placement
      if (onOrderPlaced && data) {
        const notificationData = {
          order_number: data.order_number,
          customer_name: currentUser?.name || 'ลูกค้า',
          total: data.total_amount,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        };
        
        // Call the notification function
        onOrderPlaced(notificationData);
      }

      toast({
        title: 'สั่งซื้อสำเร็จ!',
        description: 'ขอบคุณที่อุดหนุน!',
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสั่งซื้อได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>สินค้า</CardTitle>
          <CardDescription>เลือกสินค้าที่คุณต้องการ</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">ราคา: ฿{product.price}</p>
                  <Button onClick={() => addToCart(product)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มใส่ตะกร้า
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ตะกร้าสินค้า</CardTitle>
            <Badge variant="secondary">{cart.length} items</Badge>
          </div>
          <CardDescription>สินค้าที่คุณเลือก</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.length === 0 ? (
            <p>ไม่มีสินค้าในตะกร้า</p>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      ฿{item.price} x {item.quantity} = ฿{item.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="icon" onClick={() => decreaseQuantity(item.id)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      className="w-16 text-center"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (!isNaN(newQuantity) && newQuantity > 0) {
                          // Implement quantity update logic here
                        }
                      }}
                    />
                    <Button size="icon" onClick={() => increaseQuantity(item.id)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">ยอดรวม</h3>
                <p className="text-lg">฿{calculateTotal()}</p>
              </div>
              <Button
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'สั่งซื้อ'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSection;
