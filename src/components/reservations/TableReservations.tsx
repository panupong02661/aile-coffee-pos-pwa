
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
import { Calendar, Clock, Users, Phone, Edit, Trash2 } from 'lucide-react';

const TableReservations = () => {
  const { tables, tableReservations, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    table_id: '',
    customer_name: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      table_id: '',
      customer_name: '',
      customer_phone: '',
      reservation_date: '',
      reservation_time: '',
      party_size: 2,
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
          .from('table_reservations')
          .update(formData)
          .eq('id', editingReservation.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตการจองแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('table_reservations')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'จองโต๊ะเรียบร้อยแล้ว',
        });
      }

      setIsOpen(false);
      resetForm();
      refetch.tableReservations();
    } catch (error) {
      console.error('Reservation error:', error);
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
      table_id: reservation.table_id || '',
      customer_name: reservation.customer_name,
      customer_phone: reservation.customer_phone || '',
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      party_size: reservation.party_size,
      notes: reservation.notes || '',
    });
    setEditingReservation(reservation);
    setIsOpen(true);
  };

  const updateStatus = async (reservation, status) => {
    try {
      const { error } = await supabase
        .from('table_reservations')
        .update({ status })
        .eq('id', reservation.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: `อัปเดตสถานะการจองแล้ว`,
      });

      refetch.tableReservations();
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
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'cancelled': return 'ยกเลิก';
      case 'completed': return 'เสร็จสิ้น';
      case 'no_show': return 'ไม่มาตามนัด';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">การจองโต๊ะ</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Calendar className="w-4 h-4 mr-2" />
              จองโต๊ะใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? 'แก้ไขการจอง' : 'จองโต๊ะใหม่'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">ชื่อลูกค้า *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    placeholder="ชื่อผู้จอง"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="0X-XXXX-XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="table_id">โต๊ะ</Label>
                  <Select
                    value={formData.table_id}
                    onValueChange={(value) => setFormData({ ...formData, table_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกโต๊ะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          โต๊ะ {table.table_number} ({table.capacity} ที่นั่ง)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="party_size">จำนวนคน</Label>
                  <Input
                    id="party_size"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.party_size}
                    onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) || 2 })}
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
                  <Label htmlFor="reservation_time">เวลา</Label>
                  <Input
                    id="reservation_time"
                    type="time"
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    required
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
                <Button type="submit" disabled={isSubmitting || !formData.customer_name}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableReservations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">ยังไม่มีการจองโต๊ะ</p>
          </div>
        ) : (
          tableReservations.map((reservation) => (
            <Card key={reservation.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
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
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(reservation.reservation_date).toLocaleDateString('th-TH')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {reservation.reservation_time}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  {reservation.party_size} คน
                </div>
                {reservation.customer_phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {reservation.customer_phone}
                  </div>
                )}
                {reservation.tables && (
                  <div className="text-sm">
                    โต๊ะ: {reservation.tables.table_number}
                  </div>
                )}
                {reservation.notes && (
                  <div className="text-sm text-muted-foreground">
                    {reservation.notes}
                  </div>
                )}
                
                {reservation.status === 'confirmed' && (
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
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus(reservation, 'no_show')}
                    >
                      ไม่มา
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

export default TableReservations;
