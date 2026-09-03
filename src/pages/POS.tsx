import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuGrid from '@/components/MenuGrid';
import Cart from '@/components/Cart';
import PosMenuGridV2 from '@/components/pos/PosMenuGridV2';
import QuickSaleBar from '@/components/pos/QuickSaleBar';
import { useLowStockMenu } from '@/hooks/usePosInsights';

import PosCartV2 from '@/components/pos/PosCartV2';
import PosV2CategoryBar from '@/components/preview/PosV2CategoryBar';
import MobileCart from '@/components/MobileCart';
import AddonModal from '@/components/AddonModal';
import MemberSearchModal from '@/components/MemberSearchModal';
import DebugCodeChecker from '@/components/DebugCodeChecker';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';
import CustomerDetailsModal from '@/components/CustomerDetailsModal';
import { useCart } from '@/hooks/useCart';
import { useTableOrders } from '@/hooks/useTableOrders';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePOSSettings } from '@/hooks/usePOSSettings';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface SoundPopupSettings {
  online: {
    soundEnabled: boolean;
    popupEnabled: boolean;
    volume: number;
  };
  pos: {
    soundEnabled: boolean;
    popupEnabled: boolean;
    volume: number;
  };
}

const POS = ({ classic = false }: { classic?: boolean }) => {
  console.log('🚀 POS Component Started');
  
  const [selectedCategory, setSelectedCategory] = useState('1');
  const { data: lowStockInfo } = useLowStockMenu();
  const isMobile = useIsMobile();
  const { animationsEnabled, darkModeEnabled, fontSize, fontWeight, primaryColor, textColor, themePreset, glassOpacity } = usePOSSettings();
  const [shopLogoUrl, setShopLogoUrl] = useState<string>('');

  // Load shop logo from settings (uses shopSettings from useSupabaseData which is already filtered)
  // We don't need a separate query here
  // Sound and popup settings from database
  const [soundPopupSettings, setSoundPopupSettings] = useState<SoundPopupSettings>({
    online: { soundEnabled: true, popupEnabled: true, volume: 80 },
    pos: { soundEnabled: false, popupEnabled: false, volume: 80 }
  });
  
  // Load notification settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading notification settings:', error);
          return;
        }
        
        if (data) {
          const soundPopup = (data as any).sound_popup;
          if (soundPopup) {
            console.log('📢 POS - Loaded sound popup settings:', soundPopup);
            setSoundPopupSettings(soundPopup);
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    
    loadSettings();
    
    // Subscribe to changes in real-time
    const channel = supabase
      .channel('pos-notification-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_settings'
        },
        (payload) => {
          console.log('📢 POS - Settings changed:', payload);
          const newData = payload.new as any;
          if (newData) {
            const soundPopup = newData.sound_popup;
            if (soundPopup) {
              setSoundPopupSettings(soundPopup);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  console.log('📱 isMobile:', isMobile);
  
  // Simple audio functions for testing
  const playBellSound = async () => {
    // Check if POS sound is enabled in settings
    if (!soundPopupSettings.pos.soundEnabled) {
      console.log('🔇 POS sound disabled in settings, skipping');
      return;
    }
    
    try {
      const audio = new Audio('/sounds/default-notification.mp3');
      audio.volume = (soundPopupSettings.pos.volume || 80) / 100;
      await audio.play();
      console.log('🔔 POS sound played (enabled in settings)');
    } catch (error) {
      console.log('Failed to play notification sound:', error);
    }
  };
  
  const initializeAudio = async () => {
    try {
      const audio = new Audio('/sounds/default-notification.mp3');
      audio.volume = 0;
      await audio.play();
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  };
  
  // ตรวจจับ Android (Capacitor native หรือ user agent)
  const isAndroid = typeof window !== 'undefined' && (
    (window as any).Capacitor?.getPlatform?.() === 'android' ||
    /Android/i.test(navigator.userAgent)
  );

  // โหลดการตั้งค่าจาก localStorage — Android default: 6 คอลัมน์ / ขนาดใหญ่
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('pos-grid-columns');
    return saved ? parseInt(saved) : (isAndroid ? 6 : (isMobile ? 3 : 4));
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('pos-item-size');
    return saved ? saved as 'small' | 'medium' | 'large' : (isAndroid ? 'large' : (isMobile ? 'small' : 'medium'));
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
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);

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
    tables,
    selectedTableId,
    setSelectedTableId,
    saveCartToTable,
    loadTableOrder,
    completeTableOrder,
    tablesWithOrders,
    getTableRounds,
    updateRoundItems,
    deleteRound,
  } = useTableOrders();

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedTableNumber = selectedTable?.table_number || '';

  // Back-dating: null = ใช้วันที่/เวลาปัจจุบัน (จะรีเซ็ตทุกครั้งที่เปิด POS ใหม่)
  const [backdatedAt, setBackdatedAt] = useState<Date | null>(null);

  const handleSelectTable = (tableId: string | null) => {
    setSelectedTableId(tableId);
  };

  const handleLoadFromTable = (tableId: string) => {
    // Load ALL items from all rounds into cart
    const rounds = getTableRounds(tableId);
    if (rounds.length > 0) {
      const allItems = rounds.flatMap(r => r.cart_items);
      if (allItems.length > 0) {
        restoreCart(allItems, 0, 'amount');
        toast({ title: `โหลดรายการโต๊ะ ${rounds[0].table_number}`, description: `${allItems.length} รายการ จาก ${rounds.length} รอบ` });
      }
    }
  };

  const handleLoadRoundToCart = (roundNumber: number) => {
    if (!selectedTableId) return;
    const order = loadTableOrder(selectedTableId, roundNumber);
    if (order && order.cart_items.length > 0) {
      restoreCart(order.cart_items, order.bill_discount, order.bill_discount_type);
      toast({ title: `โหลดรอบ ${roundNumber}`, description: `${order.cart_items.length} รายการ` });
    }
  };

  const handleSaveToTable = async () => {
    if (!selectedTableId || !selectedTable) return;
    const ok = await saveCartToTable(selectedTableId, selectedTable.table_number, cartItems, billDiscount, billDiscountType);
    if (ok) {
      const rounds = getTableRounds(selectedTableId);
      toast({ title: `บันทึกรอบ ${rounds.length} โต๊ะ ${selectedTable.table_number} สำเร็จ` });
      clearCart();
    }
  };


  const { 
    categories, 
    menuItems, 
    addons, 
    shopSettings: supabaseShopSettings,
    loading, 
    getAddonGroupsForMenuItem, 
    getAddonGroupsForCategory 
  } = useSupabaseData();

  // Use shop logo from filtered shop settings
  useEffect(() => {
    if (supabaseShopSettings?.logo_url) {
      setShopLogoUrl(supabaseShopSettings.logo_url);
    }
  }, [supabaseShopSettings]);

  const { toast } = useToast();

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

  // NOTE: Online order notifications are handled by GlobalNotificationProvider
  // This listener is removed to prevent duplicate notifications

  const activeCategoryIds = new Set(
    (categories || [])
      .filter(cat => cat.is_active)
      .map(cat => cat.id)
  );

  const convertedCategories = [
    { 
      id: '1', 
      name: 'ทั้งหมด',
      description: 'แสดงสินค้าทั้งหมด',
      sort_order: 0,
      is_active: true
    },
    ...(categories || [])
      .filter(cat => cat.is_active)
      .map(cat => ({ 
        id: cat.id, 
        name: cat.name,
        description: cat.description || '',
        sort_order: cat.sort_order,
        is_active: cat.is_active
      }))
  ];

  console.log('🏷️ Converted categories:', convertedCategories.length);

  const convertedMenuItems = (menuItems || []).map(item => {
    const categoryIsActive = !item.category_id 
      || activeCategoryIds.has(item.category_id);

    return {
      id: item.id,
      name: item.name,
      price: Number(item.price),
      category_id: item.category_id || '',
      image: item.image_url || '',
      // แสดงเฉพาะเมนูที่เปิดใช้งานและหมวดหมู่ยังเปิดใช้งานอยู่
      is_available: item.is_available && categoryIsActive,
      description: item.description || '',
      calculated_cost: Number(item.cost_price)
    };
  });

  console.log('🍽️ Converted menu items:', convertedMenuItems.length);

  // Filter out unavailable items and then filter by category
  const availableMenuItems = convertedMenuItems.filter(item => item.is_available);
  
  const filteredMenuItems = selectedCategory === '1' 
    ? availableMenuItems 
    : availableMenuItems.filter(item => item.category_id === selectedCategory);

  console.log('🔍 Filtered menu items:', {
    selectedCategory,
    filteredCount: filteredMenuItems.length,
    availableCount: availableMenuItems.length,
    totalMenuItems: convertedMenuItems.length
  });

  const filteredMenuItemsForSearch = availableMenuItems.filter(item =>
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

  const handleMemberUpdate = (updatedMember: Member) => {
    console.log('🔄 Member updated in real-time:', updatedMember);
    setSelectedMember(updatedMember);
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
    
    // ตรวจสอบยอดขั้นต่ำ
    if (giftData.min_purchase && giftData.min_purchase > 0) {
      // Calculate current total
      const subtotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.menu_item.price * item.quantity;
        const itemDiscount = item.item_discount || 0;
        return sum + itemTotal - itemDiscount;
      }, 0);
      
      let currentTotal = subtotal;
      if (billDiscount > 0) {
        currentTotal -= billDiscountType === 'percent' 
          ? (subtotal * billDiscount) / 100 
          : billDiscount;
      }
      
      if (currentTotal < giftData.min_purchase) {
        toast({ 
          title: 'ยอดสั่งซื้อไม่ถึงขั้นต่ำ', 
          description: `ต้องซื้อขั้นต่ำ ${giftData.min_purchase} บาท (ยอดปัจจุบัน: ${currentTotal.toFixed(2)} บาท)`,
          variant: 'destructive' 
        });
        return;
      }
    }
    
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

  const handleClearCart = async () => {
    // If a table is selected and has orders, also clear from database
    if (selectedTableId && tablesWithOrders.includes(selectedTableId)) {
      await completeTableOrder(selectedTableId);
      toast({ title: 'ล้างรายการโต๊ะสำเร็จ', description: `โต๊ะ ${selectedTableNumber} ถูกล้างเรียบร้อย` });
    }
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

      // Complete table order if a table was selected
      if (selectedTableId) {
        await completeTableOrder(selectedTableId);
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

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const fontWeightClass = fontWeight === 'light' ? 'font-light' : fontWeight === 'bold' ? 'font-bold' : 'font-normal';

  // Dynamic primary color + theme via CSS custom properties
  const posStyle: React.CSSProperties = (() => {
    const style: Record<string, string> = {};
    const hue = primaryColor || '25';
    
    if (darkModeEnabled || themePreset !== 'default') {
      // Brighter primary for dark backgrounds
      style['--primary'] = `${hue} 70% 58%`;
      style['--ring'] = `${hue} 70% 58%`;
      style['--pos-primary-dark'] = `${hue} 70% 58%`;
      
      // Text color — now stored as raw HSL value or 'default'
      if (textColor && textColor !== 'default') {
        const fg = textColor;
        // Derive a muted version by reducing lightness
        const parts = fg.split(/\s+/);
        const muted = parts.length === 3
          ? `${parts[0]} ${Math.max(parseInt(parts[1]) - 10, 0)}% ${Math.max(parseInt(parts[2]) - 20, 30)}%`
          : '220 10% 72%';
        style['--foreground'] = fg;
        style['--card-foreground'] = fg;
        style['--popover-foreground'] = fg;
        style['--secondary-foreground'] = fg;
        style['--accent-foreground'] = fg;
        style['--muted-foreground'] = muted;
        style['--sidebar-foreground'] = fg;
      }

      // Glass theme opacity + blur
      if (themePreset === 'glass') {
        style['--glass-opacity'] = String(glassOpacity);
        style['--glass-blur'] = '16px';
      }
    } else {
      if (hue !== '25') {
        style['--primary'] = `${hue} 60% 35%`;
        style['--ring'] = `${hue} 60% 35%`;
      }
      // Apply text color in light mode too
      if (textColor && textColor !== 'default') {
        // For light mode, darken the chosen color
        const parts = textColor.split(/\s+/);
        if (parts.length === 3) {
          const lightness = parseInt(parts[2]);
          const darkFg = `${parts[0]} ${parts[1]} ${Math.min(lightness, 35)}%`;
          const darkMuted = `${parts[0]} ${Math.max(parseInt(parts[1]) - 15, 0)}% ${Math.min(lightness + 10, 50)}%`;
          style['--foreground'] = darkFg;
          style['--card-foreground'] = darkFg;
          style['--sidebar-foreground'] = darkFg;
          style['--muted-foreground'] = darkMuted;
        }
      }
    }
    
    return style as React.CSSProperties;
  })();

  // Determine theme CSS class
  const themeClass = (() => {
    if (themePreset === 'neon-dark') return 'pos-neon-dark';
    if (themePreset === 'cyber') return 'pos-cyber';
    if (themePreset === 'glass') return 'pos-glass';
    if (darkModeEnabled) return 'pos-dark';
    return '';
  })();

  const buildCartProps = () => ({
    cartItems,
    onUpdateQuantity: updateQuantity,
    onRemoveItem: removeFromCart,
    onUpdateDiscount: updateDiscount,
    onClearCart: handleClearCart,
    billDiscount,
    billDiscountType,
    onUpdateBillDiscount: setBillDiscount,
    onUpdateBillDiscountType: setBillDiscountType,
    onRestoreCart: restoreCart,
    selectedMember,
    onCodeApply: handleCodeApply,
    appliedGiftCode,
    onPaymentComplete: handlePaymentComplete,
    onMemberUpdate: handleMemberUpdate,
    tables,
    selectedTableId,
    onSelectTable: handleSelectTable,
    tablesWithOrders,
    onSaveToTable: handleSaveToTable,
    onLoadFromTable: handleLoadFromTable,
    selectedTableNumber,
    tableRounds: selectedTableId ? getTableRounds(selectedTableId) : [],
    onLoadRound: handleLoadRoundToCart,
    onDeleteRound: deleteRound,
    onUpdateRoundItem: updateRoundItems,
    backdatedAt,
    onChangeBackdatedAt: setBackdatedAt,
  });

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background flex overflow-hidden transition-colors duration-300",
        themeClass,
        !classic && 'posv2-skin bg-[hsl(var(--posv2-surface))]',
        animationsEnabled && 'pos-animate',
        fontSizeClass,
        fontWeightClass
      )}
      style={posStyle}
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex overflow-hidden transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
      }`}>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Fixed Header - pt-safe for iPad status bar */}
        <div className={cn(
          'flex-shrink-0 z-20',
          classic
            ? `bg-background border-b border-border ${isMobile ? 'pt-4 p-1' : 'pt-3 py-1 px-1.5'}`
            : `bg-transparent ${isMobile ? 'pt-4 p-1' : 'pt-3 py-1 px-1.5'}`
        )}>
          <Header
            onToggleSidebar={handleToggleSidebar}
            onMemberClick={handleMemberClick}
            categories={classic ? convertedCategories : []}
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
            showDebug={showDebug}
            onToggleDebug={() => setShowDebug(!showDebug)}
            onSearchOpen={() => setIsSearchOpen(true)}
            onSettingsOpen={() => setIsSettingsOpen(true)}
            onMemberInfoClick={() => setIsCustomerDetailsOpen(true)}
            trailing={!classic ? (
              <PosV2CategoryBar
                categories={convertedCategories.map(c => ({ id: c.id, name: c.name }))}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            ) : undefined}
          />
        </div>
        
        {/* Content Area - fills remaining space */}
        <div className={cn(
          'flex-1 flex overflow-hidden',
          classic ? (isMobile ? 'flex-col gap-1 p-1' : 'gap-1 p-1') : (isMobile ? 'flex-col gap-2 p-2' : 'gap-3 p-3 pt-1.5')
        )} style={{ minHeight: 0 }}>
          {/* Menu Grid Container */}
          <div className="flex-1 overflow-hidden" style={{ minWidth: 0, minHeight: 0 }}>
            <div className={cn(
              'h-full overflow-hidden',
              classic && 'bg-card rounded-lg border border-border shadow-sm'
            )}>
              <div className={cn(
                'h-full overflow-y-auto overflow-x-hidden',
                classic ? 'p-1' : 'pr-1 pb-2'
              )}
              style={{ 
                scrollbarWidth: 'thin',
                scrollBehavior: 'smooth'
              }}>
                {filteredMenuItems.length > 0 ? (
                  classic ? (
                    <MenuGrid
                      menuItems={filteredMenuItems}
                      addons={[]}
                      onAddToCart={handleMenuItemClick}
                      gridColumns={gridColumns}
                      itemSize={itemSize}
                      cartItems={cartItems}
                      shopLogoUrl={shopLogoUrl}
                    />
                  ) : (
                    <>
                      <QuickSaleBar
                        menuItems={availableMenuItems}
                        onAddToCart={handleMenuItemClick}
                      />
                      <PosMenuGridV2
                        menuItems={filteredMenuItems}
                        onAddToCart={handleMenuItemClick}
                        gridColumns={gridColumns}
                        itemSize={itemSize}
                        cartItems={cartItems}
                        shopLogoUrl={shopLogoUrl}
                        lowStockMap={lowStockInfo?.menuMap}
                      />
                    </>
                  )

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

          {/* Classic cart stays inside content area */}
          {!isMobile && classic && (
            <div className="flex-shrink-0 overflow-hidden w-60 md:w-64 lg:w-72 xl:w-80" style={{ minHeight: 0 }}>
              <Cart {...buildCartProps()} />
            </div>
          )}
        </div>
        </div>

        {/* v2 Cart - full screen height column */}
        {!isMobile && !classic && (
          <div
            className="flex-shrink-0 overflow-hidden w-72 lg:w-80 xl:w-[360px] py-3 pr-3 pl-0"
            style={{ minHeight: 0 }}
          >
            <PosCartV2 {...buildCartProps()} />
          </div>
        )}



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
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pos-badge-pop" key={totalItems}>
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
          onMemberUpdate={handleMemberUpdate}
        />
      )}

      {/* Member Search Modal */}
      <MemberSearchModal
        isOpen={isMemberSearchOpen}
        onClose={() => setIsMemberSearchOpen(false)}
        onSelectMember={handleSelectMember}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isCustomerDetailsOpen}
        onClose={() => setIsCustomerDetailsOpen(false)}
        member={selectedMember}
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
