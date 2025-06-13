
import { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import { useCart } from '@/hooks/useCart';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [gridColumns, setGridColumns] = useState(4);
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const { categories, menuItems, addons, loading } = useSupabaseData();

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

  // Convert database addons to the format expected by components
  const convertedAddons = addons.map(addon => ({
    id: addon.id,
    name: addon.name,
    price: Number(addon.price),
    category: 'other' as const,
    is_required: addon.addon_groups?.is_required || false,
    allow_multiple: addon.addon_groups?.allow_multiple || false,
    addon_group_id: addon.addon_group_id || undefined
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
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
          
          <div className="flex gap-6">
            <div className="flex-1">
              <MenuGrid
                menuItems={filteredMenuItems}
                addons={convertedAddons}
                onAddToCart={addToCart}
                gridColumns={gridColumns}
                itemSize={itemSize}
              />
            </div>

            <div className="w-80">
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
    </div>
  );
};

export default POS;
