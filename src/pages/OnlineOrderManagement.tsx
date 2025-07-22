import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package2, CheckCircle, Clock, XCircle, Search, Filter, Calendar, TrendingUp, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderSummary {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  completedOrders: number;
}

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Summary states
  const [dailySummary, setDailySummary] = useState<OrderSummary>({ totalOrders: 0, totalAmount: 0, pendingOrders: 0, completedOrders: 0 });
  const [monthlySummary, setMonthlySummary] = useState<OrderSummary>({ totalOrders: 0, totalAmount: 0, pendingOrders: 0, completedOrders: 0 });
  const [yearlySummary, setYearlySummary] = useState<OrderSummary>({ totalOrders: 0, totalAmount: 0, pendingOrders: 0, completedOrders: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_orders')
        .select(`
          *,
          customer_profiles!inner(
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert the data to match OnlineOrder interface
      const convertedOrders: OnlineOrder[] = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_profiles?.full_name || undefined,
        customer_phone: order.customer_profiles?.phone || undefined,
        items: Array.isArray(order.items) ? order.items : [],
        total_amount: order.total_amount,
        order_status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        delivery_type: order.delivery_type,
        delivery_address: order.delivery_address || undefined,
        notes: order.notes || undefined,
        created_at: order.created_at,
        updated_at: order.updated_at
      }));

      setOrders(convertedOrders);
      calculateSummaries(convertedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (ordersData: OnlineOrder[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Daily summary
    const dailyOrders = ordersData.filter(order => 
      order.created_at.split('T')[0] === todayStr
    );
    setDailySummary({
      totalOrders: dailyOrders.length,
      totalAmount: dailyOrders.reduce((sum, order) => sum + order.total_amount, 0),
      pendingOrders: dailyOrders.filter(order => order.order_status === 'pending').length,
      completedOrders: dailyOrders.filter(order => order.order_status === 'completed').length
    });

    // Monthly summary
    const monthlyOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
    });
    setMonthlySummary({
      totalOrders: monthlyOrders.length,
      totalAmount: monthlyOrders.reduce((sum, order) => sum + order.total_amount, 0),
      pendingOrders: monthlyOrders.filter(order => order.order_status === 'pending').length,
      completedOrders: monthlyOrders.filter(order => order.order_status === 'completed').length
    });

    // Yearly summary
    const yearlyOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getFullYear() === thisYear;
    });
    setYearlySummary({
      totalOrders: yearlyOrders.length,
      totalAmount: yearlyOrders.reduce((sum, order) => sum + order.total_amount, 0),
      pendingOrders: yearlyOrders.filter(order => order.order_status === 'pending').length,
      completedOrders: yearlyOrders.filter(order => order.order_status === 'completed').length
    });
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package2 className="w-4 h-4" />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const SummaryCard = ({ title, data, icon, color }: { 
    title: string; 
    data: OrderSummary; 
    icon: React.ReactNode; 
    color: string; 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${color}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`text-2xl font-bold ${color}`}>
              {data.totalOrders}
            </div>
            <p className="text-sm text-gray-600">ออเดอร์ทั้งหมด</p>
          </div>
          <div>
            <div className={`text-2xl font-bold ${color}`}>
              ฿{data.totalAmount.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">ยอดขายรวม</p>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-orange-600">รออนุมัติ: {data.pendingOrders}</span>
          <span className="text-green-600">เสร็จสิ้น: {data.completedOrders}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-coffee-800 mb-2">
          จัดการออเดอร์ออนไลน์
        </h1>
        <p className="text-coffee-600">
          ระบบจัดการออเดอร์จากลูกค้าออนไลน์
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard
          title="สรุปรายวัน"
          data={dailySummary}
          icon={<Calendar className="w-5 h-5" />}
          color="text-blue-600"
        />
        <SummaryCard
          title="สรุปรายเดือน"
          data={monthlySummary}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-600"
        />
        <SummaryCard
          title="สรุปรายปี"
          data={yearlySummary}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="text-purple-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="w-5 h-5" />
            รายการออเดอร์ ({filteredOrders.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="pending">รออนุมัติ</SelectItem>
                  <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                  <SelectItem value="preparing">กำลังเตรียม</SelectItem>
                  <SelectItem value="ready">พร้อมส่ง</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-lg">#{order.order_number}</div>
                    <Badge className={getStatusColor(order.order_status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.order_status)}
                        {order.order_status}
                      </div>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">
                      ฿{order.total_amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ลูกค้า: </span>
                    {order.customer_name || 'ไม่ระบุ'}
                  </div>
                  <div>
                    <span className="text-gray-600">เบอร์โทร: </span>
                    {order.customer_phone || 'ไม่ระบุ'}
                  </div>
                  <div>
                    <span className="text-gray-600">การชำระเงิน: </span>
                    {order.payment_method}
                  </div>
                  <div>
                    <span className="text-gray-600">การจัดส่ง: </span>
                    {order.delivery_type}
                  </div>
                </div>

                {order.delivery_address && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">ที่อยู่จัดส่ง: </span>
                    {order.delivery_address}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'confirmed');
                    }}
                    disabled={order.order_status !== 'pending'}
                  >
                    ยืนยัน
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'preparing');
                    }}
                    disabled={order.order_status !== 'confirmed'}
                  >
                    เตรียมอาหาร
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'ready');
                    }}
                    disabled={order.order_status !== 'preparing'}
                  >
                    พร้อมส่ง
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, 'completed');
                    }}
                    disabled={order.order_status !== 'ready'}
                  >
                    เสร็จสิ้น
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              ไม่พบออเดอร์ที่ตรงกับเงื่อนไข
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineOrderManagement;
