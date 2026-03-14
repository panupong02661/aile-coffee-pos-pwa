import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentShop } from '@/hooks/useCurrentShop';

// Define interfaces for the data structures
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
  salesGrowthRate: number;
  weekSalesGrowthRate: number;
  monthSalesGrowthRate: number;
  ordersGrowthRate: number;
  membersGrowthRate: number;
  averageOrderValue: number;
  ordersPerCustomer: number;
  customerReturnRate: number;
  paymentMethods: PaymentMethodStats[];
  topProducts: TopProduct[];
  peakHours: PeakHour[];
  promotionStats: PromotionStats[];
  memberTierStats: MemberTierStats[];
  pointsUsageToday: number;
  pointsUsageMonth: number;
  memberEngagementRate: number;
}

export const useDashboardStats = () => {
  const [hourlyData, setHourlyData] = useState<HourlySales[]>([]);
  const [dailyData, setDailyData] = useState<DailySales[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySales[]>([]);
  const [genderStats, setGenderStats] = useState<GenderStats[]>([]);
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todaySales: 0, todayOrders: 0, todayDiscount: 0, todayNetSales: 0,
    monthSales: 0, monthOrders: 0, monthDiscount: 0, monthNetSales: 0,
    totalMembers: 0, newMembersToday: 0, newMembersMonth: 0,
    salesGrowthRate: 0, weekSalesGrowthRate: 0, monthSalesGrowthRate: 0,
    ordersGrowthRate: 0, membersGrowthRate: 0,
    averageOrderValue: 0, ordersPerCustomer: 0, customerReturnRate: 0,
    paymentMethods: [], topProducts: [], peakHours: [],
    promotionStats: [], memberTierStats: [],
    pointsUsageToday: 0, pointsUsageMonth: 0, memberEngagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { shopId, loading: shopLoading } = useCurrentShop();

  // Helper to add shop_id filter to any query
  const withShopFilter = (query: any) => {
    if (shopId) {
      return query.eq('shop_id', shopId);
    }
    return query;
  };

  const fetchHourlyData = async () => {
    try {
      const nowBangkok = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
      const todayBangkok = new Date(nowBangkok);
      todayBangkok.setHours(0, 0, 0, 0);
      const startOfDayUTC = new Date(todayBangkok.getTime() - (7 * 60 * 60 * 1000)).toISOString();
      
      const { data, error } = await withShopFilter(
        supabase.from('orders')
          .select('created_at, total_amount, bill_discount')
          .gte('created_at', startOfDayUTC)
          .order('created_at')
      );

      if (error) throw error;

      const hourlyMap = new Map();
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        hourlyMap.set(hour, { hour, sales: 0, orders: 0, discount: 0 });
      }

      data?.forEach(order => {
        const bangkokTime = new Date(new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const hour = bangkokTime.getHours().toString().padStart(2, '0') + ':00';
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

      const { data, error } = await withShopFilter(
        supabase.from('orders')
          .select('created_at, total_amount, bill_discount')
          .gte('created_at', startDate.toISOString())
          .order('created_at')
      );

      if (error) throw error;

      const dailyMap = new Map();
      data?.forEach(order => {
        const bangkokTime = new Date(new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const date = bangkokTime.toISOString().split('T')[0];
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

      const { data, error } = await withShopFilter(
        supabase.from('orders')
          .select('created_at, total_amount, bill_discount')
          .gte('created_at', startDate.toISOString())
          .order('created_at')
      );

      if (error) throw error;

      const monthlyMap = new Map();
      data?.forEach(order => {
        const bangkokTime = new Date(new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const month = `${bangkokTime.getFullYear()}-${(bangkokTime.getMonth() + 1).toString().padStart(2, '0')}`;
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
      const { data: members, error } = await withShopFilter(
        supabase.from('members').select('gender, tier, created_at')
      );

      if (error) throw error;

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
      setGenderStats([
        { name: 'ชาย', value: genderCount.male, percentage: total > 0 ? Math.round((genderCount.male / total) * 100) : 0 },
        { name: 'หญิง', value: genderCount.female, percentage: total > 0 ? Math.round((genderCount.female / total) * 100) : 0 },
        { name: 'อื่นๆ', value: genderCount.other, percentage: total > 0 ? Math.round((genderCount.other / total) * 100) : 0 },
      ]);
      setTierStats([
        { name: 'Silver', value: tierCount.silver },
        { name: 'Gold', value: tierCount.gold },
        { name: 'Platinum', value: tierCount.platinum },
      ]);
    } catch (error) {
      console.error('Error fetching member stats:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const nowBangkok = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
      const today = nowBangkok.toISOString().split('T')[0];
      const yesterdayBangkok = new Date(nowBangkok);
      yesterdayBangkok.setDate(yesterdayBangkok.getDate() - 1);
      const yesterday = yesterdayBangkok.toISOString().split('T')[0];
      const thisMonth = nowBangkok.getFullYear() + '-' + String(nowBangkok.getMonth() + 1).padStart(2, '0');
      const lastMonthDate = new Date(nowBangkok);
      lastMonthDate.setMonth(nowBangkok.getMonth() - 1);
      const lastMonth = lastMonthDate.getFullYear() + '-' + String(lastMonthDate.getMonth() + 1).padStart(2, '0');

      const this7Start = new Date(nowBangkok);
      this7Start.setDate(nowBangkok.getDate() - 6);
      this7Start.setHours(0,0,0,0);
      const prev7Start = new Date(nowBangkok);
      prev7Start.setDate(nowBangkok.getDate() - 13);
      prev7Start.setHours(0,0,0,0);
      const prev7End = new Date(nowBangkok);
      prev7End.setDate(nowBangkok.getDate() - 7);
      prev7End.setHours(23,59,59,999);
      
      const todayStartUTC = new Date(today + 'T00:00:00+07:00').toISOString();
      const todayEndUTC = new Date(today + 'T23:59:59+07:00').toISOString();
      
      const { data: todayOrders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount, bill_discount, payment_method, member_id, created_at')
          .gte('created_at', todayStartUTC)
          .lte('created_at', todayEndUTC)
      );

      const yesterdayStartUTC = new Date(yesterday + 'T00:00:00+07:00').toISOString();
      const yesterdayEndUTC = new Date(yesterday + 'T23:59:59+07:00').toISOString();
      
      const { data: yesterdayOrders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount, bill_discount')
          .gte('created_at', yesterdayStartUTC)
          .lte('created_at', yesterdayEndUTC)
      );

      const monthStartUTC = new Date(thisMonth + '-01T00:00:00+07:00').toISOString();
      
      const { data: monthOrders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount, bill_discount, member_id')
          .gte('created_at', monthStartUTC)
      );

      const lastMonthStartUTC = new Date(lastMonth + '-01T00:00:00+07:00').toISOString();
      const thisMonthStartUTC = new Date(thisMonth + '-01T00:00:00+07:00').toISOString();
      
      const { data: lastMonthOrders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount, bill_discount')
          .gte('created_at', lastMonthStartUTC)
          .lt('created_at', thisMonthStartUTC)
      );

      const { data: this7Orders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount')
          .gte('created_at', this7Start.toISOString())
          .lte('created_at', nowBangkok.toISOString())
      );

      const { data: prev7Orders } = await withShopFilter(
        supabase.from('orders')
          .select('total_amount')
          .gte('created_at', prev7Start.toISOString())
          .lte('created_at', prev7End.toISOString())
      );

      // Member stats - filtered by shop_id
      const { data: allMembers } = await withShopFilter(
        supabase.from('members').select('created_at, tier, total_spent, points')
      );

      const { data: todayMembers } = await withShopFilter(
        supabase.from('members')
          .select('id')
          .gte('created_at', todayStartUTC)
          .lte('created_at', todayEndUTC)
      );

      const { data: monthMembers } = await withShopFilter(
        supabase.from('members')
          .select('id')
          .gte('created_at', monthStartUTC)
      );

      // Top products from order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          menu_item_name,
          quantity,
          unit_price,
          total_price,
          orders!inner(created_at, shop_id)
        `)
        .gte('orders.created_at', monthStartUTC)
        .eq('orders.shop_id', shopId!);

      // Promotions usage
      const { data: promoClaims } = await supabase
        .from('customer_promotion_claims')
        .select('promotion_id, claimed_at, is_used, used_at')
        .gte('claimed_at', monthStartUTC);

      const { data: promotions } = await supabase
        .from('limited_promotions')
        .select('id, title, discount_value, discount_type');

      // Payment methods breakdown (today)
      const paymentMethods: PaymentMethodStats[] = [];
      const paymentGroups = todayOrders?.reduce((acc: any, order) => {
        const method = order.payment_method || 'cash';
        if (!acc[method]) acc[method] = { amount: 0, count: 0 };
        acc[method].amount += Number(order.total_amount);
        acc[method].count += 1;
        return acc;
      }, {}) || {};

      const totalAmount = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      Object.entries(paymentGroups).forEach(([method, data]: [string, any]) => {
        paymentMethods.push({
          method, amount: data.amount, count: data.count,
          percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
        });
      });

      // Top products calculation
      const productSales = orderItems?.reduce((acc: any, item) => {
        const name = item.menu_item_name;
        if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
        acc[name].quantity += item.quantity;
        acc[name].revenue += Number(item.total_price);
        return acc;
      }, {}) || {};

      const topProducts: TopProduct[] = Object.entries(productSales)
        .map(([name, data]: [string, any]) => ({
          name, quantity: data.quantity, revenue: data.revenue, profit: data.revenue * 0.6
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Peak hours
      const hourlyOrders = todayOrders?.reduce((acc: any, order) => {
        const bangkokTime = new Date(new Date(order.created_at).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const hour = bangkokTime.getHours();
        if (!acc[hour]) acc[hour] = { orders: 0, revenue: 0 };
        acc[hour].orders += 1;
        acc[hour].revenue += Number(order.total_amount);
        return acc;
      }, {}) || {};

      const peakHours: PeakHour[] = Object.entries(hourlyOrders)
        .map(([hour, data]: [string, any]) => ({ hour: parseInt(hour), orders: data.orders, revenue: data.revenue }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3);

      // Member tier analysis
      const tierGroups = allMembers?.reduce((acc: any, member) => {
        const tier = member.tier || 'silver';
        if (!acc[tier]) acc[tier] = { count: 0, total_spent: 0 };
        acc[tier].count += 1;
        acc[tier].total_spent += Number(member.total_spent || 0);
        return acc;
      }, {}) || {};

      const memberTierStats: MemberTierStats[] = Object.entries(tierGroups)
        .map(([tier, data]: [string, any]) => ({
          tier, count: data.count,
          percentage: allMembers?.length ? (data.count / allMembers.length) * 100 : 0,
          total_spent: data.total_spent,
          avg_spent: data.count > 0 ? data.total_spent / data.count : 0
        }));

      const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const yesterdaySales = yesterdayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const monthSales = monthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const lastMonthSales = lastMonthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const this7Sales = this7Orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const prev7Sales = prev7Orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const salesGrowthRate = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
      const weekSalesGrowthRate = prev7Sales > 0 ? ((this7Sales - prev7Sales) / prev7Sales) * 100 : 0;
      const monthSalesGrowthRate = lastMonthSales > 0 ? ((monthSales - lastMonthSales) / lastMonthSales) * 100 : 0;
      const ordersGrowthRate = (yesterdayOrders?.length || 0) > 0 ? (((todayOrders?.length || 0) - (yesterdayOrders?.length || 0)) / (yesterdayOrders?.length || 1)) * 100 : 0;

      const uniqueCustomers = new Set(monthOrders?.filter(o => o.member_id).map(o => o.member_id)).size;
      const averageOrderValue = monthOrders?.length ? monthSales / monthOrders.length : 0;
      const ordersPerCustomer = uniqueCustomers > 0 ? (monthOrders?.length || 0) / uniqueCustomers : 0;
      
      // Points usage - filtered by shop_id
      const { data: pointTransactionsToday } = await withShopFilter(
        supabase.from('point_transactions')
          .select('points_change')
          .eq('transaction_type', 'redeem')
          .gte('created_at', today + 'T00:00:00')
          .lt('created_at', today + 'T23:59:59')
      );

      const { data: pointTransactionsMonth } = await withShopFilter(
        supabase.from('point_transactions')
          .select('points_change')
          .eq('transaction_type', 'redeem')
          .gte('created_at', thisMonth + '-01T00:00:00')
      );

      const pointsUsageToday = pointTransactionsToday?.reduce((sum, tx) => sum + Math.abs(tx.points_change), 0) || 0;
      const pointsUsageMonth = pointTransactionsMonth?.reduce((sum, tx) => sum + Math.abs(tx.points_change), 0) || 0;

      const todayDiscount = todayOrders?.reduce((sum, order) => sum + Number(order.bill_discount || 0), 0) || 0;
      const monthDiscount = monthOrders?.reduce((sum, order) => sum + Number(order.bill_discount || 0), 0) || 0;

      // Promotion stats
      const claimsByPromo: Record<string, { usage_count: number; used_count: number }> = {};
      promoClaims?.forEach((c) => {
        const pid = c.promotion_id;
        if (!claimsByPromo[pid]) claimsByPromo[pid] = { usage_count: 0, used_count: 0 };
        claimsByPromo[pid].usage_count += 1;
        if (c.is_used) claimsByPromo[pid].used_count += 1;
      });

      const promoMap = new Map((promotions || []).map((p) => [p.id, p]));
      const promotionStats: PromotionStats[] = Object.entries(claimsByPromo).map(([pid, stats]) => {
        const promo = promoMap.get(pid);
        const discountValue = Number(promo?.discount_value || 0);
        const total_discount = promo?.discount_type === 'amount' ? discountValue * stats.usage_count : 0;
        return {
          name: promo?.title || 'ไม่ทราบชื่อ',
          usage_count: stats.usage_count,
          total_discount,
          revenue_impact: total_discount,
        };
      }).sort((a,b) => b.usage_count - a.usage_count).slice(0,5);

      setDashboardStats({
        todaySales, todayOrders: todayOrders?.length || 0, todayDiscount,
        todayNetSales: todaySales - todayDiscount,
        monthSales, monthOrders: monthOrders?.length || 0, monthDiscount,
        monthNetSales: monthSales - monthDiscount,
        totalMembers: allMembers?.length || 0,
        newMembersToday: todayMembers?.length || 0,
        newMembersMonth: monthMembers?.length || 0,
        salesGrowthRate, weekSalesGrowthRate, monthSalesGrowthRate,
        ordersGrowthRate, membersGrowthRate: 0,
        averageOrderValue, ordersPerCustomer,
        customerReturnRate: uniqueCustomers > 0 ? (uniqueCustomers / (allMembers?.length || 1)) * 100 : 0,
        paymentMethods, topProducts, peakHours,
        promotionStats, memberTierStats,
        pointsUsageToday, pointsUsageMonth,
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
    if (!shopId) return;
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
    if (shopLoading) return;
    if (!shopId) {
      setLoading(false);
      return;
    }
    refreshData();
  }, [shopId, shopLoading]);

  return {
    hourlyData, dailyData, monthlyData,
    genderStats, tierStats, dashboardStats,
    loading, refreshData,
  };
};
