import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, User, Phone, CreditCard, Package, MapPin, FileText, Receipt } from 'lucide-react';
import OrderReceiptView from './OrderReceiptView';
interface OrderItem {
  id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_discount: number;
  selected_addons: any;
}

interface OrderDetails {
  id: string;
  order_number: string;
  member_name?: string;
  member_phone?: string;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  member_id?: string;
  bill_discount?: number;
  bill_discount_type?: string;
  customer_notes?: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const OrderDetailsModal = ({ isOpen, onClose, orderId }: OrderDetailsModalProps) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Get member details if member_id exists
      let memberData = null;
      if (orderData.member_id) {
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('name, phone')
          .eq('id', orderData.member_id)
          .single();

        if (!memberError) {
          memberData = member;
        }
      }

      const details: OrderDetails = {
        id: orderData.id,
        order_number: orderData.order_number,
        member_name: memberData?.name,
        member_phone: memberData?.phone,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_status: (orderData as any).payment_status || 'completed',
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        member_id: orderData.member_id,
        bill_discount: orderData.bill_discount,
        bill_discount_type: orderData.bill_discount_type,
        customer_notes: orderData.customer_notes,
        items: (itemsData || []).map(item => {
          let addons = item.selected_addons;
          // Parse if it's a string
          if (typeof addons === 'string') {
            try {
              addons = JSON.parse(addons);
            } catch (e) {
              addons = [];
            }
          }
          return {
            ...item,
            selected_addons: Array.isArray(addons) ? addons : []
          };
        })
      };

      setOrderDetails(details);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรายละเอียดออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails(orderId);
    }
  }, [isOpen, orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'mobile_banking': return 'bg-purple-100 text-purple-800';
      case 'points': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'card': return 'บัตรเครดิต';
      case 'mobile_banking': return 'โมบายแบงก์กิ้ง';
      case 'points': return 'แต้ม';
      default: return method;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมส่ง';
      case 'completed': return 'เสร็จสิ้น';
      default: return 'เสร็จสิ้น';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            รายละเอียดออเดอร์
          </DialogTitle>
          <DialogDescription>
            ข้อมูลครบถ้วนของออเดอร์
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orderDetails ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="gap-2">
                <FileText className="w-4 h-4" />
                รายละเอียด
              </TabsTrigger>
              <TabsTrigger value="receipt" className="gap-2">
                <Receipt className="w-4 h-4" />
                ใบเสร็จ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ข้อมูลออเดอร์</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">เลขออเดอร์:</span>
                      <span className="font-medium">{orderDetails.order_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">วันที่สั่ง:</span>
                      <span className="font-medium">{formatDate(orderDetails.created_at)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">วิธีการชำระ:</span>
                      <Badge className={getStatusBadgeColor(orderDetails.payment_method)}>
                        {getPaymentMethodText(orderDetails.payment_method)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">สถานะ:</span>
                      <Badge className={getStatusBadgeColor(orderDetails.payment_status || 'completed')}>
                        {getStatusText(orderDetails.payment_status || 'completed')}
                      </Badge>
                    </div>
                  </div>

                  {orderDetails.member_name && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">สมาชิก:</span>
                        <span className="font-medium">{orderDetails.member_name}</span>
                      </div>
                      {orderDetails.member_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">เบอร์โทร:</span>
                          <span className="font-medium">{orderDetails.member_phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {orderDetails.customer_notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">หมายเหตุ:</span>
                      <p className="mt-1 text-sm bg-muted p-2 rounded">{orderDetails.customer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">รายการสินค้า</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.menu_item_name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span>จำนวน: {item.quantity}</span>
                            <span className="mx-2">•</span>
                            <span>ราคาต่อหน่วย: ฿{item.unit_price.toLocaleString()}</span>
                          </div>
                          {item.selected_addons && Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>ตัวเลือกเพิ่มเติม: </span>
                              {item.selected_addons.map((addon: any, idx: number) => (
                                <span key={idx}>
                                  {addon.name} {addon.price > 0 && `(+฿${addon.price})`}
                                  {idx < item.selected_addons.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.item_discount > 0 && (
                            <div className="text-sm text-destructive mt-1">
                              ส่วนลด: -฿{item.item_discount.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">฿{item.total_price.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">สรุปการสั่งซื้อ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>ยอดรวมสินค้า:</span>
                      <span>฿{orderDetails.items.reduce((sum, item) => sum + item.total_price + (item.item_discount || 0), 0).toLocaleString()}</span>
                    </div>
                    {orderDetails.bill_discount && orderDetails.bill_discount > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>ส่วนลดท้ายบิล:</span>
                        <span>-฿{orderDetails.bill_discount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>ยอดชำระสุทธิ:</span>
                      <span>฿{orderDetails.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="receipt" className="mt-4">
              <OrderReceiptView
                orderNumber={orderDetails.order_number}
                orderDate={orderDetails.created_at}
                items={orderDetails.items}
                totalAmount={orderDetails.total_amount}
                billDiscount={orderDetails.bill_discount}
                paymentMethod={orderDetails.payment_method}
                memberName={orderDetails.member_name}
                memberPhone={orderDetails.member_phone}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            ไม่พบข้อมูลออเดอร์
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;