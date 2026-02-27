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
import { Truck, Plus, MapPin, Clock, User, Phone } from 'lucide-react';
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
  
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    vehicle_type: 'motorcycle',
    vehicle_number: '',
    license_number: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadDrivers(), loadAssignments()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_drivers')
        .select('*')
        .order('name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลพนักงานส่งได้',
        variant: 'destructive',
      });
    }
  };

  const loadAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          delivery_drivers:driver_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const assignmentsWithDriver = data?.map(assignment => ({
        ...assignment,
        driver_name: (assignment as any).delivery_drivers?.name || 'ไม่ระบุ',
      })) || [];

      setAssignments(assignmentsWithDriver);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลการจัดส่งได้',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSaveDriver = async () => {
    try {
      if (!driverForm.name || !driverForm.phone) {
        toast({
          title: 'กรุณากรอกข้อมูล',
          description: 'กรุณากรอกชื่อและเบอร์โทรศัพท์',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('delivery_drivers')
        .insert([{ ...driverForm, status: 'available' }]);

      if (error) throw error;

      toast({ title: 'เพิ่มพนักงานส่งสำเร็จ ✅' });
      setIsDriverDialogOpen(false);
      setDriverForm({
        name: '',
        phone: '',
        vehicle_type: 'motorcycle',
        vehicle_number: '',
        license_number: '',
        is_active: true,
      });
      loadDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    }
  };

  const updateDriverStatus = async (driverId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('delivery_drivers')
        .update({ status })
        .eq('id', driverId);

      if (error) throw error;

      toast({ title: 'อัปเดตสถานะสำเร็จ ✅' });
      loadDrivers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const updateDeliveryStatus = async (assignmentId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'picked_up') {
        updateData.pickup_time = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivery_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('delivery_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      toast({ title: 'อัปเดตสถานะการจัดส่งสำเร็จ ✅' });
      loadAssignments();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; variant: any } } = {
      assigned: { label: 'มอบหมายแล้ว', variant: 'secondary' },
      picked_up: { label: 'รับของแล้ว', variant: 'default' },
      in_transit: { label: 'กำลังส่ง', variant: 'default' },
      delivered: { label: 'ส่งแล้ว', variant: 'default' },
      cancelled: { label: 'ยกเลิก', variant: 'destructive' },
      available: { label: 'พร้อมใช้งาน', variant: 'default' },
      busy: { label: 'ไม่ว่าง', variant: 'secondary' },
      offline: { label: 'ออฟไลน์', variant: 'secondary' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
      }`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto mt-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary" />
                จัดการการจัดส่ง
              </h1>
              <p className="text-gray-600 mt-2">จัดการพนักงานส่งและติดตามสถานะการจัดส่ง</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">พนักงานส่งทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDrivers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">พร้อมใช้งาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableDrivers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">กำลังจัดส่ง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.activeDeliveries}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">ส่งสำเร็จวันนี้</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.completedToday}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Drivers List */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>พนักงานส่ง</CardTitle>
                    <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่ม
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>เพิ่มพนักงานส่ง</DialogTitle>
                          <DialogDescription>กรอกข้อมูลพนักงานส่ง</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>ชื่อ-นามสกุล</Label>
                            <Input
                              value={driverForm.name}
                              onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="สมชาย ใจดี"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>เบอร์โทรศัพท์</Label>
                            <Input
                              value={driverForm.phone}
                              onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="08X-XXX-XXXX"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>ประเภทยานพาหนะ</Label>
                            <Select
                              value={driverForm.vehicle_type}
                              onValueChange={(value) => setDriverForm(prev => ({ ...prev, vehicle_type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="motorcycle">มอเตอร์ไซค์</SelectItem>
                                <SelectItem value="car">รถยนต์</SelectItem>
                                <SelectItem value="bicycle">จักรยาน</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>ทะเบียนรถ</Label>
                            <Input
                              value={driverForm.vehicle_number}
                              onChange={(e) => setDriverForm(prev => ({ ...prev, vehicle_number: e.target.value }))}
                              placeholder="กก 1234 กรุงเทพ"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>เลขที่ใบขับขี่</Label>
                            <Input
                              value={driverForm.license_number}
                              onChange={(e) => setDriverForm(prev => ({ ...prev, license_number: e.target.value }))}
                              placeholder="12345678"
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDriverDialogOpen(false)}>
                              ยกเลิก
                            </Button>
                            <Button onClick={handleSaveDriver}>
                              บันทึก
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{driver.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </p>
                          <p className="text-xs text-gray-500">
                            {driver.vehicle_type} - {driver.vehicle_number}
                          </p>
                        </div>
                        {getStatusBadge(driver.status)}
                      </div>

                      <Select
                        value={driver.status}
                        onValueChange={(value) => updateDriverStatus(driver.id, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">พร้อมใช้งาน</SelectItem>
                          <SelectItem value="busy">ไม่ว่าง</SelectItem>
                          <SelectItem value="offline">ออฟไลน์</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Assignments */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>รายการจัดส่ง</CardTitle>
                    <CardDescription>ติดตามสถานะการจัดส่ง</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-8">กำลังโหลด...</div>
                    ) : assignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        ยังไม่มีรายการจัดส่ง
                      </div>
                    ) : (
                      assignments.map((assignment) => (
                        <div key={assignment.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Order #{assignment.order_id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <User className="w-3 h-3" />
                                {assignment.driver_name}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {assignment.delivery_address}
                              </p>
                              {assignment.estimated_delivery_time && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  ถึงโดยประมาณ: {new Date(assignment.estimated_delivery_time).toLocaleTimeString('th-TH')}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(assignment.status)}
                          </div>

                          <div className="flex gap-2">
                            {assignment.status === 'assigned' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDeliveryStatus(assignment.id, 'picked_up')}
                              >
                                รับของแล้ว
                              </Button>
                            )}
                            {assignment.status === 'picked_up' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDeliveryStatus(assignment.id, 'in_transit')}
                              >
                                กำลังส่ง
                              </Button>
                            )}
                            {assignment.status === 'in_transit' && (
                              <Button
                                size="sm"
                                onClick={() => updateDeliveryStatus(assignment.id, 'delivered')}
                              >
                                ส่งสำเร็จ
                              </Button>
                            )}
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
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
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;
