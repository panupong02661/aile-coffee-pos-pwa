
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';

interface CategoriesListProps {
  categories: any[];
  onEdit: (item: any) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <Badge variant={category.is_active ? 'default' : 'secondary'}>
                {category.is_active ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {category.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
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
