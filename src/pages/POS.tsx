
import { useState } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import { useCart } from '@/hooks/useCart';
import { mockCategories, mockMenuItems, mockAddons } from '@/data/mockData';

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

  const filteredMenuItems = selectedCategory === '1' 
    ? mockMenuItems 
    : mockMenuItems.filter(item => item.category_id === selectedCategory);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'}`}>
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
          />
          
          <div className="flex gap-6">
            <div className="flex-1">
              <MenuGrid
                menuItems={filteredMenuItems}
                addons={mockAddons}
                onAddToCart={addToCart}
                gridColumns={gridColumns}
                itemSize={itemSize}
              />
            </div>

            <div className="w-96">
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
