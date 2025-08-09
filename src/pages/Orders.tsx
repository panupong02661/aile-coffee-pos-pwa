
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

const Orders = () => {
  const orders = [
    { id: 1, orderNumber: 'ORD-001', customerName: 'คุณสมชาย', status: 'preparing', total: 250, time: '10:30' },
    { id: 2, orderNumber: 'ORD-002', customerName: 'คุณมาลี', status: 'ready', total: 180, time: '10:25' },
    { id: 3, orderNumber: 'ORD-003', customerName: 'คุณสมใจ', status: 'completed', total: 320, time: '10:20' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="default" className="bg-yellow-500">กำลังเตรียม</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">พร้อมเสิร์ฟ</Badge>;
      case 'completed':
        return <Badge variant="outline">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">คิวสั่งซื้อ</h1>
          <p className="text-gray-600">จัดการและติดตามคำสั่งซื้อทั้งหมด</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {order.time}
                    </span>
                    <span className="font-semibold">฿{order.total}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      ดูรายละเอียด
                    </Button>
                    {order.status === 'preparing' && (
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        เสร็จแล้ว
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
};

export default Orders;
