
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Settings } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import MenuGrid from '@/components/MenuGrid';
import CategoryFilter from '@/components/CategoryFilter';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection = ({ currentUser }: OnlineShopSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const isMobile = useIsMobile();
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);
  
  // Load display settings from localStorage with proper mobile defaults
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('customer-online-grid-columns');
    return saved ? parseInt(saved) : (isMobile ? 2 : 4);
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('customer-online-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : (isMobile ? 'small' : 'medium');
  });

  const { categories, menuItems, loading } = useSupabaseData();

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customer-online-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('customer-online-item-size', itemSize);
  }, [itemSize]);

  // Convert categories to include "All" option
  const convertedCategories = [
    { 
      id: '1', 
      name: 'ทั้งหมด',
      description: 'แสดงสินค้าทั้งหมด',
      sort_order: 0,
      is_active: true
    },
    ...categories.map(cat => ({ 
      id: cat.id, 
      name: cat.name,
      description: cat.description || '',
      sort_order: cat.sort_order,
      is_active: cat.is_active
    }))
  ];

  // Convert menu items to expected format
  const convertedMenuItems = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category_id: item.category_id || '',
    image: item.image_url || '',
    is_available: item.is_available,
    description: item.description || '',
    calculated_cost: Number(item.cost_price)
  }));

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === '1' 
    ? convertedMenuItems 
    : convertedMenuItems.filter(item => item.category_id === selectedCategory);

  const handleMenuItemClick = (menuItem: any) => {
    // For now, just log the click - you can implement cart functionality later
    console.log('Menu item clicked:', menuItem);
  };

  if (loading) {
    return (
      <Card className="p-4 text-center">
        <p>กำลังโหลดข้อมูล...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Category Filter and Settings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ร้านค้าออนไลน์</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDisplaySettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            ตั้งค่า
          </Button>
        </div>
        
        <CategoryFilter
          categories={convertedCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

      {/* Menu Grid */}
      <div className="bg-white rounded-lg border border-coffee-200">
        <div className="p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <MenuGrid
            menuItems={filteredMenuItems}
            addons={[]}
            onAddToCart={handleMenuItemClick}
            gridColumns={gridColumns}
            itemSize={itemSize}
          />
        </div>
      </div>

      {/* Cart Button - placeholder for future implementation */}
      <div className="fixed bottom-4 right-4 z-20">
        <Button
          className="w-14 h-14 rounded-full bg-coffee-600 hover:bg-coffee-700 shadow-lg"
          size="sm"
        >
          <ShoppingCart className="w-6 h-6" />
        </Button>
      </div>

      {/* Display Settings Modal */}
      <DisplaySettingsModal
        isOpen={isDisplaySettingsOpen}
        onClose={() => setIsDisplaySettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page="online"
      />
    </div>
  );
};

export default OnlineShopSection;
