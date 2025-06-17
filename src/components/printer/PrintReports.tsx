
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, BarChart3, Package, Users, TrendingUp, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const PrintReports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    {
      id: 'daily-sales',
      title: 'รายงานยอดขายรายวัน',
      description: 'สรุปยอดขายและรายได้ประจำวัน',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      id: 'monthly-sales',
      title: 'รายงานยอดขายรายเดือน',
      description: 'สรุปยอดขายและรายได้ประจำเดือน',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'inventory',
      title: 'รายงานสินค้าคงคลัง',
      description: 'สถานะสต็อกสินค้าและวัตถุดิบ',
      icon: Package,
      color: 'text-orange-600'
    },
    {
      id: 'customer',
      title: 'รายงานลูกค้า',
      description: 'ข้อมูลสมาชิกและการซื้อสินค้า',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 'receipts',
      title: 'พิมพ์ใบเสร็จซ้ำ',
      description: 'พิมพ์ใบเสร็จที่ผ่านมาอีกครั้ง',
      icon: FileText,
      color: 'text-gray-600'
    }
  ];

  const handlePrintReport = async (reportType: string) => {
    setLoading(true);
    try {
      // Simulate print report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportName = reportTypes.find(r => r.id === reportType)?.title || 'รายงาน';
      
      toast({
        title: 'ส่งงานพิมพ์สำเร็จ',
        description: `${reportName} ถูกส่งไปยังคิวการพิมพ์แล้ว`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถส่งงานพิมพ์ได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>พิมพ์รายงาน</CardTitle>
          <CardDescription>เลือกประเภทรายงานที่ต้องการพิมพ์</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${report.color}`} />
                      <div className="flex-1">
                        <CardTitle className="text-sm">{report.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handlePrintReport(report.id)}
                      disabled={loading}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      พิมพ์
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าการพิมพ์รายงาน</CardTitle>
          <CardDescription>กำหนดช่วงเวลาและรูปแบบการพิมพ์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>วันที่เริ่มต้น</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'PP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>วันที่สิ้นสุด</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'PP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>รูปแบบรายงาน</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกรูปแบบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">สรุป</SelectItem>
                  <SelectItem value="detailed">รายละเอียด</SelectItem>
                  <SelectItem value="chart">แผนภูมิ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>จำนวนสำเนา</Label>
              <Input type="number" placeholder="1" min="1" max="10" defaultValue="1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>พิมพ์ใบเสร็จซ้ำ</CardTitle>
          <CardDescription>ค้นหาและพิมพ์ใบเสร็จที่ผ่านมาอีกครั้ง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>หมายเลขใบเสร็จ</Label>
              <Input placeholder="เช่น 001234" />
            </div>
            
            <div>
              <Label>วันที่</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PP', { locale: th }) : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button className="w-full" disabled={loading}>
                <Printer className="h-4 w-4 mr-2" />
                ค้นหาและพิมพ์
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintReports;
