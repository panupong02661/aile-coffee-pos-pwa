
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
        console.error("Categories fetch error:", error);
        throw new Error(error.message);
      }

      return data || [];
    }
  });

  const { data: rawMenuItems = [], error: menuError, isLoading: menuLoading, refetch } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      console.log("Fetching menu items...");
      
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories!menu_items_category_id_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Menu items fetch error:", error);
        throw new Error(error.message);
      }

      console.log("Menu items fetched successfully:", data);
      return data || [];
    }
  });

  // Transform the data to match the MenuItem interface
  const menuItems = rawMenuItems.map((item: any) => {
    console.log("Processing menu item:", item);
    
    return {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available,
      categories: item.categories && typeof item.categories === 'object' && !('error' in item.categories) 
        ? {
            id: item.categories.id,
            name: item.categories.name
          } 
        : undefined
    };
  });

  useEffect(() => {
    if (categoriesError) {
      console.error("Categories error:", categoriesError);
      toast.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
    }
    if (menuError) {
      console.error("Menu error:", menuError);
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

  const handleRetry = () => {
    console.log("Retrying data fetch...");
    refetch();
  };

  if (menuError) {
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
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
                    <p className="text-gray-600 mb-4">ไม่สามารถโหลดรายการเมนูได้ในขณะนี้</p>
                    <button 
                      onClick={handleRetry}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      ลองใหม่
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            categories={categories || []}
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
                <div className="text-sm text-gray-600">
                  รายการเมนูทั้งหมด: {menuItems.length} รายการ
                </div>
              </div>
              
              {menuLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-gray-600">กำลังโหลดรายการเมนู...</p>
                  </div>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg">ยังไม่มีรายการเมนู</p>
                    <p className="text-gray-500 text-sm mt-2">เพิ่มเมนูใหม่เพื่อเริ่มต้นการจัดการ</p>
                  </div>
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
