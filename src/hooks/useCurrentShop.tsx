
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ShopInfo {
  id: string;
  shop_name: string;
  branch_name: string | null;
  branch_code: string | null;
  database_mode: string | null;
}

interface ShopContextType {
  currentShop: ShopInfo | null;
  shopId: string | null;
  loading: boolean;
  allShops: ShopInfo[];
  switchShop: (shopId: string) => void;
}

const ShopContext = createContext<ShopContextType | null>(null);

export const useCurrentShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useCurrentShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentShop, setCurrentShop] = useState<ShopInfo | null>(null);
  const [allShops, setAllShops] = useState<ShopInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentShop(null);
      setAllShops([]);
      localStorage.removeItem('active_shop_id');
      setLoading(false);
      return;
    }

    setLoading(true);
    setCurrentShop(null);
    setAllShops([]);

    // Admin sees all data (no shop filter)
    if (user.role === 'admin') {
      fetchAllShops();
      return;
    }

    fetchUserShops();
  }, [user?.id, user?.role]);

  const fetchAllShops = async () => {
    try {
      // Admin: also check if they have a shop assignment first
      const { data: assignments } = await supabase
        .from('user_shop_assignments')
        .select(`
          shop_id,
          is_primary,
          shops (id, shop_name, branch_name, branch_code, database_mode)
        `)
        .eq('user_id', user!.id);

      if (assignments && assignments.length > 0) {
        const shops: ShopInfo[] = assignments
          .filter((d: any) => d.shops)
          .map((d: any) => d.shops as ShopInfo);
        
        // Also fetch all shops for admin switching
        const { data: allShopsData } = await supabase
          .from('shops')
          .select('id, shop_name, branch_name, branch_code, database_mode')
          .eq('is_active', true);
        
        setAllShops(allShopsData || shops);
        
        const primary = assignments.find((d: any) => d.is_primary);
        if (primary && primary.shops) {
          setCurrentShop(primary.shops as ShopInfo);
        } else {
          setCurrentShop(shops[0]);
        }
      } else {
        // Admin with no assignment - fetch all shops and use first
        const { data, error } = await supabase
          .from('shops')
          .select('id, shop_name, branch_name, branch_code, database_mode')
          .eq('is_active', true);

        if (error) throw error;
        setAllShops(data || []);
        if (data && data.length > 0) {
          setCurrentShop(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShops = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_shop_assignments')
        .select(`
          shop_id,
          is_primary,
          shops (
            id,
            shop_name,
            branch_name,
            branch_code,
            database_mode
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const shops: ShopInfo[] = (data || [])
        .filter((d: any) => d.shops)
        .map((d: any) => d.shops as ShopInfo);

      // Fallback: user has no explicit assignment -> use their own shop_id
      if (shops.length === 0) {
        const { data: userRow } = await supabase
          .from('users')
          .select('shop_id')
          .eq('id', user.id)
          .maybeSingle();

        if (userRow?.shop_id) {
          const { data: shopRow } = await supabase
            .from('shops')
            .select('id, shop_name, branch_name, branch_code, database_mode')
            .eq('id', userRow.shop_id)
            .maybeSingle();

          if (shopRow) {
            setAllShops([shopRow as ShopInfo]);
            setCurrentShop(shopRow as ShopInfo);
            return;
          }
        }
      }

      setAllShops(shops);


      // Set primary shop as current
      const primaryAssignment = (data || []).find((d: any) => d.is_primary);
      if (primaryAssignment && primaryAssignment.shops) {
        setCurrentShop(primaryAssignment.shops as ShopInfo);
      } else if (shops.length > 0) {
        setCurrentShop(shops[0]);
      }
    } catch (error) {
      console.error('Error fetching user shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchShop = (shopId: string) => {
    const shop = allShops.find(s => s.id === shopId);
    if (shop) {
      setCurrentShop(shop);
      localStorage.setItem('active_shop_id', shop.id);
    }
  };

  useEffect(() => {
    if (!currentShop?.id) {
      localStorage.removeItem('active_shop_id');
      return;
    }

    localStorage.setItem('active_shop_id', currentShop.id);
  }, [currentShop?.id]);

  return (
    <ShopContext.Provider value={{
      currentShop,
      shopId: currentShop?.id || null,
      loading,
      allShops,
      switchShop,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
