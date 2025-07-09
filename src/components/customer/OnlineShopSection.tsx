
import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import CartModal from './CartModal';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  
  const { categories, menuItems, loading } = useSupabaseData();

  // เพิ่มหมวดหมู่ "ทั้งหมด" ที่ด้านหน้า
  const allCategories = [
    { id: 'all', name: 'ทั้งหมด' },
    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
  ];

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems.filter(item => item.is_available)
    : menuItems.filter(item => item.is_available && item.category_id === selectedCategory);

  const addToCart = (menuItem: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          quantity: 1,
          image: menuItem.image_url
        }];
      }
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getItemQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">ร้านกาแฟออนไลน์</h1>
            
            {/* Settings and Cart */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-gray-600">
                ตั้งค่าการแสดงผล
              </Button>
              
              <Button
                onClick={() => setIsCartModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white relative"
              >
                ตะกร้า {totalItems > 0 && totalItems}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {allCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMenuItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-2xl">☕</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-orange-600 font-bold text-lg">
                      ฿{Number(item.price)}
                    </p>
                    
                    {quantity === 0 ? (
                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        เพิ่มลงตะกร้า
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, quantity - 1)}
                          className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="font-medium text-orange-600">
                          {quantity}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, quantity + 1)}
                          className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button for Mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-30 md:hidden">
          <Button
            onClick={() => setIsCartModalOpen(true)}
            className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {totalItems}
            </span>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default OnlineShopSection;
