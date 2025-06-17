
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShopBasicSettings from '@/components/ShopBasicSettings';
import ReceiptSettings from '@/components/ReceiptSettings';

const ShopSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(true)}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800">ตั้งค่าร้าน</CardTitle>
                <CardDescription>จัดการข้อมูลร้านและการตั้งค่าใบเสร็จ</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="shop" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="shop">ข้อมูลร้าน</TabsTrigger>
                    <TabsTrigger value="receipt">ตั้งค่าใบเสร็จ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="shop" className="mt-6">
                    <ShopBasicSettings />
                  </TabsContent>
                  
                  <TabsContent value="receipt" className="mt-6">
                    <ReceiptSettings />
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
