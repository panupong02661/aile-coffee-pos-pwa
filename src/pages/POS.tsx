import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import MobileCart from '@/components/MobileCart';
import AddonModal from '@/components/AddonModal';
import MemberSearchModal from '@/components/MemberSearchModal';
import DebugCodeChecker from '@/components/DebugCodeChecker';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';
import { useCart } from '@/hooks/useCart';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  console.log('🚀 POS Component Started');
  
  const [selectedCategory, setSelectedCategory] = useState('1');
  const isMobile = useIsMobile();
  
  console.log('📱 isMobile:', isMobile);
  
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
  
  console.log('⚙️ Grid settings:', { gridColumns, itemSize });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [availableAddons, setAvailableAddons] = useState<DatabaseAddon[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [appliedGiftCode, setAppliedGiftCode] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

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

  console.log('🛒 Cart items count:', cartItems.length);

  const { 
    categories, 
    menuItems, 
    addons, 
    loading, 
    getAddonGroupsForMenuItem, 
    getAddonGroupsForCategory 
  } = useSupabaseData();

  console.log('📊 Data status:', {
    loading,
    categoriesCount: categories?.length || 0,
    menuItemsCount: menuItems?.length || 0,
    addonsCount: addons?.length || 0
  });

  useEffect(() => {
    console.log('📱 Mobile effect triggered:', isMobile);
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

  useEffect(() => {
    localStorage.setItem('pos-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('pos-item-size', itemSize);
  }, [itemSize]);

  const convertedCategories = [
    { 
      id: '1', 
      name: 'ทั้งหมด',
      description: 'แสดงสินค้าทั้งหมด',
      sort_order: 0,
      is_active: true
    },
    ...(categories || []).map(cat => ({ 
      id: cat.id, 
      name: cat.name,
      description: cat.description || '',
      sort_order: cat.sort_order,
      is_active: cat.is_active
    }))
  ];

  console.log('🏷️ Converted categories:', convertedCategories.length);

  const convertedMenuItems = (menuItems || []).map(item => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category_id: item.category_id || '',
    image: item.image_url || '',
    is_available: item.is_available,
    description: item.description || '',
    calculated_cost: Number(item.cost_price)
  }));

  console.log('🍽️ Converted menu items:', convertedMenuItems.length);

  const filteredMenuItems = selectedCategory === '1' 
    ? convertedMenuItems 
    : convertedMenuItems.filter(item => item.category_id === selectedCategory);

  console.log('🔍 Filtered menu items:', {
    selectedCategory,
    filteredCount: filteredMenuItems.length,
    totalMenuItems: convertedMenuItems.length
  });

  const filteredMenuItemsForSearch = convertedMenuItems.filter(item =>
    item.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    setSearchTerm(value);
  };

  const handleMenuItemFromSearch = (menuItem: any) => {
    handleMenuItemClick(menuItem);
    setIsSearchOpen(false);
    setLocalSearchTerm('');
  };

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
    
    const menuAddonGroups = getAddonGroupsForMenuItem(menuItem.id);
    console.log('Menu addon groups:', menuAddonGroups);
    
    const categoryAddonGroups = menuItem.category_id 
      ? getAddonGroupsForCategory(menuItem.category_id) 
      : [];
    console.log('Category addon groups:', categoryAddonGroups);

    const allAddonGroupIds = new Set([
      ...menuAddonGroups.map(ag => ag.id),
      ...categoryAddonGroups.map(ag => ag.id)
    ]);
    console.log('All addon group IDs:', Array.from(allAddonGroupIds));

    const relevantAddons = (addons || []).filter(addon => 
      addon.addon_group_id && allAddonGroupIds.has(addon.addon_group_id)
    );
    console.log('Relevant addons:', relevantAddons);

    if (relevantAddons.length > 0) {
      setSelectedMenuItem(menuItem);
      setAvailableAddons(relevantAddons);
      setIsAddonModalOpen(true);
    } else {
      addToCart(menuItem, []);
    }
  };

  const handleAddToCartWithAddons = (menuItem: any, selectedAddons: DatabaseAddon[]) => {
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
    
    setAppliedGiftCode(giftData);
    
    if (giftData.gift_type === 'menu_item') {
      const menuItem = convertedMenuItems.find(item => item.id === giftData.gift_id);
      
      if (menuItem) {
        addFreeItemToCart(menuItem, giftData.gift_name);
      } else {
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
      applyPromotionDiscount(giftData.gift_value);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setAppliedGiftCode(null);
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
    try {
      console.log('🔔 Playing notification sound for order confirmation...');
      await playBellSound();
      
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
    } catch (error) {
      console.error('Error in payment complete:', error);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  console.log('🛒 Total items in cart:', totalItems);

  if (loading) {
    console.log('🔄 POS is loading, showing loading screen');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-foreground text-xl">กำลังโหลดข้อมูล...</div>
          <div className="text-muted-foreground text-sm">
            กำลังดาวน์โหลดเมนูและข้อมูลสินค้า
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 POS about to render main UI');

  return (
    <div 
      className="h-screen bg-background flex overflow-hidden fixed inset-0" 
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Fixed Header */}
        <div className={`flex-shrink-0 bg-background border-b border-border sticky top-0 z-20 ${
          isMobile ? 'p-2 pb-1' : 'p-2 pb-1'
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
            selectedMember={selectedMember}
            onRemoveMember={handleRemoveMember}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            menuItems={convertedMenuItems}
            onMenuItemSelect={handleMenuItemClick}
          />
          
          {/* Debug controls with search and settings buttons */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowDebug(!showDebug)}
                size="sm"
                variant="outline"
              >
                {showDebug ? 'ปิด Debug' : 'เปิด Debug'}
              </Button>

              <Button
                onClick={async () => {
                  await handleUserInteraction();
                  await playBellSound();
                }}
                size="sm"
                variant="outline"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                🔔 ทดสอบเสียงแจ้งเตือน iPad
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-end min-w-[200px]">
              {selectedMember && (
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  ⭐ {selectedMember.points.toLocaleString()} แต้ม
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Fixed Content Area - Reduced padding */}
        <div className={`flex-1 flex overflow-hidden ${
          isMobile ? 'flex-col gap-1 p-1' : 'gap-2 p-2'
        }`}>
          {/* Menu Grid Container - Fixed */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="h-full bg-card rounded-lg border border-border shadow-sm">
              <div className={`h-full overflow-y-auto overflow-x-hidden ${
                isMobile ? 'p-1' : 'p-2'
              }`} 
              style={{ 
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}>
                {filteredMenuItems.length > 0 ? (
                  <MenuGrid
                    menuItems={filteredMenuItems}
                    addons={[]}
                    onAddToCart={handleMenuItemClick}
                    gridColumns={gridColumns}
                    itemSize={itemSize}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-2xl mb-4">🍽️</div>
                      <div className="text-foreground text-lg mb-2">ไม่พบเมนูในหมวดหมู่นี้</div>
                      <div className="text-muted-foreground">
                        เลือกหมวดหมู่อื่นหรือเพิ่มเมนูใหม่ในระบบจัดการเมนู
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Cart - Fixed */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0 overflow-hidden">
              <div className="h-full flex flex-col bg-card rounded-lg border border-border shadow-sm">
                {/* Cart Content - Scrollable */}
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

        {/* Mobile Cart Button - Fixed Position */}
        {isMobile && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              onClick={() => setIsMobileCartOpen(true)}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg relative touch-none"
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

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="bg-background max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>ค้นหาสินค้า</SheetTitle>
            <SheetDescription>
              ป้อนชื่อสินค้าที่คุณต้องการค้นหา
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search">คำค้นหา</Label>
              <Input 
                id="search" 
                placeholder="พิมพ์ชื่อเมนูที่ต้องการค้นหา..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            {localSearchTerm && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">ผลการค้นหา ({filteredMenuItemsForSearch.length} รายการ)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredMenuItemsForSearch.length > 0 ? (
                    filteredMenuItemsForSearch.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleMenuItemFromSearch(item)}
                      >
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ฿{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">เลือก</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      ไม่พบเมนูที่ตรงกับการค้นหา
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Modal */}
      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page="pos"
      />

      {/* Debug Code Checker */}
      {showDebug && <DebugCodeChecker />}
    </div>
  );
};

export default POS;
