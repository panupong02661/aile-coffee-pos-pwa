
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Calendar, DollarSign, Building, Edit } from 'lucide-react';

const PurchaseOrderManagement = () => {
  const { suppliers, purchaseOrders, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_number: '',
    order_date: '',
    expected_delivery_date: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      order_number: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
    });
    setEditingOrder(null);
  };

  const generateOrderNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        order_number: formData.order_number || generateOrderNumber(),
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('purchase_orders')
          .update(submitData)
          .eq('id', editingOrder.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตใบสั่งซื้อแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('purchase_orders')
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'สร้างใบสั่งซื้อใหม่แล้ว',
        });
      }

      setIsOpen(false);
      resetForm();
      refetch.purchaseOrders();
    } catch (error) {
      console.error('Purchase order error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (order) => {
    setFormData({
      supplier_id: order.supplier_id,
      order_number: order.order_number,
      order_date: order.order_date,
      expected_delivery_date: order.expected_delivery_date || '',
      notes: order.notes || '',
    });
    setEditingOrder(order);
    setIsOpen(true);
  };

  const updateStatus = async (order, status) => {
    try {
      const updateData = { status };
      
      if (status === 'received') {
        updateData.actual_delivery_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตสถานะใบสั่งซื้อแล้ว',
      });

      refetch.purchaseOrders();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'sent': return 'bg-blue-500';
      case 'received': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'sent': return 'ส่งแล้ว';
      case 'received': return 'รับของแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  React.useEffect(() => {
    if (!isOpen && !editingOrder) {
      setFormData(prev => ({
        ...prev,
        order_date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isOpen, editingOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ใบสั่งซื้อ</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              สร้างใบสั่งซื้อ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'แก้ไขใบสั่งซื้อ' : 'สร้างใบสั่งซื้อใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_id">ผู้จำหน่าย *</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกผู้จำหน่าย" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order_number">เลขที่ใบสั่งซื้อ</Label>
                  <Input
                    id="order_number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    placeholder="จะสร้างอัตโนมัติหากไม่ระบุ"
                  />
                </div>
                <div>
                  <Label htmlFor="order_date">วันที่สั่งซื้อ *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expected_delivery_date">วันที่คาดว่าจะได้รับ</Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.supplier_id}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchaseOrders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">ยังไม่มีใบสั่งซื้อ</p>
          </div>
        ) : (
          purchaseOrders.map((order) => (
            <Card key={order.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(order)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Badge 
                  className={`${getStatusColor(order.status)} text-white w-fit`}
                >
                  {getStatusText(order.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="w-4 h-4 mr-2" />
                  {order.suppliers?.name || 'ไม่ระบุผู้จำหน่าย'}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  วันที่สั่ง: {new Date(order.order_date).toLocaleDateString('th-TH')}
                </div>
                {order.expected_delivery_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    คาดว่าจะได้รับ: {new Date(order.expected_delivery_date).toLocaleDateString('th-TH')}
                  </div>
                )}
                {order.actual_delivery_date && (
                  <div className="flex items-center text-sm text-green-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    ได้รับแล้วเมื่อ: {new Date(order.actual_delivery_date).toLocaleDateString('th-TH')}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ฿{order.total_amount.toLocaleString()}
                </div>
                {order.notes && (
                  <div className="text-sm text-muted-foreground">
                    {order.notes}
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order, 'sent')}
                      >
                        ส่งแล้ว
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(order, 'cancelled')}
                      >
                        ยกเลิก
                      </Button>
                    </>
                  )}
                  {order.status === 'sent' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order, 'received')}
                    >
                      รับของแล้ว
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;
