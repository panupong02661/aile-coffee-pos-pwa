
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockMenuItems, mockCategories, mockAddons } from '@/data/mockData';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [categories, setCategories] = useState(mockCategories.filter(cat => cat.id !== '1'));
  const [addons, setAddons] = useState(mockAddons);

  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-coffee-800">จัดการเมนู</h1>
          <p className="text-coffee-600 mt-2">จัดการเมนูสินค้า, Add-on และหมวดหมู่</p>
        </div>

        <Tabs defaultValue="menu-items" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu-items">เมนูสินค้า</TabsTrigger>
            <TabsTrigger value="addons">Add-on</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
            <TabsTrigger value="promotions">โปรโมชั่น</TabsTrigger>
          </TabsList>

          {/* Menu Items Tab */}
          <TabsContent value="menu-items" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">รายการเมนู</CardTitle>
                <Button className="bg-coffee-600 hover:bg-coffee-700">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มเมนูใหม่
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="border-coffee-100">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-coffee-800">{item.name}</h3>
                            <p className="text-coffee-600 font-semibold">฿{item.price}</p>
                            <p className="text-xs text-coffee-500 mt-1">
                              ต้นทุน: ฿{item.calculated_cost}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
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
                <Button className="bg-coffee-600 hover:bg-coffee-700">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม Add-on
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    addons.reduce((groups, addon) => {
                      if (!groups[addon.category]) groups[addon.category] = [];
                      groups[addon.category].push(addon);
                      return groups;
                    }, {} as Record<string, typeof addons>)
                  ).map(([category, categoryAddons]) => (
                    <div key={category} className="border border-coffee-100 rounded-lg p-4">
                      <h3 className="font-medium text-coffee-800 mb-3 capitalize">
                        {category === 'shot' && 'ชอต'}
                        {category === 'sweetness' && 'ความหวาน'}
                        {category === 'topping' && 'ท็อปปิ้ง'}
                        {category === 'size' && 'ขนาด'}
                        {category === 'other' && 'อื่นๆ'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryAddons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between p-2 bg-coffee-50 rounded">
                            <div>
                              <span className="text-sm font-medium text-coffee-800">
                                {addon.name}
                              </span>
                              <div className="text-xs text-coffee-600">
                                {addon.price > 0 ? `+฿${addon.price}` : 
                                 addon.price < 0 ? `฿${addon.price}` : 'ฟรี'}
                                {addon.is_required && ' • จำเป็น'}
                                {addon.allow_multiple && ' • เลือกได้หลาย'}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">หมวดหมู่เมนู</CardTitle>
                <Button className="bg-coffee-600 hover:bg-coffee-700">
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
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-6">
            <Card className="border-coffee-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-coffee-800">โปรโมชั่น</CardTitle>
                <Button className="bg-coffee-600 hover:bg-coffee-700">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างโปรโมชั่น
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-coffee-500">
                  <p>ยังไม่มีโปรโมชั่น</p>
                  <p className="text-sm mt-2">คลิกปุ่ม "สร้างโปรโมชั่น" เพื่อเริ่มต้น</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MenuManagement;
