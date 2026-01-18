
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MenuItemsListProps {
  menuItems: any[];
  categories?: any[];
  onEdit: (item: any) => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ menuItems, categories = [], onEdit, onStatusChange, onDelete }) => {
  const [localMenuItems, setLocalMenuItems] = React.useState(menuItems);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || null;
  };

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
      
      // Call secure RPC function
      const { data, error } = await supabase.rpc('toggle_menu_availability', {
        menu_item_id: item.id,
        new_status: newStatus
      });

      if (error || !data) {
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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // ลบ order_items ที่อ้างอิงถึงเมนูนี้
      await supabase
        .from('order_items')
        .delete()
        .eq('menu_item_id', deleteId);

      // ลบความสัมพันธ์ในตาราง menu_addon_groups
      await supabase
        .from('menu_addon_groups')
        .delete()
        .eq('menu_item_id', deleteId);

      // ลบความสัมพันธ์ในตาราง menu_ingredients
      await supabase
        .from('menu_ingredients')
        .delete()
        .eq('menu_item_id', deleteId);

      // ลบความสัมพันธ์ในตาราง bulk_discounts
      await supabase
        .from('bulk_discounts')
        .delete()
        .eq('menu_item_id', deleteId);

      // ลบเมนู
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success('ลบเมนูสำเร็จ');
      onDelete?.();
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localMenuItems.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${!item.is_available ? 'opacity-60 bg-gray-50' : ''}`}>
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
              
              {getCategoryName(item.category_id) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Folder className="w-3 h-3" />
                  <span>{getCategoryName(item.category_id)}</span>
                </div>
              )}
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-coffee-600">
                  ฿{item.price?.toFixed(2) || '0.00'}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบเมนู</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบเมนูนี้? การลบจะไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MenuItemsList;
