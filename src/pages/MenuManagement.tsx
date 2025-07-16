import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Menu, Settings } from 'lucide-react';
import { useSupabaseData, DatabaseMenuItem, DatabaseCategory, DatabaseAddonGroup, DatabaseAddon } from '@/hooks/useSupabaseData';
import { useMainSidebar } from '@/hooks/useMainSidebar';
import MainSidebar from '@/components/MainSidebar';
import MenuItemForm from '@/components/MenuItemForm';
import CategoryForm from '@/components/CategoryForm';
import AddonForm from '@/components/AddonForm';
import AddonGroupForm from '@/components/AddonGroupForm';
import MenuManagementGrid from '@/components/MenuManagementGrid';
import ImageCropper from '@/components/ImageCropper';
import DisplaySettingsModal from '@/components/DisplaySettingsModal';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuManagementProps {
  onToggleSidebar?: () => void;
}

const MenuManagement = ({ onToggleSidebar }: MenuManagementProps) => {
  const { isMainSidebarOpen, toggleMainSidebar, closeMainSidebar } = useMainSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<DatabaseMenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<DatabaseCategory | null>(null);
  const [editingAddonGroup, setEditingAddonGroup] = useState<DatabaseAddonGroup | null>(null);
  const [editingAddon, setEditingAddon] = useState<DatabaseAddon | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [showAddonGroupForm, setShowAddonGroupForm] = useState(false);
  const [imageEditingItem, setImageEditingItem] = useState<DatabaseMenuItem | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [categoryMenuCounts, setCategoryMenuCounts] = useState<{ [key: string]: number }>({});
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // โหลดค่าการตั้งค่าจาก localStorage
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('menu-management-grid-columns');
    return saved ? parseInt(saved) : 4;
  });
  
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>(() => {
    const saved = localStorage.getItem('menu-management-item-size');
    return (saved as 'small' | 'medium' | 'large') || 'medium';
  });
  
  const { 
    menuItems, 
    categories, 
    addons, 
    addonGroups, 
    loading, 
    refetch 
  } = useSupabaseData();
  
  const { toast } = useToast();

  // บันทึกค่าการตั้งค่าใน localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('menu-management-grid-columns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('menu-management-item-size', itemSize);
  }, [itemSize]);

  // Calculate menu count for each category
  useEffect(() => {
    const counts: { [key: string]: number } = {};
    categories.forEach(category => {
      counts[category.id] = menuItems.filter(item => item.category_id === category.id).length;
    });
    setCategoryMenuCounts(counts);
  }, [menuItems, categories]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: DatabaseMenuItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDelete = async (item: DatabaseMenuItem) => {
    if (confirm(`คุณต้องการลบเมนู "${item.name}" หรือไม่?`)) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', item.id);

        if (error) throw error;

        toast({ title: 'สำเร็จ', description: 'ลบเมนูเรียบร้อยแล้ว' });
        refetch.menuItems();
      } catch (error: any) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleAddImage = (item: DatabaseMenuItem) => {
    setImageEditingItem(item);
    setCropperImageSrc('/placeholder.svg');
    setShowImageCropper(true);
  };

  const handleImageSave = async (croppedImageUrl: string) => {
    if (!imageEditingItem) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ image_url: croppedImageUrl })
        .eq('id', imageEditingItem.id);

      if (error) throw error;

      toast({ title: 'สำเร็จ', description: 'อัพเดทรูปภาพเรียบร้อยแล้ว' });
      setShowImageCropper(false);
      setImageEditingItem(null);
      setCropperImageSrc('');
      refetch.menuItems();
    } catch (error: any) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (error) throw error;

        toast({ title: 'สำเร็จ', description: 'ลบหมวดหมู่เรียบร้อยแล้ว' });
        refetch.categories();
      } catch (error: any) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleDeleteAddonGroup = async (addonGroupId: string) => {
    if (confirm('คุณต้องการลบกลุ่ม Add-on นี้หรือไม่?')) {
      try {
        const { error } = await supabase
          .from('addon_groups')
          .delete()
          .eq('id', addonGroupId);

        if (error) throw error;

        toast({ title: 'สำเร็จ', description: 'ลบกลุ่ม Add-on เรียบร้อยแล้ว' });
        refetch.addonGroups();
      } catch (error: any) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (confirm('คุณต้องการลบ Add-on นี้หรือไม่?')) {
      try {
        const { error } = await supabase
          .from('addons')
          .delete()
          .eq('id', addonId);

        if (error) throw error;

        toast({ title: 'สำเร็จ', description: 'ลบ Add-on เรียบร้อยแล้ว' });
        refetch.addons();
      } catch (error: any) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleFormSuccess = () => {
    setShowItemForm(false);
    setShowCategoryForm(false);
    setShowAddonForm(false);
    setShowAddonGroupForm(false);
    setEditingItem(null);
    setEditingCategory(null);
    setEditingAddonGroup(null);
    setEditingAddon(null);
    refetch.menuItems();
    refetch.categories();
    refetch.addonGroups();
    refetch.addons();
  };

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Sidebar */}
      <MainSidebar isOpen={isMainSidebarOpen} onClose={closeMainSidebar} />
      
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b p-4 bg-white z-10">
          <Header 
            onToggleSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            onToggleMainSidebar={toggleMainSidebar}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            itemSize={itemSize}
            setItemSize={setItemSize}
            page="menu-management"
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-coffee-800">จัดการเมนู</h1>
              <Button
                onClick={() => setShowDisplaySettings(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                ตั้งค่าการแสดงผล
              </Button>
            </div>

            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="menu">รายการอาหาร</TabsTrigger>
                <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
                <TabsTrigger value="addons">กลุ่ม Add-on</TabsTrigger>
                <TabsTrigger value="addon-items">Add-ons</TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>รายการอาหาร ({filteredItems.length} รายการ)</CardTitle>
                      <Button onClick={() => setShowItemForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มเมนูใหม่
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="ค้นหาเมนู..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <MenuManagementGrid 
                      menuItems={filteredItems}
                      gridColumns={gridColumns}
                      itemSize={itemSize}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddImage={handleAddImage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>หมวดหมู่</CardTitle>
                      <Button 
                        className="bg-coffee-600 hover:bg-coffee-700"
                        onClick={() => {
                          setEditingCategory(null);
                          setShowCategoryForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มหมวดหมู่
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-coffee-500">กำลังโหลด...</div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-8 text-coffee-500">
                        <p>ยังไม่มีหมวดหมู่</p>
                        <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มหมวดหมู่" เพื่อเริ่มต้น</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <div key={category.id} className="border border-coffee-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-coffee-800">{category.name}</h3>
                                <p className="text-sm text-coffee-600">{category.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {categoryMenuCounts[category.id] || 0} เมนู
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setShowCategoryForm(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addons" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>กลุ่ม Add-on</CardTitle>
                      <Button 
                        className="bg-coffee-600 hover:bg-coffee-700"
                        onClick={() => {
                          setEditingAddonGroup(null);
                          setShowAddonGroupForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มกลุ่ม Add-on
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-coffee-500">กำลังโหลด...</div>
                    ) : addonGroups.length === 0 ? (
                      <div className="text-center py-8 text-coffee-500">
                        <p>ยังไม่มีกลุ่ม Add-on</p>
                        <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มกลุ่ม Add-on" เพื่อเริ่มต้น</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addonGroups.map((group) => {
                          const groupAddons = addons.filter(addon => addon.addon_group_id === group.id);
                          return (
                            <div key={group.id} className="border border-coffee-100 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-coffee-800">{group.name}</h3>
                                  <p className="text-sm text-coffee-600">{group.description}</p>
                                  <div className="flex space-x-4 mt-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {group.is_required ? 'บังคับเลือก' : 'ไม่บังคับ'}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {group.allow_multiple ? 'เลือกได้หลายรายการ' : 'เลือกได้รายการเดียว'}
                                    </span>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      {groupAddons.length} รายการ
                                    </span>
                                  </div>
                                  {groupAddons.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-xs text-gray-600 mb-1">รายการใน Add-on นี้:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {groupAddons.map((addon) => (
                                          <span key={addon.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                            {addon.name} (฿{addon.price})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setEditingAddonGroup(group);
                                      setShowAddonGroupForm(true);
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={() => handleDeleteAddonGroup(group.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addon-items" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Add-ons</CardTitle>
                      <Button 
                        className="bg-coffee-600 hover:bg-coffee-700"
                        onClick={() => {
                          setEditingAddon(null);
                          setShowAddonForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่ม Add-on
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-coffee-500">กำลังโหลด...</div>
                    ) : addons.length === 0 ? (
                      <div className="text-center py-8 text-coffee-500">
                        <p>ยังไม่มี Add-ons</p>
                        <p className="text-sm mt-2">คลิกปุ่ม "เพิ่ม Add-on" เพื่อเริ่มต้น</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addons.map((addon) => (
                          <div key={addon.id} className="border border-coffee-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-coffee-800">{addon.name}</h3>
                                <p className="text-sm text-coffee-600">ราคา: ฿{addon.price}</p>
                                {addon.addon_groups && (
                                  <p className="text-sm text-coffee-600">กลุ่ม: {addon.addon_groups.name}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingAddon(addon);
                                    setShowAddonForm(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteAddon(addon.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Display Settings Modal with page-specific props */}
            <DisplaySettingsModal
              isOpen={showDisplaySettings}
              onClose={() => setShowDisplaySettings(false)}
              gridColumns={gridColumns}
              setGridColumns={setGridColumns}
              itemSize={itemSize}
              setItemSize={setItemSize}
              page="menu-management"
            />

            {/* Forms and Modals */}
            {showItemForm && (
              <MenuItemForm
                isOpen={showItemForm}
                editItem={editingItem}
                categories={categories}
                onSuccess={handleFormSuccess}
                onClose={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
              />
            )}

            {showCategoryForm && (
              <CategoryForm
                isOpen={showCategoryForm}
                editCategory={editingCategory}
                onSuccess={handleFormSuccess}
                onClose={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              />
            )}

            {showAddonForm && (
              <AddonForm
                isOpen={showAddonForm}
                editAddon={editingAddon}
                addonGroups={addonGroups}
                onSuccess={handleFormSuccess}
                onClose={() => {
                  setShowAddonForm(false);
                  setEditingAddon(null);
                }}
              />
            )}

            {showAddonGroupForm && (
              <AddonGroupForm
                isOpen={showAddonGroupForm}
                editAddonGroup={editingAddonGroup}
                onSuccess={handleFormSuccess}
                onClose={() => {
                  setShowAddonGroupForm(false);
                  setEditingAddonGroup(null);
                }}
              />
            )}

            {showImageCropper && imageEditingItem && (
              <ImageCropper
                isOpen={showImageCropper}
                onClose={() => {
                  setShowImageCropper(false);
                  setImageEditingItem(null);
                  setCropperImageSrc('');
                }}
                onCrop={handleImageSave}
                imageSrc={cropperImageSrc}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
