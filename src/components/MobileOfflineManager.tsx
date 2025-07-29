
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useDevice } from '@/hooks/useDevice';
import { CloudOff, Cloud, RefreshCw, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const MobileOfflineManager = () => {
  const { 
    isOffline, 
    offlineData, 
    syncData, 
    clearOfflineData, 
    hasOfflineOrders 
  } = useOfflineStorage();
  const { isOnline, connectionType } = useDevice();

  const handleSync = async () => {
    const success = await syncData();
    if (success) {
      // Additional success handling if needed
    }
  };

  const handleClearData = async () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลออฟไลน์ทั้งหมด?')) {
      await clearOfflineData();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {isOnline ? (
                <Cloud className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <CloudOff className="w-5 h-5 mr-2 text-red-500" />
              )}
              สถานะเครือข่าย
            </span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ประเภทการเชื่อมต่อ:</span>
              <span className="capitalize">{connectionType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>อัปเดตล่าสุด:</span>
              <span>{new Date(offlineData.lastSync).toLocaleString('th-TH')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            ข้อมูลออฟไลน์
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {hasOfflineOrders && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                มีออเดอร์ที่ยังไม่ได้ซิงค์ {offlineData.orders.length} รายการ
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">ออเดอร์ค้างซิงค์</div>
              <div className="text-2xl font-bold text-orange-600">
                {offlineData.orders.length}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">รายการเมนู</div>
              <div className="text-2xl font-bold text-blue-600">
                {offlineData.menuItems.length}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {isOnline && hasOfflineOrders && (
              <Button 
                onClick={handleSync}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ซิงค์ข้อมูลทั้งหมด
              </Button>
            )}
            
            <Button 
              onClick={handleClearData}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบข้อมูลออฟไลน์
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการซิงค์</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>ซิงค์ข้อมูลเมนู</span>
              </div>
              <span className="text-muted-foreground">
                {new Date().toLocaleTimeString('th-TH')}
              </span>
            </div>
            
            {hasOfflineOrders && (
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                  <span>รอการซิงค์ออเดอร์</span>
                </div>
                <span className="text-muted-foreground">
                  {offlineData.orders.length} รายการ
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOfflineManager;
