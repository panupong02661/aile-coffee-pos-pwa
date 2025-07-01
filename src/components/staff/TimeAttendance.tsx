
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ClockIn, ClockOut, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number;
  status: 'present' | 'absent' | 'late' | 'incomplete';
}

const TimeAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate, selectedStaff]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          staff_id: '1',
          staff_name: 'นางสาวสมใจ ใจดี',
          date: selectedDate,
          check_in: '08:00',
          check_out: '17:00',
          total_hours: 9,
          status: 'present'
        },
        {
          id: '2',
          staff_id: '2',
          staff_name: 'นายสมชาย รักงาน',
          date: selectedDate,
          check_in: '08:15',
          check_out: '17:00',
          total_hours: 8.75,
          status: 'late'
        },
        {
          id: '3',
          staff_id: '3',
          staff_name: 'นางสาวมาลี ขยันทำ',
          date: selectedDate,
          check_in: '07:45',
          check_out: null,
          total_hours: 0,
          status: 'incomplete'
        }
      ];

      if (selectedStaff !== 'all') {
        setAttendanceRecords(mockRecords.filter(record => record.staff_id === selectedStaff));
      } else {
        setAttendanceRecords(mockRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (staffId: string, staffName: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => 
      prev.map(record => 
        record.staff_id === staffId && record.date === selectedDate
          ? { ...record, check_in: timeString, status: 'present' }
          : record
      )
    );

    toast({
      title: 'เช็คอินสำเร็จ',
      description: `${staffName} เช็คอินเวลา ${timeString}`
    });
  };

  const handleCheckOut = (staffId: string, staffName: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => 
      prev.map(record => {
        if (record.staff_id === staffId && record.date === selectedDate) {
          const checkIn = record.check_in;
          let totalHours = 0;
          
          if (checkIn) {
            const [checkInHour, checkInMin] = checkIn.split(':').map(Number);
            const [checkOutHour, checkOutMin] = timeString.split(':').map(Number);
            totalHours = (checkOutHour - checkInHour) + (checkOutMin - checkInMin) / 60;
          }

          return {
            ...record,
            check_out: timeString,
            total_hours: Math.round(totalHours * 100) / 100,
            status: 'present'
          };
        }
        return record;
      })
    );

    toast({
      title: 'เช็คเอาท์สำเร็จ',
      description: `${staffName} เช็คเอาท์เวลา ${timeString}`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">เข้างานปกติ</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">เข้างานสาย</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">ขาดงาน</Badge>;
      case 'incomplete':
        return <Badge className="bg-blue-100 text-blue-800">ยังไม่เช็คเอาท์</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            บันทึกเวลาทำงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="เลือกพนักงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">พนักงานทั้งหมด</SelectItem>
                <SelectItem value="1">นางสาวสมใจ ใจดี</SelectItem>
                <SelectItem value="2">นายสมชาย รักงาน</SelectItem>
                <SelectItem value="3">นางสาวมาลี ขยันทำ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>พนักงาน</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>เช็คอิน</TableHead>
                <TableHead>เช็คเอาท์</TableHead>
                <TableHead>ชั่วโมงทำงาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {record.staff_name}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{record.check_in || '-'}</TableCell>
                  <TableCell>{record.check_out || '-'}</TableCell>
                  <TableCell>{record.total_hours} ชั่วโมง</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!record.check_in && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(record.staff_id, record.staff_name)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ClockIn className="w-4 h-4 mr-1" />
                          เช็คอิน
                        </Button>
                      )}
                      {record.check_in && !record.check_out && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckOut(record.staff_id, record.staff_name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <ClockOut className="w-4 h-4 mr-1" />
                          เช็คเอาท์
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เข้างานวันนี้</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'incomplete').length}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เข้างานสาย</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceRecords.filter(r => r.status === 'late').length}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ขาดงาน</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendanceRecords.filter(r => r.status === 'absent').length}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยังไม่เช็คเอาท์</CardTitle>
            <ClockOut className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attendanceRecords.filter(r => r.status === 'incomplete').length}
            </div>
            <p className="text-xs text-muted-foreground">คน</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeAttendance;
