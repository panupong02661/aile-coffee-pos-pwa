
import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Eye,
  EyeOff,
  Package
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MenuItemsList from '@/components/MenuItemsList';
import CategoriesList from '@/components/CategoriesList';
import AddonsList from '@/components/AddonsList';
import MenuManagementGrid from '@/components/MenuManagementGrid';

const MenuManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="จัดการเมนู"
          page="other"
        />
        
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">จัดการเมนู</CardTitle>
                    <CardDescription>
                      จัดการสินค้า หมวดหมู่ และส่วนเสริมต่างๆ
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      ส่งออก
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      นำเข้า
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มสินค้าใหม่
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="ค้นหาสินค้า หมวดหมู่ หรือรหัสสินค้า..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      156 สินค้า
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      142 แสดง
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="h-3 w-3" />
                      14 ซ่อน
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="products">สินค้า</TabsTrigger>
                <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
                <TabsTrigger value="addons">ส่วนเสริม</TabsTrigger>
                <TabsTrigger value="grid">แสดงผลแบบตาราง</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="mt-6">
                <MenuItemsList />
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <CategoriesList />
              </TabsContent>
              
              <TabsContent value="addons" className="mt-6">
                <AddonsList />
              </TabsContent>

              <TabsContent value="grid" className="mt-6">
                <MenuManagementGrid />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
