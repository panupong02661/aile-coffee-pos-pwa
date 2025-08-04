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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');

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
    setEditingItem(item);
    switch (type) {
      case 'menu':
        setIsMenuFormOpen(true);
        break;
      case 'category':
        setIsCategoryFormOpen(true);
        break;
      case 'addonGroup':
        setIsAddonGroupFormOpen(true);
        break;
      case 'addon':
        setIsAddonFormOpen(true);
        break;
    }
  };

  const handleFormClose = () => {
    setIsMenuFormOpen(false);
    setIsCategoryFormOpen(false);
    setIsAddonGroupFormOpen(false);
    setIsAddonFormOpen(false);
    setEditingItem(null);
    setSelectedPhoto('');
  };

  const handleFormSuccess = () => {
    // Call individual refetch functions
    refetch.categories();
    refetch.menuItems();
    refetch.addonGroups();
    refetch.addons();
    handleFormClose();
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
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="menu-items">รายการเมนู</TabsTrigger>
                  <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
                  <TabsTrigger value="addon-groups">กลุ่ม Add-on</TabsTrigger>
                  <TabsTrigger value="addons">Add-ons</TabsTrigger>
                </TabsList>

                <TabsContent value="menu-items" className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">รายการเมนู ({menuItems.length})</h3>
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
                  <MenuItemsList menuItems={menuItems} onEdit={(item) => handleEdit(item, 'menu')} />
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
                  <CategoriesList categories={categories} onEdit={(item) => handleEdit(item, 'category')} />
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
                  <AddonGroupsList addonGroups={addonGroups} onEdit={(item) => handleEdit(item, 'addonGroup')} />
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
                  <AddonsList addons={addons} addonGroups={addonGroups} onEdit={(item) => handleEdit(item, 'addon')} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forms */}
      <MenuForm
        isOpen={isMenuFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        categories={categories}
        editMenuItem={editingItem}
        capturedPhoto={selectedPhoto}
      />

      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editCategory={editingItem}
      />

      <AddonGroupForm
        isOpen={isAddonGroupFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editAddonGroup={editingItem}
      />

      <AddonForm
        isOpen={isAddonFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        addonGroups={addonGroups}
        editAddon={editingItem}
      />
    </div>
  );
};

export default MenuManagement;
