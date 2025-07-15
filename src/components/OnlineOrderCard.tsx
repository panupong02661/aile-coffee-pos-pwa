
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Phone, MapPin, Package } from 'lucide-react';
import { OnlineOrder } from '@/hooks/useOnlineOrders';

interface OnlineOrderCardProps {
  order: OnlineOrder;
  onViewDetails: (order: OnlineOrder) => void;
  onUpdateStatus: (orderId: string, status: OnlineOrder['order_status']) => void;
}

const OnlineOrderCard: React.FC<OnlineOrderCardProps> = ({ 
  order, 
  onViewDetails,
  onUpdateStatus 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมส่ง';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'ยืนยัน';
      case 'confirmed': return 'เริ่มเตรียม';
      case 'preparing': return 'เสร็จแล้ว';
      case 'ready': return 'ส่งแล้ว';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.order_status);
  const nextStatusText = getNextStatusText(order.order_status);

  return (
    <Card className={`mb-4 transition-all hover:shadow-md ${order.isNew ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">{order.order_number}</h3>
            {order.isNew && (
              <Badge className="bg-red-500 text-white animate-pulse">
                ใหม่!
              </Badge>
            )}
            <Badge className={`${getStatusColor(order.order_status)} flex items-center space-x-1`}>
              <Clock className="w-3 h-3" />
              <span>{getStatusText(order.order_status)}</span>
            </Badge>
          </div>
          <div className="text-right text-sm text-coffee-600">
            <div>เวลา: {order.created_at}</div>
            {order.estimated_time && (
              <div className="text-green-600">เสร็จ: {order.estimated_time}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ข้อมูลลูกค้าแบบย่อ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-coffee-600" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-coffee-600" />
            <span>{order.customer_phone}</span>
          </div>
        </div>

        {/* ประเภทการส่ง */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-coffee-600" />
            <Badge variant={order.delivery_type === 'delivery' ? 'default' : 'secondary'}>
              {order.delivery_type === 'delivery' ? 'จัดส่ง' : 'รับเอง'}
            </Badge>
            <Badge variant={order.payment_status === 'completed' ? 'default' : 'destructive'}>
              {order.payment_status === 'completed' ? 'ชำระแล้ว' : 'รอชำระ'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-green-600">
            ฿{order.total_amount}
          </div>
        </div>

        {/* จำนวนรายการ */}
        <div className="text-sm text-coffee-600">
          รายการอาหาร: {order.items.length} รายการ ({order.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)
        </div>

        {/* ปุ่มจัดการ */}
        <div className="flex flex-wrap gap-2 pt-2">
          {nextStatus && nextStatusText && (
            <Button 
              onClick={() => onUpdateStatus(order.id, nextStatus as OnlineOrder['order_status'])}
              size="sm"
              className="bg-coffee-600 hover:bg-coffee-700"
            >
              {nextStatusText}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(order)}
          >
            ดูรายละเอียด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineOrderCard;
