import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import AddonModal from '@/components/AddonModal';
import { useCart } from '@/hooks/useCart';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { DatabaseAddon } from '@/hooks/useSupabaseData';

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  // โหลดการตั้งค่าจาก localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('pos-grid-columns');
    return saved ? parseInt(saved) : 4;
  });
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('pos-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : 'medium';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [availableAddons, setAvailableAddons] = useState<DatabaseAddon[]>([]);

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart,
    billDiscount,
    billDiscountType,
    setBillDiscount,
    setBillDiscountType,
    restoreCart
  } = useCart();

  const { 
    categories, 
    menuItems, 
    addons, 
    loading, 
    getAddonGroupsForMenuItem, 
    getAddonGroupsForCategory 
  } = useSupabaseData();

  // บันทึกการตั้งค่าลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('pos-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('pos-item-size', itemSize);
  }, [itemSize]);

  // Convert database categories to the format expected by components
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

  // Convert database menu items to the format expected by components
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
    console.log('Menu item clicked:', menuItem);
    
    // Get addon groups for this specific menu item
    const menuAddonGroups = getAddonGroupsForMenuItem(menuItem.id);
    console.log('Menu addon groups:', menuAddonGroups);
    
    // Get addon groups for the category this menu item belongs to
    const categoryAddonGroups = menuItem.category_id 
      ? getAddonGroupsForCategory(menuItem.category_id) 
      : [];
    console.log('Category addon groups:', categoryAddonGroups);

    // Combine both sets of addon groups (avoid duplicates)
    const allAddonGroupIds = new Set([
      ...menuAddonGroups.map(ag => ag.id),
      ...categoryAddonGroups.map(ag => ag.id)
    ]);
    console.log('All addon group IDs:', Array.from(allAddonGroupIds));

    // Get all addons that belong to these addon groups
    const relevantAddons = addons.filter(addon => 
      addon.addon_group_id && allAddonGroupIds.has(addon.addon_group_id)
    );
    console.log('Relevant addons:', relevantAddons);

    if (relevantAddons.length > 0) {
      setSelectedMenuItem(menuItem);
      setAvailableAddons(relevantAddons);
      setIsAddonModalOpen(true);
    } else {
      // No addons available, add directly to cart
      addToCart(menuItem, []);
    }
  };

  const handleAddToCartWithAddons = (menuItem: any, selectedAddons: DatabaseAddon[]) => {
    // Convert DatabaseAddon to the format expected by cart
    const convertedAddons = selectedAddons.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: Number(addon.price),
      category: 'other' as const,
      is_required: addon.addon_groups?.is_required || false,
      allow_multiple: addon.addon_groups?.allow_multiple || false,
      addon_group_id: addon.addon_group_id || undefined
    }));

    addToCart(menuItem, convertedAddons);
    setIsAddonModalOpen(false);
    setSelectedMenuItem(null);
    setAvailableAddons([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Fixed Header - ไม่เลื่อน */}
        <div className="flex-shrink-0 bg-cream-50 p-4 pb-0 z-10">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={convertedCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
            page="pos"
          />
        </div>
        
        {/* Content Area - ความสูงคงที่แยกการเลื่อน */}
        <div className="flex-1 flex gap-6 p-4 pt-0 min-h-0">
          {/* Menu Grid Container - เลื่อนแยกอิสระ */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto overflow-x-hidden bg-white rounded-lg border border-coffee-200 p-4" style={{ scrollbarWidth: 'thin' }}>
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

          {/* Cart Container - เลื่อนแยกอิสระ */}
          <div className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onUpdateDiscount={updateDiscount}
                onClearCart={clearCart}
                billDiscount={billDiscount}
                billDiscountType={billDiscountType}
                onUpdateBillDiscount={setBillDiscount}
                onUpdateBillDiscountType={setBillDiscountType}
                onRestoreCart={restoreCart}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedMenuItem && (
        <AddonModal
          isOpen={isAddonModalOpen}
          onClose={() => {
            setIsAddonModalOpen(false);
            setSelectedMenuItem(null);
            setAvailableAddons([]);
          }}
          menuItem={selectedMenuItem}
          addons={availableAddons}
          onAddToCart={handleAddToCartWithAddons}
        />
      )}
    </div>
  );
};

export default POS;
