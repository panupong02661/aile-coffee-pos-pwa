
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff, Trash2, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
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

interface CategoriesListProps {
  categories: any[];
  onEdit: (item: any) => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onEdit, onStatusChange, onDelete }) => {
  const [localCategories, setLocalCategories] = React.useState(categories);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

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

  const normalizeAndSwap = async (items: any[], indexA: number, indexB: number) => {
    const newItems = [...items];
    const temp = newItems[indexA];
    newItems[indexA] = newItems[indexB];
    newItems[indexB] = temp;
    
    const updatedItems = newItems.map((item, i) => ({ ...item, sort_order: i }));
    setLocalCategories(updatedItems);
    
    try {
      const updates = updatedItems.map((item, i) =>
        supabase.from('categories').update({ sort_order: i }).eq('id', item.id)
      );
      const results = await Promise.all(updates);
      
      const hasError = results.some(r => r.error);
      if (hasError) throw new Error('DB update failed');
      
      toast.success('เลื่อนลำดับสำเร็จ');
    } catch (error) {
      console.error('Error moving item:', error);
      setLocalCategories(categories);
      toast.error('เกิดข้อผิดพลาดในการเลื่อนลำดับ');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await normalizeAndSwap(localCategories, index, index - 1);
  };

  const handleMoveDown = async (index: number) => {
    if (index === localCategories.length - 1) return;
    await normalizeAndSwap(localCategories, index, index + 1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // ลบความสัมพันธ์ในตาราง category_addon_groups
      await supabase
        .from('category_addon_groups')
        .delete()
        .eq('category_id', deleteId);

      // อัปเดต menu_items ให้ไม่มี category_id
      await supabase
        .from('menu_items')
        .update({ category_id: null })
        .eq('category_id', deleteId);

      // ลบหมวดหมู่
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success('ลบหมวดหมู่สำเร็จ');
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
          className={viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <List className="w-4 h-4 mr-1" />
          List
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localCategories.map((category, index) => (
            <Card key={category.id} className={`overflow-hidden ${!category.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
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
                        disabled={index === localCategories.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(category)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
                <TableHead>ชื่อหมวดหมู่</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localCategories.map((category, index) => (
                <TableRow key={category.id} className={!category.is_active ? 'opacity-60 bg-gray-50' : ''}>
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
                        disabled={index === localCategories.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={category.is_active ? 'default' : 'destructive'}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                        category.is_active 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleStatusToggle(category)}
                    >
                      {category.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onEdit(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(category.id)}>
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
            <AlertDialogTitle>ยืนยันการลบหมวดหมู่</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? เมนูที่อยู่ในหมวดหมู่นี้จะถูกย้ายไปหมวดหมู่ว่าง
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

export default memo(CategoriesList);
