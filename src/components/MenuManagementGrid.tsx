
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Camera } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  categories?: {
    id: string;
    name: string;
  };
}

interface MenuManagementGridProps {
  menuItems: MenuItem[];
  gridColumns?: number;
  itemSize?: string;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddImage: (item: MenuItem) => void;
}

const MenuManagementGrid = ({ 
  menuItems, 
  gridColumns = 4, 
  itemSize = 'medium',
  onEdit, 
  onDelete, 
  onAddImage 
}: MenuManagementGridProps) => {
  const getGridClasses = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10'
    };
    return `grid ${columnClasses[gridColumns as keyof typeof columnClasses] || 'grid-cols-4'} gap-4`;
  };

  const getItemSizeClasses = () => {
    switch (itemSize) {
      case 'small':
        return 'h-48';
      case 'large':
        return 'h-72';
      default:
        return 'h-60';
    }
  };

  return (
    <div className={getGridClasses()}>
      {menuItems.map((item) => (
        <Card key={item.id} className={`relative group hover:shadow-lg transition-shadow ${getItemSizeClasses()}`}>
          <CardContent className="p-4 h-full flex flex-col">
            <div className="relative mb-3 flex-shrink-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">ไม่มีรูปภาพ</span>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => onAddImage(item)}
              >
                <Camera className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-coffee-600">฿{item.price}</span>
                <Badge variant={item.is_available ? "default" : "secondary"}>
                  {item.is_available ? 'พร้อมขาย' : 'หมด'}
                </Badge>
              </div>
              
              {item.categories && (
                <Badge variant="outline" className="mb-2 w-fit">
                  {item.categories.name}
                </Badge>
              )}
              
              <div className="flex space-x-2 mt-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuManagementGrid;
