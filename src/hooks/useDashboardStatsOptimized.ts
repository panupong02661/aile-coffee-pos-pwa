import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface HourlySales { hour: string; sales: number; orders: number; discount: number; }
interface DailySales { date: string; sales: number; orders: number; discount: number; net_sales: number; }
interface MonthlySales { month: string; sales: number; orders: number; discount: number; net_sales: number; }
interface GenderStats { name: string; value: number; percentage: number; }
interface TierStats { name: string; value: number; }
interface PaymentMethodStats { method: string; amount: number; count: number; percentage: number; }
interface TopProduct { name: string; quantity: number; revenue: number; profit: number; }
interface PeakHour { hour: number; orders: number; revenue: number; }
interface PromotionStats { name: string; usage_count: number; total_discount: number; revenue_impact: number; }
interface MemberTierStats { tier: string; count: number; percentage: number; total_spent: number; avg_spent: number; }

interface DashboardStats {
  todaySales: number; todayOrders: number; todayDiscount: number; todayNetSales: number;
  monthSales: number; monthOrders: number; monthDiscount: number; monthNetSales: number;
  totalMembers: number; newMembersToday: number; newMembersMonth: number;
  salesGrowthRate: number; weekSalesGrowthRate: number; monthSalesGrowthRate: number;
  ordersGrowthRate: number; membersGrowthRate: number;
  averageOrderValue: number; ordersPerCustomer: number; customerReturnRate: number;
  paymentMethods: PaymentMethodStats[]; topProducts: TopProduct[]; peakHours: PeakHour[];
  promotionStats: PromotionStats[]; memberTierStats: MemberTierStats[];
  pointsUsageToday: number; pointsUsageMonth: number; memberEngagementRate: number;
}

const fetchHourlyData = async (shopId: string): Promise<HourlySales[]> => {
  const nowBangkok = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const todayBangkok = new Date(nowBangkok);
  todayBangkok.setHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(todayBangkok.getTime() - (7 * 60 * 60 * 1000)).toISOString();
  
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, bill_discount')
    .eq('shop_id', shopId)
    .gte('created_at', startOfDayUTC)
    .order('created_at');

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

  return Array.from(hourlyMap.values());
};

const fetchDailyData = async (shopId: string): Promise<DailySales[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, bill_discount')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())
    .order('created_at');

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

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const fetchMonthlyData = async (shopId: string): Promise<MonthlySales[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 12);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, bill_discount')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())
    .order('created_at');

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

  return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
};

const fetchMemberStats = async (shopId: string): Promise<{ gender: GenderStats[], tier: TierStats[] }> => {
  const { data: members, error } = await supabase
    .from('members')
    .select('gender, tier, created_at')
    .eq('shop_id', shopId);

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
  return {
    gender: [
      { name: 'ชาย', value: genderCount.male, percentage: total > 0 ? Math.round((genderCount.male / total) * 100) : 0 },
      { name: 'หญิง', value: genderCount.female, percentage: total > 0 ? Math.round((genderCount.female / total) * 100) : 0 },
      { name: 'อื่นๆ', value: genderCount.other, percentage: total > 0 ? Math.round((genderCount.other / total) * 100) : 0 },
    ],
    tier: [
      { name: 'Silver', value: tierCount.silver },
      { name: 'Gold', value: tierCount.gold },
      { name: 'Platinum', value: tierCount.platinum },
    ]
  };
};

const fetchDashboardStats = async (shopId: string): Promise<DashboardStats> => {
  const nowBangkok = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const today = nowBangkok.toISOString().split('T')[0];
  const todayStartUTC = new Date(today + 'T00:00:00+07:00').toISOString();
  const todayEndUTC = new Date(today + 'T23:59:59+07:00').toISOString();
  
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount, bill_discount, payment_method, member_id, created_at')
    .eq('shop_id', shopId)
    .gte('created_at', todayStartUTC)
    .lte('created_at', todayEndUTC);

  const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const todayDiscount = todayOrders?.reduce((sum, order) => sum + Number(order.bill_discount), 0) || 0;

  return {
    todaySales, todayOrders: todayOrders?.length || 0, todayDiscount,
    todayNetSales: todaySales - todayDiscount,
    monthSales: 0, monthOrders: 0, monthDiscount: 0, monthNetSales: 0,
    totalMembers: 0, newMembersToday: 0, newMembersMonth: 0,
    salesGrowthRate: 0, weekSalesGrowthRate: 0, monthSalesGrowthRate: 0,
    ordersGrowthRate: 0, membersGrowthRate: 0,
    averageOrderValue: todayOrders?.length ? todaySales / todayOrders.length : 0,
    ordersPerCustomer: 0, customerReturnRate: 0,
    paymentMethods: [], topProducts: [], peakHours: [],
    promotionStats: [], memberTierStats: [],
    pointsUsageToday: 0, pointsUsageMonth: 0, memberEngagementRate: 0,
  };
};

const emptyStats: DashboardStats = {
  todaySales: 0, todayOrders: 0, todayDiscount: 0, todayNetSales: 0,
  monthSales: 0, monthOrders: 0, monthDiscount: 0, monthNetSales: 0,
  totalMembers: 0, newMembersToday: 0, newMembersMonth: 0,
  salesGrowthRate: 0, weekSalesGrowthRate: 0, monthSalesGrowthRate: 0,
  ordersGrowthRate: 0, membersGrowthRate: 0,
  averageOrderValue: 0, ordersPerCustomer: 0, customerReturnRate: 0,
  paymentMethods: [], topProducts: [], peakHours: [],
  promotionStats: [], memberTierStats: [],
  pointsUsageToday: 0, pointsUsageMonth: 0, memberEngagementRate: 0,
};

export const useDashboardStatsOptimized = () => {
  const { shopId, loading: shopLoading } = useCurrentShop();
  const enabled = !shopLoading && !!shopId;

  const hourlyQuery = useQuery({
    queryKey: ['dashboard', 'hourly', shopId],
    queryFn: () => fetchHourlyData(shopId!),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const dailyQuery = useQuery({
    queryKey: ['dashboard', 'daily', shopId],
    queryFn: () => fetchDailyData(shopId!),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const monthlyQuery = useQuery({
    queryKey: ['dashboard', 'monthly', shopId],
    queryFn: () => fetchMonthlyData(shopId!),
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const memberStatsQuery = useQuery({
    queryKey: ['dashboard', 'members', shopId],
    queryFn: () => fetchMemberStats(shopId!),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const dashboardStatsQuery = useQuery({
    queryKey: ['dashboard', 'stats', shopId],
    queryFn: () => fetchDashboardStats(shopId!),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    hourlyData: hourlyQuery.data ?? [],
    dailyData: dailyQuery.data ?? [],
    monthlyData: monthlyQuery.data ?? [],
    genderStats: memberStatsQuery.data?.gender ?? [],
    tierStats: memberStatsQuery.data?.tier ?? [],
    dashboardStats: dashboardStatsQuery.data ?? emptyStats,
    loading: !enabled || hourlyQuery.isLoading || dailyQuery.isLoading || monthlyQuery.isLoading || memberStatsQuery.isLoading || dashboardStatsQuery.isLoading,
    isError: hourlyQuery.isError || dailyQuery.isError || monthlyQuery.isError || memberStatsQuery.isError || dashboardStatsQuery.isError,
    refetch: () => {
      hourlyQuery.refetch();
      dailyQuery.refetch();
      monthlyQuery.refetch();
      memberStatsQuery.refetch();
      dashboardStatsQuery.refetch();
    }
  };
};
