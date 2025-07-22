
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Star, Clock, Settings, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DisplaySettingsModal from './DisplaySettingsModal';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // การตั้งค่าการแสดงผล - โหลดจาก localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('displaySettings');
    return saved ? JSON.parse(saved).gridColumns || 3 : 3;
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('displaySettings');
    return saved ? JSON.parse(saved).itemSize || 'medium' : 'medium';
  });

  // บันทึกการตั้งค่าลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('displaySettings', JSON.stringify({
      gridColumns,
      itemSize
    }));
  }, [gridColumns, itemSize]);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
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
      toast.error('เกิดข้อผิดพลาดในการโหลดเมนู');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    toast.success(`เพิ่ม ${item.name} ลงในตะกร้าแล้ว`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (!currentUser) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
      return;
    }

    if (cart.length === 0) {
      toast.error('กรุณาเลือกสินค้าก่อนสั่งซื้อ');
      return;
    }

    try {
      // สร้างข้อมูลออเดอร์
      const orderData = {
        customer_id: currentUser.id,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: getTotalPrice(),
        total_amount: getTotalPrice(),
        order_number: `ONL-${Date.now()}`,
        payment_method: 'online',
        payment_status: 'pending',
        order_status: 'pending',
        delivery_type: 'pickup'
      };

      const { error } = await supabase
        .from('customer_orders')
        .insert(orderData);

      if (error) throw error;

      toast.success('สั่งซื้อสำเร็จ! รอการยืนยันจากร้าน');
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
    }
  };

  const getItemSizeClass = () => {
    switch (itemSize) {
      case 'small': return 'h-64';
      case 'medium': return 'h-80';
      case 'large': return 'h-96';
      default: return 'h-80';
    }
  };

  const getImageSizeClass = () => {
    switch (itemSize) {
      case 'small': return 'h-32';
      case 'medium': return 'h-40';
      case 'large': return 'h-48';
      default: return 'h-40';
    }
  };

  const getTextSizeClass = () => {
    switch (itemSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-coffee-800">สั่งซื้อออนไลน์</h2>
          <p className="text-coffee-600">เลือกเมนูที่คุณต้องการและสั่งซื้อได้ทันที</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            ตั้งค่าการแสดงผล
          </Button>
          
          {cart.length > 0 && (
            <Button
              onClick={placeOrder}
              className="relative flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              สั่งซื้อ ({getTotalItems()})
              <span className="ml-2">฿{getTotalPrice().toLocaleString()}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาเมนู..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Menu Grid */}
      <div 
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
      >
        {filteredMenuItems.map((item) => {
          const quantityInCart = getItemQuantityInCart(item.id);
          
          return (
            <Card key={item.id} className={`${getItemSizeClass()} flex flex-col`}>
              <div className={`${getImageSizeClass()} overflow-hidden`}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>
              
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-coffee-800 ${getTextSizeClass()} mb-2`}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className={`text-gray-600 mb-3 ${
                      itemSize === 'small' ? 'text-xs' : 
                      itemSize === 'medium' ? 'text-sm' : 'text-base'
                    } line-clamp-2`}>
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-coffee-800 ${getTextSizeClass()}`}>
                      ฿{item.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      4.5
                    </Badge>
                  </div>
                  
                  {quantityInCart > 0 ? (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="font-semibold px-3">
                        {quantityInCart}
                      </span>
                      
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => addToCart(item)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มลงตะกร้า
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMenuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            แสดงเมนูทั้งหมด
          </Button>
        </div>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              ตะกร้าสินค้า ({getTotalItems()} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-32 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                  <span className="font-semibold ml-2">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>รวมทั้งหมด:</span>
                <span>฿{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
            
            <Button onClick={placeOrder} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              สั่งซื้อตอนนี้
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display Settings Modal */}
      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
      />
    </div>
  );
};

export default OnlineShopSection;
