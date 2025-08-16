
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

const PrinterSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      
      <div className="flex-1">
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
                <CardTitle className="text-2xl text-coffee-800">ระบบเครื่องพิมพ์</CardTitle>
                <CardDescription>จัดการการตั้งค่าเครื่องพิมพ์และการพิมพ์รายงาน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="diagnostic" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="diagnostic">ตรวจสอบเครือข่าย</TabsTrigger>
                    <TabsTrigger value="config">ตั้งค่าเครื่องพิมพ์</TabsTrigger>
                    <TabsTrigger value="auto-print">การพิมพ์อัตโนมัติ</TabsTrigger>
                    <TabsTrigger value="queue">คิวการพิมพ์</TabsTrigger>
                    <TabsTrigger value="reports">พิมพ์รายงาน</TabsTrigger>
                    <TabsTrigger value="history">ประวัติการพิมพ์</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="diagnostic" className="mt-6">
                    <NetworkDiagnostic />
                  </TabsContent>
                  
                  <TabsContent value="config" className="mt-6">
                    <PrinterConfiguration />
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
