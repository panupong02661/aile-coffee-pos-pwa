
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarPrinterManager from './StarPrinterManager';
import { useDevice } from '@/hooks/useDevice';
import { 
  Printer,
  Smartphone,
  Usb,
  Bluetooth,
  Wifi,
  Star
} from 'lucide-react';

const MobilePrinterSettings = () => {
  const { isMobile } = useDevice();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            ระบบเครื่องพิมพ์มือถือ
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="star-sdk" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="star-sdk" className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Star SDK
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center">
                <Wifi className="w-4 h-4 mr-1" />
                เครือข่าย
              </TabsTrigger>
              <TabsTrigger value="bluetooth" className="flex items-center">
                <Bluetooth className="w-4 h-4 mr-1" />
                Bluetooth
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="star-sdk" className="mt-6">
              <StarPrinterManager />
            </TabsContent>
            
            <TabsContent value="network" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>เครื่องพิมพ์เครือข่าย</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-amber-800">
                        <strong>หมายเหตุ:</strong> เครื่องพิมพ์เครือข่าย (Network/Wi-Fi) 
                        ใช้งานได้บนเว็บเบราว์เซอร์ แต่มีข้อจำกัดในการเชื่อมต่อ
                      </p>
                    </div>
                    
                    <div className="text-center py-8">
                      <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">
                        ฟีเจอร์เครื่องพิมพ์เครือข่าย
                      </p>
                      <p className="text-sm text-gray-500">
                        สามารถใช้งานผ่านหน้า "ระบบเครื่องพิมพ์" ในเมนูหลัก
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bluetooth" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>เครื่องพิมพ์ Bluetooth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">
                        <strong>ในอนาคต:</strong> การรองรับเครื่องพิมพ์ Bluetooth 
                        จะถูกเพิ่มในเวอร์ชันถัดไป
                      </p>
                    </div>
                    
                    <div className="text-center py-8">
                      <Bluetooth className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">
                        กำลังพัฒนา Bluetooth Support
                      </p>
                      <p className="text-sm text-gray-500">
                        สำหรับเครื่องพิมพ์ Star MFi Certified
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Platform Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle>ความเข้ากันได้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Smartphone className="w-5 h-5 mr-2" />
                <h4 className="font-medium">Mobile App (แนะนำ)</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Star SDK เต็มรูปแบบ</li>
                <li>✅ USB Direct Connection</li>
                <li>✅ Cash Drawer Control</li>
                <li>✅ Real-time Status</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Wifi className="w-5 h-5 mr-2" />
                <h4 className="font-medium">Web Browser</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>⚠️ Network Printer เท่านั้น</li>
                <li>❌ ไม่รองรับ USB Direct</li>
                <li>❌ ไม่รองรับ Cash Drawer</li>
                <li>📄 Fallback เป็น Print Dialog</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePrinterSettings;
