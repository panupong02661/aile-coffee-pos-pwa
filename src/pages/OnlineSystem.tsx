
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';

const OnlineSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const isMobile = useIsMobile();
  
  // โหลดการตั้งค่าจาก localStorage เหมือนกับหน้า POS
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('online-grid-columns');
    return saved ? parseInt(saved) : (isMobile ? 2 : 4);
  });
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('online-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : (isMobile ? 'small' : 'medium');
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { categories, menuItems, loading } = useSupabaseData();

  // บันทึกการตั้งค่า grid ลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('online-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('online-item-size', itemSize);
  }, [itemSize]);

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

  const filteredMenuItems = selectedCategory === '1' 
    ? convertedMenuItems 
    : convertedMenuItems.filter(item => item.category_id === selectedCategory);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleMenuItemClick = (menuItem: any) => {
    // For now, just log the click - you can implement cart functionality later
    console.log('Menu item clicked:', menuItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
      }`}>
        {/* Header */}
        <div className={`flex-shrink-0 bg-background sticky top-0 z-10 ${
          isMobile ? 'p-2 pb-0' : 'p-4 pb-0'
        }`}>
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={convertedCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
            page="online"
          />
        </div>
        
        {/* Content Area */}
        <div className={`flex-1 flex gap-6 overflow-hidden ${
          isMobile ? 'flex-col p-2 pt-0' : 'p-4 pt-0'
        }`}>
          {/* Menu Grid Container */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-full bg-white rounded-lg border border-border">
              <div className={`h-full overflow-y-auto overflow-x-hidden ${
                isMobile ? 'p-2' : 'p-4'
              }`} style={{ scrollbarWidth: 'thin' }}>
                <MenuGrid
                  menuItems={filteredMenuItems}
                  addons={[]}
                  onAddToCart={handleMenuItemClick}
                  gridColumns={gridColumns}
                  itemSize={itemSize}
                />
              </div>
            </div>
          </div>

          {/* Cart/Order Summary - placeholder for future implementation */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0 overflow-hidden">
              <div className="h-full bg-white rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold mb-4">ตะกร้าสินค้า</h3>
                <p className="text-gray-500 text-center">ยังไม่มีสินค้าในตะกร้า</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cart Button - placeholder */}
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-20">
            <Button
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              size="sm"
            >
              <ShoppingCart className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineSystem;
