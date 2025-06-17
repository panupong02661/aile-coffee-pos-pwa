import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import MenuItemForm from '@/components/MenuItemForm';
import CategoryForm from '@/components/CategoryForm';
import AddonForm from '@/components/AddonForm';
import AddonGroupForm from '@/components/AddonGroupForm';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { DatabaseMenuItem, DatabaseCategory, DatabaseAddonGroup, DatabaseAddon } from '@/hooks/useSupabaseData';

const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'addon-groups' | 'addons'>('menu');
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAddonGroupForm, setShowAddonGroupForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<DatabaseMenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<DatabaseCategory | null>(null);
  const [editingAddonGroup, setEditingAddonGroup] = useState<DatabaseAddonGroup | null>(null);
  const [editingAddon, setEditingAddon] = useState<DatabaseAddon | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { 
    categories, 
    menuItems, 
    addonGroups, 
    addons, 
    loading, 
    refetch,
    uploadImage 
  } = useSupabaseData();
  
  const { toast } = useToast();

  const handleEditMenuItem = (item: DatabaseMenuItem) => {
    console.log('Editing menu item:', item);
    setEditingMenuItem(item);
    setShowMenuForm(true);
  };

  const handleAddMenuItem = () => {
    console.log('Adding new menu item');
    setEditingMenuItem(null);
    setShowMenuForm(true);
  };

  const handleCloseMenuForm = () => {
    setShowMenuForm(false);
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('คุณต้องการลบเมนูนี้หรือไม่?')) return;
    
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบเมนูได้', variant: 'destructive' });
    } else {
      toast({ title: 'สำเร็จ', description: 'ลบเมนูสำเร็จ' });
      refetch.menuItems();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบหมวดหมู่ได้', variant: 'destructive' });
    } else {
      toast({ title: 'สำเร็จ', description: 'ลบหมวดหมู่สำเร็จ' });
      refetch.categories();
    }
  };

  const handleDeleteAddonGroup = async (id: string) => {
    if (!confirm('คุณต้องการลบกลุ่ม Add-on นี้หรือไม่?')) return;
    
    const { error } = await supabase.from('addon_groups').delete().eq('id', id);
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบกลุ่ม Add-on ได้', variant: 'destructive' });
    } else {
      toast({ title: 'สำเร็จ', description: 'ลบกลุ่ม Add-on สำเร็จ' });
      refetch.addonGroups();
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!confirm('คุณต้องการลบ Add-on นี้หรือไม่?')) return;
    
    const { error } = await supabase.from('addons').delete().eq('id', id);
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบ Add-on ได้', variant: 'destructive' });
    } else {
      toast({ title: 'สำเร็จ', description: 'ลบ Add-on สำเร็จ' });
      refetch.addons();
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

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

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-coffee-800">จัดการเมนู</h1>
            <p className="text-coffee-600 mt-2">จัดการรายการอาหาร หมวดหมู่ กลุ่ม Add-on และ Add-on</p>
          </div>

          <div className="mb-4">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === 'menu' ? 'default' : 'outline'}
                onClick={() => setActiveTab('menu')}
              >
                เมนู
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'default' : 'outline'}
                onClick={() => setActiveTab('categories')}
              >
                หมวดหมู่
              </Button>
              <Button
                variant={activeTab === 'addon-groups' ? 'default' : 'outline'}
                onClick={() => setActiveTab('addon-groups')}
              >
                กลุ่ม Add-on
              </Button>
              <Button
                variant={activeTab === 'addons' ? 'default' : 'outline'}
                onClick={() => setActiveTab('addons')}
              >
                Add-ons
              </Button>
            </div>
          </div>

          {activeTab === 'menu' && (
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">รายการอาหาร</CardTitle>
                <Button 
                  className="bg-coffee-600 hover:bg-coffee-700"
                  onClick={handleAddMenuItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มเมนู
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-coffee-500">กำลังโหลด...</div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-8 text-coffee-500">
                    <p>ยังไม่มีเมนู</p>
                    <p className="text-sm mt-2">คลิกปุ่ม "เพิ่มเมนู" เพื่อเริ่มต้น</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <div key={item.id} className="border border-coffee-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-coffee-800">{item.name}</h3>
                            <p className="text-sm text-coffee-600">{item.description}</p>
                            <p className="text-sm text-coffee-600">ราคา: ฿{item.price}</p>
                            {item.categories && (
                              <p className="text-sm text-coffee-600">หมวดหมู่: {item.categories.name}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteMenuItem(item.id)}
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
          )}

          {activeTab === 'categories' && (
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">หมวดหมู่</CardTitle>
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
          )}

          {activeTab === 'addon-groups' && (
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">กลุ่ม Add-on</CardTitle>
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
                    {addonGroups.map((group) => (
                      <div key={group.id} className="border border-coffee-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-coffee-800">{group.name}</h3>
                            <p className="text-sm text-coffee-600">{group.description}</p>
                            <div className="flex space-x-4 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {group.is_required ? 'บังคับเลือก' : 'ไม่บังคับ'}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {group.allow_multiple ? 'เลือกได้หลายรายการ' : 'เลือกได้รายการเดียว'}
                              </span>
                            </div>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'addons' && (
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">Add-ons</CardTitle>
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
          )}

          <MenuItemForm
            isOpen={showMenuForm}
            onClose={handleCloseMenuForm}
            onSuccess={() => refetch.menuItems()}
            categories={categories}
            editItem={editingMenuItem}
          />

          <CategoryForm
            isOpen={showCategoryForm}
            onClose={() => setShowCategoryForm(false)}
            onSuccess={() => refetch.categories()}
            editCategory={editingCategory}
          />

          <AddonGroupForm
            isOpen={showAddonGroupForm}
            onClose={() => setShowAddonGroupForm(false)}
            onSuccess={() => refetch.addonGroups()}
            editAddonGroup={editingAddonGroup}
          />

          <AddonForm
            isOpen={showAddonForm}
            onClose={() => setShowAddonForm(false)}
            onSuccess={() => refetch.addons()}
            addonGroups={addonGroups}
            editAddon={editingAddon}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
