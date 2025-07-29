
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';

interface MenuItemsListProps {
  menuItems: any[];
  onEdit: (item: any) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ menuItems, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {menuItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <Badge variant={item.is_available ? 'default' : 'secondary'}>
                {item.is_available ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {item.is_available ? 'ใช้งาน' : 'ปิดใช้งาน'}
              </Badge>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-coffee-600">
                ฿{item.price?.toFixed(2) || '0.00'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(item)}
              >
                <Edit className="w-4 h-4 mr-1" />
                แก้ไข
              </Button>
            </div>
            
            {item.image_url && (
              <div className="mt-2">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuItemsList;
