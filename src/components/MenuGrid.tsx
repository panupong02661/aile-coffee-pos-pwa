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
      return { small: 'h-36', medium: 'h-40', large: 'h-44' };
    }
    
    if (gridColumns >= 8) {
      return { small: 'h-24', medium: 'h-28', large: 'h-32' };
    } else if (gridColumns >= 5) {
      return { small: 'h-28', medium: 'h-32', large: 'h-36' };
    }
    
    return { small: 'h-36', medium: 'h-44', large: 'h-52' };
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
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 relative overflow-visible ${
                isMobile ? 'active:scale-95 touch-manipulation' : ''
              }`}
              style={isInCart ? {
                border: '3px solid #f97316',
                boxShadow: '0 0 0 2px #f97316',
                backgroundColor: '#fff7ed'
              } : {
                borderColor: '#d6bcab'
              }}
              onClick={() => handleItemClick(item)}
            >
              {/* Cart quantity badge - bottom right corner like reference image */}
              {isInCart && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    zIndex: 20,
                    backgroundColor: '#f97316',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <span>x{quantityInCart}</span>
                  <Check className="w-3 h-3" />
                </div>
              )}
              <CardContent className={`${isMobile ? 'p-0.5' : 'p-1'}`}>
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
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
};

export default MenuGrid;
