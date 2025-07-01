
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, User, Settings, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffPermission {
  id: string;
  staff_id: string;
  staff_name: string;
  role: string;
  permissions: {
    pos: boolean;
    menu_management: boolean;
    member_management: boolean;
    reports: boolean;
    settings: boolean;
    staff_management: boolean;
    financial: boolean;
    inventory: boolean;
  };
}

interface PermissionGroup {
  key: keyof StaffPermission['permissions'];
  name: string;
  description: string;
}

const PermissionManagement = () => {
  const [staffPermissions, setStaffPermissions] = useState<StaffPermission[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffPermission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const permissionGroups: PermissionGroup[] = [
    { key: 'pos', name: 'ระบบ POS', description: 'การขายและรับชำระเงิน' },
    { key: 'menu_management', name: 'จัดการเมนู', description: 'เพิ่ม แก้ไข ลบเมนูอาหาร' },
    { key: 'member_management', name: 'จัดการสมาชิก', description: 'จัดการข้อมูลสมาชิกและแต้ม' },
    { key: 'reports', name: 'รายงาน', description: 'ดูรายงานยอดขายและสถิติ' },
    { key: 'inventory', name: 'จัดการสต็อก', description: 'จัดการคลังสินค้าและวัตถุดิบ' },
    { key: 'staff_management', name: 'จัดการพนักงาน', description: 'จัดการข้อมูลพนักงาน' },
    { key: 'financial', name: 'ระบบการเงิน', description: 'จัดการบัญชีและการเงิน' },
    { key: 'settings', name: 'ตั้งค่าระบบ', description: 'ตั้งค่าร้านและระบบ' }
  ];

  useEffect(() => {
    fetchStaffPermissions();
  }, []);

  const fetchStaffPermissions = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockPermissions: StaffPermission[] = [
        {
          id: '1',
          staff_id: '1',
          staff_name: 'นางสาวสมใจ ใจดี',
          role: 'staff',
          permissions: {
            pos: true,
            menu_management: false,
            member_management: true,
            reports: false,
            settings: false,
            staff_management: false,
            financial: false,
            inventory: false
          }
        },
        {
          id: '2',
          staff_id: '2',
          staff_name: 'นายสมชาย รักงาน',
          role: 'staff',
          permissions: {
            pos: true,
            menu_management: true,
            member_management: false,
            reports: false,
            settings: false,
            staff_management: false,
            financial: false,
            inventory: true
          }
        },
        {
          id: '3',
          staff_id: '3',
          staff_name: 'นางสาวมาลี ขยันทำ',
          role: 'manager',
          permissions: {
            pos: true,
            menu_management: true,
            member_management: true,
            reports: true,
            settings: true,
            staff_management: true,
            financial: true,
            inventory: true
          }
        }
      ];

      setStaffPermissions(mockPermissions);
    } catch (error) {
      console.error('Error fetching staff permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: keyof StaffPermission['permissions'], value: boolean) => {
    if (selectedStaff) {
      setSelectedStaff(prev => prev ? {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: value
        }
      } : null);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;

    try {
      // Update in state (in real app, would update in database)
      setStaffPermissions(prev => 
        prev.map(staff => 
          staff.id === selectedStaff.id ? selectedStaff : staff
        )
      );

      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      toast({
        title: 'สำเร็จ',
        description: 'อัพเดทสิทธิ์การเข้าถึงเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัพเดทสิทธิ์ได้',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (staff: StaffPermission) => {
    setSelectedStaff({ ...staff });
    setIsEditDialogOpen(true);
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

  const countActivePermissions = (permissions: StaffPermission['permissions']) => {
    return Object.values(permissions).filter(Boolean).length;
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            จัดการสิทธิ์การเข้าถึง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>พนักงาน</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>สิทธิ์ที่ได้รับ</TableHead>
                <TableHead>POS</TableHead>
                <TableHead>เมนู</TableHead>
                <TableHead>สมาชิก</TableHead>
                <TableHead>รายงาน</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPermissions.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {staff.staff_name}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(staff.role)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {countActivePermissions(staff.permissions)}/8 สิทธิ์
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {staff.permissions.pos ? 
                      <Badge className="bg-green-100 text-green-800">✓</Badge> : 
                      <Badge variant="outline">✗</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {staff.permissions.menu_management ? 
                      <Badge className="bg-green-100 text-green-800">✓</Badge> : 
                      <Badge variant="outline">✗</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {staff.permissions.member_management ? 
                      <Badge className="bg-green-100 text-green-800">✓</Badge> : 
                      <Badge variant="outline">✗</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {staff.permissions.reports ? 
                      <Badge className="bg-green-100 text-green-800">✓</Badge> : 
                      <Badge variant="outline">✗</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(staff)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขสิทธิ์การเข้าถึง - {selectedStaff?.staff_name}</DialogTitle>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {permissionGroups.map((group) => (
                  <div key={group.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{group.name}</Label>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <Switch
                      checked={selectedStaff.permissions[group.key]}
                      onCheckedChange={(checked) => handlePermissionChange(group.key, checked)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSavePermissions}>
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionManagement;
