import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import MobileCart from '@/components/MobileCart';
import MemberSearchModal from '@/components/MemberSearchModal';
import PaymentModal from '@/components/PaymentModal';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMainSidebar } from '@/hooks/useMainSidebar';
import MainSidebar from '@/components/MainSidebar';
import { MenuItem, Addon } from '@/types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const isMobile = useIsMobile();
  const { isMainSidebarOpen, toggleMainSidebar, closeMainSidebar } = useMainSidebar();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Load display settings from localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('pos-grid-columns');
    return saved ? parseInt(saved) : 4;
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('pos-item-size');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });

  const { menuItems, addons, categories, loading } = useSupabaseData();
  const { cartItems, addToCart, removeFromCart, updateCartItemQuantity, clearCart } = useCart();

  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory && item.is_available)
    : menuItems.filter(item => item.is_available);

  const handleAddToCart = (item: MenuItem, selectedAddons?: Addon[]) => {
    addToCart(item, selectedAddons);
  };

  useEffect(() => {
    if (isMobile) {
      setIsRightSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Sidebar */}
      <MainSidebar isOpen={isMainSidebarOpen} onClose={closeMainSidebar} />
      
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b p-4 bg-white z-10">
          <Header 
            onToggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            onToggleMainSidebar={toggleMainSidebar}
            onMemberClick={() => setShowMemberModal(true)}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
            page="pos"
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Menu Area */}
          <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
              <div className="p-4 md:p-6">
                {loading ? (
                  <div className="text-center py-8">กำลังโหลดเมนู...</div>
                ) : (
                  <MenuGrid
                    menuItems={filteredMenuItems}
                    addons={addons}
                    onAddToCart={handleAddToCart}
                    gridColumns={gridColumns}
                    itemSize={itemSize}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar - Cart */}
          {!isMobile && (
            <div className={`transition-all duration-300 ${
              isRightSidebarOpen ? 'w-80' : 'w-0'
            } border-l bg-white overflow-hidden`}>
              {isRightSidebarOpen && (
                <div className="h-full">
                  <Cart
                    cartItems={cartItems}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                    onCheckout={() => setShowPaymentModal(true)}
                    selectedMember={selectedMember}
                    onRemoveMember={() => setSelectedMember(null)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Search Modal */}
      <MemberSearchModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSelectMember={(member: any) => {
          setSelectedMember(member);
          setShowMemberModal(false);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartItems={cartItems}
        total={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        clearCart={clearCart}
        selectedMember={selectedMember}
      />

      {/* Mobile Cart */}
      {isMobile && (
        <MobileCart
          cartItems={cartItems}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={() => setShowPaymentModal(true)}
          selectedMember={selectedMember}
          onRemoveMember={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default Index;
