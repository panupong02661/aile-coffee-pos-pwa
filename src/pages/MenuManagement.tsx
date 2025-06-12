
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MenuItemForm from '@/components/MenuItemForm';
import CategoryForm from '@/components/CategoryForm';
import AddonForm from '@/components/AddonForm';

const MenuManagement = () => {
  const { categories, menuItems, addonGroups, addons, loading, refetch } = useSupabaseData();
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 p-4 flex items-center justify-center">
        <div className="text-coffee-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-coffee-800">จัดการเมนู</h1>
          <p className="text-coffee-600 mt-2">จัดการเมนูสินค้า, Add-on และหมวดหมู่</p>
        </div>

        <Tabs defaultValue="menu-items" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu-items">เมนูสินค้า</TabsTrigger>
            <TabsTrigger value="addons">Add-on</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
          </TabsList>

          {/* Menu Items Tab */}
          <TabsContent value="menu-items" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">รายการเมนู</CardTitle>
                <Button 
                  className="bg-coffee-600 hover:bg-coffee-700"
                  onClick={() => {
                    setEditingItem(null);
                    setShowMenuForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มเมนูใหม่
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-7 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="border-coffee-100">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-coffee-800 text-sm">{item.name}</h3>
                            <p className="text-coffee-600 font-semibold">฿{item.price}</p>
                            <p className="text-xs text-coffee-500">
                              ต้นทุน: ฿{item.cost_price}
                            </p>
                            <p className="text-xs text-coffee-400">
                              {item.categories?.name || 'ไม่มีหมวดหมู่'}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowMenuForm(true);
                                }}
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">Add-on</CardTitle>
                <Button 
                  className="bg-coffee-600 hover:bg-coffee-700"
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddonForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม Add-on
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addonGroups.map((group) => {
                    const groupAddons = addons.filter(addon => addon.addon_group_id === group.id);
                    return (
                      <div key={group.id} className="border border-coffee-100 rounded-lg p-4">
                        <h3 className="font-medium text-coffee-800 mb-3">{group.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupAddons.map((addon) => (
                            <div key={addon.id} className="flex items-center justify-between p-2 bg-coffee-50 rounded">
                              <div>
                                <span className="text-sm font-medium text-coffee-800">
                                  {addon.name}
                                </span>
                                <div className="text-xs text-coffee-600">
                                  {addon.price > 0 ? `+฿${addon.price}` : 
                                   addon.price < 0 ? `฿${addon.price}` : 'ฟรี'}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingItem(addon);
                                    setShowAddonForm(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600"
                                  onClick={() => handleDeleteAddon(addon.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">หมวดหมู่เมนู</CardTitle>
                <Button 
                  className="bg-coffee-600 hover:bg-coffee-700"
                  onClick={() => {
                    setEditingItem(null);
                    setShowCategoryForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border border-coffee-100 rounded-lg">
                      <div>
                        <h3 className="font-medium text-coffee-800">{category.name}</h3>
                        <p className="text-sm text-coffee-600">{category.description}</p>
                        <p className="text-xs text-coffee-500">ลำดับ: {category.sort_order}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(category);
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <MenuItemForm
          isOpen={showMenuForm}
          onClose={() => setShowMenuForm(false)}
          onSuccess={() => {
            refetch.menuItems();
            setEditingItem(null);
          }}
          categories={categories}
          editItem={editingItem}
        />

        <CategoryForm
          isOpen={showCategoryForm}
          onClose={() => setShowCategoryForm(false)}
          onSuccess={() => {
            refetch.categories();
            setEditingItem(null);
          }}
          editCategory={editingItem}
        />

        <AddonForm
          isOpen={showAddonForm}
          onClose={() => setShowAddonForm(false)}
          onSuccess={() => {
            refetch.addons();
            setEditingItem(null);
          }}
          addonGroups={addonGroups}
          editAddon={editingItem}
        />
      </div>
    </div>
  );
};

export default MenuManagement;
