
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MenuManagementGrid from '@/components/MenuManagementGrid';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const MenuManagement = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  });

  const { data: rawMenuItems = [], error: menuError, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    }
  });

  // Transform the data to match the MenuItem interface
  const menuItems = rawMenuItems.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.image_url,
    is_available: item.is_available,
    categories: item.categories ? {
      id: item.categories.id,
      name: item.categories.name
    } : undefined
  }));

  useEffect(() => {
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError.message);
      toast.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
    }
    if (menuError) {
      console.error("Error fetching menu items:", menuError.message);
      toast.error("เกิดข้อผิดพลาดในการโหลดรายการเมนู");
    }
  }, [categoriesError, menuError]);

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    toast.info(`แก้ไข ${item.name}`);
  };

  const handleDelete = (item: any) => {
    console.log('Delete item:', item);
    toast.info(`ลบ ${item.name}`);
  };

  const handleAddImage = (item: any) => {
    console.log('Add image for item:', item);
    toast.info(`เพิ่มรูปภาพสำหรับ ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isMainSidebarOpen} 
        onClose={() => setIsMainSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleMainSidebar={() => setIsMainSidebarOpen(true)}
            showMainSidebarToggle={true}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="menu"
          />
          
          <div className="max-w-7xl mx-auto">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-coffee-800">จัดการเมนู</h1>
              </div>
              
              {menuLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <MenuManagementGrid 
                  menuItems={menuItems}
                  gridColumns={4}
                  itemSize="medium"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddImage={handleAddImage}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
