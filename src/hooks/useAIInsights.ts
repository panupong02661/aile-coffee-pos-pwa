
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, getHours } from 'date-fns';

export interface AIInsight {
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: number;
  trend?: string;
}

export const useAIInsights = () => {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const insights: AIInsight[] = [];

      // ดึงข้อมูลออเดอร์ 30 วันล่าสุด
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // ดึงข้อมูลเมนูและหมวดหมู่
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories(name)
        `);

      if (menuError) throw menuError;

      // ดึงข้อมูล order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(created_at)
        `)
        .gte('orders.created_at', subDays(new Date(), 30).toISOString());

      if (itemsError) throw itemsError;

      // ดึงข้อมูลสต็อก
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true);

      if (ingredientsError) throw ingredientsError;

      // วิเคราะห์ช่วงเวลาขาย
      const hourlyStats: Record<number, { orders: number; sales: number }> = {};
      recentOrders?.forEach(order => {
        const hour = getHours(new Date(order.created_at));
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { orders: 0, sales: 0 };
        }
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].sales += Number(order.total_amount);
      });

      // หาช่วงเวลาที่ขายน้อย
      const avgOrdersPerHour = Object.values(hourlyStats).reduce((sum, stat) => sum + stat.orders, 0) / 24;
      const lowPerformanceHours = Object.entries(hourlyStats)
        .filter(([_, stat]) => stat.orders < avgOrdersPerHour * 0.5)
        .map(([hour, _]) => parseInt(hour));

      if (lowPerformanceHours.length > 0) {
        const hourRange = `${Math.min(...lowPerformanceHours)}:00-${Math.max(...lowPerformanceHours)}:00`;
        const decrease = Math.round((1 - (Math.min(...Object.values(hourlyStats).map(s => s.orders)) / avgOrdersPerHour)) * 100);
        insights.push({
          type: 'opportunity',
          title: 'เพิ่มยอดขายช่วงเวลาเงียบ',
          description: `ช่วงเวลา ${hourRange} น. มียอดขายต่ำกว่าค่าเฉลี่ย ${decrease}% แนะนำให้มีโปรโมชั่นพิเศษ`,
          impact: 'high',
          metric: decrease,
          trend: 'down'
        });
      }

      // วิเคราะห์เมนูยอดนิยม
      const menuStats: Record<string, { quantity: number; sales: number; name: string }> = {};
      orderItems?.forEach(item => {
        const menuItem = menuItems?.find(m => m.id === item.menu_item_id);
        if (menuItem) {
          if (!menuStats[item.menu_item_id!]) {
            menuStats[item.menu_item_id!] = { quantity: 0, sales: 0, name: menuItem.name };
          }
          menuStats[item.menu_item_id!].quantity += item.quantity;
          menuStats[item.menu_item_id!].sales += Number(item.total_price);
        }
      });

      const topMenu = Object.values(menuStats).sort((a, b) => b.quantity - a.quantity)[0];
      const previousWeekOrders = orderItems?.filter(item => {
        const orderDate = new Date(item.orders?.created_at || '');
        return orderDate >= subDays(new Date(), 14) && orderDate < subDays(new Date(), 7);
      });

      const previousWeekTopMenu = previousWeekOrders?.filter(item => item.menu_item_id === Object.keys(menuStats)[0]).length || 0;
      const currentWeekTopMenu = orderItems?.filter(item => {
        const orderDate = new Date(item.orders?.created_at || '');
        return orderDate >= subDays(new Date(), 7) && item.menu_item_id === Object.keys(menuStats)[0];
      }).length || 0;

      if (topMenu && currentWeekTopMenu > previousWeekTopMenu * 1.5) {
        const growth = Math.round(((currentWeekTopMenu - previousWeekTopMenu) / previousWeekTopMenu) * 100);
        insights.push({
          type: 'success',
          title: 'เมนูยอดนิยมเติบโต',
          description: `${topMenu.name} ได้รับความนิยมเพิ่มขึ้น ${growth}% ในสัปดาห์นี้`,
          impact: 'medium',
          metric: growth,
          trend: 'up'
        });
      }

      // วิเคราะห์สต็อกวัตถุดิบ
      const lowStockIngredients = ingredients?.filter(ingredient => 
        ingredient.quantity <= ingredient.minimum_stock
      ) || [];

      if (lowStockIngredients.length > 0) {
        const criticalCount = lowStockIngredients.filter(ing => ing.quantity <= ing.minimum_stock * 0.5).length;
        insights.push({
          type: 'warning',
          title: 'วัตถุดิบใกล้หมด',
          description: `มีวัตถุดิบ ${lowStockIngredients.length} รายการที่ใกล้หมด ${criticalCount > 0 ? `(${criticalCount} รายการวิกฤต)` : ''} ควรสั่งซื้อเพิ่ม`,
          impact: criticalCount > 0 ? 'high' : 'medium',
          metric: lowStockIngredients.length
        });
      }

      // วิเคราะห์การเติบโตของรายได้
      const recentWeekSales = recentOrders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= subDays(new Date(), 7);
      }).reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const previousWeekSales = recentOrders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= subDays(new Date(), 14) && orderDate < subDays(new Date(), 7);
      }).reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      if (recentWeekSales > previousWeekSales * 1.1) {
        const growth = Math.round(((recentWeekSales - previousWeekSales) / previousWeekSales) * 100);
        insights.push({
          type: 'success',
          title: 'รายได้เติบโตดี',
          description: `รายได้สัปดาห์นี้เติบโต ${growth}% เมื่อเทียบกับสัปดาห์ที่แล้ว ควรรักษาแนวทางนี้ต่อไป`,
          impact: 'high',
          metric: growth,
          trend: 'up'
        });
      }

      // วิเคราะห์ลูกค้าใหม่
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      if (!membersError && members && members.length > 0) {
        insights.push({
          type: 'success',
          title: 'ลูกค้าใหม่เพิ่มขึ้น',
          description: `สัปดาห์นี้มีสมาชิกใหม่ ${members.length} คน ควรมีโปรแกรมต้อนรับลูกค้าใหม่`,
          impact: 'medium',
          metric: members.length,
          trend: 'up'
        });
      }

      return insights;
    },
    refetchInterval: 300000, // รีเฟรชทุก 5 นาที
  });
};
