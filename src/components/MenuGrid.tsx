import { MenuItem, Addon, CartItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { memo } from 'react';
import { Check } from 'lucide-react';

interface MenuGridProps {
  menuItems: MenuItem[];
  addons: Addon[];
  onAddToCart: (item: MenuItem, selectedAddons?: Addon[]) => void;
  gridColumns?: number;
  itemSize?: 'small' | 'medium' | 'large';
  cartItems?: CartItem[];
}

const MenuGrid = ({ 
  menuItems, 
  addons, 
  onAddToCart, 
  gridColumns = 4,
  itemSize = 'medium',
  cartItems = []
}: MenuGridProps) => {
  const isMobile = useIsMobile();

  // Get cart item IDs and quantities for highlighting
  const cartItemMap = new Map<string, number>();
  cartItems.forEach(cartItem => {
    const currentQty = cartItemMap.get(cartItem.menu_item.id) || 0;
    cartItemMap.set(cartItem.menu_item.id, currentQty + cartItem.quantity);
  });

  const handleItemClick = (item: MenuItem) => {
    // ส่งต่อการคลิกไปยัง POS เพื่อจัดการ addons
    onAddToCart(item);
  };

  // Dynamic grid styling based on column count and mobile
  const getGridStyle = () => {
    if (isMobile) {
      return 'grid-cols-3'; // เปลี่ยนเป็น 3 คอลัมน์บนมือถือ
    }
    
    switch (gridColumns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      case 7:
        return 'grid-cols-7';
      case 8:
        return 'grid-cols-8';
      case 9:
        return 'grid-cols-9';
      case 10:
        return 'grid-cols-10';
      default:
        return 'grid-cols-4';
    }
  };

  const getSizeClasses = () => {
    if (isMobile) {
      return {
        small: 'h-36',  // เพิ่มความสูงจาก h-32
        medium: 'h-40', // เพิ่มความสูงจาก h-36
        large: 'h-44'   // เพิ่มความสูงจาก h-40
      };
    }
    
    // Desktop sizing - เพิ่มขนาดสำหรับ desktop
    if (gridColumns >= 8) {
      return {
        small: 'h-24',  // เพิ่มขนาดจาก h-20
        medium: 'h-28', // เพิ่มขนาดจาก h-24
        large: 'h-32'   // เพิ่มขนาดจาก h-28
      };
    } else if (gridColumns >= 5) {
      return {
        small: 'h-28',  // เพิ่มขนาดจาก h-24
        medium: 'h-32', // เพิ่มขนาดจาก h-28
        large: 'h-36'   // เพิ่มขนาดจาก h-32
      };
    }
    
    return {
      small: 'h-36',  // เพิ่มขนาดจาก h-32
      medium: 'h-44', // เพิ่มขนาดจาก h-40
      large: 'h-52'   // เพิ่มขนาดจาก h-48
    };
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`grid ${getGridStyle()} gap-0.5 md:gap-1`}>
      {menuItems
        .filter(item => item.is_available === true) // Only show available items
        .map((item) => {
          const quantityInCart = cartItemMap.get(item.id) || 0;
          const isInCart = quantityInCart > 0;
          
          return (
            <Card 
              key={item.id} 
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 relative ${
                isMobile ? 'active:scale-95 touch-manipulation' : ''
              } ${isInCart ? 'ring-2 ring-green-500 border-green-500 bg-green-50' : 'border-coffee-200'}`}
              onClick={() => handleItemClick(item)}
            >
              {/* Cart indicator badge */}
              {isInCart && (
                <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                  {quantityInCart}
                </div>
              )}
              <CardContent className={`${isMobile ? 'p-0.5' : 'p-1'}`}>
                <div className={`${sizeClasses[itemSize]} flex flex-col`}>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className={`w-full h-4/5 object-cover rounded-md mb-1 ${isInCart ? 'opacity-90' : ''}`}
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <h3 className={`font-medium line-clamp-2 ${
                      isInCart ? 'text-green-800' : 'text-coffee-800'
                    } ${
                      isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`font-semibold ${
                      isInCart ? 'text-green-600' : 'text-coffee-600'
                    } ${
                      isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      ฿{item.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
};

export default memo(MenuGrid);
