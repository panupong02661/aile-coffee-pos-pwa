
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, MapPin, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Area {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  area_id?: string;
  position_x: number;
  position_y: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  areas?: {
    name: string;
  };
}

interface TableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
  notes?: string;
  created_at: string;
  tables?: {
    table_number: string;
  };
}

const TableManagement = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [areaForm, setAreaForm] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  const [tableForm, setTableForm] = useState({
    table_number: '',
    capacity: 4,
    area_id: '',
    status: 'available',
    is_active: true
  });

  const [reservationForm, setReservationForm] = useState({
    table_id: '',
    customer_name: '',
    customer_phone: '',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '19:00',
    party_size: 2,
    notes: ''
  });

  useEffect(() => {
    fetchAreas();
    fetchTables();
    fetchReservations();
  }, []);

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลพื้นที่ได้', variant: 'destructive' });
      return;
    }
    
    setAreas(data || []);
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select(`
        *,
        areas (name)
      `)
      .order('table_number');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลโต้ะได้', variant: 'destructive' });
      return;
    }
    
    setTables(data || []);
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('table_reservations')
      .select(`
        *,
        tables (table_number)
      `)
      .gte('reservation_date', new Date().toISOString().split('T')[0])
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลการจองได้', variant: 'destructive' });
      return;
    }
    
    setReservations(data || []);
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingArea) {
        const { error } = await supabase
          .from('areas')
          .update({
            name: areaForm.name,
            description: areaForm.description,
            sort_order: areaForm.sort_order,
            is_active: areaForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArea.id);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'แก้ไขพื้นที่เรียบร้อยแล้ว' });
      } else {
        const { error } = await supabase
          .from('areas')
          .insert([areaForm]);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มพื้นที่เรียบร้อยแล้ว' });
      }

      setIsAreaDialogOpen(false);
      setEditingArea(null);
      setAreaForm({ name: '', description: '', sort_order: 0, is_active: true });
      fetchAreas();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTable) {
        const { error } = await supabase
          .from('tables')
          .update({
            table_number: tableForm.table_number,
            capacity: tableForm.capacity,
            area_id: tableForm.area_id || null,
            status: tableForm.status,
            is_active: tableForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTable.id);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'แก้ไขโต้ะเรียบร้อยแล้ว' });
      } else {
        const { error } = await supabase
          .from('tables')
          .insert([{
            table_number: tableForm.table_number,
            capacity: tableForm.capacity,
            area_id: tableForm.area_id || null,
            status: tableForm.status,
            is_active: tableForm.is_active,
            position_x: 0,
            position_y: 0
          }]);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มโต้ะเรียบร้อยแล้ว' });
      }

      setIsTableDialogOpen(false);
      setEditingTable(null);
      setTableForm({ table_number: '', capacity: 4, area_id: '', status: 'available', is_active: true });
      fetchTables();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('table_reservations')
        .insert([{
          table_id: reservationForm.table_id,
          customer_name: reservationForm.customer_name,
          customer_phone: reservationForm.customer_phone,
          reservation_date: reservationForm.reservation_date,
          reservation_time: reservationForm.reservation_time,
          party_size: reservationForm.party_size,
          notes: reservationForm.notes,
          status: 'confirmed'
        }]);

      if (error) throw error;
      
      toast({ title: 'สำเร็จ', description: 'จองโต้ะเรียบร้อยแล้ว' });
      setIsReservationDialogOpen(false);
      setReservationForm({
        table_id: '',
        customer_name: '',
        customer_phone: '',
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '19:00',
        party_size: 2,
        notes: ''
      });
      fetchReservations();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการจองโต้ะ', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (area: Area) => {
    if (!confirm('คุณต้องการลบพื้นที่นี้หรือไม่?')) return;

    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', area.id);

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบพื้นที่ได้', variant: 'destructive' });
      return;
    }

    toast({ title: 'สำเร็จ', description: 'ลบพื้นที่เรียบร้อยแล้ว' });
    fetchAreas();
  };

  const handleDeleteTable = async (table: RestaurantTable) => {
    if (!confirm('คุณต้องการลบโต้ะนี้หรือไม่?')) return;

    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', table.id);

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบโต้ะได้', variant: 'destructive' });
      return;
    }

    toast({ title: 'สำเร็จ', description: 'ลบโต้ะเรียบร้อยแล้ว' });
    fetchTables();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">ว่าง</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800">ไม่ว่าง</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-100 text-yellow-800">จองแล้ว</Badge>;
      case 'maintenance':
        return <Badge className="bg-gray-100 text-gray-800">ซ่อมบำรุง</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTables = selectedArea === 'all' 
    ? tables 
    : tables.filter(table => table.area_id === selectedArea);

  const openEditArea = (area: Area) => {
    setEditingArea(area);
    setAreaForm({
      name: area.name,
      description: area.description || '',
      sort_order: area.sort_order,
      is_active: area.is_active
    });
    setIsAreaDialogOpen(true);
  };

  const openEditTable = (table: RestaurantTable) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number,
      capacity: table.capacity,
      area_id: table.area_id || '',
      status: table.status,
      is_active: table.is_active
    });
    setIsTableDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Areas Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            จัดการพื้นที่ร้าน
          </CardTitle>
          <CardDescription>จัดการพื้นที่ต่างๆ ในร้านอาหาร</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">พื้นที่ทั้งหมด</h3>
            <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingArea(null);
                  setAreaForm({ name: '', description: '', sort_order: 0, is_active: true });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มพื้นที่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingArea ? 'แก้ไขพื้นที่' : 'เพิ่มพื้นที่ใหม่'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAreaSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="area-name">ชื่อพื้นที่</Label>
                    <Input
                      id="area-name"
                      value={areaForm.name}
                      onChange={(e) => setAreaForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="กรอกชื่อพื้นที่"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="area-description">คำอธิบาย</Label>
                    <Input
                      id="area-description"
                      value={areaForm.description}
                      onChange={(e) => setAreaForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="คำอธิบายพื้นที่ (ไม่บังคับ)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="area-sort">ลำดับการแสดง</Label>
                    <Input
                      id="area-sort"
                      type="number"
                      value={areaForm.sort_order}
                      onChange={(e) => setAreaForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="area-active"
                      checked={areaForm.is_active}
                      onCheckedChange={(checked) => setAreaForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="area-active">เปิดใช้งาน</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAreaDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area) => (
              <Card key={area.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{area.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openEditArea(area)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteArea(area)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {area.description && (
                    <CardDescription className="text-sm">{area.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      โต้ะ: {tables.filter(t => t.area_id === area.id).length} โต้ะ
                    </span>
                    {area.is_active ? (
                      <Badge className="bg-green-100 text-green-800">ใช้งาน</Badge>
                    ) : (
                      <Badge variant="outline">ปิดใช้งาน</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            จัดการโต้ะ
          </CardTitle>
          <CardDescription>จัดการโต้ะทั้งหมดในร้าน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="เลือกพื้นที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">พื้นที่ทั้งหมด</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                โต้ะทั้งหมด: {filteredTables.length} โต้ะ
              </span>
            </div>
            <div className="space-x-2">
              <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    จองโต้ะ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>จองโต้ะ</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleReservationSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="table-select">เลือกโต้ะ</Label>
                      <Select value={reservationForm.table_id} onValueChange={(value) => setReservationForm(prev => ({ ...prev, table_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกโต้ะ" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.filter(t => t.status === 'available').map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              โต้ะ {table.table_number} ({table.capacity} ที่นั่ง) - {table.areas?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customer-name">ชื่อลูกค้า</Label>
                      <Input
                        id="customer-name"
                        value={reservationForm.customer_name}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, customer_name: e.target.value }))}
                        placeholder="กรอกชื่อลูกค้า"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="customer-phone"
                        value={reservationForm.customer_phone}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                        placeholder="กรอกเบอร์โทรศัพท์"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reservation-date">วันที่จอง</Label>
                        <Input
                          id="reservation-date"
                          type="date"
                          value={reservationForm.reservation_date}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, reservation_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reservation-time">เวลาจอง</Label>
                        <Input
                          id="reservation-time"
                          type="time"
                          value={reservationForm.reservation_time}
                          onChange={(e) => setReservationForm(prev => ({ ...prev, reservation_time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="party-size">จำนวนคน</Label>
                      <Input
                        id="party-size"
                        type="number"
                        min="1"
                        value={reservationForm.party_size}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, party_size: parseInt(e.target.value) || 1 }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">หมายเหตุ</Label>
                      <Input
                        id="notes"
                        value={reservationForm.notes}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingTable(null);
                    setTableForm({ table_number: '', capacity: 4, area_id: '', status: 'available', is_active: true });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มโต้ะ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTable ? 'แก้ไขโต้ะ' : 'เพิ่มโต้ะใหม่'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTableSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="table-number">หมายเลขโต้ะ</Label>
                      <Input
                        id="table-number"
                        value={tableForm.table_number}
                        onChange={(e) => setTableForm(prev => ({ ...prev, table_number: e.target.value }))}
                        placeholder="กรอกหมายเลขโต้ะ"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="table-capacity">จำนวนที่นั่ง</Label>
                      <Input
                        id="table-capacity"
                        type="number"
                        min="1"
                        max="20"
                        value={tableForm.capacity}
                        onChange={(e) => setTableForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 4 }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="table-area">พื้นที่</Label>
                      <Select value={tableForm.area_id} onValueChange={(value) => setTableForm(prev => ({ ...prev, area_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกพื้นที่" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">ไม่ระบุพื้นที่</SelectItem>
                          {areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="table-status">สถานะ</Label>
                      <Select value={tableForm.status} onValueChange={(value) => setTableForm(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">ว่าง</SelectItem>
                          <SelectItem value="occupied">ไม่ว่าง</SelectItem>
                          <SelectItem value="reserved">จองแล้ว</SelectItem>
                          <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="table-active"
                        checked={tableForm.is_active}
                        onCheckedChange={(checked) => setTableForm(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="table-active">เปิดใช้งาน</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsTableDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>หมายเลขโต้ะ</TableHead>
                <TableHead>พื้นที่</TableHead>
                <TableHead>จำนวนที่นั่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>สถานะการใช้งาน</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">โต้ะ {table.table_number}</TableCell>
                  <TableCell>{table.areas?.name || 'ไม่ระบุ'}</TableCell>
                  <TableCell>{table.capacity} ที่นั่ง</TableCell>
                  <TableCell>{getStatusBadge(table.status)}</TableCell>
                  <TableCell>
                    {table.is_active ? (
                      <Badge className="bg-green-100 text-green-800">ใช้งาน</Badge>
                    ) : (
                      <Badge variant="outline">ปิดใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditTable(table)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTable(table)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTables.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีโต้ะในพื้นที่นี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            การจองโต้ะวันนี้และอนาคต
          </CardTitle>
          <CardDescription>รายการจองโต้ะทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โต้ะ</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>จำนวนคน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>โต้ะ {reservation.tables?.table_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.customer_name}</div>
                      {reservation.customer_phone && (
                        <div className="text-sm text-gray-500">{reservation.customer_phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(reservation.reservation_date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{reservation.reservation_time}</TableCell>
                  <TableCell>{reservation.party_size} คน</TableCell>
                  <TableCell>
                    <Badge className={
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {reservation.status === 'confirmed' ? 'ยืนยันแล้ว' :
                       reservation.status === 'cancelled' ? 'ยกเลิก' : reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{reservation.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reservations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีการจองโต้ะ
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TableManagement;
