import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const NetworkDiagnostic = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testNetworkConnectivity = async () => {
    setTesting(true);
    const testResults = {
      printerIP: '192.168.1.170',
      commonPorts: ['9100', '515', '631', '80'],
      connectivity: {},
      recommendations: []
    };

    try {
      // Test each common printer port
      for (const port of testResults.commonPorts) {
        try {
          console.log(`🔌 Testing ${testResults.printerIP}:${port}...`);
          
          // Simple connectivity test
          const response = await fetch(`http://${testResults.printerIP}:${port}`, {
            method: 'GET',
            mode: 'no-cors',
            signal: AbortSignal.timeout(3000)
          });
          
          testResults.connectivity[port] = 'reachable';
        } catch (error) {
          testResults.connectivity[port] = 'unreachable';
        }
      }

      // Generate recommendations
      const reachablePorts = Object.entries(testResults.connectivity)
        .filter(([_, status]) => status === 'reachable')
        .map(([port, _]) => port);

      if (reachablePorts.length > 0) {
        testResults.recommendations.push({
          type: 'success',
          message: `พบเครื่องพิมพ์ที่พอร์ต: ${reachablePorts.join(', ')}`
        });
        
        if (reachablePorts.includes('9100')) {
          testResults.recommendations.push({
            type: 'info',
            message: 'พอร์ต 9100 เป็นพอร์ตมาตรฐานสำหรับ Raw TCP Printing'
          });
        }
      } else {
        testResults.recommendations.push({
          type: 'error',
          message: 'ไม่พบการเชื่อมต่อในพอร์ตใดๆ'
        });
        testResults.recommendations.push({
          type: 'warning',
          message: 'ตรวจสอบ: 1) IP Address ถูกต้อง 2) เครื่องพิมพ์เปิดอยู่ 3) อยู่ในเครือข่ายเดียวกัน'
        });
      }

      setResults(testResults);
      
      if (reachablePorts.length > 0) {
        toast.success('🔍 การตรวจสอบเสร็จสิ้น', {
          description: `พบการเชื่อมต่อที่ ${reachablePorts.length} พอร์ต`
        });
      } else {
        toast.error('❌ ไม่พบการเชื่อมต่อ', {
          description: 'ตรวจสอบการตั้งค่าเครือข่าย'
        });
      }

    } catch (error) {
      console.error('Network diagnostic error:', error);
      toast.error('❌ เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถทดสอบเครือข่ายได้'
      });
    } finally {
      setTesting(false);
    }
  };

  const getPortInfo = (port: string) => {
    const portInfo = {
      '9100': 'Raw TCP/IP (มาตรฐานสำหรับ thermal printer)',
      '515': 'Line Printer Daemon (LPD)',
      '631': 'Internet Printing Protocol (IPP)',
      '80': 'HTTP Web Interface'
    };
    return portInfo[port] || 'ไม่ทราบประเภท';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reachable':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />เชื่อมต่อได้</Badge>;
      case 'unreachable':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />เชื่อมต่อไม่ได้</Badge>;
      default:
        return <Badge variant="secondary">ยังไม่ได้ทดสอบ</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          การตรวจสอบเครือข่าย
        </CardTitle>
        <CardDescription>
          ตรวจสอบการเชื่อมต่อกับเครื่องพิมพ์และพอร์ตที่ใช้งานได้
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={testNetworkConnectivity}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'กำลังตรวจสอบ...' : 'ทดสอบการเชื่อมต่อ'}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Wifi className="w-4 h-4" />
            IP: 192.168.1.170
          </div>
        </div>

        {results && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">ผลการทดสอบพอร์ต:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.commonPorts.map((port: string) => (
                  <div key={port} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">พอร์ต {port}</div>
                      <div className="text-xs text-gray-500">{getPortInfo(port)}</div>
                    </div>
                    {getStatusBadge(results.connectivity[port])}
                  </div>
                ))}
              </div>
            </div>

            {results.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">คำแนะนำ:</h4>
                <div className="space-y-2">
                  {results.recommendations.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        rec.type === 'success' ? 'bg-green-50 border-green-400' :
                        rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        rec.type === 'error' ? 'bg-red-50 border-red-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="text-sm">{rec.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <strong>หมายเหตุ:</strong> พอร์ต 9100 เป็นพอร์ตมาตรฐานสำหรับเครื่องพิมพ์ thermal 
          หากไม่สามารถเชื่อมต่อได้ ให้ตรวจสอบ:
          <br />• เครื่องพิมพ์เปิดใช้งานและเชื่อมต่อเครือข่าย
          <br />• IP Address ถูกต้อง (ตรวจสอบจากเมนูเครื่องพิมพ์)
          <br />• อยู่ในเครือข่าย Wi-Fi เดียวกัน
          <br />• Firewall ไม่ได้บล็อกการเชื่อมต่อ
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkDiagnostic;