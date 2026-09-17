
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Edit, Plus, Trash2, Eye, EyeOff, Search, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BranchDatabaseManagement from './BranchDatabaseManagement';

// All permission keys derived from MainSidebar menu items
const ALL_PERMISSIONS = [
  { key: 'dashboard', label: 'แดชบอร์ด', group: 'POS และ Dashboard' },
  { key: 'security-dashboard', label: 'Security Dashboard', group: 'POS และ Dashboard' },
  { key: 'analytics-dashboard', label: 'Analytics Dashboard', group: 'POS และ Dashboard' },
  { key: 'financial-dashboard', label: 'Financial Dashboard', group: 'POS และ Dashboard' },
  { key: 'pos', label: 'POS', group: 'POS และ Dashboard' },
  { key: 'customer-display', label: 'จอแสดงผลลูกค้า', group: 'POS และ Dashboard' },
  { key: 'kitchen-display', label: 'จอแสดงผลในครัว', group: 'POS และ Dashboard' },
  { key: 'online-orders', label: 'ออเดอร์ออนไลน์', group: 'POS และ Dashboard' },
  { key: 'delivery-integration', label: 'Delivery Integration', group: 'POS และ Dashboard' },
  { key: 'menu', label: 'จัดการเมนู', group: 'จัดการหลัก' },
  { key: 'members', label: 'จัดการสมาชิก', group: 'จัดการหลัก' },
  { key: 'inventory', label: 'จัดการคลังสินค้า', group: 'จัดการหลัก' },
  { key: 'advanced-reports', label: 'รายงานขั้นสูง', group: 'รายงาน' },
  { key: 'sales-reports', label: 'รายงานยอดขาย', group: 'รายงาน' },
  { key: 'product-reports', label: 'รายงานสินค้า', group: 'รายงาน' },
  { key: 'customer-analytics', label: 'การวิเคราะห์ลูกค้า', group: 'รายงาน' },
  { key: 'staff', label: 'จัดการพนักงาน', group: 'พนักงาน' },
  { key: 'time-attendance', label: 'บันทึกเวลาทำงาน', group: 'พนักงาน' },
  { key: 'permissions', label: 'กำหนดสิทธิ์', group: 'พนักงาน' },
  { key: 'branch-management', label: 'จัดการสาขา', group: 'พนักงาน' },
  { key: 'accounting', label: 'ระบบบัญชี', group: 'การเงิน' },
  { key: 'income-expense', label: 'รายรับ-รายจ่าย', group: 'การเงิน' },
  { key: 'profit-loss', label: 'กำไร-ขาดทุน', group: 'การเงิน' },
  { key: 'tax-system', label: 'ระบบภาษี', group: 'การเงิน' },
  { key: 'vat-calculation', label: 'คำนวณภาษีมูลค่าเพิ่ม', group: 'การเงิน' },
  { key: 'tax-invoice', label: 'ออกใบกำกับภาษี', group: 'การเงิน' },
  { key: 'credit-system', label: 'ระบบเครดิต', group: 'การเงิน' },
  { key: 'crm', label: 'ระบบ CRM', group: 'ลูกค้า' },
  { key: 'customer-data', label: 'ข้อมูลลูกค้า', group: 'ลูกค้า' },
  { key: 'purchase-history', label: 'ประวัติการซื้อ', group: 'ลูกค้า' },
  { key: 'marketing', label: 'ระบบการตลาด', group: 'ลูกค้า' },
  { key: 'sms-marketing', label: 'SMS Marketing', group: 'ลูกค้า' },
  { key: 'email-marketing', label: 'Email Marketing', group: 'ลูกค้า' },
  { key: 'table-reservation', label: 'ระบบจองโต๊ะ', group: 'ลูกค้า' },
  { key: 'digital-payment', label: 'การชำระเงินดิจิทัล', group: 'เทคโนโลยี' },
  { key: 'qr-promptpay', label: 'QR Code PromptPay', group: 'เทคโนโลยี' },
  { key: 'credit-card', label: 'บัตรเครดิต', group: 'เทคโนโลยี' },
  { key: 'api-system', label: 'ระบบ API', group: 'เทคโนโลยี' },
  { key: 'external-integration', label: 'เชื่อมต่อระบบภายนอก', group: 'เทคโนโลยี' },
  { key: 'staff-mobile-app', label: 'Mobile App พนักงาน', group: 'เทคโนโลยี' },
  { key: 'customer-mobile-app', label: 'แอปมือถือลูกค้า', group: 'เทคโนโลยี' },
  { key: 'security-recommendations', label: 'ระบบความปลอดภัย', group: 'ความปลอดภัย' },
  { key: 'session-management', label: 'Session Management', group: 'ความปลอดภัย' },
  { key: 'data-backup-monitor', label: 'Data Backup Monitor', group: 'ความปลอดภัย' },
  { key: 'auto-backup', label: 'Backup อัตโนมัติ', group: 'ความปลอดภัย' },
  { key: 'customer-app-management', label: 'จัดการแอปลูกค้า', group: 'อื่นๆ' },
  { key: 'notifications', label: 'แจ้งเตือน', group: 'อื่นๆ' },
  { key: 'line-messaging', label: 'LINE Messaging', group: 'อื่นๆ' },
  { key: 'reports', label: 'รายงาน', group: 'อื่นๆ' },
  { key: 'promotions', label: 'จัดการโปรโมชั่น', group: 'อื่นๆ' },
  { key: 'menu-promotions', label: 'โปรโมชั่นตามเมนู', group: 'อื่นๆ' },
  { key: 'cost-analysis', label: 'วิเคราะห์ต้นทุน', group: 'อื่นๆ' },
  { key: 'coupon-management', label: 'จัดการคูปอง', group: 'อื่นๆ' },
  { key: 'review-management', label: 'จัดการรีวิว', group: 'อื่นๆ' },
  { key: 'delivery-management', label: 'จัดการการจัดส่ง', group: 'อื่นๆ' },
  { key: 'shop-settings', label: 'ตั้งค่าร้าน', group: 'ตั้งค่า' },
  { key: 'business-settings', label: 'ตั้งค่าธุรกิจ', group: 'ตั้งค่า' },
  { key: 'printer-settings', label: 'เครื่องพิมพ์', group: 'ตั้งค่า' },
  { key: 'wifi-vouchers', label: 'WiFi สำหรับลูกค้า', group: 'ตั้งค่า' },
  { key: 'app-build-guide', label: 'สร้างแอปมือถือ', group: 'ตั้งค่า' },
  { key: 'shift-close', label: 'สรุปกะ / ปิดรอบขาย', group: 'POS และ Dashboard' },
  { key: 'shop-benchmark', label: 'Benchmark ร้านค้า', group: 'POS และ Dashboard' },
  { key: 'delivery-tracking', label: 'ติดตามเดลิเวอรี่', group: 'หน้าร้าน' },
  { key: 'queue-management', label: 'ระบบคิว', group: 'หน้าร้าน' },
  { key: 'queue-display', label: 'จอแสดงคิว', group: 'หน้าร้าน' },
  { key: 'table-management', label: 'จัดการโต๊ะ', group: 'หน้าร้าน' },
];

interface UserData {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserPermissionMap {
  [permissionKey: string]: boolean;
}

interface UserDiscountLimit {
  [userId: string]: number | null;
}

const PermissionManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermissionMap>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editPermissions, setEditPermissions] = useState<UserPermissionMap>({});
  const [discountLimits, setDiscountLimits] = useState<UserDiscountLimit>({});
  const [editDiscountLimit, setEditDiscountLimit] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'staff' });
  const [credUser, setCredUser] = useState<UserData | null>(null);
  const [credPassword, setCredPassword] = useState('');
  const [credVisible, setCredVisible] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Group permissions by group name
  const permissionGroups = useMemo(() => {
    const groups: Record<string, typeof ALL_PERMISSIONS> = {};
    ALL_PERMISSIONS.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  // Current user's own permissions (admin has all)
  const currentUserPermissions = useMemo(() => {
    if (currentUser?.role === 'admin') {
      const all: UserPermissionMap = {};
      ALL_PERMISSIONS.forEach(p => { all[p.key] = true; });
      return all;
    }
    return userPermissions[currentUser?.id || ''] || {};
  }, [currentUser, userPermissions]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, full_name, role, is_active, created_at')
        .order('created_at');

      if (usersError) throw usersError;

      // Fetch all permissions
      const { data: permsData, error: permsError } = await supabase
        .from('user_permissions')
        .select('user_id, permission_key, is_granted, max_discount_percent');

      if (permsError) throw permsError;

      setUsers((usersData as any[]) || []);

      // Build permission map per user and discount limits
      const permMap: Record<string, UserPermissionMap> = {};
      const discountMap: UserDiscountLimit = {};
      (permsData as any[])?.forEach((p: any) => {
        if (!permMap[p.user_id]) permMap[p.user_id] = {};
        permMap[p.user_id][p.permission_key] = p.is_granted;
        if (p.max_discount_percent != null) {
          discountMap[p.user_id] = p.max_discount_percent;
        }
      });
      setUserPermissions(permMap);
      setDiscountLimits(discountMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอก Username และ Password', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('users').insert({
        username: newUser.username,
        password_hash: newUser.password, // In production, hash this
        full_name: newUser.full_name || newUser.username,
        role: newUser.role,
      });
      if (error) throw error;

      toast({ title: 'สำเร็จ', description: 'สร้างผู้ใช้งานเรียบร้อยแล้ว' });
      setIsCreateOpen(false);
      setNewUser({ username: '', password: '', full_name: '', role: 'staff' });
      fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({ title: 'ข้อผิดพลาด', description: error.message || 'ไม่สามารถสร้างผู้ใช้ได้', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('ต้องการลบผู้ใช้นี้หรือไม่?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      toast({ title: 'สำเร็จ', description: 'ลบผู้ใช้งานแล้ว' });
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบผู้ใช้ได้', variant: 'destructive' });
    }
  };

  const openCredentials = async (user: UserData) => {
    setCredUser(user);
    setCredVisible(false);
    setCredPassword('');
    setCredLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      setCredPassword((data as any)?.password_hash || '');
    } catch (error: any) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถดึงรหัสผ่านได้', variant: 'destructive' });
    } finally {
      setCredLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!credUser) return;
    if (!credPassword.trim()) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกรหัสผ่าน', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: credPassword })
        .eq('id', credUser.id)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('ไม่มีสิทธิ์เปลี่ยนรหัสผ่านผู้ใช้นี้');
      toast({ title: 'สำเร็จ', description: 'เปลี่ยนรหัสผ่านแล้ว' });
      setCredUser(null);
    } catch (error: any) {
      toast({ title: 'ข้อผิดพลาด', description: error.message || 'ไม่สามารถบันทึกได้', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openEditPermissions = (user: UserData) => {
    setSelectedUser(user);
    const perms: UserPermissionMap = {};
    ALL_PERMISSIONS.forEach(p => {
      perms[p.key] = userPermissions[user.id]?.[p.key] || false;
    });
    setEditPermissions(perms);
    setEditDiscountLimit(discountLimits[user.id] ?? null);
    setIsEditOpen(true);
  };

  const handleTogglePermission = (key: string, value: boolean) => {
    setEditPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleGroup = (groupName: string, value: boolean) => {
    const groupPerms = permissionGroups[groupName];
    if (!groupPerms) return;
    setEditPermissions(prev => {
      const updated = { ...prev };
      groupPerms.forEach(p => {
        // Only allow toggling if current user has this permission
        if (currentUserPermissions[p.key]) {
          updated[p.key] = value;
        }
      });
      return updated;
    });
  };

  const handleSelectAll = (value: boolean) => {
    setEditPermissions(prev => {
      const updated = { ...prev };
      ALL_PERMISSIONS.forEach(p => {
        if (currentUserPermissions[p.key]) {
          updated[p.key] = value;
        }
      });
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Delete existing permissions for this user
      await supabase.from('user_permissions').delete().eq('user_id', selectedUser.id);

      // Insert new permissions
      const rows = ALL_PERMISSIONS
        .filter(p => editPermissions[p.key])
        .map(p => ({
          user_id: selectedUser.id,
          permission_key: p.key,
          is_granted: true,
          granted_by: currentUser?.id || null,
          max_discount_percent: editDiscountLimit,
        }));

      if (rows.length > 0) {
        const { error } = await supabase.from('user_permissions').insert(rows);
        if (error) throw error;
      }

      toast({ title: 'สำเร็จ', description: 'บันทึกสิทธิ์เรียบร้อยแล้ว' });
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกสิทธิ์ได้', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const countPermissions = (userId: string) => {
    const perms = userPermissions[userId];
    if (!perms) return 0;
    return Object.values(perms).filter(Boolean).length;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-500/10 text-red-700 border-red-200">Admin</Badge>;
      case 'manager': return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">Manager</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground">Staff</Badge>;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'manager': return 'เจ้าของร้าน';
      case 'staff': return 'พนักงาน';
      default: return role;
    }
  };

  const canManageUser = (targetUser: UserData) => {
    if (currentUser?.role === 'admin') return targetUser.role !== 'admin';
    if (currentUser?.role === 'manager') return targetUser.role === 'staff';
    return false;
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header with create button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center text-xl">
              <Shield className="w-5 h-5 mr-2" />
              กำหนดสิทธิ์ผู้ใช้งาน
            </CardTitle>
            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <Button onClick={() => setIsCreateOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มผู้ใช้งาน
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้ใช้งาน..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้งาน</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สิทธิ์</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{u.full_name || u.username}</p>
                          <p className="text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getRoleBadge(u.role)}
                        <p className="text-xs text-muted-foreground">{getRoleLabel(u.role)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.role === 'admin' ? (
                        <Badge variant="outline" className="text-green-700">ทั้งหมด ({ALL_PERMISSIONS.length})</Badge>
                      ) : (
                        <Badge variant="outline">{countPermissions(u.id)}/{ALL_PERMISSIONS.length} สิทธิ์</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200">ใช้งาน</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">ปิดใช้งาน</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {currentUser?.role === 'admin' && (
                          <Button variant="outline" size="sm" title="ดู/เปลี่ยนรหัสผ่าน" onClick={() => openCredentials(u)}>
                            <KeyRound className="w-4 h-4" />
                          </Button>
                        )}
                        {canManageUser(u) && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEditPermissions(u)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(u.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-xs text-muted-foreground px-2">ผู้ดูแลระบบ</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      ไม่พบผู้ใช้งาน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Branch & Database Management */}
      {(currentUser?.role === 'admin') && (
        <BranchDatabaseManagement />
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อเต็ม</Label>
              <Input
                placeholder="ชื่อ-นามสกุล"
                value={newUser.full_name}
                onChange={e => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
                value={newUser.username}
                onChange={e => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่าน"
                  value={newUser.password}
                  onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>บทบาท</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(prev => ({ ...prev, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.role === 'admin' && (
                    <SelectItem value="manager">Manager (เจ้าของร้าน)</SelectItem>
                  )}
                  <SelectItem value="staff">Staff (พนักงาน)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleCreateUser} disabled={saving}>
                {saving ? 'กำลังสร้าง...' : 'สร้างผู้ใช้งาน'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              กำหนดสิทธิ์ - {selectedUser?.full_name || selectedUser?.username}
              {selectedUser && getRoleBadge(selectedUser.role)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Quick actions */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <span className="text-sm font-medium">
                สิทธิ์ที่เลือก: {Object.values(editPermissions).filter(Boolean).length}/{ALL_PERMISSIONS.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  เลือกทั้งหมด
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSelectAll(false)}>
                  <XCircle className="w-3 h-3 mr-1" />
                  ยกเลิกทั้งหมด
                </Button>
              </div>
            </div>

            {/* Permission groups */}
            <ScrollArea className="h-[50vh]">
              <div className="space-y-4 pr-4">
                {Object.entries(permissionGroups).map(([groupName, perms]) => {
                  const grantedCount = perms.filter(p => editPermissions[p.key]).length;
                  const availableCount = perms.filter(p => currentUserPermissions[p.key]).length;

                  return (
                    <div key={groupName} className="border rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                        onClick={() => handleToggleGroup(groupName, grantedCount < availableCount)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{groupName}</span>
                          <Badge variant="outline" className="text-xs">{grantedCount}/{perms.length}</Badge>
                        </div>
                        <Switch
                          checked={grantedCount === availableCount && availableCount > 0}
                          onCheckedChange={checked => handleToggleGroup(groupName, checked)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="divide-y">
                        {perms.map(p => {
                          const canGrant = currentUserPermissions[p.key];
                          return (
                            <div key={p.key} className={`flex items-center justify-between px-4 py-2.5 ${!canGrant ? 'opacity-40' : ''}`}>
                              <span className="text-sm">{p.label}</span>
                              <Switch
                                checked={editPermissions[p.key] || false}
                                onCheckedChange={v => handleTogglePermission(p.key, v)}
                                disabled={!canGrant}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Discount Limit */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <Label className="font-medium">จำกัดส่วนลดสูงสุด (%)</Label>
              <p className="text-xs text-muted-foreground">กำหนดส่วนลดสูงสุดที่พนักงานคนนี้สามารถให้ได้ (เว้นว่างหากไม่จำกัด)</p>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="ไม่จำกัด"
                value={editDiscountLimit ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  setEditDiscountLimit(v === '' ? null : parseFloat(v));
                }}
                className="max-w-[200px]"
              />
            </div>

            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSavePermissions} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกสิทธิ์'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials dialog (admin only) */}
      <Dialog open={!!credUser} onOpenChange={(o) => !o && setCredUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              ชื่อผู้ใช้และรหัสผ่าน
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อผู้ใช้</Label>
              <Input value={credUser?.username || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  type={credVisible ? 'text' : 'password'}
                  value={credLoading ? '' : credPassword}
                  placeholder={credLoading ? 'กำลังโหลด...' : ''}
                  onChange={e => setCredPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={() => setCredVisible(v => !v)}
                >
                  {credVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">แก้ไขช่องนี้แล้วกดบันทึกเพื่อตั้งรหัสผ่านใหม่</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCredUser(null)}>ปิด</Button>
              <Button onClick={handleSavePassword} disabled={saving || credLoading}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionManagement;
