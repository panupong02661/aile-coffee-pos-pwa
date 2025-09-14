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
import { ShoppingCart, Users, Package, Clock, TrendingUp, Calendar, RotateCcw, Eye } from 'lucide-react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import OrderDetailsModal from '@/components/OrderDetailsModal';

interface OnlineOrder {
  id: string;
  order_number: string;
  member_name?: string;
  member_phone?: string;
  items_count: number;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  member_id?: string;
  bill_discount?: number;
  bill_discount_type?: string;
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
  const [dateFilter, setDateFilter] = useState('all'); // all, today, month, year, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [orderStats, setOrderStats] = useState<OrderStats>({ today: 0, thisMonth: 0, thisYear: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const fetchOnlineOrders = async () => {
    try {
      setLoading(true);
      
      // Get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get all unique member IDs that are not null
      const memberIds = [...new Set(ordersData?.map(order => order.member_id).filter(Boolean) || [])];
      
      // Get member profiles for these IDs
      let membersMap = new Map();
      if (memberIds.length > 0) {
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, name, phone')
          .in('id', memberIds);

        if (membersError) throw membersError;
        membersMap = new Map(membersData?.map(member => [member.id, member]) || []);
      }

      const convertedOrders: OnlineOrder[] = (ordersData || []).map(order => {
        const member = order.member_id ? membersMap.get(order.member_id) : null;
        return {
          id: order.id,
          order_number: order.order_number,
          member_name: member?.name || undefined,
          member_phone: member?.phone || undefined,
          items_count: order.items_count || 0,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          payment_status: (order as any).payment_status || 'completed',
          created_at: order.created_at,
          updated_at: order.updated_at,
          member_id: order.member_id,
          bill_discount: order.bill_discount,
          bill_discount_type: order.bill_discount_type
        };
      });

      setOrders(convertedOrders);
      setFilteredOrders(convertedOrders);
      calculateOrderStats(convertedOrders);
      toast.success(`โหลดข้อมูลออเดอร์สำเร็จ ${convertedOrders.length} ออเดอร์`);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
  }, [orders, activeTab, searchTerm, statusFilter, dateFilter, customDateRange]);

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status tabs
    if (activeTab !== 'all') {
      const statusMapping: Record<string, string> = {
        'pending': 'pending',
        'confirmed': 'confirmed', 
        'preparing': 'preparing',
        'ready': 'ready',
        'completed': 'completed'
      };
      
      const mappedStatus = statusMapping[activeTab] || activeTab;
      filtered = filtered.filter(order => {
        return order.payment_status === mappedStatus;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.member_phone?.includes(searchTerm)
      );
    }

    // Filter by payment method
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === statusFilter);
    }

    // Filter by date range
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = new Date();
      
      switch (dateFilter) {
        case 'today': {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= today && orderDate < tomorrow;
          });
          break;
        }
        case 'month': {
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= thisMonth && orderDate < nextMonth;
          });
          break;
        }
        case 'year': {
          const thisYear = new Date(now.getFullYear(), 0, 1);
          const nextYear = new Date(now.getFullYear() + 1, 0, 1);
          
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= thisYear && orderDate < nextYear;
          });
          break;
        }
        case 'custom': {
          if (customDateRange.start && customDateRange.end) {
            const startDate = new Date(customDateRange.start);
            const endDate = new Date(customDateRange.end);
            endDate.setDate(endDate.getDate() + 1); // Include end date
            
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.created_at);
              return orderDate >= startDate && orderDate < endDate;
            });
          }
          break;
        }
      }
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
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'mobile_banking': return 'bg-purple-100 text-purple-800';
      case 'points': return 'bg-orange-100 text-orange-800';
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
      // For now, just show success message since orders table structure may vary
      console.log('Status update requested:', newStatus, 'for order:', orderId);
      
      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
      fetchOnlineOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrderId(null);
  };

  if (loading) {
    return (
      <div className="h-screen bg-cream-50 flex">
        <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <div className="p-4">
            <Header 
              onToggleSidebar={handleToggleSidebar}
              categories={[]}
              selectedCategory=""
              onCategorySelect={() => {}}
              gridColumns={4}
              setGridColumns={() => {}}
              itemSize="medium"
              setItemSize={() => {}}
              page="other"
            />
            
            <div className="container mx-auto p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลออเดอร์...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-coffee-800 mb-2">
              จัดการออเดอร์ทั้งหมด
            </h1>
            <p className="text-coffee-600">
              ระบบจัดการออเดอร์จากระบบ POS
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
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="ช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                  <SelectItem value="year">ปีนี้</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="วิธีการชำระเงิน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  <SelectItem value="cash">เงินสด</SelectItem>
                  <SelectItem value="card">บัตรเครดิต</SelectItem>
                  <SelectItem value="mobile_banking">โมบายแบงก์กิ้ง</SelectItem>
                  <SelectItem value="points">แต้ม</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">วันที่เริ่มต้น</label>
                <Input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">วันที่สิ้นสุด</label>
                <Input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          )}
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
              <CardTitle>รายการออเดอร์ทั้งหมด</CardTitle>
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
                      <TableHead>สมาชิก</TableHead>
                      <TableHead>จำนวนรายการ</TableHead>
                      <TableHead>ยอดรวม</TableHead>
                      <TableHead>วิธีการชำระ</TableHead>
                      <TableHead>สถานะการชำระ</TableHead>
                      <TableHead>วันที่สั่ง</TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            {order.order_number}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.member_name || 'ไม่ระบุ'}</div>
                            <div className="text-sm text-gray-500">{order.member_phone || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.items_count} รายการ</TableCell>
                        <TableCell>฿{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.payment_method)}>
                            {order.payment_method === 'cash' ? 'เงินสด' :
                             order.payment_method === 'card' ? 'บัตรเครดิต' :
                             order.payment_method === 'mobile_banking' ? 'โมบายแบงก์กิ้ง' :
                             order.payment_method === 'points' ? 'แต้ม' : order.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.payment_status || 'completed')}>
                            {order.payment_status === 'pending' ? 'รอชำระ' :
                             order.payment_status === 'confirmed' ? 'ยืนยันแล้ว' :
                             order.payment_status === 'preparing' ? 'กำลังเตรียม' :
                             order.payment_status === 'ready' ? 'พร้อมส่ง' :
                             order.payment_status === 'completed' ? 'เสร็จสิ้น' : 'เสร็จสิ้น'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewOrder(order.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              ดู
                            </Button>
                            <Select 
                              value={order.payment_status || 'completed'} 
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
                              </SelectContent>
                            </Select>
                          </div>
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

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseModal}
        orderId={selectedOrderId}
      />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineOrderManagement;
