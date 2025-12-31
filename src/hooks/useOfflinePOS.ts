import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

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

// Capacitor Preferences helpers for native app compatibility
const getStoredData = async (): Promise<OfflineData | null> => {
  try {
    const { value } = await Preferences.get({ key: OFFLINE_DATA_KEY });
    if (value) {
      console.log('📱 Loaded offline data from Capacitor Preferences');
      return JSON.parse(value);
    }
    // Fallback to localStorage for web
    const localData = localStorage.getItem(OFFLINE_DATA_KEY);
    if (localData) {
      console.log('🌐 Loaded offline data from localStorage');
      return JSON.parse(localData);
    }
    return null;
  } catch (e) {
    console.error('Error reading offline data:', e);
    // Try localStorage as fallback
    try {
      const localData = localStorage.getItem(OFFLINE_DATA_KEY);
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  }
};

const setStoredData = async (data: OfflineData): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    // Save to both Capacitor Preferences and localStorage for maximum compatibility
    await Preferences.set({ key: OFFLINE_DATA_KEY, value: jsonData });
    localStorage.setItem(OFFLINE_DATA_KEY, jsonData);
    console.log('💾 Saved offline data to storage');
  } catch (e) {
    console.error('Error saving offline data:', e);
    // Try localStorage only as fallback
    try {
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
    } catch (e2) {
      console.error('Failed to save offline data:', e2);
    }
  }
};

const getStoredOrders = async (): Promise<OfflineOrder[]> => {
  try {
    const { value } = await Preferences.get({ key: OFFLINE_ORDERS_KEY });
    if (value) {
      return JSON.parse(value);
    }
    // Fallback to localStorage
    const localData = localStorage.getItem(OFFLINE_ORDERS_KEY);
    return localData ? JSON.parse(localData) : [];
  } catch (e) {
    console.error('Error reading offline orders:', e);
    try {
      const localData = localStorage.getItem(OFFLINE_ORDERS_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  }
};

const setStoredOrders = async (orders: OfflineOrder[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(orders);
    await Preferences.set({ key: OFFLINE_ORDERS_KEY, value: jsonData });
    localStorage.setItem(OFFLINE_ORDERS_KEY, jsonData);
  } catch (e) {
    console.error('Error saving offline orders:', e);
    try {
      localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Silent fail
    }
  }
};

export const useOfflinePOS = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // Sync pending orders to Supabase
  const syncPendingOrders = useCallback(async (): Promise<number> => {
    if (!navigator.onLine) {
      console.log('Cannot sync orders: offline');
      return 0;
    }

    const orders = await getStoredOrders();
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
    await setStoredOrders(orders);
    setPendingOrdersCount(orders.filter(o => !o.synced).length);

    if (syncedCount > 0) {
      toast.success(`ซิงค์ออเดอร์สำเร็จ ${syncedCount} รายการ`);
    }

    setIsSyncing(false);
    console.log(`✅ Synced ${syncedCount}/${pendingOrders.length} orders`);
    return syncedCount;
  }, []);

  // Load cached data immediately on mount (synchronous-like for faster initial render)
  useEffect(() => {
    const loadCachedDataImmediately = async () => {
      try {
        // Try localStorage first for faster access
        const localData = localStorage.getItem(OFFLINE_DATA_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          setOfflineData(parsed);
          setLastSyncTime(parsed.lastSync);
          console.log('🚀 Immediately loaded cached data from localStorage:', {
            menuItems: parsed.menuItems?.length || 0,
            categories: parsed.categories?.length || 0,
            addons: parsed.addons?.length || 0
          });
        }
      } catch (e) {
        console.error('Error loading immediate cache:', e);
      }
    };
    
    loadCachedDataImmediately();
  }, []);

  // Initialize and monitor network status
  useEffect(() => {
    const initializeOfflineData = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      console.log('📱 Initializing offline POS...');
      
      // Load stored data from Capacitor Preferences (may have more recent data)
      try {
        const stored = await getStoredData();
        if (stored && stored.menuItems?.length > 0) {
          setOfflineData(stored);
          setLastSyncTime(stored.lastSync);
          console.log('📦 Loaded cached data from Preferences:', {
            menuItems: stored.menuItems.length,
            categories: stored.categories.length,
            addons: stored.addons.length
          });
        } else {
          console.log('📭 No cached data found in Preferences');
        }
      } catch (e) {
        console.error('❌ Error loading cached data:', e);
      }

      // Load pending orders count
      try {
        const orders = await getStoredOrders();
        setPendingOrdersCount(orders.filter(o => !o.synced).length);
        console.log('📋 Pending orders:', orders.filter(o => !o.synced).length);
      } catch (e) {
        console.error('❌ Error loading pending orders:', e);
      }

      // Check network status using Capacitor Network plugin
      let currentOnline = navigator.onLine;
      try {
        const status = await Network.getStatus();
        currentOnline = status.connected;
        console.log('📡 Capacitor Network status:', currentOnline ? 'online' : 'offline', status);
      } catch (e) {
        // Fallback to navigator.onLine
        console.log('⚠️ Capacitor Network not available, using navigator.onLine:', currentOnline);
      }
      
      setIsOnline(currentOnline);

      // Auto sync menu data if online and no cached data
      if (currentOnline) {
        console.log('🌐 Online - attempting to sync menu data...');
        // Delay sync slightly to allow component to mount
        setTimeout(async () => {
          try {
            await syncMenuDataInternal();
            await syncPendingOrders();
          } catch (e) {
            console.error('Error in auto-sync:', e);
          }
        }, 500);
      }
    };

    initializeOfflineData();

    // Listen to network changes using Capacitor
    let networkListenerPromise: Promise<any> | null = null;
    try {
      networkListenerPromise = Network.addListener('networkStatusChange', (status) => {
        console.log('📡 Network status changed:', status.connected ? 'online' : 'offline');
        setIsOnline(status.connected);
        
        if (status.connected) {
          // Auto sync when back online
          syncMenuDataInternal().then(() => syncPendingOrders());
        } else {
          toast.warning('ออฟไลน์ - ระบบจะใช้ข้อมูลที่บันทึกไว้', {
            duration: 3000,
          });
        }
      });
    } catch (e) {
      console.log('Capacitor Network listener not available');
    }

    // Also listen to browser events as fallback
    const handleOnline = () => {
      console.log('🟢 Browser: Network online');
      setIsOnline(true);
      syncMenuDataInternal().then(() => syncPendingOrders());
    };

    const handleOffline = () => {
      console.log('🔴 Browser: Network offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (networkListenerPromise) {
        networkListenerPromise.then(listener => listener?.remove?.());
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingOrders]);

  // Internal sync function that doesn't depend on isOnline state
  const syncMenuDataInternal = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      console.log('Cannot sync: navigator offline');
      return false;
    }

    setIsSyncing(true);
    console.log('🔄 Syncing menu data (internal)...');

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

      const storedOrders = await getStoredOrders();
      
      const newData: OfflineData = {
        menuItems: menuItemsRes.data || [],
        categories: categoriesRes.data || [],
        addons: addonsRes.data || [],
        addonGroups: addonGroupsRes.data || [],
        menuAddonGroups: menuAddonGroupsRes.data || [],
        categoryAddonGroups: categoryAddonGroupsRes.data || [],
        orders: storedOrders,
        lastSync: new Date().toISOString(),
        version: DATA_VERSION
      };

      // Save to storage
      await setStoredData(newData);
      setOfflineData(newData);
      setLastSyncTime(newData.lastSync);

      console.log('✅ Menu data synced (internal):', {
        categories: newData.categories.length,
        menuItems: newData.menuItems.length,
        addons: newData.addons.length
      });

      return true;
    } catch (error) {
      console.error('❌ Error syncing menu data (internal):', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync menu data from Supabase (public wrapper)
  const syncMenuData = useCallback(async (): Promise<boolean> => {
    return syncMenuDataInternal();
  }, []);

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
    const orders = await getStoredOrders();
    orders.push(offlineOrder);
    await setStoredOrders(orders);
    setPendingOrdersCount(orders.filter(o => !o.synced).length);

    toast.info('บันทึกออเดอร์ในโหมดออฟไลน์', {
      description: 'จะซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
    });

    console.log('📦 Order saved offline:', orderId);
    return { success: true, orderId };
  }, [isOnline]);

  // Clear synced orders (keep unsynced)
  const clearSyncedOrders = useCallback(async () => {
    const orders = await getStoredOrders();
    const unsyncedOrders = orders.filter(o => !o.synced);
    await setStoredOrders(unsyncedOrders);
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
