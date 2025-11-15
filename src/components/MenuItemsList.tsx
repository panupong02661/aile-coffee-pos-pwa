
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MenuItemsListProps {
  menuItems: any[];
  onEdit: (item: any) => void;
  onStatusChange?: () => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ menuItems, onEdit, onStatusChange }) => {
  const [localMenuItems, setLocalMenuItems] = React.useState(menuItems);

  // Update local state when props change - simple sync
  React.useEffect(() => {
    setLocalMenuItems(menuItems);
  }, [menuItems]);

  const handleStatusToggle = async (item: any) => {
    try {
      const newStatus = !item.is_available;
      
      // Optimistic update - update UI immediately
      setLocalMenuItems(prevItems =>
        prevItems.map(menuItem =>
          menuItem.id === item.id
            ? { ...menuItem, is_available: newStatus }
            : menuItem
        )
      );
      
      // Update database
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating menu item status:', error);
        // Revert on error
        setLocalMenuItems(prevItems =>
          prevItems.map(menuItem =>
            menuItem.id === item.id
              ? { ...menuItem, is_available: !newStatus }
              : menuItem
          )
        );
        toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        return;
      }

      // Show success message
      toast.success(`${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}เมนู ${item.name} แล้ว`);
      
      // Sync with parent after a short delay
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange();
        }
      }, 300);
    } catch (error) {
      console.error('Error updating menu item status:', error);
      // Revert on error
      setLocalMenuItems(menuItems);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localMenuItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <Badge 
                variant={item.is_available ? 'default' : 'destructive'}
                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                  item.is_available 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={() => handleStatusToggle(item)}
              >
                {item.is_available ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {item.is_available ? 'ใช้งาน' : 'ไม่ใช้งาน'}
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
