
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Printer } from 'lucide-react';

interface PrinterConfigForm {
  printer_name: string;
  printer_model: string;
  connection_type: string;
  usb_path: string;
  paper_width: string;
  print_speed: string;
  auto_cut: boolean;
  test_print_enabled: boolean;
}

const PrinterConfiguration = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch } = useForm<PrinterConfigForm>({
    defaultValues: {
      printer_name: 'เครื่องพิมพ์หลัก',
      printer_model: 'STAR TSP-143III',
      connection_type: 'USB',
      usb_path: '/dev/usb/lp0',
      paper_width: '58',
      print_speed: 'ปกติ',
      auto_cut: true,
      test_print_enabled: true
    }
  });

  const connectionType = watch('connection_type');
  const autoCut = watch('auto_cut');
  const testPrintEnabled = watch('test_print_enabled');

  const onSubmit = async (data: PrinterConfigForm) => {
    setLoading(true);
    try {
      // Simulate saving printer configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'การตั้งค่าเครื่องพิมพ์ได้ถูกบันทึกเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    setLoading(true);
    try {
      // Simulate test print
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'ทดสอบการพิมพ์สำเร็จ',
        description: 'เครื่องพิมพ์ทำงานปกติ'
      });
    } catch (error) {
      toast({
        title: 'ทดสอบการพิมพ์ล้มเหลว',
        description: 'กรุณาตรวจสอบการเชื่อมต่อเครื่องพิมพ์',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            ข้อมูลเครื่องพิมพ์
          </CardTitle>
          <CardDescription>ตั้งค่าข้อมูลเครื่องพิมพ์หลัก</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="printer_name">ชื่อเครื่องพิมพ์</Label>
            <Input
              id="printer_name"
              {...register('printer_name')}
              placeholder="ใส่ชื่อเครื่องพิมพ์"
            />
          </div>

          <div>
            <Label htmlFor="printer_model">รุ่นเครื่องพิมพ์</Label>
            <Select onValueChange={(value) => setValue('printer_model', value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกรุ่นเครื่องพิมพ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAR TSP-143III">STAR TSP-143III</SelectItem>
                <SelectItem value="EPSON TM-T20III">EPSON TM-T20III</SelectItem>
                <SelectItem value="CITIZEN CT-S310II">CITIZEN CT-S310II</SelectItem>
                <SelectItem value="BIXOLON SRP-350plusIII">BIXOLON SRP-350plusIII</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การเชื่อมต่อ</CardTitle>
          <CardDescription>ตั้งค่าวิธีการเชื่อมต่อเครื่องพิมพ์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="connection_type">ประเภทการเชื่อมต่อ</Label>
            <Select onValueChange={(value) => setValue('connection_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทการเชื่อมต่อ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USB">USB</SelectItem>
                <SelectItem value="Ethernet">Ethernet</SelectItem>
                <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                <SelectItem value="WiFi">WiFi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {connectionType === 'USB' && (
            <div>
              <Label htmlFor="usb_path">USB Device Path</Label>
              <Input
                id="usb_path"
                {...register('usb_path')}
                placeholder="/dev/usb/lp0"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่าการพิมพ์</CardTitle>
          <CardDescription>ปรับแต่งรูปแบบการพิมพ์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paper_width">ความกว้างกระดาษ (มม.)</Label>
              <Select onValueChange={(value) => setValue('paper_width', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกความกว้างกระดาษ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58">58 มม.</SelectItem>
                  <SelectItem value="80">80 มม.</SelectItem>
                  <SelectItem value="110">110 มม.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="print_speed">ความเร็วการพิมพ์</Label>
              <Select onValueChange={(value) => setValue('print_speed', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกความเร็วการพิมพ์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ช้า">ช้า</SelectItem>
                  <SelectItem value="ปกติ">ปกติ</SelectItem>
                  <SelectItem value="เร็ว">เร็ว</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div>
              <Label htmlFor="auto_cut" className="text-sm font-medium">
                ตัดกระดาษอัตโนมัติ
              </Label>
              <p className="text-xs text-gray-500 mt-1">ตัดกระดาษอัตโนมัติเมื่อพิมพ์เสร็จ</p>
            </div>
            <Switch
              id="auto_cut"
              checked={autoCut}
              onCheckedChange={(checked) => setValue('auto_cut', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div>
              <Label htmlFor="test_print_enabled" className="text-sm font-medium">
                เปิดใช้งานทดสอบการพิมพ์
              </Label>
              <p className="text-xs text-gray-500 mt-1">อนุญาตให้ทดสอบการพิมพ์ได้</p>
            </div>
            <Switch
              id="test_print_enabled"
              checked={testPrintEnabled}
              onCheckedChange={(checked) => setValue('test_print_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-coffee-600 hover:bg-coffee-700">
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
        
        {testPrintEnabled && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleTestPrint}
            disabled={loading}
          >
            {loading ? 'กำลังทดสอบ...' : 'ทดสอบการพิมพ์'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default PrinterConfiguration;
