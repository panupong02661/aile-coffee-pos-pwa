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

  const { menuItems: dbMenuItems, addons: dbAddons, categories, loading } = useSupabaseData();
  const { 
    cartItems, 
    addToCart, 
    updateQuantity,
    removeFromCart, 
    clearCart,
    billDiscount,
    billDiscountType,
    setBillDiscount,
    setBillDiscountType,
    updateDiscount,
    restoreCart
  } = useCart();

  // Transform database types to interface types
  const menuItems: MenuItem[] = dbMenuItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image_url,
    description: item.description,
    category_id: item.category_id || '', // Provide default empty string for required field
    is_available: item.is_available,
    calculated_cost: item.cost_price
  }));

  const addons: Addon[] = dbAddons.map(addon => ({
    id: addon.id,
    name: addon.name,
    price: addon.price,
    category: 'other', // Default category since it's required
    is_required: addon.addon_groups?.is_required || false,
    allow_multiple: addon.addon_groups?.allow_multiple || false,
    addon_group_id: addon.addon_group_id,
    addon_groups: addon.addon_groups
  }));

  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category_id === selectedCategory && item.is_available)
    : menuItems.filter(item => item.is_available);

  const handleAddToCart = (item: MenuItem, selectedAddons?: Addon[]) => {
    addToCart(item, selectedAddons || []);
  };

  useEffect(() => {
    if (isMobile) {
      setIsRightSidebarOpen(false);
    }
  }, [isMobile]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const billDiscountAmount = billDiscountType === 'percent' 
    ? Math.min(subtotal * billDiscount / 100, subtotal)
    : Math.min(billDiscount, subtotal);
  const total = Math.max(0, subtotal - billDiscountAmount);

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
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onUpdateDiscount={updateDiscount}
                    onClearCart={clearCart}
                    billDiscount={billDiscount}
                    billDiscountType={billDiscountType}
                    onUpdateBillDiscount={setBillDiscount}
                    onUpdateBillDiscountType={setBillDiscountType}
                    onRestoreCart={restoreCart}
                    selectedMember={selectedMember}
                    onPaymentComplete={() => setShowPaymentModal(true)}
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
        total={total}
        onPayment={() => {
          clearCart();
          setShowPaymentModal(false);
        }}
        cartItems={cartItems}
        billDiscount={billDiscount}
        billDiscountType={billDiscountType}
        selectedMember={selectedMember}
      />

      {/* Mobile Cart */}
      {isMobile && (
        <MobileCart
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onPaymentComplete={() => setShowPaymentModal(true)}
          selectedMember={selectedMember}
        />
      )}
    </div>
  );
};

export default Index;
