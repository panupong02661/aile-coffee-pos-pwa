
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoriesListProps {
  categories: any[];
  onEdit: (item: any) => void;
  onStatusChange?: () => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onEdit, onStatusChange }) => {
  const [localCategories, setLocalCategories] = React.useState(categories);

  React.useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleStatusToggle = async (category: any) => {
    try {
      const newStatus = !category.is_active;
      
      setLocalCategories(prevItems =>
        prevItems.map(cat =>
          cat.id === category.id
            ? { ...cat, is_active: newStatus }
            : cat
        )
      );
      
      const { error } = await supabase
        .from('categories')
        .update({ is_active: newStatus })
        .eq('id', category.id);

      if (error) {
        console.error('Error updating category status:', error);
        setLocalCategories(prevItems =>
          prevItems.map(cat =>
            cat.id === category.id
              ? { ...cat, is_active: !newStatus }
              : cat
          )
        );
        toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        return;
      }

      toast.success(`${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}หมวดหมู่ ${category.name} แล้ว`);
      
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange();
        }
      }, 300);
    } catch (error) {
      console.error('Error updating category status:', error);
      setLocalCategories(categories);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localCategories.map((category) => (
        <Card key={category.id} className={`overflow-hidden ${!category.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <Badge 
                variant={category.is_active ? 'default' : 'destructive'}
                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                  category.is_active 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={() => handleStatusToggle(category)}
              >
                {category.is_active ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {category.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
              </Badge>
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                ลำดับ: {category.sort_order || 0}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(category)}
              >
                <Edit className="w-4 h-4 mr-1" />
                แก้ไข
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default memo(CategoriesList);
