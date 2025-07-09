
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const isMobile = useIsMobile();
  
  const { categories, menuItems, loading } = useSupabaseData();

  // Convert database menu items to the format expected by components
  const convertedMenuItems = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category_id: item.category_id || '',
    image: item.image_url || '',
    is_available: item.is_available,
    description: item.description || ''
  }));

  const filteredMenuItems = selectedCategory === 'all' 
    ? convertedMenuItems 
    : convertedMenuItems.filter(item => item.category_id === selectedCategory);

  const addToCart = (itemId: string) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cartItems).reduce((total, [itemId, count]) => {
      const item = convertedMenuItems.find(item => item.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">กำลังโหลดเมนู...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">ร้านกาแฟออนไลน์</h1>
            <div className="relative">
              <Button
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <ShoppingCart className="w-4 h-4" />
                ตะกร้า
                {getTotalItems() > 0 && (
                  <Badge className="bg-red-500 text-white ml-1">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap"
            >
              ทั้งหมด
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMenuItems
            .filter(item => item.is_available)
            .map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-6xl">☕</div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-gray-800 line-clamp-2 text-sm">
                        {item.name}
                      </h3>
                      <p className="text-orange-600 font-semibold text-lg">
                        ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                    
                    {cartItems[item.id] ? (
                      <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium">{cartItems[item.id]}</span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item.id)}
                          className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(item.id)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มลงตะกร้า
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {getTotalItems()} รายการ
              </p>
              <p className="text-lg font-bold text-orange-600">
                ฿{getTotalPrice().toLocaleString()}
              </p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              สั่งซื้อ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineShopSection;
