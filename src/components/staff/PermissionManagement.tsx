
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Lock, Unlock, Settings, Eye, Edit, UserX, Save } from 'lucide-react';
import { useStaffData } from '@/hooks/useStaffData';

const PermissionManagement = () => {
  const { 
    staff, 
    permissions, 
    availablePermissions,
    loading, 
    updatePermission, 
    getStaffPermissions 
  } = useStaffData();

  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [bulkPermissions, setBulkPermissions] = useState<Record<string, boolean>>({});

  const handlePermissionToggle = async (staffId: string, permissionName: string, isGranted: boolean) => {
    try {
      await updatePermission(staffId, permissionName, isGranted);
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  const handleBulkPermissionChange = (permissionName: string, isGranted: boolean) => {
    setBulkPermissions(prev => ({
      ...prev,
      [permissionName]: isGranted
    }));
  };

  const applyBulkPermissions = async () => {
    if (!selectedStaffId) return;

    try {
      for (const [permissionName, isGranted] of Object.entries(bulkPermissions)) {
        await updatePermission(selectedStaffId, permissionName, isGranted);
      }
      setBulkPermissions({});
      setSelectedStaffId('');
    } catch (error) {
      console.error('Error applying bulk permissions:', error);
    }
  };

  const getPermissionStats = () => {
    const stats = availablePermissions.map(perm => {
      const grantedCount = permissions.filter(p => 
        p.permission_name === perm.key && p.is_granted
      ).length;
      
      return {
        ...perm,
        grantedCount,
        percentage: staff.length > 0 ? Math.round((grantedCount / staff.length) * 100) : 0
      };
    });

    return stats;
  };

  const getRoleBasedPermissions = (role: string) => {
    const rolePermissions: Record<string, string[]> = {
      'manager': ['manage_orders', 'manage_menu', 'manage_inventory', 'manage_staff', 'view_reports', 'manage_promotions', 'manage_members', 'access_pos', 'manage_settings', 'void_transactions'],
      'supervisor': ['manage_orders', 'manage_menu', 'manage_inventory', 'view_reports', 'manage_promotions', 'manage_members', 'access_pos', 'void_transactions'],
      'cashier': ['manage_orders', 'access_pos', 'manage_members'],
      'cook': ['view_reports', 'access_pos'],
      'waiter': ['manage_orders', 'access_pos', 'manage_members'],
      'cleaner': ['access_pos'],
      'delivery': ['manage_orders', 'access_pos']
    };

    return rolePermissions[role] || [];
  };

  const applyRolePermissions = async (staffId: string, role: string) => {
    const rolePermissions = getRoleBasedPermissions(role);
    
    try {
      // Grant role permissions
      for (const permission of rolePermissions) {
        await updatePermission(staffId, permission, true);
      }
      
      // Revoke permissions not in role
      const otherPermissions = availablePermissions
        .filter(p => !rolePermissions.includes(p.key))
        .map(p => p.key);
        
      for (const permission of otherPermissions) {
        await updatePermission(staffId, permission, false);
      }
    } catch (error) {
      console.error('Error applying role permissions:', error);
    }
  };

  const permissionStats = getPermissionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">สิทธิ์รายบุคคล</TabsTrigger>
          <TabsTrigger value="bulk">จัดการสิทธิ์แบบกลุ่ม</TabsTrigger>
          <TabsTrigger value="overview">ภาพรวมสิทธิ์</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                จัดการสิทธิ์รายบุคคล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead>ตำแหน่ง</TableHead>
                    <TableHead>สิทธิ์ที่ได้รับ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map(member => {
                    const staffPerms = getStaffPermissions(member.id);
                    const grantedPerms = staffPerms.filter(p => p.is_granted);
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.position}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {grantedPerms.length > 0 ? (
                              grantedPerms.map(perm => {
                                const permDetail = availablePermissions.find(p => p.key === perm.permission_name);
                                return (
                                  <Badge key={perm.permission_name} className="bg-green-100 text-green-800 text-xs">
                                    {permDetail?.name || perm.permission_name}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-gray-500 text-sm">ไม่มีสิทธิ์พิเศษ</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const modal = document.getElementById(`permissions-modal-${member.id}`) as HTMLDialogElement;
                                modal?.showModal();
                              }}
                            >
                              <Settings className="w-4 h-4" />
                              จัดการ
                            </Button>
                            <Select
                              onValueChange={(role) => applyRolePermissions(member.id, role)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="ตั้งค่าตามตำแหน่ง" />
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

                          {/* Permission Modal */}
                          <dialog id={`permissions-modal-${member.id}`} className="modal rounded-lg p-0 backdrop:bg-black/50">
                            <div className="bg-white rounded-lg p-6 min-w-[600px] max-w-[800px] max-h-[80vh] overflow-y-auto">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">สิทธิ์การเข้าถึง - {member.name}</h3>
                                <button
                                  onClick={() => {
                                    const modal = document.getElementById(`permissions-modal-${member.id}`) as HTMLDialogElement;
                                    modal?.close();
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <div className="space-y-4">
                                {availablePermissions.map(permission => {
                                  const currentPerm = staffPerms.find(p => p.permission_name === permission.key);
                                  const isGranted = currentPerm?.is_granted || false;
                                  
                                  return (
                                    <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isGranted ? (
                                            <Unlock className="w-4 h-4 text-green-600" />
                                          ) : (
                                            <Lock className="w-4 h-4 text-red-600" />
                                          )}
                                          <span className="font-medium">{permission.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{permission.description}</p>
                                      </div>
                                      <Switch
                                        checked={isGranted}
                                        onCheckedChange={(checked) => 
                                          handlePermissionToggle(member.id, permission.key, checked)
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จัดการสิทธิ์แบบกลุ่ม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>เลือกพนักงาน</Label>
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพนักงานที่ต้องการแก้ไขสิทธิ์" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedStaffId && (
                <div className="space-y-4">
                  <h4 className="font-medium">ตั้งค่าสิทธิ์</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePermissions.map(permission => {
                      const currentPerm = getStaffPermissions(selectedStaffId).find(p => p.permission_name === permission.key);
                      const isCurrentlyGranted = currentPerm?.is_granted || false;
                      const bulkValue = bulkPermissions[permission.key];
                      const displayValue = bulkValue !== undefined ? bulkValue : isCurrentlyGranted;
                      
                      return (
                        <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {displayValue ? (
                                <Unlock className="w-4 h-4 text-green-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">{permission.name}</span>
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          <Switch
                            checked={displayValue}
                            onCheckedChange={(checked) => 
                              handleBulkPermissionChange(permission.key, checked)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={applyBulkPermissions} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setBulkPermissions({});
                        setSelectedStaffId('');
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionStats.map(stat => (
              <Card key={stat.key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{stat.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{stat.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stat.grantedCount}/{staff.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>สรุปสิทธิ์ตามตำแหน่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ตำแหน่ง</TableHead>
                    <TableHead>จำนวนคน</TableHead>
                    <TableHead>สิทธิ์เฉลี่ย</TableHead>
                    <TableHead>สิทธิ์สูงสุด</TableHead>
                    <TableHead>สิทธิ์น้อยสุด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(new Set(staff.map(s => s.position))).map(position => {
                    const positionStaff = staff.filter(s => s.position === position);
                    const allPerms = positionStaff.map(s => getStaffPermissions(s.id).filter(p => p.is_granted).length);
                    const avgPerms = allPerms.length > 0 ? allPerms.reduce((a, b) => a + b, 0) / allPerms.length : 0;
                    const maxPerms = Math.max(...allPerms, 0);
                    const minPerms = Math.min(...allPerms, 0);
                    
                    return (
                      <TableRow key={position}>
                        <TableCell>
                          <Badge variant="outline">{position}</Badge>
                        </TableCell>
                        <TableCell>{positionStaff.length}</TableCell>
                        <TableCell>{avgPerms.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">{maxPerms}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">{minPerms}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionManagement;
