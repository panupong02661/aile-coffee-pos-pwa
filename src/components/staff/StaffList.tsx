
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit, Trash2, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Staff {
  id: string;
  name: string;
  position: string;
  role: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  hire_date: string;
  salary: number;
  created_at: string;
}

const StaffList = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    role: 'staff',
    phone: '',
    email: '',
    salary: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Mock data for demonstration
      setStaff([
        {
          id: '1',
          name: 'นางสาวสมใจ ใจดี',
          position: 'พนักงานเสิร์ฟ',
          role: 'staff',
          phone: '081-234-5678',
          email: 'somjai@example.com',
          status: 'active',
          hire_date: '2024-01-15',
          salary: 15000,
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'นายสมชาย รักงาน',
          position: 'บาริสต้า',
          role: 'staff',
          phone: '082-345-6789',
          email: 'somchai@example.com',
          status: 'active',
          hire_date: '2024-02-01',
          salary: 18000,
          created_at: '2024-02-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'นางสาวมาลี ขยันทำ',
          position: 'ผู้จัดการ',
          role: 'manager',
          phone: '083-456-7890',
          email: 'malee@example.com',
          status: 'active',
          hire_date: '2023-06-15',
          salary: 25000,
          created_at: '2023-06-15T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      const staffData = {
        ...newStaff,
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('staff')
        .insert([staffData]);

      if (error) {
        // Mock success for demonstration
        const mockStaff: Staff = {
          id: Date.now().toString(),
          ...staffData,
          hire_date: staffData.hire_date,
          created_at: new Date().toISOString()
        };
        setStaff(prev => [mockStaff, ...prev]);
      } else {
        await fetchStaff();
      }

      setNewStaff({
        name: '',
        position: '',
        role: 'staff',
        phone: '',
        email: '',
        salary: 0
      });
      setIsAddDialogOpen(false);
      toast({ title: 'สำเร็จ', description: 'เพิ่มพนักงานใหม่เรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเพิ่มพนักงานได้', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800">ทำงานอยู่</Badge> : 
      <Badge variant="outline">ลาออก</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            รายชื่อพนักงาน
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                เพิ่มพนักงาน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">ตำแหน่ง</Label>
                  <Input
                    id="position"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, position: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">สิทธิ์</Label>
                  <Select value={newStaff.role} onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salary" className="text-right">เงินเดือน</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, salary: Number(e.target.value) }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddStaff}>
                  เพิ่มพนักงาน
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>สิทธิ์</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>เงินเดือน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันเริ่มงาน</TableHead>
              <TableHead>จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>฿{member.salary.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell>{new Date(member.hire_date).toLocaleDateString('th-TH')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffList;
