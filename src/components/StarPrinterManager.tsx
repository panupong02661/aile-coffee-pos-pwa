
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStarPrinter } from '@/hooks/useStarPrinter';
import { useDevice } from '@/hooks/useDevice';
import { 
  Printer, 
  Search, 
  Usb, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Monitor
} from 'lucide-react';

const StarPrinterManager = () => {
  const {
    connection,
    availablePrinters,
    printerStatus,
    isSearching,
    isPrinting,
    searchPrinters,
    connectPrinter,
    disconnectPrinter,
    testPrint,
    openCashDrawer,
    isReady,
    requiresNativeApp,
    pluginInstalled
  } = useStarPrinter();

  const { isMobile } = useDevice();

  useEffect(() => {
    // Auto search for printers on component mount
    if (!requiresNativeApp && pluginInstalled) {
      searchPrinters();
    }
  }, [requiresNativeApp, pluginInstalled, searchPrinters]);

  if (!requiresNativeApp && !pluginInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="w-5 h-5 mr-2" />
            แอปนี้ยังไม่ได้ติดตั้งตัวเชื่อมเครื่องพิมพ์ Star
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>ตอนทำแอปต้องรันคำสั่งนี้หลัง <code>npx cap sync android</code> แล้ว Build APK ใหม่ ติดตั้งทับ:</p>
          <pre className="bg-muted p-3 rounded text-xs">bash scripts/setup-star-printer.sh</pre>
          <p className="text-muted-foreground">ดูขั้นตอนเต็มที่หน้า "สร้างแอปมือถือ" → Native App → ขั้นตอนที่ 6</p>
        </CardContent>
      </Card>
    );
  }

  if (requiresNativeApp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            ต้องใช้ Native App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Monitor className="w-16 h-16 mx-auto text-gray-400" />
            <div>
              <p className="text-gray-600 mb-2">
                การเชื่อมต่อเครื่องพิมพ์ Star TSP100III ผ่าน USB
              </p>
              <p className="text-gray-600 mb-4">
                ต้องใช้ Native Mobile App เท่านั้น
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2">ขั้นตอนการใช้งาน:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Export โปรเจค to GitHub</li>
                  <li>Build เป็น Android/iOS App</li>
                  <li>Install บนอุปกรณ์จริง</li>
                  <li>เชื่อมต่อเครื่องพิมพ์ผ่าน USB</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Star TSP100III Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {connection.connected ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {connection.connected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
                </p>
                {connection.deviceName && (
                  <p className="text-sm text-gray-600">{connection.deviceName}</p>
                )}
              </div>
            </div>
            
            {connection.connected && (
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  <Usb className="w-3 h-3 mr-1" />
                  USB
                </Badge>
                {printerStatus?.online && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Printer Status Details */}
          {printerStatus && connection.connected && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Cover:</span>
                <span className={printerStatus.coverOpen ? 'text-red-600' : 'text-green-600'}>
                  {printerStatus.coverOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Paper:</span>
                <span className={printerStatus.paperEmpty ? 'text-red-600' : 'text-green-600'}>
                  {printerStatus.paperEmpty ? 'Empty' : 'OK'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cutter:</span>
                <span className={printerStatus.cutterError ? 'text-red-600' : 'text-green-600'}>
                  {printerStatus.cutterError ? 'Error' : 'OK'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Drawer:</span>
                <span className={printerStatus.drawerOpen ? 'text-amber-600' : 'text-gray-600'}>
                  {printerStatus.drawerOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Printers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>เครื่องพิมพ์ที่ใช้ได้</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={searchPrinters}
              disabled={isSearching}
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-1" />
              )}
              {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {availablePrinters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Printer className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>ไม่พบเครื่องพิมพ์</p>
              <p className="text-sm">กรุณาตรวจสอบการเชื่อมต่อ USB</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availablePrinters.map((printer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Usb className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{printer.modelName}</p>
                      <p className="text-sm text-gray-600">{printer.portName}</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => connectPrinter(printer)}
                    disabled={connection.connected && connection.portName === printer.portName}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {connection.connected && connection.portName === printer.portName
                      ? 'เชื่อมต่อแล้ว'
                      : 'เชื่อมต่อ'
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {connection.connected && (
        <Card>
          <CardHeader>
            <CardTitle>การดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={testPrint}
                disabled={isPrinting}
                className="h-auto py-4 flex-col space-y-2"
              >
                <Printer className="w-6 h-6" />
                <span>{isPrinting ? 'กำลังพิมพ์...' : 'ทดสอบการพิมพ์'}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={openCashDrawer}
                className="h-auto py-4 flex-col space-y-2"
              >
                <div className="w-6 h-6 border-2 border-current rounded" />
                <span>เปิดลิ้นชักเงิน</span>
              </Button>
              
              <Button
                variant="destructive"
                onClick={disconnectPrinter}
                className="h-auto py-4 flex-col space-y-2"
              >
                <XCircle className="w-6 h-6" />
                <span>ตัดการเชื่อมต่อ</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลทางเทคนิค</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">รองรับเครื่องพิมพ์</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Star TSP100III (USB)</li>
                <li>• Star TSP143III (USB)</li>
                <li>• Star TSP650II (USB)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">ฟีเจอร์</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Auto-cut กระดาษ</li>
                <li>• เปิดลิ้นชักเงิน</li>
                <li>• ตรวจสอบสถานะ</li>
                <li>• กระดาษ 80mm</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StarPrinterManager;
