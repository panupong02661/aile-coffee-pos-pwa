
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DisplaySettings from './DisplaySettings';

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: string;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OnlineShopSectionProps {
  currentUser?: any;
}

const OnlineShopSection: React.FC<OnlineShopSectionProps> = ({ currentUser }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridColumns, setGridColumns] = useState(2);
  const [itemSize, setItemSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Load saved settings and cart on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('customerAppDisplaySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setGridColumns(settings.gridColumns || 2);
        setItemSize(settings.itemSize || 'medium');
      } catch (error) {
        console.error('Error loading display settings:', error);
      }
    }

    const savedCart = localStorage.getItem('customerAppCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem('customerAppCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (menuError) throw menuError;

      setCategories(categoriesData || []);
      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    toast.success(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prev.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleGridColumnsChange = (columns: number) => {
    setGridColumns(columns);
  };

  const handleItemSizeChange = (size: 'small' | 'medium' | 'large') => {
    setItemSize(size);
  };

  const getItemSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'h-32';
      case 'large':
        return 'h-48';
      default:
        return 'h-40';
    }
  };

  const getImageSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'h-16 w-16';
      case 'large':
        return 'h-24 w-24';
      default:
        return 'h-20 w-20';
    }
  };

  const getTextSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coffee-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดเมนู...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and settings */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-coffee-800">สั่งซื้อออนไลน์</h2>
        <DisplaySettings
          gridColumns={gridColumns}
          itemSize={itemSize}
          onGridColumnsChange={handleGridColumnsChange}
          onItemSizeChange={handleItemSizeChange}
        />
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาเมนู..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            className="whitespace-nowrap"
          >
            ทั้งหมด
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="p-4">
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
          }}
        >
          {filteredItems.map(item => {
            const quantityInCart = getItemQuantityInCart(item.id);
            return (
              <Card key={item.id} className={`${getItemSizeClasses()} overflow-hidden`}>
                <CardContent className="p-3 h-full flex flex-col">
                  {item.image_url && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className={`${getImageSizeClasses()} object-cover rounded`}
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`font-medium text-coffee-800 ${getTextSizeClasses()} line-clamp-1`}>
                        {item.name}
                      </h3>
                      {item.description && itemSize !== 'small' && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <p className={`text-coffee-600 font-semibold mt-1 ${getTextSizeClasses()}`}>
                        ฿{item.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="mt-2">
                      {quantityInCart > 0 ? (
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="mx-2 font-medium">{quantityInCart}</span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          เพิ่ม
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบเมนูที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-coffee-600" />
              <span className="font-medium">{getTotalItems()} รายการ</span>
              <Badge variant="secondary" className="bg-coffee-100 text-coffee-800">
                ฿{getTotalPrice().toLocaleString()}
              </Badge>
            </div>
            <Button className="bg-coffee-600 hover:bg-coffee-700">
              ดูตะกร้า
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineShopSection;
