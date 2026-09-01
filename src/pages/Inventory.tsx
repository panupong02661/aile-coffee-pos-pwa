
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StockManagement from '@/components/inventory/StockManagement';
import RecipeManagement from '@/components/inventory/RecipeManagement';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryReports from '@/components/inventory/InventoryReports';
import ErrorBoundary from '@/components/ui/error-boundary';

const Inventory = () => {
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
                <CardTitle className="text-2xl text-foreground">จัดการคลังสินค้า</CardTitle>
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
                        <ErrorBoundary fallback={<div className="p-4 text-sm text-destructive">โหลดแดชบอร์ดไม่สำเร็จ</div>}>
                          <InventoryDashboard />
                        </ErrorBoundary>
                      </TabsContent>
                      
                      <TabsContent value="stock" className="mt-6">
                        <ErrorBoundary fallback={<div className="p-4 text-sm text-destructive">โหลดจัดการสต็อกไม่สำเร็จ</div>}>
                          <StockManagement />
                        </ErrorBoundary>
                      </TabsContent>
                      
                      <TabsContent value="recipes" className="mt-6">
                        <ErrorBoundary fallback={<div className="p-4 text-sm text-destructive">โหลดสูตร & ต้นทุนไม่สำเร็จ</div>}>
                          <RecipeManagement />
                        </ErrorBoundary>
                      </TabsContent>
                      
                      <TabsContent value="reports" className="mt-6">
                        <ErrorBoundary fallback={<div className="p-4 text-sm text-destructive">โหลดรายงานไม่สำเร็จ</div>}>
                          <InventoryReports />
                        </ErrorBoundary>
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
