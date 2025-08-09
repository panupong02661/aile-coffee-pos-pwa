import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Calendar as CalendarIcon, LogIn, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Staff {
  id: string;
  name: string;
  position: string;
}

interface TimeAttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number;
  status: string;
  notes: string | null;
  staff: Staff;
}

const TimeAttendance = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<TimeAttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('08:00');
  const [checkOutTime, setCheckOutTime] = useState<string>('17:00');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, position')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลพนักงานได้', variant: 'destructive' });
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('time_attendance')
        .select(`
          *,
          staff (
            id,
            name,
            position
          )
        `)
        .eq('date', dateString)
        .order('staff(name)');

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลการเข้างานได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkHours = (checkIn: string, checkOut: string): number => {
    const checkInTime = new Date(`2000-01-01 ${checkIn}`);
    const checkOutTime = new Date(`2000-01-01 ${checkOut}`);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  };

  const recordAttendance = async () => {
    if (!selectedStaff) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกพนักงาน', variant: 'destructive' });
      return;
    }

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const workHours = checkOutTime ? calculateWorkHours(checkInTime, checkOutTime) : 0;
      
      // Check if record already exists
      const existingRecord = attendanceRecords.find(record => record.staff_id === selectedStaff);
      
      const attendanceData = {
        staff_id: selectedStaff,
        date: dateString,
        check_in_time: checkInTime,
        check_out_time: checkOutTime || null,
        work_hours: workHours,
        status: workHours >= 8 ? 'present' : workHours >= 4 ? 'half_day' : 'late'
      };

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('time_attendance')
          .update(attendanceData)
          .eq('id', existingRecord.id);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดตข้อมูลการเข้างานเรียบร้อยแล้ว' });
      } else {
        // Insert new record
        const { error } = await supabase
          .from('time_attendance')
          .insert([attendanceData]);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'บันทึกการเข้างานเรียบร้อยแล้ว' });
      }

      await fetchAttendanceRecords();
      setSelectedStaff('');
      setCheckInTime('08:00');
      setCheckOutTime('17:00');
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกการเข้างานได้', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">เข้างานเต็ม</Badge>;
      case 'half_day':
        return <Badge className="bg-yellow-100 text-yellow-800">เข้างานสาย</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800">มาสาย</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">ขาดงาน</Badge>;
      default:
        return <Badge variant="outline">ไม่ระบุ</Badge>;
    }
  };

  const getWorkHoursDisplay = (hours: number) => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    return `${fullHours} ชม. ${minutes} น.`;
  };

  return (
    <div className="space-y-6">
      {/* Date Selection and Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            บันทึกเวลาทำงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>วันที่</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>พนักงาน</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกพนักงาน" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>เวลาเข้างาน</Label>
              <Input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>เวลาออกงาน</Label>
              <Input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={recordAttendance}>
              <LogIn className="w-4 h-4 mr-2" />
              บันทึกเวลาทำงาน
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            บันทึกเวลาทำงานวันที่ {format(selectedDate, "PPP", { locale: th })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>เวลาเข้า</TableHead>
                  <TableHead>เวลาออก</TableHead>
                  <TableHead>ชั่วโมงทำงาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      ยังไม่มีการบันทึกเวลาทำงานในวันนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {record.staff.name}
                        </div>
                      </TableCell>
                      <TableCell>{record.staff.position}</TableCell>
                      <TableCell>
                        {record.check_in_time ? (
                          <div className="flex items-center">
                            <LogIn className="w-4 h-4 mr-2 text-green-600" />
                            {record.check_in_time}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? (
                          <div className="flex items-center">
                            <LogOut className="w-4 h-4 mr-2 text-red-600" />
                            {record.check_out_time}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {record.work_hours > 0 ? getWorkHoursDisplay(record.work_hours) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">เข้างานวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceRecords.filter(r => r.status === 'present').length}
            </div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">เข้างานสาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceRecords.filter(r => r.status === 'late').length}
            </div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ขาดงาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {staff.length - attendanceRecords.length}
            </div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ยังไม่เช็คเอาท์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attendanceRecords.filter(r => !r.check_out_time).length}
            </div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeAttendance;
