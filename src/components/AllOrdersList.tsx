
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Download, Eye } from 'lucide-react';
import { useAllOrders } from '@/hooks/useAllOrders';
import OrderDetailsModal from './OrderDetailsModal';

const AllOrdersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { orders, loading, error } = useAllOrders();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
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

  // ฟังก์ชันทำความสะอาดเลขออเดอร์ (ลบ TRIGGER ออก)
  const cleanOrderNumber = (orderNumber: string) => {
    if (!orderNumber) return '';
    return orderNumber.replace(/-TRIGGER$/, '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;
    const matchesDate = !dateFilter || new Date(order.created_at).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleViewDetails = (order: any) => {
    setSelectedOrderId(order.id);
    setSelectedOrderNumber(cleanOrderNumber(order.order_number));
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">เกิดข้อผิดพลาด: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            ประวัติบิลทั้งหมด
          </CardTitle>
          <CardDescription>
            รายการออเดอร์ทั้งหมดในระบบ ({filteredOrders.length} รายการ)
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาเลขออเดอร์หรือชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="การชำระเงิน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="cash">เงินสด</SelectItem>
                <SelectItem value="card">บัตรเครดิต</SelectItem>
                <SelectItem value="transfer">โอนเงิน</SelectItem>
                <SelectItem value="online">ออนไลน์</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขออเดอร์</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>จำนวนรายการ</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>การชำระเงิน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {cleanOrderNumber(order.order_number)}
                    </TableCell>
                    <TableCell>{order.member_name || 'ลูกค้าทั่วไป'}</TableCell>
                    <TableCell>{order.items_count} รายการ</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.payment_method)}>
                        {order.payment_method === 'cash' && 'เงินสด'}
                        {order.payment_method === 'card' && 'บัตรเครดิต'}
                        {order.payment_method === 'transfer' && 'โอนเงิน'}
                        {order.payment_method === 'online' && 'ออนไลน์'}
                        {!['cash', 'card', 'transfer', 'online'].includes(order.payment_method) && order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'completed' && 'เสร็จสิ้น'}
                        {order.status === 'pending' && 'รอดำเนินการ'}
                        {order.status === 'cancelled' && 'ยกเลิก'}
                        {!['completed', 'pending', 'cancelled'].includes(order.status) && order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        ดูรายละเอียด
                      </Button>
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

      <OrderDetailsModal
        orderId={selectedOrderId || ''}
        orderNumber={selectedOrderNumber}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  );
};

export default AllOrdersList;
