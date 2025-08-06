
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
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useMenuExcel } from '@/hooks/useMenuExcel';
import { useToast } from '@/hooks/use-toast';
import MenuItemsList from '@/components/MenuItemsList';
import CategoriesList from '@/components/CategoriesList';
import AddonsList from '@/components/AddonsList';
import MenuManagementGrid from '@/components/MenuManagementGrid';

const MenuManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const {
    categories,
    menuItems,
    addons,
    addonGroups,
    loading,
    refetch
  } = useSupabaseData();

  const { exportMenuToExcel, importMenuFromExcel, isExporting, isImporting } = useMenuExcel();

  const handleExport = async () => {
    await exportMenuToExcel(menuItems, categories);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMenuFromExcel(file, categories, () => {
        refetch.menuItems();
      });
    }
  };

  const handleEditMenuItem = (item: any) => {
    console.log('Edit menu item:', item);
    toast({
      title: 'แก้ไขเมนู',
      description: `เตรียมแก้ไข ${item.name}`,
    });
  };

  const handleEditCategory = (category: any) => {
    console.log('Edit category:', category);
    toast({
      title: 'แก้ไขหมวดหมู่',
      description: `เตรียมแก้ไข ${category.name}`,
    });
  };

  const handleEditAddon = (addon: any) => {
    console.log('Edit addon:', addon);
    toast({
      title: 'แก้ไขส่วนเสริม',
      description: `เตรียมแก้ไข ${addon.name}`,
    });
  };

  const handleDeleteMenuItem = (item: any) => {
    console.log('Delete menu item:', item);
    toast({
      title: 'ลบเมนู',
      description: `เตรียมลบ ${item.name}`,
      variant: 'destructive',
    });
  };

  const handleAddImage = (item: any) => {
    console.log('Add image for:', item);
    toast({
      title: 'เพิ่มรูปภาพ',
      description: `เตรียมเพิ่มรูปภาพสำหรับ ${item.name}`,
    });
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableItems = menuItems.filter(item => item.is_available).length;
  const unavailableItems = menuItems.length - availableItems;

  if (loading) {
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
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isExporting ? 'กำลังส่งออก...' : 'ส่งออก'}
                    </Button>
                    <Button size="sm" variant="outline" disabled={isImporting}>
                      <Upload className="h-4 w-4 mr-2" />
                      {isImporting ? 'กำลังนำเข้า...' : 'นำเข้า'}
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImport}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isImporting}
                      />
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
                      {menuItems.length} สินค้า
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      {availableItems} แสดง
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="h-3 w-3" />
                      {unavailableItems} ซ่อน
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
                <MenuItemsList 
                  menuItems={filteredMenuItems}
                  onEdit={handleEditMenuItem}
                />
              </TabsContent>
              
              <TabsContent value="categories" className="mt-6">
                <CategoriesList 
                  categories={filteredCategories}
                  onEdit={handleEditCategory}
                />
              </TabsContent>
              
              <TabsContent value="addons" className="mt-6">
                <AddonsList 
                  addons={filteredAddons}
                  addonGroups={addonGroups}
                  onEdit={handleEditAddon}
                />
              </TabsContent>

              <TabsContent value="grid" className="mt-6">
                <MenuManagementGrid 
                  menuItems={filteredMenuItems}
                  onEdit={handleEditMenuItem}
                  onDelete={handleDeleteMenuItem}
                  onAddImage={handleAddImage}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
