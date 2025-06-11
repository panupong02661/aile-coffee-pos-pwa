
import { useState } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import { useCart } from '@/hooks/useCart';
import { mockCategories, mockMenuItems, mockAddons } from '@/data/mockData';

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState('1'); // "ทั้งหมด"
  const [gridColumns, setGridColumns] = useState(4);
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>('medium');

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateDiscount,
    clearCart
  } = useCart();

  const filteredMenuItems = selectedCategory === '1' 
    ? mockMenuItems 
    : mockMenuItems.filter(item => item.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="flex gap-6">
          {/* Menu Section */}
          <div className="flex-1">
            <CategoryFilter
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            <MenuGrid
              menuItems={filteredMenuItems}
              addons={mockAddons}
              onAddToCart={addToCart}
              gridColumns={gridColumns}
              itemSize={itemSize}
            />
          </div>

          {/* Cart Section */}
          <div className="w-96">
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onUpdateDiscount={updateDiscount}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
