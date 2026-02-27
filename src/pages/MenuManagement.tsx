import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import MenuForm from '@/components/MenuForm';
import CategoryForm from '@/components/CategoryForm';
import AddonGroupForm from '@/components/AddonGroupForm';
import AddonForm from '@/components/AddonForm';
import MenuItemsList from '@/components/MenuItemsList';
import CategoriesList from '@/components/CategoriesList';
import AddonGroupsList from '@/components/AddonGroupsList';
import AddonsList from '@/components/AddonsList';
import MobilePhotoCapture from '@/components/MobilePhotoCapture';
import AddonDisplaySettings from '@/components/AddonDisplaySettings';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useDevice } from '@/hooks/useDevice';
import { useMenuExcel } from '@/hooks/useMenuExcel';
import { Plus, Smartphone, Download, Upload } from 'lucide-react';
import { useRef } from 'react';

const MenuManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isAddonGroupFormOpen, setIsAddonGroupFormOpen] = useState(false);
  const [isAddonFormOpen, setIsAddonFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingAddonGroup, setEditingAddonGroup] = useState<any>(null);
  const [editingAddon, setEditingAddon] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const { isMobile } = useDevice();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    categories, 
    menuItems, 
    addonGroups, 
    addons,
    loading,
    refetch 
  } = useSupabaseData();

  const {
    exportMenuToExcel,
    importMenuFromExcel,
    isExporting,
    isImporting
  } = useMenuExcel();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleEdit = (item: any, type: string) => {
    switch (type) {
      case 'menu':
        setEditingMenuItem(item);
        setIsMenuFormOpen(true);
        break;
      case 'category':
        setEditingCategory(item);
        setIsCategoryFormOpen(true);
        break;
      case 'addonGroup':
        setEditingAddonGroup(item);
        setIsAddonGroupFormOpen(true);
        break;
      case 'addon':
        setEditingAddon(item);
        setIsAddonFormOpen(true);
        break;
    }
  };

  const handleMenuFormClose = () => {
    setIsMenuFormOpen(false);
    setEditingMenuItem(null);
    setSelectedPhoto('');
  };

  const handleCategoryFormClose = () => {
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleAddonGroupFormClose = () => {
    setIsAddonGroupFormOpen(false);
    setEditingAddonGroup(null);
  };

  const handleAddonFormClose = () => {
    setIsAddonFormOpen(false);
    setEditingAddon(null);
  };

  const handleFormSuccess = () => {
    refetch.categories();
    refetch.menuItems();
    refetch.addonGroups();
    refetch.addons();
  };

  const handlePhotoCapture = (photoUri: string) => {
    setSelectedPhoto(photoUri);
  };

  const handleExportMenu = () => {
    exportMenuToExcel(menuItems, categories);
  };

  const handleImportMenu = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)');
        return;
      }
      
      importMenuFromExcel(file, categories, handleFormSuccess);
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleStatusChange = () => {
    // Refresh menu items when status changes
    refetch.menuItems();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        'md:ml-[56px]'
      }`}>
        <div className="max-w-7xl mx-auto">
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-coffee-800">จัดการเมนู</CardTitle>
                  <p className="text-coffee-600 mt-1">
                    จัดการเมนูอาหาร หมวดหมู่ และตัวเลือกเสริม
                    {isMobile && (
                      <span className="flex items-center text-sm text-blue-600 mt-1">
                        <Smartphone className="w-4 h-4 mr-1" />
                        โหมดมือถือ - รองรับการถ่ายรูป
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Mobile Photo Test */}
                {isMobile && (
                  <MobilePhotoCapture
                    onPhotoCapture={handlePhotoCapture}
                    currentPhoto={selectedPhoto}
                    title="ทดสอบถ่ายรูป"
                  />
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="menu-items" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="menu-items">รายการเมนู</TabsTrigger>
                  <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
                  <TabsTrigger value="addon-groups">กลุ่ม Add-on</TabsTrigger>
                  <TabsTrigger value="addons">Add-ons</TabsTrigger>
                  <TabsTrigger value="addon-settings">ตั้งค่า Add-on</TabsTrigger>
                </TabsList>

                <TabsContent value="menu-items" className="mt-6">
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">รายการเมนู ({selectedCategoryFilter === 'all' ? menuItems.length : menuItems.filter(item => item.category_id === selectedCategoryFilter).length})</h3>
                      <div className="flex gap-2">
                        {/* Export Button */}
                        <Button 
                          onClick={handleExportMenu}
                          disabled={isExporting || menuItems.length === 0}
                          variant="outline"
                          className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isExporting ? 'กำลังส่งออก...' : 'ส่งออก Excel'}
                        </Button>

                        {/* Import Button */}
                        <Button 
                          onClick={handleImportMenu}
                          disabled={isImporting}
                          variant="outline"
                          className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isImporting ? 'กำลังนำเข้า...' : 'นำเข้า Excel'}
                        </Button>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {/* Add Menu Button */}
                        <Button 
                          onClick={() => setIsMenuFormOpen(true)}
                          className="bg-coffee-600 hover:bg-coffee-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มเมนูใหม่
                        </Button>
                      </div>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategoryFilter('all')}
                        className={selectedCategoryFilter === 'all' ? 'bg-coffee-600 hover:bg-coffee-700' : 'border-coffee-200 text-coffee-600 hover:bg-coffee-50'}
                      >
                        เมนูทั้งหมด ({menuItems.length})
                      </Button>
                      {categories.map((category) => {
                        const count = menuItems.filter(item => item.category_id === category.id).length;
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategoryFilter === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategoryFilter(category.id)}
                            className={selectedCategoryFilter === category.id ? 'bg-coffee-600 hover:bg-coffee-700' : 'border-coffee-200 text-coffee-600 hover:bg-coffee-50'}
                          >
                            {category.name} ({count})
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <MenuItemsList 
                    menuItems={selectedCategoryFilter === 'all' ? menuItems : menuItems.filter(item => item.category_id === selectedCategoryFilter)} 
                    categories={categories}
                    onEdit={(item) => handleEdit(item, 'menu')}
                    onStatusChange={handleStatusChange}
                    onDelete={() => refetch.menuItems()}
                  />
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">หมวดหมู่ ({categories.length})</h3>
                    <Button 
                      onClick={() => setIsCategoryFormOpen(true)}
                      className="bg-coffee-600 hover:bg-coffee-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มหมวดหมู่ใหม่
                    </Button>
                  </div>
                  <CategoriesList 
                    categories={categories} 
                    onEdit={(item) => handleEdit(item, 'category')} 
                    onStatusChange={() => refetch.categories()}
                    onDelete={() => refetch.categories()}
                  />
                </TabsContent>

                <TabsContent value="addon-groups" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">กลุ่ม Add-on ({addonGroups.length})</h3>
                    <Button 
                      onClick={() => setIsAddonGroupFormOpen(true)}
                      className="bg-coffee-600 hover:bg-coffee-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่มกลุ่ม Add-on ใหม่
                    </Button>
                  </div>
                  <AddonGroupsList 
                    addonGroups={addonGroups} 
                    onEdit={(item) => handleEdit(item, 'addonGroup')} 
                    onDelete={() => refetch.addonGroups()}
                    onStatusChange={() => refetch.addonGroups()}
                  />
                </TabsContent>

                <TabsContent value="addons" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add-ons ({addons.length})</h3>
                    <Button 
                      onClick={() => setIsAddonFormOpen(true)}
                      className="bg-coffee-600 hover:bg-coffee-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เพิ่ม Add-on ใหม่
                    </Button>
                  </div>
                  <AddonsList 
                    addons={addons} 
                    addonGroups={addonGroups} 
                    onEdit={(item) => handleEdit(item, 'addon')} 
                    onDelete={() => refetch.addons()}
                    onStatusChange={() => refetch.addons()}
                  />
                </TabsContent>

                <TabsContent value="addon-settings" className="mt-6">
                  <AddonDisplaySettings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forms */}
      <MenuForm
        isOpen={isMenuFormOpen}
        onClose={handleMenuFormClose}
        onSuccess={() => { handleFormSuccess(); handleMenuFormClose(); }}
        categories={categories}
        editMenuItem={editingMenuItem}
        capturedPhoto={selectedPhoto}
      />

      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleCategoryFormClose}
        onSuccess={() => { handleFormSuccess(); handleCategoryFormClose(); }}
        editCategory={editingCategory}
      />

      <AddonGroupForm
        isOpen={isAddonGroupFormOpen}
        onClose={handleAddonGroupFormClose}
        onSuccess={() => { handleFormSuccess(); handleAddonGroupFormClose(); }}
        editAddonGroup={editingAddonGroup}
      />

      <AddonForm
        isOpen={isAddonFormOpen}
        onClose={handleAddonFormClose}
        onSuccess={() => { handleFormSuccess(); handleAddonFormClose(); }}
        addonGroups={addonGroups}
        editAddon={editingAddon}
      />
    </div>
  );
};

export default MenuManagement;
