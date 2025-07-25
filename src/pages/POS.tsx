import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import MobileCart from '@/components/MobileCart';
import AddonModal from '@/components/AddonModal';
import MemberSearchModal from '@/components/MemberSearchModal';
import SelectedMemberDisplay from '@/components/SelectedMemberDisplay';
import DebugCodeChecker from '@/components/DebugCodeChecker';
import { useCart } from '@/hooks/useCart';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

const POS = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const isMobile = useIsMobile();
  
  // Initialize order notifications for iPad compatibility
  const { playBellSound, initializeAudio } = useOrderNotifications();
  
  // โหลดการตั้งค่าจาก localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('pos-grid-columns');
    return saved ? parseInt(saved) : (isMobile ? 3 : 4);
  });
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('pos-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : (isMobile ? 'small' : 'medium');
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [availableAddons, setAvailableAddons] = useState<DatabaseAddon[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [appliedGiftCode, setAppliedGiftCode] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const {
    cartItems,
    addToCart,
    addFreeItemToCart,
    applyPromotionDiscount,
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

  // ปรับ grid columns สำหรับมือถือ
  useEffect(() => {
    if (isMobile) {
      setGridColumns(3); 
      setItemSize('small'); 
    } else {
      const saved = localStorage.getItem('pos-grid-columns');
      setGridColumns(saved ? parseInt(saved) : 4);
      const savedSize = localStorage.getItem('pos-item-size');
      setItemSize(savedSize ? savedSize as 'small' | 'medium' | 'large' : 'medium');
    }
  }, [isMobile]);

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

  const handleMemberClick = () => {
    setIsMemberSearchOpen(true);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleRemoveMember = () => {
    setSelectedMember(null);
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

  const handleCodeApply = async (giftData: any) => {
    console.log('Applying gift code:', giftData);
    
    // เก็บข้อมูลโค้ดไว้ แต่ไม่อัปเดตสถานะในฐานข้อมูลตอนนี้
    setAppliedGiftCode(giftData);
    
    if (giftData.gift_type === 'menu_item') {
      // Try to find the menu item by gift_id (assuming it references menu_items.id)
      const menuItem = convertedMenuItems.find(item => item.id === giftData.gift_id);
      
      if (menuItem) {
        // Add the menu item as a free item with full discount
        addFreeItemToCart(menuItem, giftData.gift_name);
      } else {
        // Create a placeholder menu item if not found
        const placeholderItem = {
          id: giftData.gift_id || `gift_${Date.now()}`,
          name: giftData.gift_name,
          price: giftData.gift_value || 0,
          category_id: '',
          image: '',
          is_available: true,
          description: giftData.gift_description || '',
          calculated_cost: 0
        };
        addFreeItemToCart(placeholderItem, giftData.gift_name);
      }
    } else if (giftData.gift_type === 'promotion') {
      // Apply promotion discount to bill
      applyPromotionDiscount(giftData.gift_value);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setAppliedGiftCode(null); // Clear applied gift code when cart is cleared
  };

  const handleUserInteraction = async () => {
    try {
      await initializeAudio();
      console.log('🎵 Audio ready for notifications');
    } catch (error) {
      console.log('⚠️ Audio initialization failed:', error);
    }
  };

  const handlePaymentComplete = async () => {
    // เล่นเสียงแจ้งเตือนเมื่อยืนยันการสั่งซื้อ
    console.log('🔔 Playing notification sound for order confirmation...');
    await playBellSound();
    
    // อัปเดตสถานะโค้ดเป็น "ใช้แล้ว" เมื่อชำระเงินสำเร็จแล้วเท่านั้น
    if (appliedGiftCode) {
      try {
        console.log('🔄 กำลังอัพเดทสถานะโค้ดเป็น "ใช้แล้ว":', appliedGiftCode.id);
        
        const { data, error } = await supabase
          .from('customer_gifts')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString() 
          })
          .eq('id', appliedGiftCode.id)
          .select();
        
        if (error) {
          console.error('❌ ข้อผิดพลาดในการอัพเดทสถานะโค้ด:', error);
        } else {
          console.log('✅ อัพเดทสถานะโค้ดสำเร็จ:', data);
        }
        
        setAppliedGiftCode(null);
      } catch (error) {
        console.error('❌ ข้อผิดพลาดที่ไม่คาดคิดในการอัพเดทโค้ด:', error);
      }
    } else {
      console.log('ℹ️ ไม่มีโค้ดที่ต้องอัพเดท');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    console.log('🔄 POS loading data...');
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  console.log('🎯 POS data loaded - Categories:', categories.length, 'Menu Items:', menuItems.length);
  console.log('🎯 Converted categories:', convertedCategories);
  console.log('🎯 Converted menu items:', convertedMenuItems);
  console.log('🎯 Filtered menu items:', filteredMenuItems.length);

  return (
    <div 
      className="h-screen bg-cream-50 flex overflow-hidden" 
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <div className={`flex-shrink-0 bg-cream-50 sticky top-0 z-10 ${
          isMobile ? 'p-2 pb-0' : 'p-4 pb-0'
        }`}>
          <Header 
            onToggleSidebar={handleToggleSidebar}
            onMemberClick={handleMemberClick}
            categories={convertedCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
            page="pos"
          />
          
          {/* Debug toggle button */}
          <Button
            onClick={() => setShowDebug(!showDebug)}
            size="sm"
            variant="outline"
            className="mt-2"
          >
            {showDebug ? 'ปิด Debug' : 'เปิด Debug'}
          </Button>

          {/* Enhanced iPad Audio Test Button */}
          <Button
            onClick={async () => {
              await handleUserInteraction();
              await playBellSound();
            }}
            size="sm"
            variant="outline"
            className="mt-2 ml-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
          >
            🔔 ทดสอบเสียงแจ้งเตือน iPad
          </Button>
        </div>
        
        {/* Content Area */}
        <div className={`flex-1 flex gap-6 overflow-hidden ${
          isMobile ? 'flex-col p-2 pt-0' : 'p-4 pt-0'
        }`}>
          {/* Menu Grid Container */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-full bg-white rounded-lg border border-coffee-200">
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

          {/* Desktop Cart */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Selected Member Display */}
                {selectedMember && (
                  <SelectedMemberDisplay
                    member={selectedMember}
                    onRemove={handleRemoveMember}
                  />
                )}
                
                <div className="flex-1 overflow-hidden">
                  <Cart
                    cartItems={cartItems}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onUpdateDiscount={updateDiscount}
                    onClearCart={handleClearCart}
                    billDiscount={billDiscount}
                    billDiscountType={billDiscountType}
                    onUpdateBillDiscount={setBillDiscount}
                    onUpdateBillDiscountType={setBillDiscountType}
                    onRestoreCart={restoreCart}
                    selectedMember={selectedMember}
                    onCodeApply={handleCodeApply}
                    appliedGiftCode={appliedGiftCode}
                    onPaymentComplete={handlePaymentComplete}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cart Button */}
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-20">
            <Button
              onClick={() => setIsMobileCartOpen(true)}
              className="w-14 h-14 rounded-full bg-coffee-600 hover:bg-coffee-700 shadow-lg relative"
              size="sm"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Cart Drawer */}
      {isMobile && (
        <MobileCart
          isOpen={isMobileCartOpen}
          onClose={() => setIsMobileCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onUpdateDiscount={updateDiscount}
          onClearCart={handleClearCart}
          billDiscount={billDiscount}
          billDiscountType={billDiscountType}
          onUpdateBillDiscount={setBillDiscount}
          onUpdateBillDiscountType={setBillDiscountType}
          onRestoreCart={restoreCart}
          selectedMember={selectedMember}
          onCodeApply={handleCodeApply}
          appliedGiftCode={appliedGiftCode}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Member Search Modal */}
      <MemberSearchModal
        isOpen={isMemberSearchOpen}
        onClose={() => setIsMemberSearchOpen(false)}
        onSelectMember={handleSelectMember}
      />

      {/* Addon Modal */}
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

      {/* Debug Code Checker */}
      {showDebug && <DebugCodeChecker />}
    </div>
  );
};

export default POS;
