import { MenuItem, Addon, CartItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
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
    const menuItemId = cartItem.menu_item.id;
    const currentQty = cartItemMap.get(menuItemId) || 0;
    cartItemMap.set(menuItemId, currentQty + cartItem.quantity);
  });

  // Debug: Log cart data
  console.log('🎯 MenuGrid received cartItems:', cartItems.length, 'items');
  console.log('🎯 MenuGrid cartItemMap entries:', JSON.stringify(Array.from(cartItemMap.entries())));

  const handleItemClick = (item: MenuItem) => {
    onAddToCart(item);
  };

  // Dynamic grid styling based on column count and mobile
  const getGridStyle = () => {
    if (isMobile) {
      return 'grid-cols-3';
    }
    
    switch (gridColumns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      case 8: return 'grid-cols-8';
      case 9: return 'grid-cols-9';
      case 10: return 'grid-cols-10';
      default: return 'grid-cols-4';
    }
  };

  const getSizeClasses = () => {
    if (isMobile) {
      return { small: 'h-32', medium: 'h-36', large: 'h-40' };
    }
    
    if (gridColumns >= 8) {
      return { small: 'h-20', medium: 'h-24', large: 'h-28' };
    } else if (gridColumns >= 5) {
      return { small: 'h-24', medium: 'h-28', large: 'h-32' };
    }
    
    return { small: 'h-28', medium: 'h-32', large: 'h-40' };
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`grid ${getGridStyle()} gap-0.5 md:gap-1`}>
      {menuItems
        .filter(item => item.is_available === true)
        .map((item) => {
          const quantityInCart = cartItemMap.get(item.id) || 0;
          const isInCart = quantityInCart > 0;
          
          return (
            <Card 
              key={item.id}
              className={`relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 h-full ${
                isMobile ? 'active:scale-95 touch-manipulation' : ''
              } ${isInCart ? 'border-[3px] border-orange-500 bg-orange-50/70' : 'border border-coffee-300'}`}
              onClick={() => handleItemClick(item)}
            >
              <CardContent className={`${isMobile ? 'p-0.5' : 'p-1'} relative`}>
                <div className={`${sizeClasses[itemSize]} flex flex-col`}>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-4/5 object-cover rounded-md mb-1"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <h3 className={`font-medium line-clamp-2 ${
                      isInCart ? 'text-orange-600' : 'text-coffee-800'
                    } ${
                      isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`font-semibold ${
                      isInCart ? 'text-orange-500' : 'text-coffee-600'
                    } ${
                      isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      ฿{item.price}
                    </p>
                  </div>
                </div>
                {/* Cart quantity badge - inside CardContent with absolute positioning */}
                {isInCart && (
                  <div className="absolute bottom-1 right-1 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-10">
                    x{quantityInCart} <Check className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
};

export default MenuGrid;
