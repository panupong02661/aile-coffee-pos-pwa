
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Upload,
  Grid3X3,
  List,
  Package,
  Tag,
  Settings,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import MenuForm from '@/components/MenuForm';
import CategoryForm from '@/components/CategoryForm';

const MenuManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState<any>(null);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  
  const {
    categories,
    menuItems,
    addons,
    loading,
    refetch
  } = useSupabaseData();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleEditMenuItem = (item: any) => {
    setEditMenuItem(item);
    setIsMenuFormOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleAddNewMenu = () => {
    setEditMenuItem(null);
    setIsMenuFormOpen(true);
  };

  const handleAddNewCategory = () => {
    setEditCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleMenuFormClose = () => {
    setIsMenuFormOpen(false);
    setEditMenuItem(null);
  };

  const handleCategoryFormClose = () => {
    setIsCategoryFormOpen(false);
    setEditCategory(null);
  };

  const handleFormSuccess = () => {
    refetch.menuItems();
    refetch.categories();
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-cream-50 flex overflow-hidden">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen && !isMobile ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <div className="flex-shrink-0 bg-cream-50 p-4 pb-0">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            page="other"
            title="จัดการเมนูและสินค้า"
          />
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden p-4 pt-0">
          {/* Page Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-coffee-600">จัดการเมนู หมวดหมู่ และส่วนเสริม</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                นำเข้าข้อมูล
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาสินค้า หมวดหมู่ หรือส่วนเสริม..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="products" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  สินค้า ({filteredMenuItems.length})
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  หมวดหมู่ ({filteredCategories.length})
                </TabsTrigger>
                <TabsTrigger value="addons" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  ส่วนเสริม ({filteredAddons.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="flex-1 mt-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddNewMenu}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มเมนูใหม่
                  </Button>
                </div>
                
                <div className="h-full overflow-auto">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMenuItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                {item.is_available ? (
                                  <Eye className="w-3 h-3 mr-1" />
                                ) : (
                                  <EyeOff className="w-3 h-3 mr-1" />
                                )}
                                {item.is_available ? 'ใช้งาน' : 'ปิดใช้งาน'}
                              </Badge>
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            )}
                            
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-coffee-600">
                                ฿{item.price?.toFixed(2) || '0.00'}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditMenuItem(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                แก้ไข
                              </Button>
                            </div>
                            
                            {item.image_url && (
                              <div className="mt-2">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {filteredMenuItems.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center space-x-4">
                                {item.image_url && (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  <span className="text-lg font-bold text-coffee-600">
                                    ฿{item.price?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={item.is_available ? 'default' : 'secondary'}>
                                  {item.is_available ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditMenuItem(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="flex-1 mt-6">
                <div className="flex justify-end mb-4">
                  <Button onClick={handleAddNewCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มหมวดหมู่ใหม่
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? (
                              <Eye className="w-3 h-3 mr-1" />
                            ) : (
                              <EyeOff className="w-3 h-3 mr-1" />
                            )}
                            {category.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </Badge>
                        </div>
                        
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            ลำดับ: {category.sort_order || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            แก้ไข
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="addons" className="flex-1 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAddons.map((addon) => (
                    <Card key={addon.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{addon.name}</h3>
                          <span className="text-lg font-bold text-coffee-600">
                            +฿{addon.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: 'แก้ไขส่วนเสริม',
                                description: `เตรียมแก้ไข ${addon.name}`,
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            แก้ไข
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Menu Form Modal */}
      <MenuForm
        isOpen={isMenuFormOpen}
        onClose={handleMenuFormClose}
        onSuccess={handleFormSuccess}
        categories={categories}
        editMenuItem={editMenuItem}
      />

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleCategoryFormClose}
        onSuccess={handleFormSuccess}
        editCategory={editCategory}
      />
    </div>
  );
};

export default MenuManagement;
