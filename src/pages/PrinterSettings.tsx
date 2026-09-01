
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrinterConfiguration from '@/components/printer/PrinterConfiguration';
import PrintQueue from '@/components/printer/PrintQueue';
import PrintReports from '@/components/printer/PrintReports';
import PrintHistory from '@/components/printer/PrintHistory';
import NetworkDiagnostic from '@/components/printer/NetworkDiagnostic';
import AutoPrintSettings from '@/components/AutoPrintSettings';
import UniversalPrinterConfig from '@/components/printer/UniversalPrinterConfig';
import PrintCopiesSettings from '@/components/printer/PrintCopiesSettings';

const PrinterSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
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
                <CardTitle className="text-2xl text-foreground">ระบบเครื่องพิมพ์</CardTitle>
                <CardDescription>จัดการการตั้งค่าเครื่องพิมพ์และการพิมพ์รายงาน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="universal" className="w-full">
                  <TabsList className="grid w-full grid-cols-8">
                    <TabsTrigger value="universal">เครื่องพิมพ์ทั่วไป</TabsTrigger>
                    <TabsTrigger value="diagnostic">ตรวจสอบเครือข่าย</TabsTrigger>
                    <TabsTrigger value="config">Star Printer</TabsTrigger>
                    <TabsTrigger value="copies">จำนวนการพิมพ์</TabsTrigger>
                    <TabsTrigger value="auto-print">พิมพ์อัตโนมัติ</TabsTrigger>
                    <TabsTrigger value="queue">คิวพิมพ์</TabsTrigger>
                    <TabsTrigger value="reports">รายงาน</TabsTrigger>
                    <TabsTrigger value="history">ประวัติ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="universal" className="mt-6">
                    <UniversalPrinterConfig />
                  </TabsContent>
                  
                  <TabsContent value="diagnostic" className="mt-6">
                    <NetworkDiagnostic />
                  </TabsContent>
                  
                  <TabsContent value="config" className="mt-6">
                    <PrinterConfiguration />
                  </TabsContent>
                  
                  <TabsContent value="copies" className="mt-6">
                    <PrintCopiesSettings />
                  </TabsContent>
                  
                  <TabsContent value="auto-print" className="mt-6">
                    <AutoPrintSettings />
                  </TabsContent>
                  
                  <TabsContent value="queue" className="mt-6">
                    <PrintQueue />
                  </TabsContent>
                  
                  <TabsContent value="reports" className="mt-6">
                    <PrintReports />
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-6">
                    <PrintHistory />
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

export default PrinterSettings;
