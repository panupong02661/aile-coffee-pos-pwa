import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { useAuth } from '@/hooks/useAuth';
import { notifyPosOrder } from '@/utils/orderNotify';

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
  shop_id: string;
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
  shopId: string;
  userId: string;
}

const OFFLINE_DATA_KEY_BASE = 'pos_offline_data';
const OFFLINE_ORDERS_KEY_BASE = 'pos_offline_orders';
const DATA_VERSION = 1;

const buildScopedKey = (baseKey: string, userId: string | null, shopId: string | null) => {
  return `${baseKey}:${userId || 'guest'}:${shopId || 'no-shop'}`;
};

// Capacitor Preferences helpers for native app compatibility
const getStoredData = async (key: string): Promise<OfflineData | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value) {
      console.log('📱 Loaded offline data from Capacitor Preferences', key);
      return JSON.parse(value);
    }

    // Fallback to localStorage for web
    const localData = localStorage.getItem(key);
    if (localData) {
      console.log('🌐 Loaded offline data from localStorage', key);
      return JSON.parse(localData);
    }

    return null;
  } catch (e) {
    console.error('Error reading offline data:', e);
    try {
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  }
};

const setStoredData = async (key: string, data: OfflineData): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    await Preferences.set({ key, value: jsonData });
    localStorage.setItem(key, jsonData);
    console.log('💾 Saved offline data to storage', key);
  } catch (e) {
    console.error('Error saving offline data:', e);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e2) {
      console.error('Failed to save offline data:', e2);
    }
  }
};

const getStoredOrders = async (key: string): Promise<OfflineOrder[]> => {
  try {
    const { value } = await Preferences.get({ key });
    if (value) {
      return JSON.parse(value);
    }

    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : [];
  } catch (e) {
    console.error('Error reading offline orders:', e);
    try {
      const localData = localStorage.getItem(key);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  }
};

const setStoredOrders = async (key: string, orders: OfflineOrder[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(orders);
    await Preferences.set({ key, value: jsonData });
    localStorage.setItem(key, jsonData);
  } catch (e) {
    console.error('Error saving offline orders:', e);
    try {
      localStorage.setItem(key, JSON.stringify(orders));
    } catch {
      // Silent fail
    }
  }
};

export const useOfflinePOS = () => {
  const { user } = useAuth();
  const { shopId, loading: shopLoading } = useCurrentShop();

  const scopedDataKey = useMemo(
    () => buildScopedKey(OFFLINE_DATA_KEY_BASE, user?.id ?? null, shopId),
    [user?.id, shopId]
  );
  const scopedOrdersKey = useMemo(
    () => buildScopedKey(OFFLINE_ORDERS_KEY_BASE, user?.id ?? null, shopId),
    [user?.id, shopId]
  );

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const initializedKeyRef = useRef<string | null>(null);

  const syncMenuDataInternal = useCallback(async (): Promise<boolean> => {
    if (!shopId || !user?.id || !navigator.onLine) {
      return false;
    }

    setIsSyncing(true);
    console.log('🔄 Syncing menu data (shop scoped)...', { shopId, userId: user.id });

    try {
      const [categoriesRes, menuItemsRes, addonsRes, addonGroupsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('shop_id', shopId).order('sort_order'),
        supabase
          .from('menu_items')
          .select(`
            *,
            categories!menu_items_category_id_fkey (id, name)
          `)
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false }),
        supabase
          .from('addons')
          .select(`
            *,
            addon_groups!addons_addon_group_id_fkey (id, name, is_required, allow_multiple)
          `)
          .eq('shop_id', shopId)
          .order('sort_order'),
        supabase.from('addon_groups').select('*').eq('shop_id', shopId).order('sort_order'),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (menuItemsRes.error) throw menuItemsRes.error;
      if (addonsRes.error) throw addonsRes.error;
      if (addonGroupsRes.error) throw addonGroupsRes.error;

      const menuItemIds = (menuItemsRes.data || []).map((item) => item.id);
      const categoryIds = (categoriesRes.data || []).map((category) => category.id);

      const [menuAddonGroupsRes, categoryAddonGroupsRes] = await Promise.all([
        menuItemIds.length > 0
          ? supabase.from('menu_addon_groups').select('*').in('menu_item_id', menuItemIds)
          : Promise.resolve({ data: [], error: null }),
        categoryIds.length > 0
          ? supabase.from('category_addon_groups').select('*').in('category_id', categoryIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (menuAddonGroupsRes.error) throw menuAddonGroupsRes.error;
      if (categoryAddonGroupsRes.error) throw categoryAddonGroupsRes.error;

      const storedOrders = await getStoredOrders(scopedOrdersKey);
      const scopedOrders = storedOrders.filter((order) => order.shop_id === shopId);

      const newData: OfflineData = {
        menuItems: menuItemsRes.data || [],
        categories: categoriesRes.data || [],
        addons: addonsRes.data || [],
        addonGroups: addonGroupsRes.data || [],
        menuAddonGroups: menuAddonGroupsRes.data || [],
        categoryAddonGroups: categoryAddonGroupsRes.data || [],
        orders: scopedOrders,
        lastSync: new Date().toISOString(),
        version: DATA_VERSION,
        shopId,
        userId: user.id,
      };

      await setStoredData(scopedDataKey, newData);
      setOfflineData(newData);
      setLastSyncTime(newData.lastSync);

      console.log('✅ Menu data synced (scoped):', {
        categories: newData.categories.length,
        menuItems: newData.menuItems.length,
        addons: newData.addons.length,
        shopId,
      });

      return true;
    } catch (error) {
      console.error('❌ Error syncing menu data (scoped):', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [shopId, user?.id, scopedDataKey, scopedOrdersKey]);

  // Sync pending orders to Supabase
  const syncPendingOrders = useCallback(async (): Promise<number> => {
    if (!shopId || !user?.id || !navigator.onLine) {
      return 0;
    }

    const orders = await getStoredOrders(scopedOrdersKey);
    const pendingOrders = orders.filter((order) => !order.synced && order.shop_id === shopId);

    if (pendingOrders.length === 0) {
      return 0;
    }

    setIsSyncing(true);
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
            created_at: order.created_at,
            shop_id: order.shop_id || shopId,
          })
          .select()
          .single();

        if (error) throw error;

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
            item_discount_type: item.item_discount_type || 'amount',
          }));

          await supabase.from('order_items').insert(orderItems);
        }

        order.synced = true;
        syncedCount++;
      } catch (error) {
        console.error(`❌ Error syncing order ${order.order_number}:`, error);
      }
    }

    await setStoredOrders(scopedOrdersKey, orders);
    setPendingOrdersCount(orders.filter((order) => !order.synced && order.shop_id === shopId).length);

    if (syncedCount > 0) {
      toast.success(`ซิงค์ออเดอร์สำเร็จ ${syncedCount} รายการ`);
    }

    setIsSyncing(false);
    return syncedCount;
  }, [shopId, user?.id, scopedOrdersKey]);

  // Load cached data immediately per user+shop
  useEffect(() => {
    if (shopLoading) return;

    if (!shopId || !user?.id) {
      setOfflineData(null);
      setPendingOrdersCount(0);
      setLastSyncTime(null);
      return;
    }

    const loadCachedDataImmediately = async () => {
      try {
        const localData = localStorage.getItem(scopedDataKey);
        if (!localData) {
          setOfflineData(null);
          setLastSyncTime(null);
          return;
        }

        const parsed: OfflineData = JSON.parse(localData);
        if (parsed.shopId !== shopId || parsed.userId !== user.id) {
          setOfflineData(null);
          setLastSyncTime(null);
          return;
        }

        setOfflineData(parsed);
        setLastSyncTime(parsed.lastSync);
      } catch (e) {
        console.error('Error loading immediate scoped cache:', e);
      }
    };

    loadCachedDataImmediately();
  }, [shopLoading, shopId, user?.id, scopedDataKey]);

  // Initialize and monitor network status
  useEffect(() => {
    if (shopLoading || !shopId || !user?.id) return;

    const initializeOfflineData = async () => {
      if (initializedKeyRef.current === scopedDataKey) return;
      initializedKeyRef.current = scopedDataKey;

      try {
        const stored = await getStoredData(scopedDataKey);
        if (stored && stored.shopId === shopId && stored.userId === user.id) {
          setOfflineData(stored);
          setLastSyncTime(stored.lastSync);
        } else {
          setOfflineData(null);
          setLastSyncTime(null);
        }
      } catch (e) {
        console.error('❌ Error loading cached scoped data:', e);
      }

      try {
        const orders = await getStoredOrders(scopedOrdersKey);
        setPendingOrdersCount(orders.filter((order) => !order.synced && order.shop_id === shopId).length);
      } catch (e) {
        console.error('❌ Error loading pending scoped orders:', e);
      }

      let currentOnline = navigator.onLine;
      try {
        const status = await Network.getStatus();
        currentOnline = status.connected;
      } catch {
        // fallback to navigator
      }

      setIsOnline(currentOnline);

      if (currentOnline) {
        setTimeout(async () => {
          await syncMenuDataInternal();
          await syncPendingOrders();
        }, 500);
      }
    };

    initializeOfflineData();

    let networkListenerPromise: Promise<any> | null = null;

    try {
      networkListenerPromise = Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);

        if (status.connected) {
          syncMenuDataInternal().then(() => syncPendingOrders());
        } else {
          toast.warning('ออฟไลน์ - ระบบจะใช้ข้อมูลของสาขาปัจจุบันที่บันทึกไว้', {
            duration: 3000,
          });
        }
      });
    } catch {
      console.log('Capacitor Network listener not available');
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncMenuDataInternal().then(() => syncPendingOrders());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (networkListenerPromise) {
        networkListenerPromise.then((listener) => listener?.remove?.());
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [shopLoading, shopId, user?.id, scopedDataKey, scopedOrdersKey, syncMenuDataInternal, syncPendingOrders]);

  // Sync menu data from Supabase (public wrapper)
  const syncMenuData = useCallback(async (): Promise<boolean> => {
    return syncMenuDataInternal();
  }, [syncMenuDataInternal]);

  // Save order (works offline) - Always saves locally first for reliability
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
    if (!shopId || !user?.id) {
      toast.error('ไม่พบข้อมูลสาขาของผู้ใช้ที่ล็อกอิน');
      return { success: false, orderId: '' };
    }

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
      synced: false,
      shop_id: shopId,
    };

    try {
      const orders = await getStoredOrders(scopedOrdersKey);
      orders.push(offlineOrder);
      await setStoredOrders(scopedOrdersKey, orders);
    } catch (localError) {
      console.error('❌ Error saving order locally:', localError);
    }

    let actuallyOnline = navigator.onLine;
    try {
      const status = await Network.getStatus();
      actuallyOnline = status.connected;
    } catch {
      // fallback
    }

    if (actuallyOnline) {
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
            status: 'completed',
            shop_id: shopId,
          })
          .select()
          .single();

        if (error) throw error;

        if (orderData.order_items && data) {
          const orderItems = orderData.order_items.map((item) => ({
            ...item,
            order_id: data.id,
          }));

          await supabase.from('order_items').insert(orderItems);
        }

        try {
          const orders = await getStoredOrders(scopedOrdersKey);
          const orderIndex = orders.findIndex((order) => order.id === orderId);
          if (orderIndex >= 0) {
            orders[orderIndex].synced = true;
            await setStoredOrders(scopedOrdersKey, orders);
          }
          setPendingOrdersCount(orders.filter((order) => !order.synced && order.shop_id === shopId).length);
        } catch (e) {
          console.error('Error updating sync status:', e);
        }

        return { success: true, orderId: data.id };
      } catch (error) {
        console.error('❌ Error saving order online, keeping local:', error);

        try {
          const orders = await getStoredOrders(scopedOrdersKey);
          setPendingOrdersCount(orders.filter((order) => !order.synced && order.shop_id === shopId).length);
        } catch {
          // ignore
        }

        toast.info('บันทึกออเดอร์ในโหมดออฟไลน์', {
          description: 'จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต',
        });

        return { success: true, orderId };
      }
    }

    try {
      const orders = await getStoredOrders(scopedOrdersKey);
      setPendingOrdersCount(orders.filter((order) => !order.synced && order.shop_id === shopId).length);
    } catch {
      // ignore
    }

    toast.info('บันทึกออเดอร์ในโหมดออฟไลน์', {
      description: 'จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต',
    });

    return { success: true, orderId };
  }, [shopId, user?.id, scopedOrdersKey]);

  // Clear synced orders (keep unsynced)
  const clearSyncedOrders = useCallback(async () => {
    if (!shopId || !user?.id) return;

    const orders = await getStoredOrders(scopedOrdersKey);
    const unsyncedOrders = orders.filter((order) => !order.synced && order.shop_id === shopId);
    await setStoredOrders(scopedOrdersKey, unsyncedOrders);
    setPendingOrdersCount(unsyncedOrders.length);
  }, [shopId, user?.id, scopedOrdersKey]);

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
    offlineData,
  };
};
