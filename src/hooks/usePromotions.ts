
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
      // ใช้ function ที่สร้างไว้ในฐานข้อมูลเพื่อดึงข้อมูลโปรโมชั่นพร้อมรายการเมนูและหมวดหมู่
      const { data, error } = await supabase
        .rpc('get_active_promotions');
      
      if (error) throw error;
      
      // แปลงข้อมูลให้ตรงกับ interface
      return (data as any[]).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        type: item.discount_type === 'percent' ? 'percentage' as const : 'amount' as const,
        discount_value: Number(item.discount_value),
        target_group: 'all' as const, // ใช้ all เป็นค่าเริ่มต้น
        start_date: new Date().toISOString(), // ใช้ค่าปัจจุบันเป็นค่าเริ่มต้น
        end_date: new Date(Date.now() + 86400000).toISOString(), // ใช้วันถัดไปเป็นค่าเริ่มต้น
        is_active: true,
        menu_item_ids: item.menu_item_ids || [],
        category_ids: item.category_ids || []
      })) as Promotion[];
    },
    refetchInterval: 30000, // รีเฟรชทุก 30 วินาที
  });
};
