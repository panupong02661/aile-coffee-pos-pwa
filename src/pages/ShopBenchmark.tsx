
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Store, TrendingUp, DollarSign, Users, ShoppingCart, 
  BarChart3, RefreshCw, Eye, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

interface ShopInfo {
  id: string;
  shop_name: string;
  branch_name: string | null;
  branch_code: string | null;
}

interface ShopStats {
  shopId: string;
  shopName: string;
  branchName: string | null;
  totalOrders: number;
  totalRevenue: number;
  totalMembers: number;
  avgOrderValue: number;
  topItems: { name: string; count: number }[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

const ShopBenchmark = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<ShopInfo[]>([]);
  const [shopStats, setShopStats] = useState<ShopStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');

  // Admin-only guard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllShopsData();
    }
  }, [user, period]);

  const getDateFilter = () => {
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    }
  };

  const fetchAllShopsData = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      // Admin-only RPC returns all shops (direct shops/orders queries are limited by RLS to the current shop)
      const { data: benchRows, error: benchError } = await (supabase as any).rpc('get_shop_benchmark', { p_start: dateFilter });
      if (benchError) {
        toast({ title: 'โหลดข้อมูล Benchmark ไม่ได้', description: benchError.message === 'Admin only' ? 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น' : benchError.message, variant: 'destructive' });
        throw benchError;
      }
      const shopsData = (benchRows || []).map((r: any) => ({ id: r.shop_id, shop_name: r.shop_name, branch_name: r.branch_name, branch_code: null }));
      if (shopsData.length === 0) {
        setShops([]);
        setShopStats([]);
        return;
      }
      setShops(shopsData);
      const benchMap = new Map<string, any>((benchRows || []).map((r: any) => [r.shop_id, r]));

      const statsPromises = shopsData.map(async (shop) => {
        const row = benchMap.get(shop.id) || {};
        const orders = { length: Number(row.total_orders) || 0 };
        const totalRevenue = Number(row.total_revenue) || 0;
        const membersRes = { data: { length: Number(row.total_members) || 0 } };
        const topItems = (row.top_items || []).map((t: any) => ({ name: t.name, count: Number(t.count) || 0 }));

        return {
          shopId: shop.id,
          shopName: shop.shop_name,
          branchName: shop.branch_name,
          totalOrders: orders.length,
          totalRevenue,
          totalMembers: membersRes.data?.length || 0,
          avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
          topItems,
        } as ShopStats;
      });

      const allStats = await Promise.all(statsPromises);
      setShopStats(allStats);
    } catch (error) {
      console.error('Error fetching shop benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') return null;

  const filteredStats = selectedShopId === 'all' 
    ? shopStats 
    : shopStats.filter(s => s.shopId === selectedShopId);

  const totalRevAll = shopStats.reduce((s, sh) => s + sh.totalRevenue, 0);
  const totalOrdersAll = shopStats.reduce((s, sh) => s + sh.totalOrders, 0);
  const totalMembersAll = shopStats.reduce((s, sh) => s + sh.totalMembers, 0);

  const comparisonData = shopStats.map(s => ({
    name: s.branchName || s.shopName,
    revenue: s.totalRevenue,
    orders: s.totalOrders,
    members: s.totalMembers,
    avgOrder: Math.round(s.avgOrderValue),
  }));

  const revenueShareData = shopStats.map((s, i) => ({
    name: s.branchName || s.shopName,
    value: s.totalRevenue,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const periodLabel: Record<string, string> = {
    today: 'วันนี้',
    week: '7 วันล่าสุด',
    month: 'เดือนนี้',
    year: 'ปีนี้',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-14 md:pl-14 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Benchmark ร้านค้า
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              เปรียบเทียบผลประกอบการร้านค้าทั้งหมด — สำหรับ Admin เท่านั้น
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">7 วัน</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="year">ปีนี้</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="ทุกร้าน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกร้าน</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.branch_name || shop.shop_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchAllShopsData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shopStats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีข้อมูลร้านค้า</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Store className="w-3.5 h-3.5" />
                    จำนวนร้าน
                  </div>
                  <p className="text-2xl font-bold text-foreground">{shops.length}</p>
                  <p className="text-xs text-muted-foreground">สาขาทั้งหมด</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    รายได้รวม
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ฿{totalRevAll.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{periodLabel[period]}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    ออเดอร์รวม
                  </div>
                  <p className="text-2xl font-bold text-foreground">{totalOrdersAll.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{periodLabel[period]}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    สมาชิกรวม
                  </div>
                  <p className="text-2xl font-bold text-foreground">{totalMembersAll.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">ทุกร้าน</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="comparison" className="space-y-4">
              <TabsList>
                <TabsTrigger value="comparison">เปรียบเทียบ</TabsTrigger>
                <TabsTrigger value="details">รายละเอียดแต่ละร้าน</TabsTrigger>
                <TabsTrigger value="ranking">จัดอันดับ</TabsTrigger>
              </TabsList>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Revenue Comparison Bar Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">เปรียบเทียบรายได้</CardTitle>
                      <CardDescription>{periodLabel[period]}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip 
                              formatter={(value: number) => [`฿${value.toLocaleString()}`, 'รายได้']}
                              contentStyle={{ borderRadius: 8, fontSize: 12 }}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Share Pie Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">สัดส่วนรายได้</CardTitle>
                      <CardDescription>แบ่งตามร้าน/สาขา</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={revenueShareData}
                              cx="50%" cy="50%"
                              innerRadius={50} outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {revenueShareData.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders Comparison */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">เปรียบเทียบออเดอร์</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="orders" fill="hsl(var(--chart-2, 160 60% 45%))" radius={[4, 4, 0, 0]} name="ออเดอร์" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avg Order Value */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">ยอดเฉลี่ยต่อออเดอร์</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip 
                              formatter={(value: number) => [`฿${value.toLocaleString()}`, 'เฉลี่ย/ออเดอร์']}
                              contentStyle={{ borderRadius: 8, fontSize: 12 }}
                            />
                            <Bar dataKey="avgOrder" fill="hsl(var(--chart-3, 30 80% 55%))" radius={[4, 4, 0, 0]} name="เฉลี่ย/ออเดอร์" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredStats.map((stat) => (
                    <Card key={stat.shopId} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Store className="w-4 h-4 text-primary" />
                            {stat.branchName || stat.shopName}
                          </CardTitle>
                          <Badge variant="outline" className="text-[10px]">
                            {periodLabel[period]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">รายได้</p>
                            <p className="text-lg font-bold text-foreground">฿{stat.totalRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">ออเดอร์</p>
                            <p className="text-lg font-bold text-foreground">{stat.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">สมาชิก</p>
                            <p className="text-lg font-bold text-foreground">{stat.totalMembers}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">เฉลี่ย/ออเดอร์</p>
                            <p className="text-lg font-bold text-foreground">฿{Math.round(stat.avgOrderValue).toLocaleString()}</p>
                          </div>
                        </div>

                        {stat.topItems.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">เมนูขายดี</p>
                            <div className="space-y-1">
                              {stat.topItems.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-foreground truncate">{i + 1}. {item.name}</span>
                                  <Badge variant="secondary" className="text-[10px] ml-1">{item.count}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Ranking Tab */}
              <TabsContent value="ranking" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Ranking */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        อันดับรายได้
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...shopStats]
                          .sort((a, b) => b.totalRevenue - a.totalRevenue)
                          .map((stat, i) => (
                            <div key={stat.shopId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? 'bg-yellow-500 text-white' :
                                  i === 1 ? 'bg-gray-400 text-white' :
                                  i === 2 ? 'bg-amber-700 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {stat.branchName || stat.shopName}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                ฿{stat.totalRevenue.toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Orders Ranking */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        อันดับจำนวนออเดอร์
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...shopStats]
                          .sort((a, b) => b.totalOrders - a.totalOrders)
                          .map((stat, i) => (
                            <div key={stat.shopId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? 'bg-yellow-500 text-white' :
                                  i === 1 ? 'bg-gray-400 text-white' :
                                  i === 2 ? 'bg-amber-700 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {stat.branchName || stat.shopName}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {stat.totalOrders} ออเดอร์
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Members Ranking */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        อันดับจำนวนสมาชิก
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...shopStats]
                          .sort((a, b) => b.totalMembers - a.totalMembers)
                          .map((stat, i) => (
                            <div key={stat.shopId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? 'bg-yellow-500 text-white' :
                                  i === 1 ? 'bg-gray-400 text-white' :
                                  i === 2 ? 'bg-amber-700 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {stat.branchName || stat.shopName}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {stat.totalMembers} คน
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avg Order Value Ranking */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        อันดับยอดเฉลี่ยต่อออเดอร์
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...shopStats]
                          .sort((a, b) => b.avgOrderValue - a.avgOrderValue)
                          .map((stat, i) => (
                            <div key={stat.shopId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? 'bg-yellow-500 text-white' :
                                  i === 1 ? 'bg-gray-400 text-white' :
                                  i === 2 ? 'bg-amber-700 text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {stat.branchName || stat.shopName}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                ฿{Math.round(stat.avgOrderValue).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ShopBenchmark;
