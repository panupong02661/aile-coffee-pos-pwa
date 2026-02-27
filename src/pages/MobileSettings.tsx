
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MobilePrinterSettings from '@/components/MobilePrinterSettings';
import MobileOfflineManager from '@/components/MobileOfflineManager';
import { useDevice } from '@/hooks/useDevice';
import { 
  Smartphone, 
  Camera, 
  Printer, 
  CloudOff, 
  Vibrate, 
  Battery,
  Wifi,
  Settings,
  Star
} from 'lucide-react';

const MobileSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { deviceInfo, networkStatus, isMobile } = useDevice();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar} 
      />
      
      <div className="flex-1 md:ml-[56px]">
        <div className="p-4">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800 flex items-center">
                  <Smartphone className="w-6 h-6 mr-2" />
                  ตั้งค่าแอพมือถือ
                </CardTitle>
                <CardDescription>
                  จัดการฟีเจอร์และการตั้งค่าสำหรับการใช้งานบนมือถือและแท็บเล็ต
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Device Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">ข้อมูลอุปกรณ์</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">แพลตฟอร์ม</p>
                            <p className="font-medium capitalize">{deviceInfo?.platform || 'Web'}</p>
                          </div>
                          <Badge variant={isMobile ? "default" : "secondary"}>
                            {isMobile ? 'Mobile' : 'Desktop'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">เครือข่าย</p>
                            <p className="font-medium">{networkStatus?.connectionType || 'Unknown'}</p>
                          </div>
                          <Wifi className={`w-5 h-5 ${networkStatus?.connected ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">รุ่น</p>
                            <p className="font-medium">{deviceInfo?.model || 'Unknown'}</p>
                          </div>
                          <Battery className="w-5 h-5 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Star SDK</p>
                            <p className="font-medium">{isMobile ? 'พร้อมใช้งาน' : 'ไม่รองรับ'}</p>
                          </div>
                          <Star className={`w-5 h-5 ${isMobile ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Tabs defaultValue="printer" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="printer" className="flex items-center">
                      <Printer className="w-4 h-4 mr-1" />
                      เครื่องพิมพ์
                    </TabsTrigger>
                    <TabsTrigger value="offline" className="flex items-center">
                      <CloudOff className="w-4 h-4 mr-1" />
                      ออฟไลน์
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex items-center">
                      <Camera className="w-4 h-4 mr-1" />
                      กล้อง
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center">
                      <Settings className="w-4 h-4 mr-1" />
                      ทั่วไป
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="printer" className="mt-6">
                    <MobilePrinterSettings />
                  </TabsContent>
                  
                  <TabsContent value="offline" className="mt-6">
                    <MobileOfflineManager />
                  </TabsContent>
                  
                  <TabsContent value="camera" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>การตั้งค่ากล้อง</CardTitle>
                        <CardDescription>
                          ใช้สำหรับถ่ายรูปสินค้า อัปโหลดรูปเมนู และจัดการรูปภาพ
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded">
                              <h4 className="font-medium mb-2">คุณภาพรูปภาพ</h4>
                              <p className="text-sm text-muted-foreground">90% (แนะนำ)</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                              <h4 className="font-medium mb-2">การแก้ไขรูป</h4>
                              <p className="text-sm text-muted-foreground">เปิดใช้งาน</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 rounded">
                            <p className="text-sm">
                              <strong>คำแนะนำ:</strong> ถ่ายรูปในที่ที่มีแสงสว่างเพียงพอ 
                              และวางสินค้าให้เห็นชัดเจนเพื่อผลลัพธ์ที่ดีที่สุด
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="general" className="mt-6">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>การตั้งค่าทั่วไป</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">การสั่นเตือน</p>
                                <p className="text-sm text-muted-foreground">
                                  เปิดการสั่นเมื่อมีการแจ้งเตือน
                                </p>
                              </div>
                              <Badge variant="default">เปิดใช้งาน</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">การแจ้งเตือนแบบ Push</p>
                                <p className="text-sm text-muted-foreground">
                                  รับการแจ้งเตือนออเดอร์ใหม่
                                </p>
                              </div>
                              <Badge variant="default">เปิดใช้งาน</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">โหมดประหยัดแบตเตอรี่</p>
                                <p className="text-sm text-muted-foreground">
                                  ลดการใช้ทรัพยากรเพื่อประหยัดแบตเตอรี่
                                </p>
                              </div>
                              <Badge variant="outline">ปิดใช้งาน</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">การซิงค์อัตโนมัติ</p>
                                <p className="text-sm text-muted-foreground">
                                  ซิงค์ข้อมูลอัตโนมัติเมื่อเชื่อมต่อ Wi-Fi
                                </p>
                              </div>
                              <Badge variant="default">เปิดใช้งาน</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>ข้อมูลแอพพลิเคชัน</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">เวอร์ชั่น</p>
                              <p className="text-muted-foreground">1.0.0</p>
                            </div>
                            <div>
                              <p className="font-medium">Build</p>
                              <p className="text-muted-foreground">2024.01.29</p>
                            </div>
                            <div>
                              <p className="font-medium">ระบบปฏิบัติการ</p>
                              <p className="text-muted-foreground capitalize">
                                {deviceInfo?.operatingSystem || 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Capacitor</p>
                              <p className="text-muted-foreground">7.4.2</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSettings;
