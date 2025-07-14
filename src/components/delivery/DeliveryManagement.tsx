
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Truck, UserPlus, MapPin, Phone, Edit, Trash2 } from 'lucide-react';

const DeliveryManagement = () => {
  const { deliveryDrivers, deliveryAssignments, refetch } = useSupabaseData();
  const { toast } = useToast();
  
  // Driver management state
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isDriverSubmitting, setIsDriverSubmitting] = useState(false);
  
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    license_number: '',
    vehicle_type: '',
    vehicle_number: '',
  });

  // Assignment management state  
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isAssignmentSubmitting, setIsAssignmentSubmitting] = useState(false);
  
  const [assignmentForm, setAssignmentForm] = useState({
    driver_id: '',
    delivery_address: '',
    delivery_fee: 0,
    estimated_delivery_time: '',
    notes: '',
  });

  const resetDriverForm = () => {
    setDriverForm({
      name: '',
      phone: '',
      license_number: '',
      vehicle_type: '',
      vehicle_number: '',
    });
    setEditingDriver(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      driver_id: '',
      delivery_address: '',
      delivery_fee: 0,
      estimated_delivery_time: '',
      notes: '',
    });
    setEditingAssignment(null);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setIsDriverSubmitting(true);

    try {
      if (editingDriver) {
        const { error } = await supabase
          .from('delivery_drivers')
          .update(driverForm)
          .eq('id', editingDriver.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตข้อมูลคนขับแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('delivery_drivers')
          .insert([driverForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มคนขับใหม่แล้ว',
        });
      }

      setIsDriverOpen(false);
      resetDriverForm();
      refetch.deliveryDrivers();
    } catch (error) {
      console.error('Driver error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsDriverSubmitting(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setIsAssignmentSubmitting(true);

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('delivery_assignments')
          .update(assignmentForm)
          .eq('id', editingAssignment.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตการจัดส่งแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('delivery_assignments')
          .insert([assignmentForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'สร้างการจัดส่งใหม่แล้ว',
        });
      }

      setIsAssignmentOpen(false);
      resetAssignmentForm();
      refetch.deliveryAssignments();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsAssignmentSubmitting(false);
    }
  };

  const handleEditDriver = (driver) => {
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number || '',
      vehicle_type: driver.vehicle_type || '',
      vehicle_number: driver.vehicle_number || '',
    });
    setEditingDriver(driver);
    setIsDriverOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentForm({
      driver_id: assignment.driver_id || '',
      delivery_address: assignment.delivery_address,
      delivery_fee: assignment.delivery_fee,
      estimated_delivery_time: assignment.estimated_delivery_time ? 
        new Date(assignment.estimated_delivery_time).toISOString().slice(0, 16) : '',
      notes: assignment.notes || '',
    });
    setEditingAssignment(assignment);
    setIsAssignmentOpen(true);
  };

  const updateDriverStatus = async (driver, status) => {
    try {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ status })
        .eq('id', driver.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: `อัปเดตสถานะคนขับแล้ว`,
      });

      refetch.deliveryDrivers();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const updateAssignmentStatus = async (assignment, status) => {
    try {
      const updateData = { status };
      
      // Set pickup/delivery time based on status
      if (status === 'picked_up') {
        updateData.pickup_time = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivery_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('delivery_assignments')
        .update(updateData)
        .eq('id', assignment.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตสถานะการจัดส่งแล้ว',
      });

      refetch.deliveryAssignments();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getDriverStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getDriverStatusText = (status) => {
    switch (status) {
      case 'available': return 'ว่าง';
      case 'busy': return 'ไม่ว่าง';
      case 'offline': return 'ออฟไลน์';
      default: return status;
    }
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'on_route': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAssignmentStatusText = (status) => {
    switch (status) {
      case 'assigned': return 'มอบหมายแล้ว';
      case 'picked_up': return 'รับของแล้ว';
      case 'on_route': return 'กำลังส่ง';
      case 'delivered': return 'ส่งแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการการจัดส่ง</h1>
      </div>

      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drivers">คนขับ</TabsTrigger>
          <TabsTrigger value="assignments">การจัดส่ง</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDriverOpen} onOpenChange={setIsDriverOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetDriverForm}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    เพิ่มคนขับ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingDriver ? 'แก้ไขคนขับ' : 'เพิ่มคนขับใหม่'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDriverSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="driver-name">ชื่อ *</Label>
                      <Input
                        id="driver-name"
                        value={driverForm.name}
                        onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                        required
                        placeholder="ชื่อคนขับ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driver-phone">เบอร์โทรศัพท์ *</Label>
                      <Input
                        id="driver-phone"
                        value={driverForm.phone}
                        onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                        required
                        placeholder="0X-XXXX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="license-number">เลขใบขับขี่</Label>
                      <Input
                        id="license-number"
                        value={driverForm.license_number}
                        onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })}
                        placeholder="เลขใบขับขี่"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicle-type">ประเภทยานพาหนะ</Label>
                      <Select
                        value={driverForm.vehicle_type}
                        onValueChange={(value) => setDriverForm({ ...driverForm, vehicle_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="motorcycle">รถจักรยานยนต์</SelectItem>
                          <SelectItem value="car">รถยนต์</SelectItem>
                          <SelectItem value="truck">รถกระบะ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vehicle-number">ทะเบียนรถ</Label>
                      <Input
                        id="vehicle-number"
                        value={driverForm.vehicle_number}
                        onChange={(e) => setDriverForm({ ...driverForm, vehicle_number: e.target.value })}
                        placeholder="ทะเบียนรถ"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDriverOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={isDriverSubmitting || !driverForm.name || !driverForm.phone}>
                        {isDriverSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryDrivers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">ยังไม่มีคนขับ</p>
                </div>
              ) : (
                deliveryDrivers.map((driver) => (
                  <Card key={driver.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDriver(driver)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge 
                        className={`${getDriverStatusColor(driver.status)} text-white w-fit`}
                      >
                        {getDriverStatusText(driver.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        {driver.phone}
                      </div>
                      {driver.vehicle_type && (
                        <div className="text-sm">
                          <strong>ยานพาหนะ:</strong> {driver.vehicle_type}
                        </div>
                      )}
                      {driver.vehicle_number && (
                        <div className="text-sm">
                          <strong>ทะเบียน:</strong> {driver.vehicle_number}
                        </div>
                      )}
                      {driver.license_number && (
                        <div className="text-sm">
                          <strong>ใบขับขี่:</strong> {driver.license_number}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        {driver.status !== 'available' && (
                          <Button
                            size="sm"
                            onClick={() => updateDriverStatus(driver, 'available')}
                          >
                            ว่าง
                          </Button>
                        )}
                        {driver.status !== 'busy' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDriverStatus(driver, 'busy')}
                          >
                            ไม่ว่าง
                          </Button>
                        )}
                        {driver.status !== 'offline' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateDriverStatus(driver, 'offline')}
                          >
                            ออฟไลน์
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetAssignmentForm}>
                    <MapPin className="w-4 h-4 mr-2" />
                    สร้างการจัดส่ง
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAssignment ? 'แก้ไขการจัดส่ง' : 'สร้างการจัดส่งใหม่'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="assignment-driver">คนขับ *</Label>
                      <Select
                        value={assignmentForm.driver_id}
                        onValueChange={(value) => setAssignmentForm({ ...assignmentForm, driver_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกคนขับ" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryDrivers
                            .filter(driver => driver.status === 'available')
                            .map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name} ({driver.vehicle_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="delivery-address">ที่อยู่จัดส่ง *</Label>
                      <Textarea
                        id="delivery-address"
                        value={assignmentForm.delivery_address}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, delivery_address: e.target.value })}
                        required
                        placeholder="ที่อยู่สำหรับจัดส่ง"
                        className="min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery-fee">ค่าจัดส่ง</Label>
                      <Input
                        id="delivery-fee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={assignmentForm.delivery_fee}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, delivery_fee: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimated-time">เวลาที่คาดว่าจะส่งถึง</Label>
                      <Input
                        id="estimated-time"
                        type="datetime-local"
                        value={assignmentForm.estimated_delivery_time}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, estimated_delivery_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignment-notes">หมายเหตุ</Label>
                      <Textarea
                        id="assignment-notes"
                        value={assignmentForm.notes}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                        placeholder="หมายเหตุเพิ่มเติม..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAssignmentOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isAssignmentSubmitting || !assignmentForm.driver_id || !assignmentForm.delivery_address}
                      >
                        {isAssignmentSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryAssignments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">ยังไม่มีการจัดส่ง</p>
                </div>
              ) : (
                deliveryAssignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          การจัดส่ง #{assignment.id.slice(-6)}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge 
                        className={`${getAssignmentStatusColor(assignment.status)} text-white w-fit`}
                      >
                        {getAssignmentStatusText(assignment.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>คนขับ:</strong> {assignment.delivery_drivers?.name || 'ไม่ระบุ'}
                      </div>
                      <div className="text-sm">
                        <strong>ที่อยู่:</strong> {assignment.delivery_address}
                      </div>
                      {assignment.delivery_fee > 0 && (
                        <div className="text-sm">
                          <strong>ค่าจัดส่ง:</strong> ฿{assignment.delivery_fee.toLocaleString()}
                        </div>
                      )}
                      {assignment.estimated_delivery_time && (
                        <div className="text-sm">
                          <strong>เวลาที่คาดว่าจะส่งถึง:</strong> {' '}
                          {new Date(assignment.estimated_delivery_time).toLocaleString('th-TH')}
                        </div>
                      )}
                      {assignment.pickup_time && (
                        <div className="text-sm text-green-600">
                          <strong>รับของแล้วเมื่อ:</strong> {new Date(assignment.pickup_time).toLocaleString('th-TH')}
                        </div>
                      )}
                      {assignment.delivery_time && (
                        <div className="text-sm text-blue-600">
                          <strong>ส่งแล้วเมื่อ:</strong> {new Date(assignment.delivery_time).toLocaleString('th-TH')}
                        </div>
                      )}
                      {assignment.notes && (
                        <div className="text-sm text-muted-foreground">
                          {assignment.notes}
                        </div>
                      )}
                      
                      {assignment.status === 'assigned' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment, 'picked_up')}
                          >
                            รับของแล้ว
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAssignmentStatus(assignment, 'cancelled')}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                      
                      {assignment.status === 'picked_up' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment, 'on_route')}
                          >
                            กำลังส่ง
                          </Button>
                        </div>
                      )}
                      
                      {assignment.status === 'on_route' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment, 'delivered')}
                          >
                            ส่งแล้ว
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryManagement;
