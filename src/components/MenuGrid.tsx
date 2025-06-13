
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItem, Addon } from '@/types';
import AddonModal from './AddonModal';

interface MenuGridProps {
  menuItems: MenuItem[];
  addons: Addon[];
  onAddToCart: (item: MenuItem, selectedAddons: Addon[]) => void;
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    // Check if this menu item has any addons available
    const availableAddons = addons.filter(addon => 
      !addon.addon_group_id || // Global addons
      addon.menu_item_id === item.id // Item-specific addons
    );

    // If no addons available, add directly to cart
    if (availableAddons.length === 0) {
      onAddToCart(item, []);
    } else {
      // Show addon modal if addons are available
      setSelectedItem(item);
      setIsAddonModalOpen(true);
    }
  };

  const handleAddonConfirm = (selectedAddons: Addon[]) => {
    if (selectedItem) {
      onAddToCart(selectedItem, selectedAddons);
    }
    setIsAddonModalOpen(false);
    setSelectedItem(null);
  };

  // Dynamic grid styling based on column count
  const getGridStyle = () => {
    switch (gridColumns) {
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-4';
    }
  };

  const getSizeClasses = () => {
    // Adjust size based on both itemSize and gridColumns for responsive design
    if (gridColumns >= 5) {
      return {
        small: 'h-24',
        medium: 'h-28',
        large: 'h-32'
      };
    }
    
    return {
      small: 'h-32',
      medium: 'h-40',
      large: 'h-48'
    };
  };

  const sizeClasses = getSizeClasses();

  return (
    <>
      <div className={`grid ${getGridStyle()} gap-4`}>
        {menuItems
          .filter(item => item.is_available)
          .map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-coffee-200"
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-3">
                <div className={`${sizeClasses[itemSize]} flex flex-col`}>
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-2/3 object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className={`font-medium text-coffee-800 line-clamp-2 ${
                      gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-coffee-600 font-semibold ${
                      gridColumns >= 5 ? 'text-xs' : 'text-sm'
                    }`}>
                      ฿{item.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <AddonModal
        isOpen={isAddonModalOpen}
        onClose={() => {
          setIsAddonModalOpen(false);
          setSelectedItem(null);
        }}
        menuItem={selectedItem}
        addons={addons.filter(addon => 
          !addon.menu_item_id || addon.menu_item_id === selectedItem?.id
        )}
        onAddToCart={(menuItem, selectedAddons) => {
          onAddToCart(menuItem, selectedAddons);
          setIsAddonModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
};

export default MenuGrid;
