
import { MenuItem, Addon, CartItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MenuGridProps {
  menuItems: MenuItem[];
  addons: Addon[];
  onAddToCart: (item: MenuItem, selectedAddons?: Addon[]) => void;
  gridColumns?: number;
  itemSize?: 'small' | 'medium' | 'large';
  cartItems?: CartItem[];
  shopLogoUrl?: string;
}

const MenuGrid = ({ 
  menuItems, 
  addons, 
  onAddToCart, 
  gridColumns = 4,
  itemSize = 'medium',
  cartItems = [],
  shopLogoUrl
}: MenuGridProps) => {
  const isMobile = useIsMobile();

  // Build cart quantity map
  const cartItemMap = new Map<string, number>();
  cartItems.forEach(cartItem => {
    const menuItemId = cartItem.menu_item.id;
    const currentQty = cartItemMap.get(menuItemId) || 0;
    cartItemMap.set(menuItemId, currentQty + cartItem.quantity);
  });

  const handleItemClick = (item: MenuItem) => {
    onAddToCart(item);
  };

  const getGridStyle = () => {
    if (isMobile) return 'grid-cols-3';
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
  const isCompact = gridColumns >= 5;
  const textSize = isMobile || isCompact ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('grid gap-1.5', getGridStyle())}>
      {menuItems
        .filter(item => item.is_available === true)
        .map((item, index) => {
          const quantityInCart = cartItemMap.get(item.id) || 0;
          const isInCart = quantityInCart > 0;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={cn(
                'group relative rounded-xl text-left transition-all duration-200 overflow-hidden border animate-pos-slide-up',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isMobile && 'active:scale-[0.97] touch-manipulation',
                !isMobile && 'hover:shadow-lg hover:-translate-y-0.5',
                isInCart
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/30'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={cn(sizeClasses[itemSize], 'flex flex-col')}>
                {/* Image with hover zoom */}
                {item.image ? (
                  <div className="relative w-full h-4/5 overflow-hidden rounded-t-xl">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Subtle gradient overlay for readability */}
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-4/5 rounded-t-xl bg-muted flex items-center justify-center overflow-hidden">
                    {shopLogoUrl ? (
                      <img
                        src={shopLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain opacity-20 scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                )}
                
                {/* Info */}
                <div className="flex-1 flex items-center justify-between px-1.5 py-0.5 min-w-0">
                  <h3 className={cn(
                    'font-medium line-clamp-1 leading-tight',
                    textSize,
                    isInCart ? 'text-primary' : 'text-card-foreground'
                  )}>
                    {item.name}
                  </h3>
                  <span className={cn(
                    'font-semibold shrink-0 ml-1',
                    textSize,
                    isInCart ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    ฿{item.price}
                  </span>
                </div>
              </div>

              {/* Cart quantity pill badge */}
              {isInCart && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1 shadow-sm animate-pos-badge-pop">
                  {quantityInCart}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
};

export default MenuGrid;
