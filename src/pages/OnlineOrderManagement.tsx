
import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, CheckCircle, AlertCircle, Package, User, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  addons?: string[];
}

interface OnlineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'รอดำเนินการ' | 'รับออเดอร์แล้ว' | 'กำลังเตรียม' | 'พร้อมส่ง' | 'ส่งแล้ว' | 'เสร็จสิ้น';
  orderType: 'รับเอง' | 'จัดส่ง';
  paymentStatus: 'รอชำระ' | 'ชำระแล้ว';
  paymentMethod: string;
  orderTime: string;
  estimatedTime?: string;
  isNew?: boolean;
}

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'ready'>('new');

  // Mock data - ในการใช้งานจริงจะดึงจาก API
  useEffect(() => {
    const mockOrders: OnlineOrder[] = [
      {
        id: '1',
        orderNumber: '#OL001',
        customerName: 'คุณสมชาย ใจดี',
        customerPhone: '081-234-5678',
        customerAddress: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
        items: [
          { id: '1', name: 'ผัดไทย', quantity: 2, price: 60, addons: ['ไข่ดาว', 'กุ้งเพิ่ม'] },
          { id: '2', name: 'ต้มยำกุ้ง', quantity: 1, price: 120 },
          { id: '3', name: 'ชาไทย', quantity: 2, price: 25 }
        ],
        totalAmount: 290,
        status: 'รอดำเนินการ',
        orderType: 'จัดส่ง',
        paymentStatus: 'ชำระแล้ว',
        paymentMethod: 'PromptPay',
        orderTime: '13:45',
        isNew: true
      },
      {
        id: '2',
        orderNumber: '#OL002',
        customerName: 'คุณสุภา วงศ์ดี',
        customerPhone: '082-345-6789',
        items: [
          { id: '1', name: 'ข้าวผัดปู', quantity: 1, price: 80 },
          { id: '2', name: 'น้ำส้มคั้น', quantity: 1, price: 35 }
        ],
        totalAmount: 115,
        status: 'กำลังเตรียม',
        orderType: 'รับเอง',
        paymentStatus: 'ชำระแล้ว',
        paymentMethod: 'เงินสด',
        orderTime: '13:30',
        estimatedTime: '14:00'
      },
      {
        id: '3',
        orderNumber: '#OL003',
        customerName: 'คุณมาลี ดอกไม้',
        customerPhone: '083-456-7890',
        customerAddress: '456 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
        items: [
          { id: '1', name: 'แกงเขียวหวานไก่', quantity: 1, price: 90 },
          { id: '2', name: 'ส้มตำไทย', quantity: 1, price: 45 },
          { id: '3', name: 'ข้าวเหนียว', quantity: 1, price: 20 }
        ],
        totalAmount: 155,
        status: 'พร้อมส่ง',
        orderType: 'จัดส่ง',
        paymentStatus: 'ชำระแล้ว',
        paymentMethod: 'บัตรเครดิต',
        orderTime: '13:15',
        estimatedTime: '14:15'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'รอดำเนินการ': return 'bg-red-100 text-red-800 border-red-200';
      case 'รับออเดอร์แล้ว': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'กำลังเตรียม': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'พร้อมส่ง': return 'bg-green-100 text-green-800 border-green-200';
      case 'ส่งแล้ว': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'เสร็จสิ้น': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'รอดำเนินการ': return <AlertCircle className="w-4 h-4" />;
      case 'รับออเดอร์แล้ว': return <CheckCircle className="w-4 h-4" />;
      case 'กำลังเตรียม': return <Clock className="w-4 h-4" />;
      case 'พร้อมส่ง': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, isNew: false }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'new': return order.isNew || order.status === 'รอดำเนินการ';
      case 'preparing': return order.status === 'กำลังเตรียม' || order.status === 'รับออเดอร์แล้ว';
      case 'ready': return order.status === 'พร้อมส่ง';
      default: return true;
    }
  });

  const newOrdersCount = orders.filter(order => order.isNew).length;

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
                  { key: 'new', label: 'ออเดอร์ใหม่', count: orders.filter(o => o.isNew || o.status === 'รอดำเนินการ').length },
                  { key: 'preparing', label: 'กำลังเตรียม', count: orders.filter(o => o.status === 'กำลังเตรียม' || o.status === 'รับออเดอร์แล้ว').length },
                  { key: 'ready', label: 'พร้อมส่ง', count: orders.filter(o => o.status === 'พร้อมส่ง').length },
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
                  <Card key={order.id} className={`transition-all hover:shadow-md ${order.isNew ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                          {order.isNew && (
                            <Badge className="bg-red-500 text-white animate-pulse">
                              ใหม่!
                            </Badge>
                          )}
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-coffee-600">เวลา: {order.orderTime}</div>
                          {order.estimatedTime && (
                            <div className="text-sm text-green-600">เสร็จ: {order.estimatedTime}</div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-cream-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-coffee-600" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-coffee-600" />
                          <span>{order.customerPhone}</span>
                        </div>
                        {order.customerAddress && (
                          <div className="flex items-start space-x-2 md:col-span-2">
                            <MapPin className="w-4 h-4 text-coffee-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-coffee-600">{order.customerAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-4">
                          <Badge variant={order.orderType === 'จัดส่ง' ? 'default' : 'secondary'}>
                            {order.orderType}
                          </Badge>
                          <Badge variant={order.paymentStatus === 'ชำระแล้ว' ? 'default' : 'destructive'}>
                            {order.paymentStatus}
                          </Badge>
                          <span className="text-sm text-coffee-600">{order.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-coffee-800 mb-2">รายการอาหาร</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-coffee-800">{item.name}</div>
                                {item.addons && item.addons.length > 0 && (
                                  <div className="text-sm text-coffee-600">
                                    เพิ่มเติม: {item.addons.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">x{item.quantity}</div>
                                <div className="text-sm text-coffee-600">฿{item.price * item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center font-bold text-lg text-coffee-800">
                          <span>รวมทั้งสิ้น:</span>
                          <span className="text-green-600">฿{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {order.status === 'รอดำเนินการ' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'รับออเดอร์แล้ว')}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            รับออเดอร์
                          </Button>
                        )}
                        {order.status === 'รับออเดอร์แล้ว' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'กำลังเตรียม')}
                            className="bg-yellow-500 hover:bg-yellow-600"
                          >
                            เริ่มเตรียม
                          </Button>
                        )}
                        {order.status === 'กำลังเตรียม' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'พร้อมส่ง')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            เตรียมเสร็จ
                          </Button>
                        )}
                        {order.status === 'พร้อมส่ง' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, order.orderType === 'จัดส่ง' ? 'ส่งแล้ว' : 'เสร็จสิ้น')}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            {order.orderType === 'จัดส่ง' ? 'ส่งออก' : 'มอบให้ลูกค้า'}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedOrder(order)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                <h2 className="text-xl font-bold text-coffee-800">รายละเอียดออเดอร์ {selectedOrder.orderNumber}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">ลูกค้า:</span> {selectedOrder.customerName}</div>
                  <div><span className="font-medium">เบอร์โทร:</span> {selectedOrder.customerPhone}</div>
                  <div><span className="font-medium">เวลาสั่ง:</span> {selectedOrder.orderTime}</div>
                  <div><span className="font-medium">ประเภท:</span> {selectedOrder.orderType}</div>
                  <div><span className="font-medium">การชำระ:</span> {selectedOrder.paymentStatus}</div>
                  <div><span className="font-medium">วิธีชำระ:</span> {selectedOrder.paymentMethod}</div>
                </div>
                
                {selectedOrder.customerAddress && (
                  <div>
                    <span className="font-medium">ที่อยู่จัดส่ง:</span>
                    <p className="text-coffee-600 mt-1">{selectedOrder.customerAddress}</p>
                  </div>
                )}

                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">รายการอาหาร</h3>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
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
                    <span className="text-green-600">฿{selectedOrder.totalAmount}</span>
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
