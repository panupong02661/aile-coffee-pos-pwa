
import React, { useState } from 'react';
import { Bell, X, Clock, CheckCircle, AlertCircle, Package, User, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOnlineOrders, OnlineOrder } from '@/hooks/useOnlineOrders';
import OnlineOrderCard from '@/components/OnlineOrderCard';

const OnlineOrderManagement = () => {
  const { orders, loading, updateOrderStatus } = useOnlineOrders();
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('new');

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'new': return order.isNew || order.order_status === 'pending';
      case 'preparing': return order.order_status === 'preparing' || order.order_status === 'confirmed';
      case 'ready': return order.order_status === 'ready';
      default: return true;
    }
  });

  const newOrdersCount = orders.filter(order => order.isNew).length;

  const handleUpdateStatus = async (orderId: string, newStatus: OnlineOrder['order_status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (!success) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-coffee-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛒</div>
              <h1 className="text-2xl font-bold text-coffee-800">จัดการออเดอร์ออนไลน์</h1>
              {newOrdersCount > 0 && (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full animate-pulse">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm font-medium">ออเดอร์ใหม่ {newOrdersCount} รายการ</span>
                </div>
              )}
            </div>
            <div className="text-sm text-coffee-600">
              อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-coffee-200 p-4">
              <h3 className="font-semibold text-coffee-800 mb-3">กรองออเดอร์</h3>
              <div className="space-y-2">
                {[
                  { key: 'new', label: 'ออเดอร์ใหม่', count: orders.filter(o => o.isNew || o.order_status === 'pending').length },
                  { key: 'preparing', label: 'กำลังเตรียม', count: orders.filter(o => o.order_status === 'preparing' || o.order_status === 'confirmed').length },
                  { key: 'ready', label: 'พร้อมส่ง', count: orders.filter(o => o.order_status === 'ready').length },
                  { key: 'all', label: 'ทั้งหมด', count: orders.length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      filter === key 
                        ? 'bg-coffee-100 text-coffee-800 font-medium' 
                        : 'text-coffee-600 hover:bg-coffee-50'
                    }`}
                  >
                    <span>{label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1">
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg border border-coffee-200 p-8 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-coffee-600">ไม่มีออเดอร์ในหมวดหมู่นี้</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <OnlineOrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={setSelectedOrder}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-coffee-800">รายละเอียดออเดอร์ {selectedOrder.order_number}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">ลูกค้า:</span> {selectedOrder.customer_name}</div>
                  <div><span className="font-medium">เบอร์โทร:</span> {selectedOrder.customer_phone}</div>
                  <div><span className="font-medium">เวลาสั่ง:</span> {selectedOrder.created_at}</div>
                  <div><span className="font-medium">ประเภท:</span> {selectedOrder.delivery_type === 'delivery' ? 'จัดส่ง' : 'รับเอง'}</div>
                  <div><span className="font-medium">การชำระ:</span> {selectedOrder.payment_status === 'completed' ? 'ชำระแล้ว' : 'รอชำระ'}</div>
                  <div><span className="font-medium">วิธีชำระ:</span> {selectedOrder.payment_method}</div>
                </div>
                
                {selectedOrder.customer_address && (
                  <div>
                    <span className="font-medium">ที่อยู่จัดส่ง:</span>
                    <p className="text-coffee-600 mt-1">{selectedOrder.customer_address}</p>
                  </div>
                )}

                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">รายการอาหาร</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.addons && item.addons.length > 0 && (
                          <div className="text-sm text-coffee-600">+ {item.addons.join(', ')}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div>x{item.quantity}</div>
                        <div className="text-coffee-600">฿{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>รวมทั้งสิ้น:</span>
                    <span className="text-green-600">฿{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineOrderManagement;
