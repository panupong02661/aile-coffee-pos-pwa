
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Award, ShoppingBag, Gift, Percent, Star, Calendar, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TopMenuItem {
  menu_item_name: string;
  total_quantity: number;
  total_spent: number;
  image_url?: string;
}

interface DiscountStats {
  total_discount_used: number;
  total_orders_with_discount: number;
  average_discount: number;
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  total_points_earned: number;
  total_points_used: number;
  current_tier: string;
  orders_this_month: number;
  spent_this_month: number;
  points_this_month: number;
  average_order_value: number;
  favorite_category: string;
  last_order_date: string;
}

interface StatsSectionProps {
  currentUser: any;
}

const StatsSection = ({ currentUser }: StatsSectionProps) => {
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItem[]>([]);
  const [discountStats, setDiscountStats] = useState<DiscountStats>({
    total_discount_used: 0,
    total_orders_with_discount: 0,
    average_discount: 0
  });
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    total_orders: 0,
    total_spent: 0,
    total_points_earned: 0,
    total_points_used: 0,
    current_tier: '',
    orders_this_month: 0,
    spent_this_month: 0,
    points_this_month: 0,
    average_order_value: 0,
    favorite_category: '',
    last_order_date: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTopMenuItems = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          menu_item_name,
          quantity,
          total_price,
          orders!inner(member_id)
        `)
        .eq('orders.member_id', currentUser.id);

      if (error) throw error;

      // Group by menu item and calculate totals
      const menuStats = data.reduce((acc: any, item: any) => {
        const name = item.menu_item_name;
        if (!acc[name]) {
          acc[name] = {
            menu_item_name: name,
            total_quantity: 0,
            total_spent: 0
          };
        }
        acc[name].total_quantity += item.quantity;
        acc[name].total_spent += Number(item.total_price);
        return acc;
      }, {});

      // Convert to array and sort by quantity
      const sortedItems = Object.values(menuStats)
        .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
        .slice(0, 5) as TopMenuItem[];

      setTopMenuItems(sortedItems);
    } catch (error) {
      console.error('Error fetching top menu items:', error);
    }
  };

  const fetchDiscountStats = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('bill_discount, total_amount')
        .eq('member_id', currentUser.id)
        .not('bill_discount', 'is', null)
        .gt('bill_discount', 0);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalDiscount = data.reduce((sum, order) => sum + (Number(order.bill_discount) || 0), 0);
        const avgDiscount = totalDiscount / data.length;

        setDiscountStats({
          total_discount_used: totalDiscount,
          total_orders_with_discount: data.length,
          average_discount: avgDiscount
        });
      }
    } catch (error) {
      console.error('Error fetching discount stats:', error);
    }
  };

  const fetchCustomerStats = async () => {
    if (!currentUser) return;

    try {
      console.log('Fetching customer stats for member ID:', currentUser.id);
      
      // Get all orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('member_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw orderError;
      }

      console.log('Order data:', orderData);

      // Get this month's data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthOrders = orderData?.filter(order => 
        new Date(order.created_at) >= startOfMonth
      ) || [];

      // Get points transactions with better filtering
      const { data: pointsData, error: pointsError } = await supabase
        .from('point_transactions')
        .select('points_change, transaction_type, created_at')
        .eq('member_id', currentUser.id);

      if (pointsError) {
        console.error('Points fetch error:', pointsError);
        throw pointsError;
      }

      console.log('Points data:', pointsData);

      // Get this month's points - fix the transaction type filtering
      const thisMonthPoints = pointsData?.filter(t => 
        new Date(t.created_at) >= startOfMonth && 
        (t.transaction_type === 'earn' || t.transaction_type === 'earned')
      ).reduce((sum, t) => sum + Math.abs(t.points_change), 0) || 0;

      const totalOrders = orderData?.length || 0;
      const totalSpent = orderData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const thisMonthSpent = thisMonthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      
      // Fix points calculation - check for both 'earn' and 'earned' transaction types
      const pointsEarned = pointsData?.filter(t => 
        t.transaction_type === 'earn' || 
        t.transaction_type === 'earned' || 
        t.points_change > 0
      ).reduce((sum, t) => sum + Math.abs(t.points_change), 0) || 0;
      
      // Fix points used calculation - check for both 'redeem' and negative values
      const pointsUsed = Math.abs(pointsData?.filter(t => 
        t.transaction_type === 'redeem' || 
        t.transaction_type === 'redeemed' ||
        t.points_change < 0
      ).reduce((sum, t) => sum + Math.abs(t.points_change), 0) || 0);

      console.log('Calculated stats:', {
        totalOrders,
        totalSpent,
        pointsEarned,
        pointsUsed,
        thisMonthPoints
      });

      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = orderData?.[0]?.created_at || '';

      setCustomerStats({
        total_orders: totalOrders,
        total_spent: totalSpent,
        total_points_earned: pointsEarned,
        total_points_used: pointsUsed,
        current_tier: currentUser.tier || 'silver',
        orders_this_month: thisMonthOrders.length,
        spent_this_month: thisMonthSpent,
        points_this_month: thisMonthPoints,
        average_order_value: avgOrderValue,
        favorite_category: 'กาแฟ', // This could be calculated from actual data
        last_order_date: lastOrderDate
      });
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      await Promise.all([
        fetchTopMenuItems(),
        fetchDiscountStats(),
        fetchCustomerStats()
      ]);
      setIsLoading(false);
    };

    loadStats();
  }, [currentUser]);

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'ทองแดง';
      case 'silver': return 'เงิน';
      case 'gold': return 'ทอง';
      case 'platinum': return 'แพลทินัม';
      default: return 'เงิน';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'ไม่มีข้อมูล';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดสถิติ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{currentUser?.name || 'สมาชิก'}</h2>
                <p className="text-white/80">{currentUser?.phone}</p>
              </div>
            </div>
            <Badge className={`${getTierColor(customerStats.current_tier)} text-xs`}>
              {getTierDisplayName(customerStats.current_tier)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm">แต้มสะสม</p>
              <p className="text-2xl font-bold">{(currentUser?.points || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">ยอดใช้จ่าย</p>
              <p className="text-2xl font-bold">฿{customerStats.total_spent.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
                <p className="text-xl font-bold text-blue-600">{customerStats.total_orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ค่าเฉลี่ย/ออเดอร์</p>
                <p className="text-xl font-bold text-green-600">฿{customerStats.average_order_value.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">เดือนนี้</p>
                <p className="text-xl font-bold text-purple-600">{customerStats.orders_this_month} ออเดอร์</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">แต้มเดือนนี้</p>
                <p className="text-xl font-bold text-orange-600">+{customerStats.points_this_month}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-600 mb-1">ออเดอร์ล่าสุด</p>
            <p className="text-lg font-bold text-blue-700">{formatDate(customerStats.last_order_date)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-green-600 mb-1">ยอดเดือนนี้</p>
            <p className="text-lg font-bold text-green-700">฿{customerStats.spent_this_month.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Points Summary - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            สรุปแต้มสะสม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">แต้มที่ได้รับ</p>
                <p className="text-xl font-bold text-green-700">+{customerStats.total_points_earned.toLocaleString()}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 mb-1">แต้มที่ใช้ไป</p>
                <p className="text-xl font-bold text-red-700">-{customerStats.total_points_used.toLocaleString()}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">แต้มคงเหลือ</p>
                <p className="text-xl font-bold text-blue-700">{(currentUser?.points || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Points Earning Rules */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">การได้รับแต้ม</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">สมาชิกเงิน:</span>
                  <span className="font-medium">1 แต้ม/บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สมาชิกทอง:</span>
                  <span className="font-medium">1.5 แต้ม/บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สมาชิกแพลทินัม:</span>
                  <span className="font-medium">2 แต้ม/บาท</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            เมนูที่สั่งบ่อยที่สุด (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topMenuItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลการสั่งซื้อ</p>
          ) : (
            topMenuItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.menu_item_name}</h4>
                    <p className="text-sm text-gray-600">สั่ง {item.total_quantity} ครั้ง</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">฿{item.total_spent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">ยอดรวม</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Discount Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            สถิติส่วนลด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {discountStats.total_orders_with_discount === 0 ? (
            <p className="text-center text-gray-500 py-8">ยังไม่เคยใช้ส่วนลด</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">ส่วนลดรวมที่ได้รับ</p>
                    <p className="text-2xl font-bold text-red-700">฿{discountStats.total_discount_used.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Percent className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-600 mb-1">ออเดอร์ที่ได้ส่วนลด</p>
                  <p className="text-xl font-bold text-blue-700">{discountStats.total_orders_with_discount}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-600 mb-1">ส่วนลดเฉลี่ย</p>
                  <p className="text-xl font-bold text-green-700">฿{discountStats.average_discount.toFixed(0)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSection;
