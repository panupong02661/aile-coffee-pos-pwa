
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsData {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  trend: 'up' | 'down' | 'stable';
  previousRevenue: number;
  previousOrders: number;
  previousCustomers: number;
  previousAvgOrderValue: number;
}

export interface SalesData {
  name: string;
  sales: number;
  orders: number;
  customers: number;
  date: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  sales: number;
}

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const today = new Date();
      const startDate = startOfDay(subDays(today, 30));
      const endDate = endOfDay(today);
      const previousStartDate = startOfDay(subDays(today, 60));
      const previousEndDate = endOfDay(subDays(today, 30));

      // Current period data
      const { data: currentOrders, error: currentError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (currentError) throw currentError;

      // Previous period data for comparison
      const { data: previousOrders, error: previousError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString());

      if (previousError) throw previousError;

      // Current period calculations
      const revenue = currentOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const orders = currentOrders?.length || 0;
      const uniqueCustomers = new Set(currentOrders?.map(order => order.member_id).filter(Boolean)).size;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;

      // Previous period calculations
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const previousOrdersCount = previousOrders?.length || 0;
      const previousUniqueCustomers = new Set(previousOrders?.map(order => order.member_id).filter(Boolean)).size;
      const previousAvgOrderValue = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (revenue > previousRevenue * 1.05) trend = 'up';
      else if (revenue < previousRevenue * 0.95) trend = 'down';

      const analyticsData: AnalyticsData = {
        revenue,
        orders,
        customers: uniqueCustomers,
        avgOrderValue,
        trend,
        previousRevenue,
        previousOrders: previousOrdersCount,
        previousCustomers: previousUniqueCustomers,
        previousAvgOrderValue
      };

      return analyticsData;
    },
    refetchInterval: 30000,
  });
};

export const useSalesData = () => {
  return useQuery({
    queryKey: ['sales-data'],
    queryFn: async () => {
      const salesData: SalesData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);

        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (error) throw error;

        const dailySales = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        const dailyOrders = orders?.length || 0;
        const dailyCustomers = new Set(orders?.map(order => order.member_id).filter(Boolean)).size;

        salesData.push({
          name: format(date, 'EEE'),
          sales: dailySales,
          orders: dailyOrders,
          customers: dailyCustomers,
          date: format(date, 'yyyy-MM-dd')
        });
      }

      return salesData;
    },
    refetchInterval: 30000,
  });
};

export const useCategoryData = () => {
  return useQuery({
    queryKey: ['category-data'],
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(created_at)
        `)
        .gte('orders.created_at', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      // Get categories separately to avoid relationship conflicts
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Get menu items separately
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*');

      if (menuError) throw menuError;

      const categoryStats: Record<string, { sales: number; count: number }> = {};
      
      orderItems?.forEach(item => {
        const menuItem = menuItems?.find(m => m.id === item.menu_item_id);
        const category = categories?.find(c => c.id === menuItem?.category_id);
        const categoryName = category?.name || 'อื่นๆ';
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { sales: 0, count: 0 };
        }
        
        categoryStats[categoryName].sales += Number(item.total_price);
        categoryStats[categoryName].count += item.quantity;
      });

      const totalSales = Object.values(categoryStats).reduce((sum, cat) => sum + cat.sales, 0);
      const colors = ['#8B4513', '#CD853F', '#DEB887', '#F4A460', '#D2691E', '#A0522D'];
      
      const categoryData: CategoryData[] = Object.entries(categoryStats)
        .map(([name, stats], index) => ({
          name,
          value: totalSales > 0 ? Math.round((stats.sales / totalSales) * 100) : 0,
          color: colors[index % colors.length],
          sales: stats.sales
        }))
        .sort((a, b) => b.sales - a.sales);

      return categoryData;
    },
    refetchInterval: 30000,
  });
};
