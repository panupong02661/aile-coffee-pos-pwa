
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'amount';
  discount_value: number;
  target_group: 'all' | 'silver' | 'gold' | 'platinum';
  start_date: string;
  end_date: string;
  is_active: boolean;
  menu_item_ids?: string[];
  category_ids?: string[];
}

export const usePromotions = () => {
  return useQuery({
    queryKey: ['active-promotions'],
    queryFn: async () => {
      console.log('Fetching active promotions...');
      
      // ดึงข้อมูลโปรโมชั่นที่เปิดใช้งาน
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());
      
      if (promotionsError) {
        console.error('Error fetching promotions:', promotionsError);
        throw promotionsError;
      }

      if (!promotionsData) {
        console.log('No promotions found');
        return [];
      }

      console.log('Found promotions:', promotionsData);

      // ดึงข้อมูลรายการเมนูที่เชื่อมโยงกับโปรโมชั่น
      const promotionIds = promotionsData.map(p => p.id);
      
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('promotion_menu_items')
        .select('promotion_id, menu_item_id')
        .in('promotion_id', promotionIds);

      if (menuItemsError) {
        console.error('Error fetching promotion menu items:', menuItemsError);
      }

      console.log('Promotion menu items:', menuItemsData);

      // ดึงข้อมูลหมวดหมู่ที่เชื่อมโยงกับโปรโมชั่น
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('promotion_categories')
        .select('promotion_id, category_id')
        .in('promotion_id', promotionIds);

      if (categoriesError) {
        console.error('Error fetching promotion categories:', categoriesError);
      }

      console.log('Promotion categories:', categoriesData);

      // รวมข้อมูลโปรโมชั่นกับรายการเมนูและหมวดหมู่
      const promotions: Promotion[] = promotionsData.map(promotion => {
        const menuItems = menuItemsData?.filter(item => item.promotion_id === promotion.id) || [];
        const categories = categoriesData?.filter(cat => cat.promotion_id === promotion.id) || [];

        const result = {
          id: promotion.id,
          name: promotion.name,
          description: promotion.description || '',
          type: promotion.type === 'percentage' ? 'percentage' as const : 'amount' as const,
          discount_value: Number(promotion.discount_value),
          target_group: 'all' as const,
          start_date: promotion.start_date,
          end_date: promotion.end_date,
          is_active: promotion.is_active,
          menu_item_ids: menuItems.map(item => item.menu_item_id),
          category_ids: categories.map(cat => cat.category_id)
        };

        console.log(`Promotion ${promotion.name}:`, {
          menu_item_ids: result.menu_item_ids,
          category_ids: result.category_ids
        });

        return result;
      });

      console.log('Final promotions:', promotions);
      return promotions;
    },
    refetchInterval: 30000,
  });
};
