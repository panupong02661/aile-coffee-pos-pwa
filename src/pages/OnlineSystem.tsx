import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Eye, Globe, Menu as MenuIcon } from 'lucide-react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import MobileCart from '@/components/MobileCart';
import AddonModal from '@/components/AddonModal';
import MemberSearchModal from '@/components/MemberSearchModal';
import SelectedMemberDisplay from '@/components/SelectedMemberDisplay';
import { useCart } from '@/hooks/useCart';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import { ShoppingCart } from 'lucide-react';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

const OnlineSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [showPreview, setShowPreview] = useState(false);
  const [isMenuEnabled, setIsMenuEnabled] = useState(true);
  const isMobile = useIsMobile();
  
  // Load settings from localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('online-pos-grid-columns');
    return saved ? parseInt(saved) : (isMobile ? 3 : 4);
  });
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('online-pos-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : (isMobile ? 'small' : 'medium');
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [availableAddons, setAvailableAddons] = useState<DatabaseAddon[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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

  // Adjust grid columns for mobile
  useEffect(() => {
    if (isMobile) {
      setGridColumns(3); 
      setItemSize('small'); 
    } else {
      const saved = localStorage.getItem('online-pos-grid-columns');
      setGridColumns(saved ? parseInt(saved) : 4);
      const savedSize = localStorage.getItem('online-pos-item-size');
      setItemSize(savedSize ? savedSize as 'small' | 'medium' | 'large' : 'medium');
    }
  }, [isMobile]);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('online-pos-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('online-pos-item-size', itemSize);
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
    is_available: item.is_available && isMenuEnabled,
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
    if (!isMenuEnabled) return;
    
    console.log('Menu item clicked:', menuItem);
    
    const menuAddonGroups = getAddonGroupsForMenuItem(menuItem.id);
    const categoryAddonGroups = menuItem.category_id 
      ? getAddonGroupsForCategory(menuItem.category_id) 
      : [];

    const allAddonGroupIds = new Set([
      ...menuAddonGroups.map(ag => ag.id),
      ...categoryAddonGroups.map(ag => ag.id)
    ]);

    const relevantAddons = addons.filter(addon => 
      addon.addon_group_id && allAddonGroupIds.has(addon.addon_group_id)
    );

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

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!showPreview) {
    return (
      <div className="h-screen bg-cream-50 flex overflow-hidden">
        <MainSidebar 
          isOpen={isSidebarOpen} 
          onClose={handleCloseSidebar}
        />
        
        <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-2xl w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-coffee-800 flex items-center justify-center gap-2">
                  <Globe className="w-8 h-8" />
                  ระบบออนไลน์
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center text-coffee-600">
                  จัดการระบบ POS ออนไลน์สำหรับลูกค้า
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-coffee-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-coffee-800">เปิด/ปิด เมนู</h3>
                      <p className="text-sm text-coffee-600">ควบคุมการแสดงเมนูสำหรับลูกค้าออนไลน์</p>
                    </div>
                    <Toggle
                      pressed={isMenuEnabled}
                      onPressedChange={setIsMenuEnabled}
                      className="data-[state=on]:bg-coffee-600"
                    >
                      <MenuIcon className="w-4 h-4" />
                    </Toggle>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowPreview(true)}
                      className="flex-1 bg-coffee-600 hover:bg-coffee-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Header with Back Button */}
        <div className={`flex-shrink-0 bg-cream-50 sticky top-0 z-10 ${
          isMobile ? 'p-2 pb-0' : 'p-4 pb-0'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
              className="border-coffee-300"
            >
              ← กลับ
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-coffee-600" />
              <span className="text-coffee-800 font-medium">POS ออนไลน์ (Preview)</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-coffee-600">เมนู:</span>
              <span className={`text-sm font-medium ${isMenuEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {isMenuEnabled ? 'เปิด' : 'ปิด'}
              </span>
            </div>
          </div>
          
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
            page="other"
          />
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
                {!isMenuEnabled ? (
                  <div className="flex items-center justify-center h-full text-coffee-500">
                    <div className="text-center">
                      <MenuIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">เมนูถูกปิดใช้งาน</p>
                      <p className="text-sm">กรุณาเปิดเมนูเพื่อแสดงรายการอาหาร</p>
                    </div>
                  </div>
                ) : (
                  <MenuGrid
                    menuItems={filteredMenuItems}
                    addons={[]}
                    onAddToCart={handleMenuItemClick}
                    gridColumns={gridColumns}
                    itemSize={itemSize}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Desktop Cart */}
          {!isMobile && (
            <div className="w-80 flex-shrink-0 overflow-hidden">
              <div className="h-full flex flex-col">
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
                    onClearCart={clearCart}
                    billDiscount={billDiscount}
                    billDiscountType={billDiscountType}
                    onUpdateBillDiscount={setBillDiscount}
                    onUpdateBillDiscountType={setBillDiscountType}
                    onRestoreCart={restoreCart}
                    selectedMember={selectedMember}
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
          onClearCart={clearCart}
          billDiscount={billDiscount}
          billDiscountType={billDiscountType}
          onUpdateBillDiscount={setBillDiscount}
          onUpdateBillDiscountType={setBillDiscountType}
          onRestoreCart={restoreCart}
          selectedMember={selectedMember}
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
    </div>
  );
};

export default OnlineSystem;
