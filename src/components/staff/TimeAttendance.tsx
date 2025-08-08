
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Timer, Download, Filter } from 'lucide-react';
import { useStaffData } from '@/hooks/useStaffData';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { th } from 'date-fns/locale';

const TimeAttendance = () => {
  const { 
    staff, 
    attendance, 
    loading, 
    checkIn, 
    checkOut, 
    getTodayAttendance,
    getStaffAttendanceToday,
    refetch 
  } = useStaffData();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date(), { locale: th }),
    to: endOfWeek(new Date(), { locale: th })
  });
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  const todayAttendance = getTodayAttendance();
  const currentTime = new Date().toTimeString().split(' ')[0].slice(0, 5);

  const handleQuickCheckIn = async (staffId: string) => {
    try {
      await checkIn(staffId);
      refetch.attendance();
    } catch (error) {
      console.error('Error with quick check in:', error);
    }
  };

  const handleQuickCheckOut = async (staffId: string) => {
    try {
      await checkOut(staffId);
      refetch.attendance();
    } catch (error) {
      console.error('Error with quick check out:', error);
    }
  };

  const handleManualCheckIn = async (staffId: string) => {
    if (!checkInTime) return;
    try {
      await checkIn(staffId, checkInTime + ':00');
      setCheckInTime('');
      refetch.attendance();
    } catch (error) {
      console.error('Error with manual check in:', error);
    }
  };

  const handleManualCheckOut = async (staffId: string) => {
    if (!checkOutTime) return;
    try {
      await checkOut(staffId, checkOutTime + ':00');
      setCheckOutTime('');
      refetch.attendance();
    } catch (error) {
      console.error('Error with manual check out:', error);
    }
  };

  const getAttendanceStatus = (staffId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendance.find(a => a.staff_id === staffId && a.date === dateStr);
    
    if (!record || !record.check_in_time) return 'absent';
    if (!record.check_out_time) return 'working';
    return 'completed';
  };

  const getWeeklyStats = () => {
    const weekAttendance = attendance.filter(a => {
      const date = new Date(a.date);
      return date >= dateRange.from && date <= dateRange.to;
    });

    return {
      totalPresent: weekAttendance.filter(a => a.check_in_time).length,
      totalAbsent: staff.length * 7 - weekAttendance.filter(a => a.check_in_time).length,
      totalHours: weekAttendance.reduce((sum, a) => sum + (a.work_hours || 0), 0),
      avgHoursPerDay: weekAttendance.length > 0 ? 
        weekAttendance.reduce((sum, a) => sum + (a.work_hours || 0), 0) / weekAttendance.length : 0
    };
  };

  const weeklyStats = getWeeklyStats();

  const exportAttendanceData = () => {
    const csvData = attendance.map(record => {
      const staffMember = staff.find(s => s.id === record.staff_id);
      return {
        'วันที่': record.date,
        'ชื่อพนักงาน': staffMember?.name || 'ไม่ทราบ',
        'เวลาเข้า': record.check_in_time || '-',
        'เวลาออก': record.check_out_time || '-',
        'ชั่วโมงทำงาน': record.work_hours || 0,
        'สถานะ': record.status,
        'หมายเหตุ': record.notes || ''
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
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
      {/* Header with Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">มาวันนี้</p>
                <p className="text-2xl font-bold">{todayAttendance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ขาดวันนี้</p>
                <p className="text-2xl font-bold">{staff.length - todayAttendance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ชั่วโมงรวม (สัปดาห์)</p>
                <p className="text-2xl font-bold">{weeklyStats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">เฉลี่ย/วัน</p>
                <p className="text-2xl font-bold">{weeklyStats.avgHoursPerDay.toFixed(1)}ช.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ลงเวลาด่วน
            </CardTitle>
            <div className="text-sm text-gray-600">
              เวลาปัจจุบัน: {currentTime}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.filter(s => s.status === 'active').map(member => {
              const todayRecord = getStaffAttendanceToday(member.id);
              const hasCheckedIn = todayRecord?.check_in_time;
              const hasCheckedOut = todayRecord?.check_out_time;

              return (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.position}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {hasCheckedIn ? (
                      <div className="text-sm">
                        <div className="text-green-600">
                          ✓ เข้างาน: {todayRecord.check_in_time}
                        </div>
                        {hasCheckedOut && (
                          <div className="text-blue-600">
                            ← ออกงาน: {todayRecord.check_out_time}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">ยังไม่ได้ลงเวลา</Badge>
                    )}

                    <div className="flex gap-2">
                      {!hasCheckedIn ? (
                        <Button
                          size="sm"
                          onClick={() => handleQuickCheckIn(member.id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          เข้างาน
                        </Button>
                      ) : !hasCheckedOut ? (
                        <Button
                          size="sm"
                          onClick={() => handleQuickCheckOut(member.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        >
                          ออกงาน
                        </Button>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 justify-center py-1">
                          เสร็จสิ้น ({(todayRecord.work_hours || 0).toFixed(1)}ช.)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Time Entry */}
      <Card>
        <CardHeader>
          <CardTitle>ลงเวลาด้วยตนเอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">ลงเวลาเข้างาน</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>เลือกพนักงาน</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพนักงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>เวลา</Label>
                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {/* handle manual check in */}}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ลงเวลาเข้างาน
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">ลงเวลาออกงาน</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>เลือกพนักงาน</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพนักงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => {
                        const record = getStaffAttendanceToday(s.id);
                        return record?.check_in_time && !record?.check_out_time;
                      }).map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>เวลา</Label>
                  <Input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {/* handle manual check out */}}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                ลงเวลาออกงาน
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>รายงานการลงเวลา</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportAttendanceData}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                ส่งออก CSV
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, 'dd/MM/yyyy', { locale: th })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>พนักงาน</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลาเข้า</TableHead>
                <TableHead>เวลาออก</TableHead>
                <TableHead>ชั่วโมงทำงาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance
                .filter(record => {
                  const recordDate = new Date(record.date);
                  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
                  return record.date === selectedDateStr;
                })
                .map((record) => {
                  const staffMember = staff.find(s => s.id === record.staff_id);
                  return (
                    <TableRow key={`${record.staff_id}-${record.date}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{staffMember?.name}</div>
                            <div className="text-sm text-gray-500">{staffMember?.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'dd/MM/yyyy', { locale: th })}
                      </TableCell>
                      <TableCell>
                        {record.check_in_time ? (
                          <span className="text-green-600">{record.check_in_time}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? (
                          <span className="text-blue-600">{record.check_out_time}</span>
                        ) : record.check_in_time ? (
                          <Badge variant="secondary">ยังทำงาน</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.work_hours > 0 ? (
                          <span className="font-medium">{record.work_hours.toFixed(2)} ชั่วโมง</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {record.status === 'present' ? 'มาทำงาน' :
                           record.status === 'absent' ? 'ขาดงาน' :
                           record.status === 'late' ? 'มาสาย' : 'อื่นๆ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {record.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          {attendance.filter(r => r.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีข้อมูลการลงเวลาในวันที่เลือก
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeAttendance;
