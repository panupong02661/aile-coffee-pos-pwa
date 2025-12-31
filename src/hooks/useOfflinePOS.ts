import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for offline data
interface OfflineMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  category_id?: string;
  image_url?: string;
  is_available: boolean;
  categories?: { id: string; name: string } | null;
}

interface OfflineCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

interface OfflineAddon {
  id: string;
  name: string;
  price: number;
  addon_group_id?: string;
  sort_order: number;
  is_active: boolean;
  addon_groups?: {
    id: string;
    name: string;
    is_required: boolean;
    allow_multiple: boolean;
  } | null;
}

interface OfflineAddonGroup {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  allow_multiple: boolean;
  sort_order: number;
  is_active: boolean;
}

interface OfflineOrder {
  id: string;
  order_number: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  member_id?: string;
  bill_discount?: number;
  bill_discount_type?: string;
  created_at: string;
  synced: boolean;
}

interface OfflineData {
  menuItems: OfflineMenuItem[];
  categories: OfflineCategory[];
  addons: OfflineAddon[];
  addonGroups: OfflineAddonGroup[];
  menuAddonGroups: any[];
  categoryAddonGroups: any[];
  orders: OfflineOrder[];
  lastSync: string;
  version: number;
}

const OFFLINE_DATA_KEY = 'pos_offline_data';
const OFFLINE_ORDERS_KEY = 'pos_offline_orders';
const DATA_VERSION = 1;

// Helper functions for localStorage
const getStoredData = (): OfflineData | null => {
  try {
    const data = localStorage.getItem(OFFLINE_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading offline data:', e);
    return null;
  }
};

const setStoredData = (data: OfflineData): void => {
  try {
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving offline data:', e);
    // Try to clear old data and save again
    try {
      localStorage.removeItem(OFFLINE_DATA_KEY);
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
    } catch (e2) {
      console.error('Failed to save offline data even after clearing:', e2);
    }
  }
};

const getStoredOrders = (): OfflineOrder[] => {
  try {
    const data = localStorage.getItem(OFFLINE_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading offline orders:', e);
    return [];
  }
};

const setStoredOrders = (orders: OfflineOrder[]): void => {
  try {
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving offline orders:', e);
  }
};

export const useOfflinePOS = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Network online');
      setIsOnline(true);
      // Auto sync when back online
      syncPendingOrders();
    };

    const handleOffline = () => {
      console.log('🔴 Network offline');
      setIsOnline(false);
      toast.warning('ออฟไลน์ - ระบบจะใช้ข้อมูลที่บันทึกไว้', {
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize
    setIsOnline(navigator.onLine);
    
    // Load stored data
    const stored = getStoredData();
    if (stored) {
      setOfflineData(stored);
      setLastSyncTime(stored.lastSync);
    }

    // Load pending orders count
    const orders = getStoredOrders();
    setPendingOrdersCount(orders.filter(o => !o.synced).length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync menu data from Supabase
  const syncMenuData = useCallback(async (): Promise<boolean> => {
    if (!isOnline) {
      console.log('Cannot sync: offline');
      return false;
    }

    setIsSyncing(true);
    console.log('🔄 Syncing menu data...');

    try {
      // Fetch all data in parallel
      const [
        categoriesRes,
        menuItemsRes,
        addonsRes,
        addonGroupsRes,
        menuAddonGroupsRes,
        categoryAddonGroupsRes
      ] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select(`
          *,
          categories!menu_items_category_id_fkey (id, name)
        `).order('created_at', { ascending: false }),
        supabase.from('addons').select(`
          *,
          addon_groups!addons_addon_group_id_fkey (id, name, is_required, allow_multiple)
        `).order('sort_order'),
        supabase.from('addon_groups').select('*').order('sort_order'),
        supabase.from('menu_addon_groups').select('*'),
        supabase.from('category_addon_groups').select('*')
      ]);

      // Check for errors
      if (categoriesRes.error) throw categoriesRes.error;
      if (menuItemsRes.error) throw menuItemsRes.error;
      if (addonsRes.error) throw addonsRes.error;
      if (addonGroupsRes.error) throw addonGroupsRes.error;
      if (menuAddonGroupsRes.error) throw menuAddonGroupsRes.error;
      if (categoryAddonGroupsRes.error) throw categoryAddonGroupsRes.error;

      const newData: OfflineData = {
        menuItems: menuItemsRes.data || [],
        categories: categoriesRes.data || [],
        addons: addonsRes.data || [],
        addonGroups: addonGroupsRes.data || [],
        menuAddonGroups: menuAddonGroupsRes.data || [],
        categoryAddonGroups: categoryAddonGroupsRes.data || [],
        orders: getStoredOrders(),
        lastSync: new Date().toISOString(),
        version: DATA_VERSION
      };

      // Save to localStorage
      setStoredData(newData);
      setOfflineData(newData);
      setLastSyncTime(newData.lastSync);

      console.log('✅ Menu data synced:', {
        categories: newData.categories.length,
        menuItems: newData.menuItems.length,
        addons: newData.addons.length
      });

      return true;
    } catch (error) {
      console.error('❌ Error syncing menu data:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Save order (works offline)
  const saveOrder = useCallback(async (orderData: {
    order_number: string;
    items: any[];
    total_amount: number;
    payment_method: string;
    member_id?: string;
    bill_discount?: number;
    bill_discount_type?: string;
    order_items?: any[];
  }): Promise<{ success: boolean; orderId: string }> => {
    const orderId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineOrder: OfflineOrder = {
      id: orderId,
      order_number: orderData.order_number,
      items: orderData.items,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      member_id: orderData.member_id,
      bill_discount: orderData.bill_discount,
      bill_discount_type: orderData.bill_discount_type,
      created_at: new Date().toISOString(),
      synced: false
    };

    // If online, try to save directly to Supabase
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            order_number: orderData.order_number,
            total_amount: orderData.total_amount,
            payment_method: orderData.payment_method,
            member_id: orderData.member_id || null,
            bill_discount: orderData.bill_discount || 0,
            bill_discount_type: orderData.bill_discount_type || 'amount',
            items_count: orderData.items.length,
            order_type: 'dine-in',
            status: 'completed'
          })
          .select()
          .single();

        if (error) throw error;

        // Save order items
        if (orderData.order_items && data) {
          const orderItems = orderData.order_items.map(item => ({
            ...item,
            order_id: data.id
          }));

          await supabase.from('order_items').insert(orderItems);
        }

        console.log('✅ Order saved online:', data.id);
        return { success: true, orderId: data.id };
      } catch (error) {
        console.error('❌ Error saving order online, saving offline:', error);
        // Fall through to offline save
      }
    }

    // Save offline
    const orders = getStoredOrders();
    orders.push(offlineOrder);
    setStoredOrders(orders);
    setPendingOrdersCount(orders.filter(o => !o.synced).length);

    toast.info('บันทึกออเดอร์ในโหมดออฟไลน์', {
      description: 'จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
    });

    console.log('📦 Order saved offline:', orderId);
    return { success: true, orderId };
  }, [isOnline]);

  // Sync pending orders to Supabase
  const syncPendingOrders = useCallback(async (): Promise<number> => {
    if (!isOnline) {
      console.log('Cannot sync orders: offline');
      return 0;
    }

    const orders = getStoredOrders();
    const pendingOrders = orders.filter(o => !o.synced);

    if (pendingOrders.length === 0) {
      console.log('No pending orders to sync');
      return 0;
    }

    setIsSyncing(true);
    console.log(`🔄 Syncing ${pendingOrders.length} pending orders...`);

    let syncedCount = 0;

    for (const order of pendingOrders) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            order_number: order.order_number,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            member_id: order.member_id || null,
            bill_discount: order.bill_discount || 0,
            bill_discount_type: order.bill_discount_type || 'amount',
            items_count: order.items.length,
            order_type: 'dine-in',
            status: 'completed',
            created_at: order.created_at
          })
          .select()
          .single();

        if (error) throw error;

        // Save order items
        if (order.items && data) {
          const orderItems = order.items.map((item: any) => ({
            order_id: data.id,
            menu_item_id: item.menu_item?.id || item.menu_item_id,
            menu_item_name: item.menu_item?.name || item.name || 'Unknown',
            quantity: item.quantity,
            unit_price: item.menu_item?.price || item.unit_price || 0,
            total_price: (item.menu_item?.price || item.unit_price || 0) * item.quantity,
            selected_addons: item.addons || [],
            item_discount: item.item_discount || 0,
            item_discount_type: item.item_discount_type || 'amount'
          }));

          await supabase.from('order_items').insert(orderItems);
        }

        // Mark as synced
        order.synced = true;
        syncedCount++;
        console.log(`✅ Order synced: ${order.order_number}`);
      } catch (error) {
        console.error(`❌ Error syncing order ${order.order_number}:`, error);
      }
    }

    // Update stored orders
    setStoredOrders(orders);
    setPendingOrdersCount(orders.filter(o => !o.synced).length);

    if (syncedCount > 0) {
      toast.success(`ซิงค์ออเดอร์สำเร็จ ${syncedCount} รายการ`);
    }

    setIsSyncing(false);
    console.log(`✅ Synced ${syncedCount}/${pendingOrders.length} orders`);
    return syncedCount;
  }, [isOnline]);

  // Clear synced orders (keep unsynced)
  const clearSyncedOrders = useCallback(() => {
    const orders = getStoredOrders();
    const unsyncedOrders = orders.filter(o => !o.synced);
    setStoredOrders(unsyncedOrders);
    setPendingOrdersCount(unsyncedOrders.length);
  }, []);

  // Get cached data for offline use
  const getCachedMenuItems = useCallback(() => {
    return offlineData?.menuItems || [];
  }, [offlineData]);

  const getCachedCategories = useCallback(() => {
    return offlineData?.categories || [];
  }, [offlineData]);

  const getCachedAddons = useCallback(() => {
    return offlineData?.addons || [];
  }, [offlineData]);

  const getCachedAddonGroups = useCallback(() => {
    return offlineData?.addonGroups || [];
  }, [offlineData]);

  // Check if data is available
  const hasOfflineData = useCallback(() => {
    return offlineData !== null && offlineData.menuItems.length > 0;
  }, [offlineData]);

  return {
    isOnline,
    isSyncing,
    pendingOrdersCount,
    lastSyncTime,
    
    // Data sync
    syncMenuData,
    syncPendingOrders,
    
    // Order management
    saveOrder,
    clearSyncedOrders,
    
    // Cached data getters
    getCachedMenuItems,
    getCachedCategories,
    getCachedAddons,
    getCachedAddonGroups,
    hasOfflineData,
    
    // Raw offline data
    offlineData
  };
};
