import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Printer, Settings } from 'lucide-react';
import { useAutoPrint } from '@/hooks/useAutoPrint';
import { toast } from 'sonner';

const AutoPrintSettings = () => {
  const { isAutoPrintEnabled, toggleAutoPrint } = useAutoPrint();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          การพิมพ์อัตโนมัติ
        </CardTitle>
        <CardDescription>
          ตั้งค่าการพิมพ์ใบเสร็จอัตโนมัติเมื่อมีออเดอร์ออนไลน์ใหม่
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="auto-print" className="text-sm font-medium">
              เปิดใช้งานการพิมพ์อัตโนมัติ
            </Label>
            <p className="text-xs text-muted-foreground">
              พิมพ์ใบเสร็จทันทีเมื่อมีออเดอร์ออนไลน์ใหม่เข้ามา
            </p>
          </div>
          <Switch
            id="auto-print"
            checked={isAutoPrintEnabled}
            onCheckedChange={toggleAutoPrint}
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">คุณสมบัติการพิมพ์อัตโนมัติ:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• พิมพ์ใบเสร็จทันทีเมื่อมีออเดอร์ออนไลน์ใหม่</li>
            <li>• แสดงรายละเอียดเมนูและ Addon ครบถ้วน</li>
            <li>• ระบุข้อมูลลูกค้าและการชำระเงิน</li>
            <li>• บันทึกลงคิวการพิมพ์เพื่อติดตาม</li>
          </ul>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">หมายเหตุ:</p>
              <p>กรุณาตรวจสอบให้แน่ใจว่าเครื่องพิมพ์เชื่อมต่อและพร้อมใช้งาน</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('ทดสอบการพิมพ์', {
                description: 'กำลังทดสอบการพิมพ์ใบเสร็จ...'
              });
            }}
          >
            ทดสอบการพิมพ์
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoPrintSettings;