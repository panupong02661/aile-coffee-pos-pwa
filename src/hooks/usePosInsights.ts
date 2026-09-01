import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

export interface BestSeller {
  menu_item_id: string;
  qty: number;
}

/** เมนูขายดี 7 วันล่าสุด (นับจาก order_items) */
export const useBestSellers = (limit = 8) => {
  const { shopId, loading: shopLoading } = useCurrentShop();

  return useQuery({
    queryKey: ['pos-best-sellers', shopId, limit],
    enabled: !shopLoading,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<BestSeller[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      let q = supabase
        .from('order_items')
        .select('menu_item_id, quantity, created_at')
        .gte('created_at', since.toISOString())
        .limit(5000);

      if (shopId) q = q.eq('shop_id', shopId);

      const { data, error } = await q;
      if (error) throw error;

      const tally = new Map<string, number>();
      (data || []).forEach((row: any) => {
        if (!row.menu_item_id) return;
        tally.set(row.menu_item_id, (tally.get(row.menu_item_id) || 0) + Number(row.quantity || 0));
      });

      return Array.from(tally.entries())
        .map(([menu_item_id, qty]) => ({ menu_item_id, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, limit);
    },
  });
};

export interface LowStockInfo {
  /** menu_item_id -> ชื่อวัตถุดิบที่ใกล้หมด */
  menuMap: Record<string, string[]>;
  ingredients: { id: string; name: string; quantity: number; unit: string; minimum_stock: number }[];
}

/** เมนูที่มีวัตถุดิบต่ำกว่าขั้นต่ำ */
export const useLowStockMenu = () => {
  const { shopId, loading: shopLoading } = useCurrentShop();

  return useQuery({
    queryKey: ['pos-low-stock', shopId],
    enabled: !shopLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LowStockInfo> => {
      let iq = supabase
        .from('ingredients')
        .select('id, name, quantity, unit, minimum_stock')
        .eq('is_active', true);
      if (shopId) iq = iq.eq('shop_id', shopId);

      const { data: ings, error } = await iq;
      if (error) throw error;

      const low = (ings || []).filter(
        (i: any) => Number(i.quantity) <= Number(i.minimum_stock || 0)
      );
      if (low.length === 0) return { menuMap: {}, ingredients: [] };

      const lowIds = low.map((i: any) => i.id);
      let mq = supabase
        .from('menu_ingredients')
        .select('menu_item_id, ingredient_id')
        .in('ingredient_id', lowIds);
      if (shopId) mq = mq.eq('shop_id', shopId);

      const { data: links } = await mq;
      const nameById = new Map(low.map((i: any) => [i.id, i.name as string]));

      const menuMap: Record<string, string[]> = {};
      (links || []).forEach((l: any) => {
        const name = nameById.get(l.ingredient_id);
        if (!name) return;
        menuMap[l.menu_item_id] = [...(menuMap[l.menu_item_id] || []), name];
      });

      return {
        menuMap,
        ingredients: low.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: Number(i.quantity),
          unit: i.unit,
          minimum_stock: Number(i.minimum_stock || 0),
        })),
      };
    },
  });
};
