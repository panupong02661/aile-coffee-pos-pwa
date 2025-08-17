
import { MenuItem, Addon } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface MenuGridProps {
  menuItems: MenuItem[];
  addons: Addon[];
  onAddToCart: (item: MenuItem, selectedAddons?: Addon[]) => void;
  gridColumns?: number;
  itemSize?: 'small' | 'medium' | 'large';
}

const MenuGrid = ({ 
  menuItems, 
  addons, 
  onAddToCart, 
  gridColumns = 4,
  itemSize = 'medium' 
}: MenuGridProps) => {
  const isMobile = useIsMobile();

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
    <div className={`grid ${getGridStyle()} gap-1 md:gap-2`}>
      {menuItems
        .filter(item => item.is_available)
        .map((item) => (
          <Card 
            key={item.id} 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-coffee-200 ${
              isMobile ? 'active:scale-95 touch-manipulation' : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className={`${isMobile ? 'p-1' : 'p-2'}`}>
              <div className={`${sizeClasses[itemSize]} flex flex-col`}>
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-3/4 object-cover rounded-md mb-1"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 flex flex-col justify-between px-1">
                  <h3 className={`font-medium text-coffee-800 line-clamp-2 ${
                    isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                  }`}>
                    {item.name}
                  </h3>
                  <p className={`text-coffee-600 font-semibold ${
                    isMobile ? 'text-xs' : gridColumns >= 8 ? 'text-xs' : gridColumns >= 5 ? 'text-xs' : 'text-sm'
                  }`}>
                    ฿{item.price}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default MenuGrid;
