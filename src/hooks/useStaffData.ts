
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email?: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAttendance {
  id: string;
  staff_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  work_hours: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffPermission {
  id: string;
  staff_id: string;
  permission_name: string;
  is_granted: boolean;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'manage_orders', name: 'จัดการออเดอร์', description: 'สามารถสร้าง แก้ไข ยกเลิกออเดอร์ได้' },
  { key: 'manage_menu', name: 'จัดการเมนู', description: 'สามารถเพิ่ม แก้ไข ลบเมนูได้' },
  { key: 'manage_inventory', name: 'จัดการสต็อก', description: 'สามารถจัดการวัตถุดิบและสต็อกได้' },
  { key: 'manage_staff', name: 'จัดการพนักงาน', description: 'สามารถจัดการข้อมูลพนักงานได้' },
  { key: 'view_reports', name: 'ดูรายงาน', description: 'สามารถดูรายงานต่างๆ ได้' },
  { key: 'manage_promotions', name: 'จัดการโปรโมชั่น', description: 'สามารถสร้างและจัดการโปรโมชั่นได้' },
  { key: 'manage_members', name: 'จัดการสมาชิก', description: 'สามารถจัดการข้อมูลสมาชิกได้' },
  { key: 'access_pos', name: 'เข้าถึงระบบ POS', description: 'สามารถใช้งานระบบขายหน้าร้านได้' },
  { key: 'manage_settings', name: 'จัดการตั้งค่าระบบ', description: 'สามารถแก้ไขการตั้งค่าระบบได้' },
  { key: 'void_transactions', name: 'ยกเลิกการขาย', description: 'สามารถยกเลิกการขายที่เสร็จแล้วได้' }
];

export const useStaffData = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [permissions, setPermissions] = useState<StaffPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStaff((data || []) as Staff[]);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลพนักงานได้',
        variant: 'destructive'
      });
    }
  };

  const fetchAttendance = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('time_attendance')
        .select('*')
        .order('date', { ascending: false })
        .order('check_in_time', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAttendance((data || []) as StaffAttendance[]);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลการลงเวลาได้',
        variant: 'destructive'
      });
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_permissions')
        .select('*');

      if (error) throw error;
      setPermissions((data || []) as StaffPermission[]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลสิทธิ์การเข้าถึงได้',
        variant: 'destructive'
      });
    }
  };

  const createStaff = async (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert(staffData)
        .select()
        .single();

      if (error) throw error;

      setStaff(prev => [...prev, data as Staff]);
      toast({
        title: 'สำเร็จ',
        description: 'เพิ่มพนักงานใหม่แล้ว'
      });

      return data as Staff;
    } catch (error) {
      console.error('Error creating staff:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มพนักงานได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateStaff = async (staffId: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', staffId)
        .select()
        .single();

      if (error) throw error;

      setStaff(prev => prev.map(s => s.id === staffId ? data as Staff : s));
      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตข้อมูลพนักงานแล้ว'
      });

      return data as Staff;
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตข้อมูลพนักงานได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      setStaff(prev => prev.filter(s => s.id !== staffId));
      toast({
        title: 'สำเร็จ',
        description: 'ลบพนักงานแล้ว'
      });
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลบพนักงานได้',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const checkIn = async (staffId: string, time?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = time || new Date().toTimeString().split(' ')[0];

    try {
      // Check if already checked in today
      const existing = attendance.find(a => a.staff_id === staffId && a.date === today);
      
      if (existing && existing.check_in_time) {
        toast({
          title: 'แจ้งเตือน',
          description: 'พนักงานได้ลงเวลาเข้างานแล้ววันนี้',
          variant: 'destructive'
        });
        return;
      }

      const attendanceData = {
        staff_id: staffId,
        date: today,
        check_in_time: checkInTime,
        status: 'present' as const
      };

      const { data, error } = await supabase
        .from('time_attendance')
        .upsert(attendanceData, { onConflict: 'staff_id,date' })
        .select()
        .single();

      if (error) throw error;

      setAttendance(prev => {
        const filtered = prev.filter(a => !(a.staff_id === staffId && a.date === today));
        return [data as StaffAttendance, ...filtered];
      });

      toast({
        title: 'สำเร็จ',
        description: 'ลงเวลาเข้างานแล้ว'
      });

    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลงเวลาเข้างานได้',
        variant: 'destructive'
      });
    }
  };

  const checkOut = async (staffId: string, time?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = time || new Date().toTimeString().split(' ')[0];

    try {
      const existing = attendance.find(a => a.staff_id === staffId && a.date === today);
      
      if (!existing || !existing.check_in_time) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ต้องลงเวลาเข้างานก่อน',
          variant: 'destructive'
        });
        return;
      }

      // Calculate work hours
      const checkIn = new Date(`${today}T${existing.check_in_time}`);
      const checkOut = new Date(`${today}T${checkOutTime}`);
      const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      const { data, error } = await supabase
        .from('time_attendance')
        .update({
          check_out_time: checkOutTime,
          work_hours: workHours
        })
        .eq('staff_id', staffId)
        .eq('date', today)
        .select()
        .single();

      if (error) throw error;

      setAttendance(prev => prev.map(a => 
        a.staff_id === staffId && a.date === today ? data as StaffAttendance : a
      ));

      toast({
        title: 'สำเร็จ',
        description: `ลงเวลาออกงานแล้ว (ทำงาน ${workHours.toFixed(2)} ชั่วโมง)`
      });

    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถลงเวลาออกงานได้',
        variant: 'destructive'
      });
    }
  };

  const updatePermission = async (staffId: string, permissionName: string, isGranted: boolean) => {
    try {
      const { data, error } = await supabase
        .from('staff_permissions')
        .upsert({
          staff_id: staffId,
          permission_name: permissionName,
          is_granted: isGranted
        }, { onConflict: 'staff_id,permission_name' })
        .select()
        .single();

      if (error) throw error;

      setPermissions(prev => {
        const filtered = prev.filter(p => !(p.staff_id === staffId && p.permission_name === permissionName));
        return [...filtered, data as StaffPermission];
      });

      toast({
        title: 'สำเร็จ',
        description: `${isGranted ? 'ให้' : 'ยกเลิก'}สิทธิ์แล้ว`
      });

    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสิทธิ์ได้',
        variant: 'destructive'
      });
    }
  };

  const getStaffPermissions = (staffId: string) => {
    return permissions.filter(p => p.staff_id === staffId);
  };

  const getStaffAttendanceToday = (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(a => a.staff_id === staffId && a.date === today);
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.date === today);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStaff(),
        fetchAttendance(),
        fetchPermissions()
      ]);
      setLoading(false);
    };

    loadData();

    // Subscribe to real-time changes
    const staffSubscription = supabase
      .channel('staff_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        fetchStaff();
      })
      .subscribe();

    const attendanceSubscription = supabase
      .channel('attendance_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_attendance' }, () => {
        fetchAttendance();
      })
      .subscribe();

    const permissionsSubscription = supabase
      .channel('permissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_permissions' }, () => {
        fetchPermissions();
      })
      .subscribe();

    return () => {
      staffSubscription.unsubscribe();
      attendanceSubscription.unsubscribe();
      permissionsSubscription.unsubscribe();
    };
  }, []);

  return {
    staff,
    attendance,
    permissions,
    availablePermissions: AVAILABLE_PERMISSIONS,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    checkIn,
    checkOut,
    updatePermission,
    getStaffPermissions,
    getStaffAttendanceToday,
    getTodayAttendance,
    refetch: {
      staff: fetchStaff,
      attendance: fetchAttendance,
      permissions: fetchPermissions
    }
  };
};
