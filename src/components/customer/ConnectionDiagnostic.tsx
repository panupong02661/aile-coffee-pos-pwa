
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const ConnectionDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Basic connection
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('members').select('count').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        diagnosticResults.push({
          test: 'การเชื่อมต่อฐานข้อมูล',
          status: 'error',
          message: 'ไม่สามารถเชื่อมต่อได้',
          details: error.message
        });
      } else {
        diagnosticResults.push({
          test: 'การเชื่อมต่อฐานข้อมูล',
          status: 'success',
          message: `เชื่อมต่อสำเร็จ (${responseTime}ms)`,
          details: 'การเชื่อมต่อฐานข้อมูลทำงานปกติ'
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'การเชื่อมต่อฐานข้อมูล',
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        details: error.message || 'ไม่สามารถระบุสาเหตุได้'
      });
    }

    // Test 2: Members table access
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, phone')
        .limit(1);
      
      if (error) {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Members',
          status: 'error',
          message: 'ไม่สามารถเข้าถึงข้อมูลสมาชิกได้',
          details: error.message
        });
      } else {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Members',
          status: 'success',
          message: 'เข้าถึงข้อมูลสมาชิกได้ปกติ',
          details: `พบข้อมูลสมาชิก ${data?.length || 0} รายการ`
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'การเข้าถึงตาราง Members',
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการเข้าถึงข้อมูล',
        details: error.message
      });
    }

    // Test 3: Rewards table access
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name')
        .limit(1);
      
      if (error) {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Rewards',
          status: 'warning',
          message: 'ไม่สามารถเข้าถึงข้อมูลรางวัลได้',
          details: error.message
        });
      } else {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Rewards',
          status: 'success',
          message: 'เข้าถึงข้อมูลรางวัลได้ปกติ',
          details: `พบข้อมูลรางวัล ${data?.length || 0} รายการ`
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'การเข้าถึงตาราง Rewards',
        status: 'warning',
        message: 'เกิดข้อผิดพลาดในการเข้าถึงข้อมูล',
        details: error.message
      });
    }

    // Test 4: Point transactions table access
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('id, transaction_type')
        .limit(1);
      
      if (error) {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Point Transactions',
          status: 'warning',
          message: 'ไม่สามารถเข้าถึงข้อมูลการทำธุรกรรมแต้มได้',
          details: error.message
        });
      } else {
        diagnosticResults.push({
          test: 'การเข้าถึงตาราง Point Transactions',
          status: 'success',
          message: 'เข้าถึงข้อมูลการทำธุรกรรมแต้มได้ปกติ',
          details: `พบข้อมูลการทำธุรกรรม ${data?.length || 0} รายการ`
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'การเข้าถึงตาราง Point Transactions',
        status: 'warning',
        message: 'เกิดข้อผิดพลาดในการเข้าถึงข้อมูล',
        details: error.message
      });
    }

    // Test 5: Network connectivity
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      diagnosticResults.push({
        test: 'การเชื่อมต่ออินเทอร์เน็ต',
        status: 'success',
        message: 'การเชื่อมต่ออินเทอร์เน็ทปกติ',
        details: 'สามารถเชื่อมต่อกับเซิร์ฟเวอร์ภายนอกได้'
      });
    } catch (error) {
      diagnosticResults.push({
        test: 'การเชื่อมต่ออินเทอร์เน็ต',
        status: 'error',
        message: 'การเชื่อมต่ออินเทอร์เน็ทมีปัญหา',
        details: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ภายนอกได้'
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">ปกติ</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">ข้อผิดพลาด</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">เตือน</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          ตรวจสอบการเชื่อมต่อระบบ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              กำลังตรวจสอบ...
            </>
          ) : (
            'เริ่มตรวจสอบระบบ'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">ผลการตรวจสอบ:</h3>
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.test}</h4>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500">{result.details}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">คำแนะนำ:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• หากพบข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล ให้ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</li>
              <li>• หากปัญหายังคงอยู่ ให้ลองรีเฟรชหน้าเว็บ</li>
              <li>• หากยังไม่สามารถแก้ไขได้ ให้ติดต่อผู้ดูแลระบบ</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionDiagnostic;
