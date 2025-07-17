import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MenuManagementGrid from '@/components/MenuManagementGrid';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';

const MenuManagement = () => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useQuery('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

  useEffect(() => {
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError.message);
    }
  }, [categoriesError]);

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
              
              <MenuManagementGrid />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
