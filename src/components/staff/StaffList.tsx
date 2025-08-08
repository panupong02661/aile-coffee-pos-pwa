import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, User, Phone, Mail, Briefcase, Calendar, DollarSign, Clock } from 'lucide-react';
import { useStaffData, Staff } from '@/hooks/useStaffData';

const StaffList = () => {
  const { staff, loading, createStaff, updateStaff, deleteStaff, getStaffAttendanceToday } = useStaffData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    department: '',
    hire_date: '',
    salary: 0,
    status: 'active' as const,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      position: '',
      department: '',
      hire_date: '',
      salary: 0,
      status: 'active',
      is_active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        setEditingStaff(null);
      } else {
        await createStaff(formData);
        setIsCreateDialogOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      phone: staff.phone,
      email: staff.email || '',
      position: staff.position,
      department: staff.department,
      hire_date: staff.hire_date,
      salary: staff.salary,
      status: staff.status,
      is_active: staff.is_active
    });
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) {
      try {
        await deleteStaff(staffId);
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Staff['status']) => {
    switch (status) {
      case 'active': return 'ทำงาน';
      case 'inactive': return 'หยุดงาน';
      case 'terminated': return 'เลิกงาน';
      default: return 'ไม่ทราบ';
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">จัดการพนักงาน</h2>
          <p className="text-gray-600">จัดการข้อมูลและสิทธิ์ของพนักงาน</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="กรอกเบอร์โทรศัพท์"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="กรอกอีเมล"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">ผู้จัดการ</SelectItem>
                      <SelectItem value="supervisor">หัวหน้างาน</SelectItem>
                      <SelectItem value="cashier">แคชเชียร์</SelectItem>
                      <SelectItem value="cook">พ่อครัว</SelectItem>
                      <SelectItem value="waiter">พนักงานเสิร์ฟ</SelectItem>
                      <SelectItem value="cleaner">พนักงานทำความสะอาด</SelectItem>
                      <SelectItem value="delivery">พนักงานส่งของ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">แผนก *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="management">บริหาร</SelectItem>
                      <SelectItem value="kitchen">ครัว</SelectItem>
                      <SelectItem value="service">บริการ</SelectItem>
                      <SelectItem value="delivery">จัดส่ง</SelectItem>
                      <SelectItem value="cleaning">ทำความสะอาด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">วันที่เริ่มงาน *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">เงินเดือน *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    step="100"
                    placeholder="กรอกเงินเดือน"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Staff['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ทำงาน</SelectItem>
                      <SelectItem value="inactive">หยุดงาน</SelectItem>
                      <SelectItem value="terminated">เลิกงาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">เปิดใช้งานบัญชี</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  บันทึก
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">พนักงานทั้งหมด</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ทำงานวันนี้</p>
                <p className="text-2xl font-bold">
                  {staff.filter(s => {
                    const todayAttendance = getStaffAttendanceToday(s.id);
                    return todayAttendance && todayAttendance.check_in_time;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">พนักงานใหม่ (เดือนนี้)</p>
                <p className="text-2xl font-bold">
                  {staff.filter(s => {
                    const hireDate = new Date(s.hire_date);
                    const now = new Date();
                    return hireDate.getMonth() === now.getMonth() && 
                           hireDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">เงินเดือนรวม</p>
                <p className="text-lg font-bold">
                  {formatSalary(staff.filter(s => s.status === 'active').reduce((sum, s) => sum + s.salary, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>เงินเดือน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันนี้</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => {
                const todayAttendance = getStaffAttendanceToday(member.id);
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          {member.email && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.position}</Badge>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                    </TableCell>
                    <TableCell>{formatSalary(member.salary)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(member.status)}>
                        {getStatusText(member.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {todayAttendance?.check_in_time ? (
                        <div className="text-sm">
                          <div className="text-green-600">✓ เข้า: {todayAttendance.check_in_time}</div>
                          {todayAttendance.check_out_time && (
                            <div className="text-blue-600">← ออก: {todayAttendance.check_out_time}</div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">ยังไม่มา</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีพนักงานในระบบ
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">ชื่อ-นามสกุล *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">เบอร์โทรศัพท์ *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="กรอกอีเมล"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่ง *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกตำแหน่ง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">ผู้จัดการ</SelectItem>
                    <SelectItem value="supervisor">หัวหน้างาน</SelectItem>
                    <SelectItem value="cashier">แคชเชียร์</SelectItem>
                    <SelectItem value="cook">พ่อครัว</SelectItem>
                    <SelectItem value="waiter">พนักงานเสิร์ฟ</SelectItem>
                    <SelectItem value="cleaner">พนักงานทำความสะอาด</SelectItem>
                    <SelectItem value="delivery">พนักงานส่งของ</SelectItem>
                  </SelectContent>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">แผนก *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="management">บริหาร</SelectItem>
                      <SelectItem value="kitchen">ครัว</SelectItem>
                      <SelectItem value="service">บริการ</SelectItem>
                      <SelectItem value="delivery">จัดส่ง</SelectItem>
                      <SelectItem value="cleaning">ทำความสะอาด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">วันที่เริ่มงาน *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">เงินเดือน *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    step="100"
                    placeholder="กรอกเงินเดือน"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Staff['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ทำงาน</SelectItem>
                      <SelectItem value="inactive">หยุดงาน</SelectItem>
                      <SelectItem value="terminated">เลิกงาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">เปิดใช้งานบัญชี</Label>
              </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                บันทึกการแก้ไข
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditingStaff(null);
                  resetForm();
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffList;
