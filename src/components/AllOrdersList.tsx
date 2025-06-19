
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAllOrders } from '@/hooks/useAllOrders';
import OrderCancellationModal from './OrderCancellationModal';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const AllOrdersList = () => {
  const { orders, loading, refreshOrders } = useAllOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleOrderCancelled = () => {
    refreshOrders();
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'card': return 'บัตรเครดิต';
      case 'bank_transfer': return 'โอนเงิน';
      default: return method;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประวัติบิลทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            ประวัติบิลทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ไม่มีออเดอร์ในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หมายเลขออเดอร์</TableHead>
                    <TableHead>วันที่/เวลา</TableHead>
                    <TableHead>จำนวนรายการ</TableHead>
                    <TableHead>ยอดรวม</TableHead>
                    <TableHead>ส่วนลด</TableHead>
                    <TableHead>ยอดสุทธิ</TableHead>
                    <TableHead>วิธีชำระเงิน</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const discountAmount = order.bill_discount || 0;
                    const netAmount = order.total_amount - discountAmount;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {order.items_count} รายการ
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.total_amount.toLocaleString()} บาท
                        </TableCell>
                        <TableCell className="text-right">
                          {discountAmount > 0 ? (
                            <span className="text-red-600">
                              -{discountAmount.toLocaleString()} บาท
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {netAmount.toLocaleString()} บาท
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPaymentMethodText(order.payment_method)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            ยกเลิก
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderCancellationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onOrderCancelled={handleOrderCancelled}
      />
    </>
  );
};

export default AllOrdersList;
