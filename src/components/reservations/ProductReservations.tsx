
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
import { Package, Calendar, Clock, DollarSign, Edit } from 'lucide-react';

const ProductReservations = () => {
  const { menuItems, members, productReservations, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    menu_item_id: '',
    quantity: 1,
    reservation_date: '',
    pickup_time: '',
    deposit_amount: 0,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      customer_id: '',
      menu_item_id: '',
      quantity: 1,
      reservation_date: '',
      pickup_time: '',
      deposit_amount: 0,
      notes: '',
    });
    setEditingReservation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingReservation) {
        const { error } = await supabase
          .from('product_reservations')
          .update(formData)
          .eq('id', editingReservation.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตการจองสินค้าแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('product_reservations')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'จองสินค้าเรียบร้อยแล้ว',
        });
      }

      setIsOpen(false);
      resetForm();
      refetch.productReservations();
    } catch (error) {
      console.error('Product reservation error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการจองได้',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (reservation) => {
    setFormData({
      customer_id: reservation.customer_id || '',
      menu_item_id: reservation.menu_item_id || '',
      quantity: reservation.quantity,
      reservation_date: reservation.reservation_date,
      pickup_time: reservation.pickup_time || '',
      deposit_amount: reservation.deposit_amount,
      notes: reservation.notes || '',
    });
    setEditingReservation(reservation);
    setIsOpen(true);
  };

  const updateStatus = async (reservation, status) => {
    try {
      const { error } = await supabase
        .from('product_reservations')
        .update({ status })
        .eq('id', reservation.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตสถานะการจองแล้ว',
      });

      refetch.productReservations();
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
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'กำลังจอง';
      case 'cancelled': return 'ยกเลิก';
      case 'completed': return 'เสร็จสิ้น';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">การจองสินค้า</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Package className="w-4 h-4 mr-2" />
              จองสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? 'แก้ไขการจอง' : 'จองสินค้าใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">ลูกค้า *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกลูกค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="menu_item_id">สินค้า *</Label>
                  <Select
                    value={formData.menu_item_id}
                    onValueChange={(value) => setFormData({ ...formData, menu_item_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (฿{item.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">จำนวน</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="deposit_amount">มัดจำ</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="reservation_date">วันที่จอง</Label>
                  <Input
                    id="reservation_date"
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickup_time">เวลารับสินค้า</Label>
                  <Input
                    id="pickup_time"
                    type="time"
                    value={formData.pickup_time}
                    onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
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
                <Button type="submit" disabled={isSubmitting || !formData.customer_id || !formData.menu_item_id}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productReservations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">ยังไม่มีการจองสินค้า</p>
          </div>
        ) : (
          productReservations.map((reservation) => (
            <Card key={reservation.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {reservation.menu_items?.name || 'ไม่ระบุสินค้า'}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(reservation)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Badge 
                  className={`${getStatusColor(reservation.status)} text-white w-fit`}
                >
                  {getStatusText(reservation.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>ลูกค้า:</strong> {reservation.members?.name || 'ไม่ระบุ'}
                </div>
                <div className="text-sm">
                  <strong>จำนวน:</strong> {reservation.quantity} ชิ้น
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(reservation.reservation_date).toLocaleDateString('th-TH')}
                </div>
                {reservation.pickup_time && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {reservation.pickup_time}
                  </div>
                )}
                {reservation.deposit_amount > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" />
                    มัดจำ ฿{reservation.deposit_amount.toLocaleString()}
                  </div>
                )}
                {reservation.notes && (
                  <div className="text-sm text-muted-foreground">
                    {reservation.notes}
                  </div>
                )}
                
                {reservation.status === 'active' && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(reservation, 'completed')}
                    >
                      เสร็จสิ้น
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(reservation, 'cancelled')}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReservations;
