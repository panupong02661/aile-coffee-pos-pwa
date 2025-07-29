
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMobilePrinter } from '@/hooks/useMobilePrinter';
import { Printer, Usb, Bluetooth, Wifi, CheckCircle, XCircle } from 'lucide-react';

const MobilePrinterSettings = () => {
  const { 
    isConnected, 
    isPrinting, 
    printerSettings,
    connectPrinter, 
    disconnectPrinter 
  } = useMobilePrinter();
  
  const [connectionType, setConnectionType] = useState<'usb' | 'bluetooth' | 'network'>('usb');
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('9100');

  const handleConnect = async () => {
    const settings = {
      connectionType,
      deviceName: deviceName || undefined,
      ipAddress: ipAddress || undefined,
      port: port ? parseInt(port) : undefined,
    };

    await connectPrinter(settings);
  };

  const testPrint = async () => {
    // Mock test receipt data
    const testData = {
      orderNumber: 'TEST-001',
      items: [
        { name: 'ทดสอบการพิมพ์', quantity: 1, total: 0 }
      ],
      total: 0,
      payment: 'ทดสอบ',
      shop: {
        name: 'ร้านกาแฟทดสอบ',
        address: '123 ถนนทดสอบ',
        phone: '02-123-4567'
      }
    };

    // This would use the actual printer hook
    console.log('Test print initiated');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            ตั้งค่าเครื่องพิมพ์
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                สถานะ: {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
              </span>
            </div>
            
            {isConnected && (
              <Badge variant="secondary">
                {printerSettings.connectionType.toUpperCase()}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Connection Type */}
          <div className="space-y-2">
            <Label>ประเภทการเชื่อมต่อ</Label>
            <Select value={connectionType} onValueChange={(value: any) => setConnectionType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usb">
                  <div className="flex items-center">
                    <Usb className="w-4 h-4 mr-2" />
                    USB
                  </div>
                </SelectItem>
                <SelectItem value="bluetooth">
                  <div className="flex items-center">
                    <Bluetooth className="w-4 h-4 mr-2" />
                    Bluetooth
                  </div>
                </SelectItem>
                <SelectItem value="network">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-2" />
                    เครือข่าย (Wi-Fi)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Connection Settings */}
          {connectionType === 'bluetooth' && (
            <div className="space-y-2">
              <Label>ชื่ออุปกรณ์ Bluetooth</Label>
              <Input
                placeholder="เช่น TSP100III"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>
          )}

          {connectionType === 'network' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP Address</Label>
                <Input
                  placeholder="192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  placeholder="9100"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {!isConnected ? (
              <Button 
                onClick={handleConnect}
                disabled={isPrinting}
                className="bg-coffee-600 hover:bg-coffee-700"
              >
                {isPrinting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อเครื่องพิมพ์'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={testPrint}
                  variant="outline" 
                  className="w-full"
                  disabled={isPrinting}
                >
                  {isPrinting ? 'กำลังพิมพ์...' : 'ทดสอบการพิมพ์'}
                </Button>
                
                <Button 
                  onClick={disconnectPrinter}
                  variant="destructive" 
                  className="w-full"
                >
                  ตัดการเชื่อมต่อ
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Printer Compatibility Info */}
      <Card>
        <CardHeader>
          <CardTitle>เครื่องพิมพ์ที่รองรับ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Star Micronics</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TSP100III</li>
                <li>• TSP650II</li>
                <li>• mPOP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Epson</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• TM-T20II</li>
                <li>• TM-T82II</li>
                <li>• TM-m30</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePrinterSettings;
