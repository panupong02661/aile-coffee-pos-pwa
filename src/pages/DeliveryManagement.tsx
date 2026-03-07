import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Truck, Plus, MapPin, Clock, User, Phone, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  status: string;
  is_active: boolean;
}

interface DeliveryAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  driver_name?: string;
  delivery_address: string;
  delivery_fee: number;
  status: string;
  pickup_time: string;
  delivery_time: string;
  estimated_delivery_time: string;
}

const DeliveryManagement = () => {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null);

  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    vehicle_type: 'motorcycle',
    vehicle_number: '',
    license_number: '',
    is_active: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadDrivers(), loadAssignments()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrivers = async () => {
    const { data, error } = await supabase
      .from('delivery_drivers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลพนักงานส่งได้', variant: 'destructive' });
      return;
    }
    setDrivers(data || []);
  };

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`*, delivery_drivers:driver_id (name)`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลการจัดส่งได้', variant: 'destructive' });
      return;
    }
    setAssignments(data?.map(a => ({ ...a, driver_name: (a as any).delivery_drivers?.name || 'ไม่ระบุ' })) || []);
  };

  const resetForm = () => {
    setDriverForm({ name: '', phone: '', vehicle_type: 'motorcycle', vehicle_number: '', license_number: '', is_active: true });
    setEditingDriver(null);
  };

  const openEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type || 'motorcycle',
      vehicle_number: driver.vehicle_number || '',
      license_number: driver.license_number || '',
      is_active: driver.is_active,
    });
    setIsDriverDialogOpen(true);
  };

  const handleSaveDriver = async () => {
    if (!driverForm.name || !driverForm.phone) {
      toast({ title: 'กรุณากรอกข้อมูล', description: 'กรุณากรอกชื่อและเบอร์โทรศัพท์', variant: 'destructive' });
      return;
    }

    if (editingDriver) {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ ...driverForm })
        .eq('id', editingDriver.id);
      if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
      toast({ title: 'แก้ไขพนักงานส่งสำเร็จ ✅' });
    } else {
      const { error } = await supabase
        .from('delivery_drivers')
        .insert([{ ...driverForm, status: 'available' }]);
      if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
      toast({ title: 'เพิ่มพนักงานส่งสำเร็จ ✅' });
    }

    setIsDriverDialogOpen(false);
    resetForm();
    loadDrivers();
  };

  const handleDeleteDriver = async () => {
    if (!deleteDriverId) return;
    const { error } = await supabase
      .from('delivery_drivers')
      .update({ is_active: false })
      .eq('id', deleteDriverId);
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
    toast({ title: 'ลบพนักงานส่งสำเร็จ' });
    setDeleteDriverId(null);
    loadDrivers();
  };

  const updateDriverStatus = async (driverId: string, status: string) => {
    const { error } = await supabase
      .from('delivery_drivers')
      .update({ status })
      .eq('id', driverId);
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
    toast({ title: 'อัปเดตสถานะสำเร็จ ✅' });
    loadDrivers();
  };

  const updateDeliveryStatus = async (assignmentId: string, status: string) => {
    const updateData: any = { status };
    if (status === 'picked_up') updateData.pickup_time = new Date().toISOString();
    else if (status === 'delivered') updateData.delivery_time = new Date().toISOString();

    const { error } = await supabase.from('delivery_assignments').update(updateData).eq('id', assignmentId);
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
    toast({ title: 'อัปเดตสถานะการจัดส่งสำเร็จ ✅' });
    loadAssignments();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      assigned: { label: 'มอบหมายแล้ว', variant: 'secondary' },
      picked_up: { label: 'รับของแล้ว', variant: 'default' },
      in_transit: { label: 'กำลังส่ง', variant: 'default' },
      delivered: { label: 'ส่งแล้ว', variant: 'default' },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' },
      available: { label: 'พร้อมใช้งาน', variant: 'default' },
      busy: { label: 'ไม่ว่าง', variant: 'secondary' },
      offline: { label: 'ออฟไลน์', variant: 'secondary' },
    };
    const c = config[status] || { label: status, variant: 'secondary' };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available' && d.is_active).length,
    activeDeliveries: assignments.filter(a => ['assigned', 'picked_up', 'in_transit'].includes(a.status)).length,
    completedToday: assignments.filter(a =>
      a.status === 'delivered' &&
      new Date(a.delivery_time).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 md:ml-[56px] px-3 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Truck className="w-7 h-7 text-primary" />
              จัดการการจัดส่ง
            </h1>
            <p className="text-muted-foreground mt-1">จัดการพนักงานส่งและติดตามสถานะการจัดส่ง</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">พนักงานส่งทั้งหมด</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalDrivers}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">พร้อมใช้งาน</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.availableDrivers}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">กำลังจัดส่ง</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.activeDeliveries}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">ส่งสำเร็จวันนี้</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{stats.completedToday}</div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Drivers List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">พนักงานส่ง</CardTitle>
                  <Dialog open={isDriverDialogOpen} onOpenChange={(o) => { setIsDriverDialogOpen(o); if (!o) resetForm(); }}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> เพิ่ม</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingDriver ? 'แก้ไขพนักงานส่ง' : 'เพิ่มพนักงานส่ง'}</DialogTitle>
                        <DialogDescription>กรอกข้อมูลพนักงานส่ง</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>ชื่อ-นามสกุล</Label>
                          <Input value={driverForm.name} onChange={e => setDriverForm(p => ({ ...p, name: e.target.value }))} placeholder="สมชาย ใจดี" />
                        </div>
                        <div className="space-y-2">
                          <Label>เบอร์โทรศัพท์</Label>
                          <Input value={driverForm.phone} onChange={e => setDriverForm(p => ({ ...p, phone: e.target.value }))} placeholder="08X-XXX-XXXX" />
                        </div>
                        <div className="space-y-2">
                          <Label>ประเภทยานพาหนะ</Label>
                          <Select value={driverForm.vehicle_type} onValueChange={v => setDriverForm(p => ({ ...p, vehicle_type: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="motorcycle">มอเตอร์ไซค์</SelectItem>
                              <SelectItem value="car">รถยนต์</SelectItem>
                              <SelectItem value="bicycle">จักรยาน</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>ทะเบียนรถ</Label>
                          <Input value={driverForm.vehicle_number} onChange={e => setDriverForm(p => ({ ...p, vehicle_number: e.target.value }))} placeholder="กก 1234 กรุงเทพ" />
                        </div>
                        <div className="space-y-2">
                          <Label>เลขที่ใบขับขี่</Label>
                          <Input value={driverForm.license_number} onChange={e => setDriverForm(p => ({ ...p, license_number: e.target.value }))} placeholder="12345678" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => { setIsDriverDialogOpen(false); resetForm(); }}>ยกเลิก</Button>
                          <Button onClick={handleSaveDriver}>{editingDriver ? 'บันทึก' : 'เพิ่ม'}</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {drivers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">ยังไม่มีพนักงานส่ง</p>
                )}
                {drivers.map(driver => (
                  <div key={driver.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{driver.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {driver.phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {driver.vehicle_type === 'motorcycle' ? 'มอเตอร์ไซค์' : driver.vehicle_type === 'car' ? 'รถยนต์' : 'จักรยาน'} - {driver.vehicle_number || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {getStatusBadge(driver.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select value={driver.status} onValueChange={v => updateDriverStatus(driver.id, v)}>
                        <SelectTrigger className="h-8 flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">พร้อมใช้งาน</SelectItem>
                          <SelectItem value="busy">ไม่ว่าง</SelectItem>
                          <SelectItem value="offline">ออฟไลน์</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditDriver(driver)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteDriverId(driver.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Assignments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">รายการจัดส่ง</CardTitle>
                  <CardDescription>ติดตามสถานะการจัดส่ง</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                  ) : assignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">ยังไม่มีรายการจัดส่ง</div>
                  ) : (
                    assignments.map(assignment => (
                      <div key={assignment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">Order #{assignment.order_id?.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="w-3 h-3" /> {assignment.driver_name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {assignment.delivery_address}
                            </p>
                            {assignment.estimated_delivery_time && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                ถึงโดยประมาณ: {new Date(assignment.estimated_delivery_time).toLocaleTimeString('th-TH')}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(assignment.status)}
                        </div>
                        <div className="flex gap-2">
                          {assignment.status === 'assigned' && (
                            <Button size="sm" variant="outline" onClick={() => updateDeliveryStatus(assignment.id, 'picked_up')}>รับของแล้ว</Button>
                          )}
                          {assignment.status === 'picked_up' && (
                            <Button size="sm" variant="outline" onClick={() => updateDeliveryStatus(assignment.id, 'in_transit')}>กำลังส่ง</Button>
                          )}
                          {assignment.status === 'in_transit' && (
                            <Button size="sm" onClick={() => updateDeliveryStatus(assignment.id, 'delivered')}>ส่งสำเร็จ</Button>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          ค่าจัดส่ง: ฿{assignment.delivery_fee}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDriverId} onOpenChange={(o) => { if (!o) setDeleteDriverId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบพนักงานส่ง</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการลบพนักงานส่งคนนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDriver} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeliveryManagement;
