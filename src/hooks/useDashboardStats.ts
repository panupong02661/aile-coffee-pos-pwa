
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
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Today's stats
      const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('total_amount, bill_discount')
        .gte('created_at', startOfDay.toISOString());

      if (todayError) throw todayError;

      // Month's stats
      const { data: monthOrders, error: monthError } = await supabase
        .from('orders')
        .select('total_amount, bill_discount')
        .gte('created_at', startOfMonth.toISOString());

      if (monthError) throw monthError;

      // Member stats
      const { data: allMembers, error: membersError } = await supabase
        .from('members')
        .select('created_at');

      if (membersError) throw membersError;

      const { data: todayMembers, error: todayMembersError } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', startOfDay.toISOString());

      if (todayMembersError) throw todayMembersError;

      const { data: monthMembers, error: monthMembersError } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', startOfMonth.toISOString());

      if (monthMembersError) throw monthMembersError;

      const todaySales = todayOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const todayDiscount = todayOrders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0;
      
      const monthSales = monthOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
      const monthDiscount = monthOrders?.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0) || 0;

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
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลสถิติได้',
        variant: 'destructive'
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
