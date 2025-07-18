
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Phone, Clock, DollarSign, FileText } from 'lucide-react';
import type { OnlineOrder } from '@/pages/OnlineOrderManagement';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';

interface OrdersListProps {
  orders: OnlineOrder[];
  ordersLoading: boolean;
  onViewOrderDetail: (order: OnlineOrder) => void;
  dateFilter: DateFilter;
}

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  ordersLoading,
  onViewOrderDetail,
  dateFilter
}) => {
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'credit_card': return 'บัตรเครดิต';
      case 'promptpay': return 'พร้อมเพย์';
      case 'online': return 'ออนไลน์';
      default: return method;
    }
  };

  const getDateFilterText = () => {
    switch (dateFilter) {
      case 'today': return 'วันนี้';
      case 'yesterday': return 'เมื่อวาน';
      case 'this_week': return 'สัปดาห์นี้';
      case 'this_month': return 'เดือนนี้';
      case 'this_year': return 'ปีนี้';
      case 'custom': return 'กำหนดเอง';
      default: return 'ทั้งหมด';
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {dateFilter === 'all' ? 'ยังไม่มีออเดอร์ออนไลน์' : `ไม่มีออเดอร์ในช่วง${getDateFilterText()}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  #{order.order_number}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">ลูกค้า:</span>
                      <span>{order.members?.name || 'ไม่ระบุชื่อ'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">เบอร์โทร:</span>
                      <span>{order.members?.phone || 'ไม่ระบุ'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">วันที่สั่ง:</span>
                      <span>{new Date(order.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">รายการ:</span>
                      <span>{order.items_count} รายการ</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">การชำระเงิน:</span>
                      <span>{getPaymentMethodText(order.payment_method)}</span>
                    </div>
                  </div>
                </div>
                
                {order.customer_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">หมายเหตุ:</span>
                        <p className="text-gray-600 mt-1">{order.customer_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-orange-600 mb-3 flex items-center justify-end">
                  <DollarSign className="w-5 h-5 mr-1" />
                  ฿{order.total_amount.toFixed(2)}
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => onViewOrderDetail(order)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    ดูรายละเอียด
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersList;
