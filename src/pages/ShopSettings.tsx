
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShopBasicSettings from '@/components/ShopBasicSettings';
import ReceiptSettings from '@/components/ReceiptSettings';
import ReceiptPreview from '@/components/ReceiptPreview';
import VATServiceChargeSettings from '@/components/VATServiceChargeSettings';
import BackupRestore from '@/components/BackupRestore';

const ShopSettings = () => {
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
          
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">ตั้งค่าร้าน</CardTitle>
                <CardDescription>จัดการข้อมูลร้านและการตั้งค่าใบเสร็จ</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="shop" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="shop">ข้อมูลร้าน</TabsTrigger>
                    <TabsTrigger value="tax">ภาษี/ค่าบริการ</TabsTrigger>
                    <TabsTrigger value="receipt">ตั้งค่าใบเสร็จ</TabsTrigger>
                    <TabsTrigger value="preview">ตัวอย่างใบเสร็จ</TabsTrigger>
                    <TabsTrigger value="backup">สำรอง/กู้คืน</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="shop" className="mt-6">
                    <ShopBasicSettings />
                  </TabsContent>

                  <TabsContent value="tax" className="mt-6">
                    <VATServiceChargeSettings />
                  </TabsContent>
                  
                  <TabsContent value="receipt" className="mt-6">
                    <ReceiptSettings />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-6">
                    <ReceiptPreview />
                  </TabsContent>

                  <TabsContent value="backup" className="mt-6">
                    <BackupRestore />
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

export default ShopSettings;
