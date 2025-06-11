
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
    // Check if item has addons
    const itemAddons = addons.filter(addon => 
      !addon.menu_item_id || addon.menu_item_id === item.id
    );
    
    if (itemAddons.length > 0) {
      setSelectedItem(item);
      setIsAddonModalOpen(true);
    } else {
      onAddToCart(item, []);
    }
  };

  const handleAddonConfirm = (selectedAddons: Addon[]) => {
    if (selectedItem) {
      onAddToCart(selectedItem, selectedAddons);
    }
    setIsAddonModalOpen(false);
    setSelectedItem(null);
  };

  const gridClass = `grid grid-cols-${gridColumns} gap-4`;
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48'
  };

  return (
    <>
      <div className={gridClass}>
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
                    <h3 className="font-medium text-sm text-coffee-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-coffee-600 font-semibold">
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
        onConfirm={handleAddonConfirm}
      />
    </>
  );
};

export default MenuGrid;
