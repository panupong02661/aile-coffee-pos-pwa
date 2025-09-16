
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HourlySales {
  hour: string;
  sales: number;
  orders: number;
  discount: number;
}

interface DailySales {
  date: string;
  sales: number;
  orders: number;
  discount: number;
  net_sales: number;
}

interface MonthlySales {
  month: string;
  sales: number;
  orders: number;
  discount: number;
  net_sales: number;
}

interface GenderStats {
  name: string;
  value: number;
  percentage: number;
}

interface TierStats {
  name: string;
  value: number;
}

interface PaymentMethodStats {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}

interface PeakHour {
  hour: number;
  orders: number;
  revenue: number;
}

interface PromotionStats {
  name: string;
  usage_count: number;
  total_discount: number;
  revenue_impact: number;
}

interface MemberTierStats {
  tier: string;
  count: number;
  percentage: number;
  total_spent: number;
  avg_spent: number;
}

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayDiscount: number;
  todayNetSales: number;
  monthSales: number;
  monthOrders: number;
  monthDiscount: number;
  monthNetSales: number;
  totalMembers: number;
  newMembersToday: number;
  newMembersMonth: number;
  // Growth & Performance
  salesGrowthRate: number;
  ordersGrowthRate: number;
  membersGrowthRate: number;
  // Business Performance
  averageOrderValue: number;
  ordersPerCustomer: number;
  customerReturnRate: number;
  // Payment Methods
  paymentMethods: PaymentMethodStats[];
  // Top Products
  topProducts: TopProduct[];
  // Peak Hours
  peakHours: PeakHour[];
  // Promotions
  promotionStats: PromotionStats[];
  // Member Analysis
  memberTierStats: MemberTierStats[];
  pointsUsageToday: number;
  memberEngagementRate: number;
}

export const useDashboardStats = () => {
  const [hourlyData, setHourlyData] = useState<HourlySales[]>([]);
  const [dailyData, setDailyData] = useState<DailySales[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySales[]>([]);
  const [genderStats, setGenderStats] = useState<GenderStats[]>([]);
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayDiscount: 0,
    todayNetSales: 0,
    monthSales: 0,
    monthOrders: 0,
    monthDiscount: 0,
    monthNetSales: 0,
    totalMembers: 0,
    newMembersToday: 0,
    newMembersMonth: 0,
    salesGrowthRate: 0,
    ordersGrowthRate: 0,
    membersGrowthRate: 0,
    averageOrderValue: 0,
    ordersPerCustomer: 0,
    customerReturnRate: 0,
    paymentMethods: [],
    topProducts: [],
    peakHours: [],
    promotionStats: [],
    memberTierStats: [],
    pointsUsageToday: 0,
    memberEngagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHourlyData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount, bill_discount')
        .gte('created_at', startOfDay.toISOString())
        .order('created_at');

      if (error) throw error;

      const hourlyMap = new Map();
      
      // Initialize hours
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        hourlyMap.set(hour, { hour, sales: 0, orders: 0, discount: 0 });
      }

      data?.forEach(order => {
        const hour = new Date(order.created_at).getHours().toString().padStart(2, '0') + ':00';
        const existing = hourlyMap.get(hour);
        if (existing) {
          existing.sales += Number(order.total_amount) || 0;
          existing.orders += 1;
          existing.discount += Number(order.bill_discount) || 0;
        }
      });

      setHourlyData(Array.from(hourlyMap.values()));
    } catch (error) {
      console.error('Error fetching hourly data:', error);
    }
  };

  const fetchDailyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount, bill_discount')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (error) throw error;

      const dailyMap = new Map();

      data?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = dailyMap.get(date) || { date, sales: 0, orders: 0, discount: 0, net_sales: 0 };
        
        const totalAmount = Number(order.total_amount) || 0;
        const discount = Number(order.bill_discount) || 0;
        
        existing.sales += totalAmount;
        existing.orders += 1;
        existing.discount += discount;
        existing.net_sales = existing.sales - existing.discount;
        
        dailyMap.set(date, existing);
      });

      setDailyData(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error fetching daily data:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 12);

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_amount, bill_discount')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      if (error) throw error;

      const monthlyMap = new Map();

      data?.forEach(order => {
        const date = new Date(order.created_at);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const existing = monthlyMap.get(month) || { month, sales: 0, orders: 0, discount: 0, net_sales: 0 };
        
        const totalAmount = Number(order.total_amount) || 0;
        const discount = Number(order.bill_discount) || 0;
        
        existing.sales += totalAmount;
        existing.orders += 1;
        existing.discount += discount;
        existing.net_sales = existing.sales - existing.discount;
        
        monthlyMap.set(month, existing);
      });

      setMonthlyData(Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchMemberStats = async () => {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('gender, tier, created_at');

      if (error) throw error;

      // Gender statistics
      const genderCount = { male: 0, female: 0, other: 0 };
      const tierCount = { silver: 0, gold: 0, platinum: 0 };

      members?.forEach(member => {
        if (member.gender === 'male' || member.gender === 'ชาย') genderCount.male++;
        else if (member.gender === 'female' || member.gender === 'หญิง') genderCount.female++;
        else genderCount.other++;

        if (member.tier === 'silver') tierCount.silver++;
        else if (member.tier === 'gold') tierCount.gold++;
        else if (member.tier === 'platinum') tierCount.platinum++;
      });

      const total = members?.length || 0;
      const genderData = [
        { name: 'ชาย', value: genderCount.male, percentage: total > 0 ? Math.round((genderCount.male / total) * 100) : 0 },
        { name: 'หญิง', value: genderCount.female, percentage: total > 0 ? Math.round((genderCount.female / total) * 100) : 0 },
        { name: 'อื่นๆ', value: genderCount.other, percentage: total > 0 ? Math.round((genderCount.other / total) * 100) : 0 },
      ];

      const tierData = [
        { name: 'Silver', value: tierCount.silver },
        { name: 'Gold', value: tierCount.gold },
        { name: 'Platinum', value: tierCount.platinum },
      ];

      setGenderStats(genderData);
      setTierStats(tierData);
    } catch (error) {
      console.error('Error fetching member stats:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).getFullYear() + '-' + String(new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth() + 1).padStart(2, '0');
      
      // Today's stats
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount, bill_discount, payment_method, member_id, created_at')
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59');

      // Yesterday's stats for comparison
      const { data: yesterdayOrders } = await supabase
        .from('orders')
        .select('total_amount, bill_discount')
        .gte('created_at', yesterday + 'T00:00:00')
        .lt('created_at', yesterday + 'T23:59:59');

      // This month's stats
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total_amount, bill_discount, member_id')
        .gte('created_at', thisMonth + '-01T00:00:00');

      // Last month's stats for comparison
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('total_amount, bill_discount')
        .gte('created_at', lastMonth + '-01T00:00:00')
        .lt('created_at', thisMonth + '-01T00:00:00');

      // Member stats
      const { data: allMembers } = await supabase
        .from('members')
        .select('created_at, tier, total_spent, points');

      const { data: todayMembers } = await supabase
        .from('members')
        .select('id')
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59');

      const { data: monthMembers } = await supabase
        .from('members')
        .select('id')
        .gte('created_at', thisMonth + '-01T00:00:00');

      const { data: lastMonthMemberCount } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .gte('created_at', lastMonth + '-01T00:00:00')
        .lt('created_at', thisMonth + '-01T00:00:00');

      // Top products from order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          menu_item_name,
          quantity,
          unit_price,
          total_price,
          orders!inner(created_at)
        `)
        .gte('orders.created_at', thisMonth + '-01T00:00:00');

      // Payment methods breakdown
      const paymentMethods: PaymentMethodStats[] = [];
      const paymentGroups = todayOrders?.reduce((acc: any, order) => {
        const method = order.payment_method || 'cash';
        if (!acc[method]) {
          acc[method] = { amount: 0, count: 0 };
        }
        acc[method].amount += Number(order.total_amount);
        acc[method].count += 1;
        return acc;
      }, {}) || {};

      const totalAmount = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      Object.entries(paymentGroups).forEach(([method, data]: [string, any]) => {
        paymentMethods.push({
          method,
          amount: data.amount,
          count: data.count,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        });
      });

      // Top products calculation
      const productSales = orderItems?.reduce((acc: any, item) => {
        const name = item.menu_item_name;
        if (!acc[name]) {
          acc[name] = { quantity: 0, revenue: 0 };
        }
        acc[name].quantity += item.quantity;
        acc[name].revenue += Number(item.total_price);
        return acc;
      }, {}) || {};

      const topProducts: TopProduct[] = Object.entries(productSales)
        .map(([name, data]: [string, any]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
          profit: data.revenue * 0.6 // Assume 60% profit margin
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Peak hours analysis
      const hourlyOrders = todayOrders?.reduce((acc: any, order) => {
        const hour = new Date(order.created_at).getHours();
        if (!acc[hour]) {
          acc[hour] = { orders: 0, revenue: 0 };
        }
        acc[hour].orders += 1;
        acc[hour].revenue += Number(order.total_amount);
        return acc;
      }, {}) || {};

      const peakHours: PeakHour[] = Object.entries(hourlyOrders)
        .map(([hour, data]: [string, any]) => ({
          hour: parseInt(hour),
          orders: data.orders,
          revenue: data.revenue
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3);

      // Member tier analysis
      const tierGroups = allMembers?.reduce((acc: any, member) => {
        const tier = member.tier || 'silver';
        if (!acc[tier]) {
          acc[tier] = { count: 0, total_spent: 0 };
        }
        acc[tier].count += 1;
        acc[tier].total_spent += Number(member.total_spent || 0);
        return acc;
      }, {}) || {};

      const memberTierStats: MemberTierStats[] = Object.entries(tierGroups)
        .map(([tier, data]: [string, any]) => ({
          tier,
          count: data.count,
          percentage: allMembers?.length ? (data.count / allMembers.length) * 100 : 0,
          total_spent: data.total_spent,
          avg_spent: data.count > 0 ? data.total_spent / data.count : 0
        }));

      // Calculate growth rates
      const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const yesterdaySales = yesterdayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const monthSales = monthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const lastMonthSales = lastMonthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const salesGrowthRate = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
      const ordersGrowthRate = yesterdayOrders?.length ? (((todayOrders?.length || 0) - yesterdayOrders.length) / yesterdayOrders.length) * 100 : 0;
      const membersGrowthRate = lastMonthMemberCount?.length ? ((monthMembers?.length || 0) / lastMonthMemberCount.length) * 100 : 0;

      // Business performance metrics
      const uniqueCustomers = new Set(monthOrders?.filter(o => o.member_id).map(o => o.member_id)).size;
      const averageOrderValue = monthOrders?.length ? monthSales / monthOrders.length : 0;
      const ordersPerCustomer = uniqueCustomers > 0 ? (monthOrders?.length || 0) / uniqueCustomers : 0;
      
      // Points usage today
      const { data: pointTransactions } = await supabase
        .from('point_transactions')
        .select('points_change')
        .eq('transaction_type', 'redemption')
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59');

      const pointsUsageToday = pointTransactions?.reduce((sum, tx) => sum + Math.abs(tx.points_change), 0) || 0;

      const todayDiscount = todayOrders?.reduce((sum, order) => sum + Number(order.bill_discount || 0), 0) || 0;
      const monthDiscount = monthOrders?.reduce((sum, order) => sum + Number(order.bill_discount || 0), 0) || 0;

      setDashboardStats({
        todaySales,
        todayOrders: todayOrders?.length || 0,
        todayDiscount,
        todayNetSales: todaySales - todayDiscount,
        monthSales,
        monthOrders: monthOrders?.length || 0,
        monthDiscount,
        monthNetSales: monthSales - monthDiscount,
        totalMembers: allMembers?.length || 0,
        newMembersToday: todayMembers?.length || 0,
        newMembersMonth: monthMembers?.length || 0,
        salesGrowthRate,
        ordersGrowthRate,
        membersGrowthRate,
        averageOrderValue,
        ordersPerCustomer,
        customerReturnRate: uniqueCustomers > 0 ? (uniqueCustomers / (allMembers?.length || 1)) * 100 : 0,
        paymentMethods,
        topProducts,
        peakHours,
        promotionStats: [], // TODO: Implement promotion stats
        memberTierStats,
        pointsUsageToday,
        memberEngagementRate: allMembers?.length ? (uniqueCustomers / allMembers.length) * 100 : 0,
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสถิติได้",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchHourlyData(),
      fetchDailyData(),
      fetchMonthlyData(),
      fetchMemberStats(),
      fetchDashboardStats(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    hourlyData,
    dailyData,
    monthlyData,
    genderStats,
    tierStats,
    dashboardStats,
    loading,
    refreshData,
  };
};
