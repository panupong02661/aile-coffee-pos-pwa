
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DailyReportTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const testDailyReport = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing daily report function...');
      
      const { data, error } = await supabase.functions.invoke('send-daily-report', {
        body: { manual_trigger: true }
      });

      if (error) {
        console.error('❌ Error invoking function:', error);
        throw error;
      }

      console.log('✅ Function response:', data);
      setLastResult(data);
      
      if (data.success) {
        toast.success(`รายงานส่งสำเร็จ! ส่งไปยัง ${data.sentCount} แพลตฟอร์ม`);
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error('ไม่สามารถทดสอบส่งรายงานได้');
      setLastResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return {
      thai: thaiTime.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
      time: thaiTime.toTimeString().slice(0, 5)
    };
  };

  const currentTime = getCurrentTime();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          ทดสอบส่งรายงานประจำวัน
        </CardTitle>
        <CardDescription>
          ทดสอบการส่งรายงานและตรวจสอบสถานะระบบ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">เวลาปัจจุบัน (GMT+7)</p>
            <p className="font-mono text-lg">{currentTime.thai}</p>
            <p className="text-sm text-muted-foreground">เวลาสั้น: {currentTime.time}</p>
          </div>
          <Button 
            onClick={testDailyReport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'กำลังส่ง...' : 'ทดสอบส่งรายงาน'}
          </Button>
        </div>

        {lastResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                ผลการทดสอบล่าสุด
              </span>
              <Badge variant={lastResult.success ? "default" : "destructive"}>
                {lastResult.success ? 'สำเร็จ' : 'ล้มเหลว'}
              </Badge>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>ข้อความ:</strong> {lastResult.message}</p>
              
              {lastResult.reportData && (
                <div className="space-y-1">
                  <p><strong>วันที่รายงาน:</strong> {lastResult.reportData.date}</p>
                  <p><strong>เวลาที่ส่ง:</strong> {lastResult.reportData.time}</p>
                  <p><strong>เวลาปัจจุบัน:</strong> {lastResult.reportData.currentTimeStr}</p>
                  <p><strong>เวลาที่กำหนด:</strong> {lastResult.reportData.scheduledTime}</p>
                  <p><strong>จำนวนออเดอร์:</strong> {lastResult.reportData.totalOrders}</p>
                  <p><strong>ยอดขายรวม:</strong> {lastResult.reportData.totalSales?.toLocaleString()} บาท</p>
                </div>
              )}

              {lastResult.sentCount !== undefined && (
                <p><strong>ส่งไปยังแพลตฟอร์ม:</strong> {lastResult.sentCount} แห่ง</p>
              )}

              {lastResult.errors && lastResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-red-600 font-medium">ข้อผิดพลาด:</p>
                  <ul className="list-disc list-inside text-sm">
                    {lastResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lastResult.error && (
                <p className="text-red-600"><strong>ข้อผิดพลาด:</strong> {lastResult.error}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">หมายเหตุ:</p>
            <p className="text-blue-700">
              • ระบบจะส่งรายงานอัตโนมัติตามเวลาที่ตั้งค่าไว้<br/>
              • ใช้ปุ่มทดสอบเพื่อตรวจสอบการทำงานของระบบ<br/>
              • ตรวจสอบการตั้งค่า Webhook ใน Discord หากไม่ได้รับรายงาน
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReportTester;
