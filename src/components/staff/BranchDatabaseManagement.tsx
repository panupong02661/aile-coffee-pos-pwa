
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Plus, Edit, Trash2, Database, Globe, Link, Users, 
  Store, MapPin, Server, GitBranch 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Shop {
  id: string;
  shop_name: string;
  branch_name: string | null;
  branch_code: string | null;
  address: string | null;
  phone: string | null;
  database_mode: string;
  supabase_project_url: string | null;
  supabase_project_key: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserShopAssignment {
  id: string;
  user_id: string;
  shop_id: string;
  is_primary: boolean;
  assigned_at: string;
}

interface UserData {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
}

const BranchDatabaseManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [assignments, setAssignments] = useState<UserShopAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [selectedShopForAssign, setSelectedShopForAssign] = useState<Shop | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [shopForm, setShopForm] = useState({
    shop_name: '',
    branch_name: '',
    branch_code: '',
    address: '',
    phone: '',
    database_mode: 'multi_tenant',
    supabase_project_url: '',
    supabase_project_key: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shopsRes, usersRes, assignRes] = await Promise.all([
        supabase.from('shops').select('*').order('created_at'),
        supabase.from('users').select('id, username, full_name, role').order('created_at'),
        supabase.from('user_shop_assignments').select('*'),
      ]);

      if (shopsRes.error) throw shopsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (assignRes.error) throw assignRes.error;

      setShops((shopsRes.data as any[]) || []);
      setUsers((usersRes.data as any[]) || []);
      setAssignments((assignRes.data as any[]) || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateShop = () => {
    setEditingShop(null);
    setShopForm({
      shop_name: '', branch_name: '', branch_code: '', address: '', phone: '',
      database_mode: 'multi_tenant', supabase_project_url: '', supabase_project_key: '',
    });
    setIsShopDialogOpen(true);
  };

  const openEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setShopForm({
      shop_name: shop.shop_name,
      branch_name: shop.branch_name || '',
      branch_code: shop.branch_code || '',
      address: shop.address || '',
      phone: shop.phone || '',
      database_mode: shop.database_mode,
      supabase_project_url: shop.supabase_project_url || '',
      supabase_project_key: shop.supabase_project_key || '',
    });
    setIsShopDialogOpen(true);
  };

  const handleSaveShop = async () => {
    if (!shopForm.shop_name) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อร้าน', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        shop_name: shopForm.shop_name,
        branch_name: shopForm.branch_name || null,
        branch_code: shopForm.branch_code || null,
        address: shopForm.address || null,
        phone: shopForm.phone || null,
        database_mode: shopForm.database_mode,
        supabase_project_url: shopForm.database_mode === 'separate_project' ? (shopForm.supabase_project_url || null) : null,
        supabase_project_key: shopForm.database_mode === 'separate_project' ? (shopForm.supabase_project_key || null) : null,
      };

      if (editingShop) {
        const { data: updated, error } = await supabase
          .from('shops')
          .update(data)
          .eq('id', editingShop.id)
          .select('id');
        if (error) throw error;
        if (!updated || updated.length === 0) {
          throw new Error('ไม่มีสิทธิ์แก้ไขสาขานี้ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล');
        }
        toast({ title: 'สำเร็จ', description: 'แก้ไขข้อมูลสาขาแล้ว' });
      } else {
        const { data: created, error } = await supabase.from('shops').insert(data).select('id');
        if (error) throw error;
        if (!created || created.length === 0) {
          throw new Error('ไม่มีสิทธิ์เพิ่มสาขา กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล');
        }
        toast({ title: 'สำเร็จ', description: 'เพิ่มสาขาใหม่แล้ว' });
      }
      setIsShopDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'ข้อผิดพลาด', description: error.message || 'ไม่สามารถบันทึกได้', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('ต้องการลบสาขานี้หรือไม่?')) return;
    try {
      const { error } = await supabase.from('shops').delete().eq('id', shopId);
      if (error) throw error;
      toast({ title: 'สำเร็จ', description: 'ลบสาขาแล้ว' });
      fetchData();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบได้', variant: 'destructive' });
    }
  };

  const openAssignUsers = (shop: Shop) => {
    setSelectedShopForAssign(shop);
    setIsAssignDialogOpen(true);
  };

  const isUserAssigned = (userId: string, shopId: string) => {
    return assignments.some(a => a.user_id === userId && a.shop_id === shopId);
  };

  const isPrimaryAssignment = (userId: string, shopId: string) => {
    return assignments.some(a => a.user_id === userId && a.shop_id === shopId && a.is_primary);
  };

  const handleToggleAssignment = async (userId: string, shopId: string, assigned: boolean) => {
    try {
      if (assigned) {
        const { error } = await supabase.from('user_shop_assignments').insert({
          user_id: userId,
          shop_id: shopId,
          assigned_by: currentUser?.id || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_shop_assignments')
          .delete()
          .eq('user_id', userId)
          .eq('shop_id', shopId);
        if (error) throw error;
      }
      fetchData();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเปลี่ยนแปลงได้', variant: 'destructive' });
    }
  };

  const handleTogglePrimary = async (userId: string, shopId: string, isPrimary: boolean) => {
    try {
      // Remove other primary flags for this user
      if (isPrimary) {
        await supabase.from('user_shop_assignments')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }
      const { error } = await supabase.from('user_shop_assignments')
        .update({ is_primary: isPrimary })
        .eq('user_id', userId)
        .eq('shop_id', shopId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเปลี่ยนแปลงได้', variant: 'destructive' });
    }
  };

  const getShopAssignedUsers = (shopId: string) => {
    const assignedUserIds = assignments.filter(a => a.shop_id === shopId).map(a => a.user_id);
    return users.filter(u => assignedUserIds.includes(u.id));
  };

  const getUserAssignedShops = (userId: string) => {
    const assignedShopIds = assignments.filter(a => a.user_id === userId).map(a => a.shop_id);
    return shops.filter(s => assignedShopIds.includes(s.id));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-500/10 text-red-700 border-red-200 text-[10px]">Admin</Badge>;
      case 'manager': return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[10px]">Manager</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground text-[10px]">Staff</Badge>;
    }
  };

  const getDbModeBadge = (mode: string) => {
    if (mode === 'multi_tenant') {
      return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200"><Database className="w-3 h-3 mr-1" />Multi-tenant (shop_id)</Badge>;
    }
    return <Badge className="bg-violet-500/10 text-violet-700 border-violet-200"><Server className="w-3 h-3 mr-1" />แยกโปรเจกต์</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">ฐานข้อมูล Supabase (PostgreSQL) - รองรับ Multi-tenant</p>
              <p className="text-blue-700">กำหนดสาขาของร้านค้าและเชื่อมโยงผู้ใช้ (Manager / Staff) กับสาขา โดยรองรับ 2 โมเดล:</p>
              <ul className="list-disc pl-5 text-blue-700 space-y-0.5">
                <li><strong>Multi-tenant (shop_id)</strong> — เพิ่มรหัสสาขา (shop_id) ในทุกตาราง เพื่อแยกข้อมูลตามสาขาภายในฐานข้อมูลเดียวกัน</li>
                <li><strong>แยกโปรเจกต์</strong> — สร้างโปรเจกต์ Supabase แยกสำหรับแต่ละร้าน/สาขา เหมาะสำหรับขายระบบให้ร้านต่างๆ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shops List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center text-lg">
                <Building2 className="w-5 h-5 mr-2" />
                จัดการสาขาและฐานข้อมูล
              </CardTitle>
              <CardDescription>เพิ่ม/แก้ไขสาขา กำหนดโมเดลฐานข้อมูล และเชื่อมโยงผู้ใช้</CardDescription>
            </div>
            {currentUser?.role === 'admin' && (
              <Button onClick={openCreateShop} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มสาขา
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {shops.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ยังไม่มีสาขา กดปุ่ม "เพิ่มสาขา" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shops.map(shop => {
                const assignedUsers = getShopAssignedUsers(shop.id);
                return (
                  <Card key={shop.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{shop.shop_name}</h3>
                            {shop.branch_name && (
                              <Badge variant="outline"><GitBranch className="w-3 h-3 mr-1" />{shop.branch_name}</Badge>
                            )}
                            {shop.branch_code && (
                              <Badge variant="secondary" className="text-xs">รหัส: {shop.branch_code}</Badge>
                            )}
                            {!shop.is_active && <Badge variant="outline" className="text-muted-foreground">ปิดใช้งาน</Badge>}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {getDbModeBadge(shop.database_mode)}
                            {shop.database_mode === 'separate_project' && shop.supabase_project_url && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                {shop.supabase_project_url.replace('https://', '').substring(0, 30)}...
                              </Badge>
                            )}
                          </div>

                          {shop.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{shop.address}
                            </p>
                          )}

                          {/* Assigned users */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            {assignedUsers.length === 0 ? (
                              <span className="text-xs text-muted-foreground">ยังไม่มีผู้ใช้เชื่อมโยง</span>
                            ) : (
                              assignedUsers.map(u => (
                                <Badge key={u.id} variant="outline" className="text-xs gap-1">
                                  {u.full_name || u.username}
                                  {getRoleBadge(u.role)}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>

                        {currentUser?.role === 'admin' && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openAssignUsers(shop)} title="กำหนดผู้ใช้">
                              <Link className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditShop(shop)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteShop(shop.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Shop Dialog */}
      <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {editingShop ? 'แก้ไขสาขา' : 'เพิ่มสาขาใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>ชื่อร้าน *</Label>
                <Input placeholder="เช่น AILE Coffee" value={shopForm.shop_name}
                  onChange={e => setShopForm(p => ({ ...p, shop_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>ชื่อสาขา</Label>
                <Input placeholder="เช่น สาขาสยาม" value={shopForm.branch_name}
                  onChange={e => setShopForm(p => ({ ...p, branch_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>รหัสสาขา</Label>
                <Input placeholder="เช่น BKK-001" value={shopForm.branch_code}
                  onChange={e => setShopForm(p => ({ ...p, branch_code: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>เบอร์โทร</Label>
                <Input placeholder="02-xxx-xxxx" value={shopForm.phone}
                  onChange={e => setShopForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ที่อยู่</Label>
              <Input placeholder="ที่อยู่สาขา" value={shopForm.address}
                onChange={e => setShopForm(p => ({ ...p, address: e.target.value }))} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                โมเดลฐานข้อมูล
              </Label>
              <Select value={shopForm.database_mode} onValueChange={v => setShopForm(p => ({ ...p, database_mode: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi_tenant">
                    <span className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      Multi-tenant (shop_id ในทุกตาราง)
                    </span>
                  </SelectItem>
                  <SelectItem value="separate_project">
                    <span className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-violet-600" />
                      แยกโปรเจกต์ Supabase
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {shopForm.database_mode === 'multi_tenant' && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  ข้อมูลทุกสาขาจะอยู่ในฐานข้อมูลเดียวกัน แยกด้วย shop_id ในแต่ละตาราง 
                  เหมาะสำหรับร้านที่มีหลายสาขาและต้องการดูภาพรวมได้ง่าย
                </p>
              )}

              {shopForm.database_mode === 'separate_project' && (
                <div className="space-y-3 mt-2 p-3 border rounded-lg bg-violet-50/50">
                  <p className="text-xs text-violet-700">
                    แต่ละร้าน/สาขาจะมีโปรเจกต์ Supabase แยก เหมาะสำหรับขายระบบ SaaS ให้ร้านต่างๆ
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs">Supabase Project URL</Label>
                    <Input placeholder="https://xxxxx.supabase.co" value={shopForm.supabase_project_url}
                      onChange={e => setShopForm(p => ({ ...p, supabase_project_url: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Supabase Anon Key</Label>
                    <Input placeholder="eyJhbGciOi..." value={shopForm.supabase_project_key}
                      onChange={e => setShopForm(p => ({ ...p, supabase_project_key: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsShopDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSaveShop} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : editingShop ? 'บันทึก' : 'เพิ่มสาขา'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              กำหนดผู้ใช้ - {selectedShopForAssign?.shop_name}
              {selectedShopForAssign?.branch_name && ` (${selectedShopForAssign.branch_name})`}
            </DialogTitle>
          </DialogHeader>

          {selectedShopForAssign && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                {getDbModeBadge(selectedShopForAssign.database_mode)}
              </div>

              <div className="overflow-auto max-h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ผู้ใช้</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead className="text-center">เชื่อมโยง</TableHead>
                      <TableHead className="text-center">สาขาหลัก</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.role !== 'admin').map(u => {
                      const assigned = isUserAssigned(u.id, selectedShopForAssign.id);
                      const primary = isPrimaryAssignment(u.id, selectedShopForAssign.id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{u.full_name || u.username}</p>
                              <p className="text-xs text-muted-foreground">@{u.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(u.role)}</TableCell>
                          <TableCell className="text-center">
                            <Switch checked={assigned} onCheckedChange={v => handleToggleAssignment(u.id, selectedShopForAssign.id, v)} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch checked={primary} disabled={!assigned}
                              onCheckedChange={v => handleTogglePrimary(u.id, selectedShopForAssign.id, v)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchDatabaseManagement;
