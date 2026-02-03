
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder, Edit, Eye, EyeOff, Trash2, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

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

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const currentItem = localMenuItems[index];
    const prevItem = localMenuItems[index - 1];
    
    // Swap sort_order values
    const currentSortOrder = currentItem.sort_order || index;
    const prevSortOrder = prevItem.sort_order || index - 1;
    
    // Optimistic update
    const newItems = [...localMenuItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setLocalMenuItems(newItems);
    
    try {
      // Update both items in database - use type assertion since sort_order is newly added
      await Promise.all([
        supabase.from('menu_items').update({ sort_order: prevSortOrder } as any).eq('id', currentItem.id),
        supabase.from('menu_items').update({ sort_order: currentSortOrder } as any).eq('id', prevItem.id)
      ]);
      
      toast.success('เลื่อนลำดับสำเร็จ');
      onStatusChange?.();
    } catch (error) {
      console.error('Error moving item:', error);
      setLocalMenuItems(menuItems);
      toast.error('เกิดข้อผิดพลาดในการเลื่อนลำดับ');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === localMenuItems.length - 1) return;
    
    const currentItem = localMenuItems[index];
    const nextItem = localMenuItems[index + 1];
    
    // Swap sort_order values
    const currentSortOrder = currentItem.sort_order || index;
    const nextSortOrder = nextItem.sort_order || index + 1;
    
    // Optimistic update
    const newItems = [...localMenuItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setLocalMenuItems(newItems);
    
    try {
      // Update both items in database - use type assertion since sort_order is newly added
      await Promise.all([
        supabase.from('menu_items').update({ sort_order: nextSortOrder } as any).eq('id', currentItem.id),
        supabase.from('menu_items').update({ sort_order: currentSortOrder } as any).eq('id', nextItem.id)
      ]);
      
      toast.success('เลื่อนลำดับสำเร็จ');
      onStatusChange?.();
    } catch (error) {
      console.error('Error moving item:', error);
      setLocalMenuItems(menuItems);
      toast.error('เกิดข้อผิดพลาดในการเลื่อนลำดับ');
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
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'bg-coffee-600 hover:bg-coffee-700' : ''}
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-coffee-600 hover:bg-coffee-700' : ''}
        >
          <List className="w-4 h-4 mr-1" />
          List
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localMenuItems.map((item, index) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_available ? 'opacity-60 bg-gray-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === localMenuItems.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                  </div>
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
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ลำดับ</TableHead>
                <TableHead>ชื่อเมนู</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localMenuItems.map((item, index) => (
                <TableRow key={item.id} className={!item.is_available ? 'opacity-60 bg-gray-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === localMenuItems.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(item.category_id) || '-'}</TableCell>
                  <TableCell className="font-bold text-coffee-600">฿{item.price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.is_available ? 'default' : 'destructive'}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                        item.is_available 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleStatusToggle(item)}
                    >
                      {item.is_available ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
