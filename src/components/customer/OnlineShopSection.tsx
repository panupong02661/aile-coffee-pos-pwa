
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Settings } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';

interface OnlineShopSectionProps {
  currentUser: any;
}

const OnlineShopSection: React.FC<OnlineShopSectionProps> = ({ currentUser }) => {
  const isMobile = useIsMobile();
  const { menuItems, categories, loading } = useSupabaseData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Load display settings from localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('customer-mobile-grid-columns');
    return saved ? parseInt(saved) : (isMobile ? 2 : 3);
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('customer-mobile-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : 'medium';
  });

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('customer-mobile-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('customer-mobile-item-size', itemSize);
  }, [itemSize]);

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems.filter(item => item.is_available)
    : menuItems.filter(item => item.category_id === selectedCategory && item.is_available);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get item size classes with proper proportions
  const getItemSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'h-32'; // Small: 128px height
      case 'medium':
        return 'h-40'; // Medium: 160px height  
      case 'large':
        return 'h-48'; // Large: 192px height
      default:
        return 'h-40';
    }
  };

  const getImageSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'h-16 w-16'; // Small image
      case 'medium':
        return 'h-20 w-20'; // Medium image
      case 'large':
        return 'h-24 w-24'; // Large image
      default:
        return 'h-20 w-20';
    }
  };

  const getTextSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'text-xs'; // Small text
      case 'medium':
        return 'text-sm'; // Medium text
      case 'large':
        return 'text-base'; // Large text
      default:
        return 'text-sm';
    }
  };

  const getPriceSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'text-sm font-bold'; // Small price
      case 'medium':
        return 'text-base font-bold'; // Medium price
      case 'large':
        return 'text-lg font-bold'; // Large price
      default:
        return 'text-base font-bold';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">กำลังโหลดสินค้า...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-coffee-800">สั่งซื้อออนไลน์</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </Button>
            <div className="relative">
              <Button size="sm" className="bg-coffee-600 hover:bg-coffee-700">
                <ShoppingCart className="w-4 h-4 mr-1" />
                ตะกร้า ({getTotalItems()})
              </Button>
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="whitespace-nowrap"
          >
            ทั้งหมด
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div 
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
          }}
        >
          {filteredMenuItems.map(item => (
            <Card 
              key={item.id} 
              className={`${getItemSizeClasses()} flex flex-col overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="flex-1 p-3 flex flex-col">
                {/* Item Image */}
                <div className="flex justify-center mb-2">
                  <div className={`${getImageSizeClasses()} bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden`}>
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">No Image</div>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className={`${getTextSizeClasses()} font-medium text-gray-900 line-clamp-2 mb-1`}>
                    {item.name}
                  </h3>
                  
                  <div className="mt-auto">
                    <p className={`${getPriceSizeClasses()} text-coffee-600 mb-2`}>
                      ฿{item.price}
                    </p>
                    
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="w-full bg-coffee-600 hover:bg-coffee-700 text-white"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary (if items in cart) */}
      {cart.length > 0 && (
        <div className="p-4 border-t bg-white sticky bottom-0">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">รวม: ฿{getTotalPrice()}</span>
            <Button className="bg-green-600 hover:bg-green-700">
              สั่งซื้อ ({getTotalItems()} รายการ)
            </Button>
          </div>
        </div>
      )}

      {/* Display Settings Modal */}
      <DisplaySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page="customer-mobile"
      />
    </div>
  );
};

export default OnlineShopSection;
