import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, Users, Package, Clock, TrendingUp, Calendar, RotateCcw } from 'lucide-react';

interface OnlineOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  items: any[];
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  delivery_type: string;
  delivery_address?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface OrderStats {
  today: number;
  thisMonth: number;
  thisYear: number;
}

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStats, setOrderStats] = useState<OrderStats>({ today: 0, thisMonth: 0, thisYear: 0 });

  const fetchOnlineOrders = async () => {
    try {
      setLoading(true);
      
      // First, get all customer orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('customer_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get all unique customer IDs
      const customerIds = [...new Set(ordersData?.map(order => order.customer_id) || [])];
      
      // Get customer profiles for these IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('customer_profiles')
        .select('id, full_name, phone')
        .in('id', customerIds);

      if (profilesError) throw profilesError;

      // Create a map of customer profiles for quick lookup
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      const convertedOrders: OnlineOrder[] = (ordersData || []).map(order => {
        const customerProfile = profilesMap.get(order.customer_id);
        return {
          id: order.id,
          order_number: order.order_number,
          customer_name: customerProfile?.full_name || undefined,
          customer_phone: customerProfile?.phone || undefined,
          items: Array.isArray(order.items) ? order.items : [],
          total_amount: order.total_amount,
          order_status: order.order_status,
          payment_status: order.payment_status,
          payment_method: order.payment_method || 'online',
          delivery_type: order.delivery_type,
          delivery_address: order.delivery_address || undefined,
          created_at: order.created_at,
          updated_at: order.updated_at,
          notes: order.notes || undefined
        };
      });

      setOrders(convertedOrders);
      setFilteredOrders(convertedOrders);
      calculateOrderStats(convertedOrders);
      toast.success(`โหลดข้อมูลออเดอร์ออนไลน์สำเร็จ ${convertedOrders.length} ออเดอร์`);
    } catch (error) {
      console.error('Error fetching online orders:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderStats = (orderList: OnlineOrder[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const todayOrders = orderList.filter(order => new Date(order.created_at) >= today).length;
    const monthOrders = orderList.filter(order => new Date(order.created_at) >= thisMonth).length;
    const yearOrders = orderList.filter(order => new Date(order.created_at) >= thisYear).length;

    setOrderStats({
      today: todayOrders,
      thisMonth: monthOrders,
      thisYear: yearOrders
    });
  };

  useEffect(() => {
    fetchOnlineOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchTerm, statusFilter]);

  const filterOrders = () => {
    let filtered = orders;

    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.order_status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
      fetchOnlineOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลออเดอร์ออนไลน์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-coffee-800 mb-2">
              จัดการออเดอร์ออนไลน์
            </h1>
            <p className="text-coffee-600">
              ระบบจัดการออเดอร์จากแอปพลิเคชันลูกค้า
            </p>
          </div>
          <Button onClick={fetchOnlineOrders} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            รีเฟรช
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              ออเดอร์ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">{orders.length}</div>
            <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              วันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">{orderStats.today}</div>
            <p className="text-sm text-gray-600">ออเดอร์วันนี้</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              เดือนนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">{orderStats.thisMonth}</div>
            <p className="text-sm text-gray-600">ออเดอร์เดือนนี้</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              ปีนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">{orderStats.thisYear}</div>
            <p className="text-sm text-gray-600">ออเดอร์ปีนี้</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะการชำระเงิน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                <SelectItem value="failed">ชำระไม่สำเร็จ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">ทั้งหมด ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">รอดำเนินการ</TabsTrigger>
          <TabsTrigger value="confirmed">ยืนยันแล้ว</TabsTrigger>
          <TabsTrigger value="preparing">กำลังเตรียม</TabsTrigger>
          <TabsTrigger value="ready">พร้อมส่ง</TabsTrigger>
          <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>รายการออเดอร์ออนไลน์</CardTitle>
              <CardDescription>
                แสดงข้อมูลออเดอร์ {filteredOrders.length} ออเดอร์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>เลขออเดอร์</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>จำนวนรายการ</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>สถานะออเดอร์</TableHead>
                      <TableHead>สถานะการชำระ</TableHead>
                      <TableHead>วันที่สั่ง</TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer_name || 'ไม่ระบุ'}</div>
                            <div className="text-sm text-gray-500">{order.customer_phone || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.items.length} รายการ</TableCell>
                        <TableCell>฿{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.order_status)}>
                            {order.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <Select 
                            value={order.order_status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">รอดำเนินการ</SelectItem>
                              <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                              <SelectItem value="preparing">กำลังเตรียม</SelectItem>
                              <SelectItem value="ready">พร้อมส่ง</SelectItem>
                              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                              <SelectItem value="cancelled">ยกเลิก</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลออเดอร์
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnlineOrderManagement;
