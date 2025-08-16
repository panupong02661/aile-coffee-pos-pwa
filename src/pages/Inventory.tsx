
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StockManagement from '@/components/inventory/StockManagement';
import RecipeManagement from '@/components/inventory/RecipeManagement';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryReports from '@/components/inventory/InventoryReports';

const Inventory = () => {
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
                <CardTitle className="text-2xl text-coffee-800">จัดการคลังสินค้า</CardTitle>
                <CardDescription>ระบบจัดการสต็อก สูตรอาหาร การคำนวณต้นทุน และรายงาน</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">แดชบอร์ด</TabsTrigger>
                    <TabsTrigger value="stock">จัดการสต็อก</TabsTrigger>
                    <TabsTrigger value="recipes">สูตร & ต้นทุน</TabsTrigger>
                    <TabsTrigger value="reports">รายงาน</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-6">
                    <InventoryDashboard />
                  </TabsContent>
                  
                  <TabsContent value="stock" className="mt-6">
                    <StockManagement />
                  </TabsContent>
                  
                  <TabsContent value="recipes" className="mt-6">
                    <RecipeManagement />
                  </TabsContent>
                  
                  <TabsContent value="reports" className="mt-6">
                    <InventoryReports />
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

export default Inventory;
