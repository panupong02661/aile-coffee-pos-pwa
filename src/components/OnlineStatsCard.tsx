
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, ShoppingCart, TrendingUp, Users, Gift, Award, Coffee } from 'lucide-react';

interface OnlineStats {
  totalCustomers: number;
  totalOrders: number;
  totalSales: number;
  totalGifts: number;
  giftsByType: {
    menu_item: number;
    promotion: number;
    reward: number;
  };
  codesUsed: number;
  codesUnused: number;
}

const OnlineStatsCard = () => {
  const [stats, setStats] = useState<OnlineStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalSales: 0,
    totalGifts: 0,
    giftsByType: {
      menu_item: 0,
      promotion: 0,
      reward: 0
    },
    codesUsed: 0,
    codesUnused: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // ดึงข้อมูลลูกค้า
      const { data: customers, error: customersError } = await supabase
        .from('customer_profiles')
        .select('id');
      
      if (customersError) throw customersError;

      // ดึงข้อมูลออเดอร์ออนไลน์
      const { data: orders, error: ordersError } = await supabase
        .from('customer_orders')
        .select('total_amount');
      
      if (ordersError) throw ordersError;

      // ดึงข้อมูลของรางวัล/โค้ด
      const { data: gifts, error: giftsError } = await supabase
        .from('customer_gifts')
        .select('gift_type, is_used');
      
      if (giftsError) throw giftsError;

      // คำนวณสถิติ
      const totalSales = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      const giftsByType = {
        menu_item: gifts?.filter(g => g.gift_type === 'menu_item').length || 0,
        promotion: gifts?.filter(g => g.gift_type === 'promotion').length || 0,
        reward: gifts?.filter(g => g.gift_type === 'reward').length || 0
      };

      const codesUsed = gifts?.filter(g => g.is_used).length || 0;
      const codesUnused = gifts?.filter(g => !g.is_used).length || 0;

      setStats({
        totalCustomers: customers?.length || 0,
        totalOrders: orders?.length || 0,
        totalSales,
        totalGifts: gifts?.length || 0,
        giftsByType,
        codesUsed,
        codesUnused
      });
    } catch (error) {
      console.error('Error fetching online stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* แอปมือถือสำหรับลูกค้า */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Smartphone className="w-5 h-5" />
            แอปมือถือสำหรับลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
              <div className="text-sm text-blue-600">ผู้ใช้แอป</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
              <div className="text-sm text-green-600">ออเดอร์จากแอป</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">฿{stats.totalSales.toLocaleString()}</div>
              <div className="text-sm text-purple-600">ยอดขายจากแอป</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                รายละเอียดลูกค้า
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>ลูกค้าทั้งหมด:</span>
                <Badge variant="secondary">{stats.totalCustomers}</Badge>
              </div>
              <div className="flex justify-between">
                <span>ออเดอร์เฉลี่ย:</span>
                <Badge variant="outline">
                  {stats.totalCustomers > 0 ? (stats.totalOrders / stats.totalCustomers).toFixed(1) : 0} ครั้ง
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* แอปมือถือสำหรับจัดการลูกค้า */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Gift className="w-5 h-5" />
            แอปมือถือสำหรับจัดการลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalCustomers}</div>
              <div className="text-sm text-orange-600">ลูกค้าที่ได้โค้ด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.totalGifts}</div>
              <div className="text-sm text-red-600">จำนวนโค้ดที่ส่ง</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.codesUsed}</div>
              <div className="text-sm text-green-600">โค้ดที่ใช้แล้ว</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ประเภทของรางวัล</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  เมนูอาหาร
                </span>
                <Badge className="bg-amber-100 text-amber-800">
                  {stats.giftsByType.menu_item}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  โปรโมชั่น
                </span>
                <Badge className="bg-blue-100 text-blue-800">
                  {stats.giftsByType.promotion}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  ของรางวัล
                </span>
                <Badge className="bg-purple-100 text-purple-800">
                  {stats.giftsByType.reward}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>โค้ดคงเหลือ:</span>
                <Badge variant="outline" className="text-green-600">
                  {stats.codesUnused}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>อัตราการใช้:</span>
                <Badge variant="outline" className="text-blue-600">
                  {stats.totalGifts > 0 ? ((stats.codesUsed / stats.totalGifts) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineStatsCard;
